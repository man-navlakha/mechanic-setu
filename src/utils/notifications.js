import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true, // Deprecated but kept for backwards compatibility
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Request notification permissions
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('mechanic-updates', {
            name: 'Mechanic Updates',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#10b981',
            sound: 'default',
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
        });

        // High priority channel for arrival notifications
        await Notifications.setNotificationChannelAsync('mechanic-arrival', {
            name: 'Mechanic Arrival',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#3b82f6',
            sound: 'default',
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            alert('Failed to get push notification permissions!');
            return;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}

// Show live tracking notification
export async function showMechanicTrackingNotification({
    mechanicName,
    vehicleType,
    vehicleNumber,
    estimatedTime,
    mechanicPhoto,
    phoneNumber
}) {
    // Clear any existing notifications
    await Notifications.dismissAllNotificationsAsync();

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: '🚗 Mechanic on the way',
            body: `${mechanicName} is arriving in ${estimatedTime} mins`,
            data: {
                type: 'mechanic_tracking',
                mechanicName,
                vehicleType,
                vehicleNumber,
                phoneNumber
            },
            badge: 1,
            priority: Notifications.AndroidNotificationPriority.MAX,
            sticky: true, // Keep notification visible
            sound: 'default',
            vibrate: [0, 250, 250, 250],
            ...(Platform.OS === 'android' && {
                color: '#10b981',
                // Custom layout for Android
                categoryIdentifier: 'mechanic_tracking',
            }),
        },
        trigger: null, // Show immediately
        ...(Platform.OS === 'android' && {
            identifier: 'mechanic-tracking-notification',
            channelId: 'mechanic-updates',
        }),
    });

    return notificationId;
}

// Update the live notification with new ETA
export async function updateMechanicTrackingNotification({
    mechanicName,
    estimatedTime,
    distance
}) {
    // Android: Update existing notification
    if (Platform.OS === 'android') {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🚗 Mechanic on the way',
                body: `${mechanicName} • ${estimatedTime} min away • ${distance.toFixed(1)} km`,
                data: { type: 'mechanic_tracking_update' },
                badge: 1,
                priority: Notifications.AndroidNotificationPriority.MAX,
                sticky: true,
                color: '#10b981',
            },
            trigger: null,
            identifier: 'mechanic-tracking-notification',
            channelId: 'mechanic-updates',
        });
    }
    // iOS: Notifications auto-update via same identifier
}

// Show mechanic arrived notification
export async function showMechanicArrivedNotification({ mechanicName }) {
    await Notifications.dismissAllNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '✅ Mechanic Arrived!',
            body: `${mechanicName} has arrived at your location`,
            data: { type: 'mechanic_arrived' },
            badge: 1,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            sound: 'default',
            vibrate: [0, 500, 200, 500],
            ...(Platform.OS === 'android' && {
                color: '#3b82f6',
            }),
        },
        trigger: null,
        ...(Platform.OS === 'android' && {
            channelId: 'mechanic-arrival',
        }),
    });
}

// Clear mechanic tracking notification
export async function clearMechanicNotification() {
    await Notifications.dismissAllNotificationsAsync();
}

// Show job completed notification
export async function showJobCompletedNotification() {
    await Notifications.dismissAllNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '✅ Service Completed',
            body: 'Your service has been completed successfully',
            data: { type: 'job_completed' },
            badge: 0,
            sound: 'default',
            ...(Platform.OS === 'android' && {
                color: '#10b981',
            }),
        },
        trigger: null,
    });
}
