import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Simple notification configuration that works in Expo Go
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false, // Simplified for Expo Go
    }),
});

// Request notification permissions (Works in Expo Go)
export async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Notifications need permission to work. Enable in Settings.',
                [{ text: 'OK' }]
            );
            return;
        }

        console.log('✅ Notification permissions granted');
    } else {
        Alert.alert('Use Physical Device', 'Notifications work best on physical devices');
    }

    return token;
}

// Basic notification (Works in Expo Go)
export async function showMechanicTrackingNotification({
    mechanicName,
    estimatedTime,
}) {
    try {
        console.log('📱 Showing notification:', mechanicName, estimatedTime);

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🚗 Mechanic on the way',
                body: `${mechanicName} is arriving in ${estimatedTime} mins`,
                data: { type: 'mechanic_tracking' },
                sound: true,
            },
            trigger: null, // Show immediately
        });

        console.log('✅ Notification shown:', notificationId);
        return notificationId;
    } catch (error) {
        console.error('❌ Notification error:', error);
    }
}

// Update notification (Limited in Expo Go - creates new notification)
export async function updateMechanicTrackingNotification({
    mechanicName,
    estimatedTime,
    distance
}) {
    try {
        // In Expo Go, we can't update existing notifications
        // So we show a new one (will stack in notification panel)
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📍 Location Update',
                body: `${mechanicName} • ${estimatedTime} min • ${distance.toFixed(1)} km`,
                data: { type: 'update' },
                sound: false, // Don't play sound for updates
            },
            trigger: null,
        });
        console.log('📍 Update notification sent');
    } catch (error) {
        console.error('❌ Update error:', error);
    }
}

// Arrival notification (Works in Expo Go)
export async function showMechanicArrivedNotification({ mechanicName }) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '✅ Mechanic Arrived!',
                body: `${mechanicName} has arrived at your location`,
                data: { type: 'arrived' },
                sound: true,
            },
            trigger: null,
        });
        console.log('✅ Arrival notification sent');
    } catch (error) {
        console.error('❌ Arrival error:', error);
    }
}

// Clear notifications (Works in Expo Go)
export async function clearMechanicNotification() {
    try {
        await Notifications.dismissAllNotificationsAsync();
        console.log('🗑️ Notifications cleared');
    } catch (error) {
        console.error('❌ Clear error:', error);
    }
}

// Completion notification (Works in Expo Go)
export async function showJobCompletedNotification() {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '✅ Service Completed',
                body: 'Your service has been completed successfully',
                data: { type: 'completed' },
                sound: true,
            },
            trigger: null,
        });
        console.log('✅ Completion notification sent');
    } catch (error) {
        console.error('❌ Completion error:', error);
    }
}

// Testing function - use this to test in Expo Go
export async function testNotification() {
    const perms = await Notifications.getPermissionsAsync();
    console.log('Current permissions:', perms);

    if (perms.status !== 'granted') {
        console.log('❌ Permissions not granted');
        await registerForPushNotificationsAsync();
        return;
    }

    console.log('Testing notification...');
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🧪 Test Notification',
            body: 'If you see this, notifications are working!',
            data: { test: true },
        },
        trigger: null,
    });
    console.log('✅ Test notification sent');
}
