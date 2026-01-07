import { Dimensions, Platform } from 'react-native';

/**
 * Platform detection utilities
 */
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;

/**
 * Responsive breakpoints
 */
export const useResponsive = () => {
    const { width, height } = Dimensions.get('window');

    return {
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isWeb,
        isPortrait: height > width,
        isLandscape: width > height,
    };
};

/**
 * Platform-specific values
 * Usage: platformSelect({ web: 'value1', native: 'value2', ios: 'value3', android: 'value4' })
 */
export const platformSelect = (values) => {
    if (values.web && isWeb) return values.web;
    if (values.ios && isIOS) return values.ios;
    if (values.android && isAndroid) return values.android;
    if (values.native && isMobile) return values.native;
    return values.default;
};

/**
 * Feature detection
 */
export const features = {
    hasNativeNotifications: isMobile,
    hasHaptics: isMobile,
    hasSecureStorage: isMobile,
    hasNativeMaps: isMobile,
    hasGeolocation: true, // Available on all platforms
    hasCamera: true, // Available on all platforms (HTML5 on web)
};

/**
 * Get platform-specific component
 * Usage: getPlatformComponent('MapComponent', { web: WebMap, native: NativeMap })
 */
export const getPlatformComponent = (name, components) => {
    if (components.web && isWeb) return components.web;
    if (components.ios && isIOS) return components.ios;
    if (components.android && isAndroid) return components.android;
    if (components.native && isMobile) return components.native;
    return components.default || null;
};
