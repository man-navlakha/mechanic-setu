# 🔧 Netlify Deployment Troubleshooting Guide

## ✅ Fixes Applied

1. **Fixed `netlify.toml`**: Changed publish directory from `dist` to `web-build`
2. **Created `public/_redirects`**: Added SPA routing support
3. **Updated API URL**: Using environment variable for production

---

## 🚀 Deploy to Netlify - Step by Step

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Build locally**:
   ```bash
   npm run web:build
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

   When prompted:
   - **Publish directory**: `web-build`
   - Confirm deployment

### Method 2: Netlify Dashboard

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fixed Netlify configuration"
   git push
   ```

2. **Connect to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: `npm run web:build`
     - **Publish directory**: `web-build`
     - **Node version**: 18
   - Click "Deploy site"

### Method 3: Drag & Drop

1. **Build locally**:
   ```bash
   npm run web:build
   ```

2. **Deploy**:
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `web-build` folder
   - Done!

---

## 🔍 Common Issues & Solutions

### Issue 1: "Page Not Found" on Refresh

**Problem**: Routes work initially but show 404 on page refresh  
**Solution**: ✅ Already fixed with `_redirects` file and `netlify.toml`

### Issue 2: Build Fails

**Error**: `Command failed with exit code 1`

**Solutions**:

1. **Check Node version**:
   ```toml
   # In netlify.toml
   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Clear build cache**:
   - Netlify Dashboard → Site Settings → Build & Deploy
   - Click "Clear cache and retry deploy"

3. **Check build logs** for specific errors

### Issue 3: Blank Page / White Screen

**Possible causes**:

1. **Wrong publish directory**:
   - ✅ Fixed: Should be `web-build` not `dist`

2. **Missing environment variables**:
   - Add `EXPO_PUBLIC_API_URL` in Netlify

3. **Console errors**:
   - Open browser DevTools (F12)
   - Check Console tab for errors

### Issue 4: API Calls Failing

**Problem**: API requests not working on deployed site

**Solution**: Set environment variable in Netlify

1. Go to Site Settings → Environment Variables
2. Add variable:
   - **Key**: `EXPO_PUBLIC_API_URL`
   - **Value**: `https://mechanic-setu.onrender.com/api`
3. Redeploy

### Issue 5: Maps Not Loading

**Problem**: Google Maps not showing on deployed site

**Solutions**:

1. **Check API key restrictions**:
   - Go to Google Cloud Console
   - APIs & Services → Credentials
   - Edit your API key
   - Add your Netlify domain to allowed referrers:
     - `https://your-site.netlify.app/*`
     - `https://*.netlify.app/*` (for preview deployments)

2. **Verify API key is in code**:
   - Check `app.json` has correct Google Maps API key
   - Check `WebMapView.js` uses the key

---

## 📋 Netlify Configuration Files

### `netlify.toml` (Already Updated)
```toml
[build]
  command = "npm run web:build"
  publish = "web-build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### `public/_redirects` (Already Created)
```
/*    /index.html   200
```

---

## 🎯 Deployment Checklist

Before deploying, verify:

- [ ] `netlify.toml` has `publish = "web-build"`
- [ ] `public/_redirects` file exists
- [ ] Build works locally: `npm run web:build`
- [ ] Test build locally: `npm run web:serve`
- [ ] Code pushed to GitHub
- [ ] Environment variables set (if needed)
- [ ] Google Maps API key allows your domain

---

## 🔄 Redeploy After Fixes

If you already deployed and it's not working:

### Via Netlify Dashboard:
1. Go to Deploys tab
2. Click "Trigger deploy" → "Clear cache and deploy site"

### Via CLI:
```bash
# Build fresh
npm run web:build

# Deploy
netlify deploy --prod
```

### Via Git:
```bash
# Commit fixes
git add .
git commit -m "Fixed Netlify deployment"
git push

# Netlify will auto-deploy
```

---

## 📊 Verify Deployment

After deployment, check:

1. **Site loads**: Visit your Netlify URL
2. **Routing works**: Navigate between pages and refresh
3. **Maps load**: Check if Google Maps displays
4. **API works**: Try logging in or making requests
5. **No console errors**: Open DevTools and check Console

---

## 🆘 Still Not Working?

### Check Build Logs

1. Go to Netlify Dashboard
2. Click on your site
3. Go to "Deploys" tab
4. Click on the latest deploy
5. Check the build log for errors

### Common Build Log Errors

**Error**: `Module not found`
- **Fix**: Run `npm install` locally and commit `package-lock.json`

**Error**: `Command not found: expo`
- **Fix**: Already handled by `npm run web:build`

**Error**: `Out of memory`
- **Fix**: Upgrade Netlify plan or optimize build

### Test Locally First

```bash
# Clean build
rm -rf web-build node_modules
npm install
npm run web:build

# Test
npm run web:serve
```

If it works locally but not on Netlify, it's likely a configuration issue.

---

## 💡 Pro Tips

1. **Preview Deployments**: Every branch gets a preview URL
2. **Deploy Previews**: Every PR gets a preview deployment
3. **Custom Domain**: Add your own domain in Site Settings
4. **Analytics**: Enable Netlify Analytics for insights
5. **Forms**: Use Netlify Forms for contact forms
6. **Functions**: Add serverless functions if needed

---

## 📞 Get Help

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Support**: [answers.netlify.com](https://answers.netlify.com)
- **Build Logs**: Check for specific error messages

---

**After applying these fixes, redeploy to Netlify and it should work!** 🚀

## Quick Fix Commands:

```bash
# Rebuild
npm run web:build

# Test locally
npm run web:serve

# Commit and push
git add .
git commit -m "Fixed Netlify deployment"
git push

# Or deploy directly
netlify deploy --prod
```
