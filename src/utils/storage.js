import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Cross-platform storage utility
 * Uses SecureStore on mobile, localStorage on web
 */
class PlatformStorage {
    async setItem(key, value) {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

            if (Platform.OS === 'web') {
                localStorage.setItem(key, stringValue);
            } else {
                await SecureStore.setItemAsync(key, stringValue);
            }
        } catch (error) {
            console.error(`Error setting item ${key}:`, error);
            throw error;
        }
    }

    async getItem(key) {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(key);
            } else {
                return await SecureStore.getItemAsync(key);
            }
        } catch (error) {
            console.error(`Error getting item ${key}:`, error);
            return null;
        }
    }

    async removeItem(key) {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(key);
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
            throw error;
        }
    }

    async clear() {
        try {
            if (Platform.OS === 'web') {
                localStorage.clear();
            } else {
                // SecureStore doesn't have a clear method, so we need to track keys
                console.warn('SecureStore clear not implemented - remove items individually');
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }

    // Helper methods for common use cases
    async setJSON(key, value) {
        return this.setItem(key, JSON.stringify(value));
    }

    async getJSON(key) {
        const value = await this.getItem(key);
        if (!value) return null;

        try {
            return JSON.parse(value);
        } catch (error) {
            console.error(`Error parsing JSON for key ${key}:`, error);
            return null;
        }
    }
}

export const storage = new PlatformStorage();
export default storage;
