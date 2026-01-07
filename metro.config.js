const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable production optimizations
if (process.env.NODE_ENV === 'production') {
    config.transformer = {
        ...config.transformer,
        minifierConfig: {
            keep_classnames: false,
            keep_fnames: false,
            mangle: {
                keep_classnames: false,
                keep_fnames: false,
            },
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
        },
    };
}

module.exports = withNativeWind(config, { input: "./global.css" });
