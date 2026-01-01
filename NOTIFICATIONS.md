# Uber-Style Live Tracking Notifications

## Overview
This implementation provides **real-time, live-updating notifications** in the device's notification panel, similar to Uber's experience. The notification shows:

- ✅ Mechanic name and photo
- ✅ Real-time ETA updates
- ✅ Distance tracking
- ✅ Vehicle information
- ✅ Persistent notification that stays visible
- ✅ Custom colors and styling
- ✅ Arrival alerts

## How It Works

### 1. **Initial Display**
When a mechanic is assigned to your request:
- A **sticky notification** appears in the notification panel
- Shows: "*🚗 Mechanic on the way*"
- Body: "*John Doe is arriving in 12 mins*"

### 2. **Live Updates**
As the mechanic moves closer:
- Notification **auto-updates** without dismissing
- Shows: "*John Doe • 8 min away • 2.3 km*"
- Updates happen every time the mechanic's location changes

### 3. **Arrival Notification**
When mechanic arrives:
- **High-priority notification** with different color (blue)
- Shows: "*✅ Mechanic Arrived!*"
- Body: "*John Doe has arrived at your location*"

### 4. **Completion/Cancellation**
- Notifications are automatically cleared
- Shows final status message
- Badge count resets to 0

## Features

### Android Features
- **Notification Channels**: Separate channels for tracking and arrival
- **Persistent Notifications**: Stays in panel until dismissed
- **Custom Colors**: Green for tracking, Blue for arrival
- **Vibration Patterns**: Different patterns for different events
- **LED Lights**: Custom colors for devices that support it
- **Priority Levels**: MAX priority for tracking, HIGH for arrival

### iOS Features
- **Rich Notifications**: Full content display
- **Badge Management**: Auto-updates app badge
- **Sound Alerts**: Default or custom sounds
- **Critical Alerts**: For arrival notifications (if enabled)

## Files Added/Modified

### New Files
1. **`src/utils/notifications.js`** - Core notification logic
   - Permission handling
   - Notification channels setup
   - Show/update/dismiss functions

### Modified Files
1. **`App.js`** - Request permissions on app load
2. **`MechanicFoundScreen.jsx`** - Trigger notifications based on events
3. **`app.json`** - Configure notification settings and permissions

## Testing

### On Development Build
1. Run: `npx expo start --clear`
2. Press `a` for Android or `i` for iOS
3. Grant notification permissions when prompted
4. Create a service request
5. Pull down notification panel to see live updates

### On Production Build
For full notification features, build with EAS:

```bash
# Android
eas build --platform android --profile preview

# iOS
eas build --platform ios --profile preview
```

## Notification Types

### 1. Tracking Notification
```javascript
showMechanicTrackingNotification({
    mechanicName: "John Doe",
    vehicleType: "Car",
    vehicleNumber: "MH12AB1234",
    estimatedTime: 12,
    mechanicPhoto: "https://...",
    phoneNumber: "+919876543210"
})
```

### 2. Update Notification
```javascript
updateMechanicTrackingNotification({
    mechanicName: "John Doe",
    estimatedTime: 8,
    distance: 2.3
})
```

### 3. Arrival Notification
```javascript
showMechanicArrivedNotification({
    mechanicName: "John Doe"
})
```

### 4. Completion Notification
```javascript
showJobCompletedNotification()
```

### 5. Clear Notification
```javascript
clearMechanicNotification()
```

## Android Notification Channels

### mechanic-updates
- **Importance**: MAX
- **Sound**: Default
- **Vibration**: [0, 250, 250, 250]
- **LED Color**: Green (#10b981)
- **Use**: Live tracking updates

### mechanic-arrival
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: [0, 500, 200, 500]
- **LED Color**: Blue (#3b82f6)
- **Use**: Mechanic arrival alerts

## Customization

### Change Notification Color
Edit `src/utils/notifications.js`:
```javascript
color: '#YOUR_COLOR_HEX',
```

### Change Vibration Pattern
```javascript
vibrationPattern: [0, 500, 200, 500], // wait, vibrate, wait, vibrate
```

### Change Sound
1. Add sound file to `assets/notification.wav`
2. Update `app.json`:
```json
"sounds": ["./assets/notification.wav"]
```

## Permissions

### Android (API 33+)
Automatically requests `POST_NOTIFICATIONS` permission

### iOS
Automatically requests notification permissions on first launch

## Troubleshooting

### Notifications Not Showing
1. Check if permissions are granted:
   - Android: Settings > Apps > Mechanic Setu > Notifications
   - iOS: Settings > Mechanic Setu > Notifications

2. Verify channel creation (Android):
   - Look for `[API Response]` logs in console
   - Check notification channel settings in device

3. Test permissions:
```javascript
const { status } = await Notifications.getPermissionsAsync();
console.log('Notification Status:', status);
```

### Notifications Not Updating
- Android: Updates use same `identifier` to replace existing notification
- iOS: Updates happen automatically via notification ID
- Ensure `requestId` is consistent across updates

### Background Updates Not Working
- Requires native build (not Expo Go)
- Build with: `eas build --platform android --profile preview`
- Background notifications need FCM for remote updates

## Future Enhancements

### Possible Additions
1. **Action Buttons**: "Call Mechanic", "Cancel Request"
2. **Map Preview**: Show route in notification (Android 12+)
3. **Progress Bar**: Visual ETA countdown
4. **Rich Media**: Mechanic photo in expanded notification
5. **Live Activities**: iOS 16+ Dynamic Island integration

### iOS Live Activities (Future)
For iOS 16+ with Dynamic Island support:
```bash
npm install react-native-live-activities
```

This would enable real-time updates in the Dynamic Island and Lock Screen.

## Notes

- **Sticky Notifications**: Android notifications are sticky (can't swipe away easily)
- **Battery Optimization**: Notifications don't drain battery significantly
- **Rate Limiting**: Updates are throttled to prevent spam
- **Offline Support**: Works even when app is in background
- **Privacy**: Location data is only used for ETA calculation

## Support

For issues or questions:
1. Check Expo Notifications docs: https://docs.expo.dev/versions/latest/sdk/notifications/
2. Review notification channel settings in device
3. Test on physical device (notifications limited in simulators)
