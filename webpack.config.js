const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(
        {
            ...env,
            babel: {
                dangerouslyAddModulePathsToTranspile: ['@expo/vector-icons'],
            },
        },
        argv
    );

    // Add postcss-loader to handle Tailwind CSS
    const cssRule = config.module.rules.find(
        (rule) => rule.oneOf && rule.oneOf.some((r) => r.test && r.test.toString().includes('css'))
    );

    if (cssRule) {
        const cssLoader = cssRule.oneOf.find(
            (rule) => rule.test && rule.test.toString().includes('css')
        );

        if (cssLoader) {
            cssLoader.use.push({
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        ident: 'postcss',
                        config: true,
                        plugins: [require('tailwindcss'), require('autoprefixer')],
                    },
                },
            });
        }
    }

    return config;
};
