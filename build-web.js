const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Building web app for production...\n');

// Set production environment
process.env.NODE_ENV = 'production';

// Run expo start --web in production mode
const expo = spawn('npx', ['expo', 'start', '--web', '--no-dev', '--minify'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        NODE_ENV: 'production',
    }
});

expo.on('close', (code) => {
    if (code !== 0) {
        console.error(`\n❌ Build failed with code ${code}`);
        process.exit(code);
    }
    console.log('\n✅ Build complete!');
});

expo.on('error', (err) => {
    console.error('❌ Failed to start build process:', err);
    process.exit(1);
});
