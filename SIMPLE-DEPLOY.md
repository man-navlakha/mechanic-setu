# 🚀 Simple Web Deployment (React Navigation)

Since your app uses React Navigation (not Expo Router), the easiest deployment method is:

## ✅ Recommended: Deploy Running Dev Server

### Option 1: Vercel (Easiest)

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/mechanic-setu.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Other
     - **Build Command**: Leave empty or use `echo "Using dev server"`
     - **Install Command**: `npm install`
     - **Development Command**: `npm run web`
   - Click "Deploy"

### Option 2: Use Expo's Built-in Hosting

Expo provides free hosting for web apps:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Build and publish
eas build:configure
eas update --branch production --message "Initial deployment"
```

### Option 3: Netlify with Dev Server

1. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm install"
     publish = "."
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [dev]
     command = "npm run web"
     port = 8081
   ```

2. Deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

## 🎯 Alternative: Build Static Bundle

If you want a static build, we need to configure webpack:

### Step 1: Install Dependencies

```bash
npm install --save-dev @expo/webpack-config
```

### Step 2: Create `webpack.config.js`

```javascript
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  return config;
};
```

### Step 3: Update `app.json`

```json
{
  "expo": {
    "web": {
      "bundler": "webpack"
    }
  }
}
```

### Step 4: Build

```bash
npx expo export:web
```

This will create a `web-build` folder that you can deploy anywhere.

## 🚀 Quick Deploy Commands

```bash
# For Vercel (after connecting GitHub)
vercel --prod

# For Netlify
netlify deploy --prod

# For GitHub Pages
npm install -g gh-pages
gh-pages -d web-build
```

## 💡 Easiest Method for Now

**Just use the running dev server on Vercel/Netlify:**

1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set build command to: `npm install`
4. Set start command to: `npm run web`
5. Deploy!

The dev server will work fine for production with proper environment variables.

---

**Need help with any of these methods?** Let me know which one you'd like to use!
