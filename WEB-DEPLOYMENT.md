# 🚀 Web Deployment Guide

## Quick Deploy Options

Your web app can be deployed to:
1. **Vercel** (Recommended - Easiest)
2. **Netlify** (Great alternative)
3. **GitHub Pages**
4. **Any static hosting**

---

## 🎯 Option 1: Vercel (Recommended)

### Method A: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # First deployment
   vercel
   
   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? (select your account)
   # - Link to existing project? No
   # - Project name? mechanic-setu (or your choice)
   # - Directory? ./
   # - Override settings? No
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Method B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run web:build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Vercel Configuration

Already created: `vercel.json`
```json
{
  "buildCommand": "npm run web:build",
  "outputDirectory": "dist"
}
```

---

## 🌐 Option 2: Netlify

### Method A: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**:
   ```bash
   # Initialize
   netlify init
   
   # Deploy to production
   netlify deploy --prod
   ```

### Method B: Deploy via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure:
   - **Build command**: `npm run web:build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

### Method C: Drag & Drop

1. Build locally:
   ```bash
   npm run web:build
   ```

2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the upload area
4. Done!

### Netlify Configuration

Already created: `netlify.toml`
```toml
[build]
  command = "npm run web:build"
  publish = "dist"
```

---

## 📦 Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**:
   ```json
   {
     "scripts": {
       "deploy": "npm run web:build && gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Your site will be at: `https://yourusername.github.io/mechanic-setu`

---

## 🔧 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Build completes successfully: `npm run web:build`
- [ ] Test production build locally: `npm run web:serve`
- [ ] All environment variables are set (if any)
- [ ] API endpoints are configured for production
- [ ] Images are optimized
- [ ] Google Maps API key is valid for your domain

---

## 🌍 Environment Variables

If you need to set environment variables (API keys, etc.):

### Vercel
```bash
vercel env add EXPO_PUBLIC_API_URL
```

Or in Vercel Dashboard:
- Project Settings → Environment Variables

### Netlify
```bash
netlify env:set EXPO_PUBLIC_API_URL "your-value"
```

Or in Netlify Dashboard:
- Site Settings → Environment Variables

---

## 📊 After Deployment

### Update Your Domain

1. **Custom Domain (Vercel)**:
   - Project Settings → Domains
   - Add your custom domain
   - Update DNS records

2. **Custom Domain (Netlify)**:
   - Site Settings → Domain Management
   - Add custom domain
   - Update DNS records

### Enable HTTPS

Both Vercel and Netlify provide free SSL certificates automatically!

---

## 🎯 Quick Commands Reference

```bash
# Build for production
npm run web:build

# Test production build locally
npm run web:serve

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy to GitHub Pages
npm run deploy
```

---

## 🔍 Troubleshooting

### Build Fails

1. **Clear cache and rebuild**:
   ```bash
   npx expo start -c
   npm run web:build
   ```

2. **Check Node version**:
   ```bash
   node --version  # Should be 18 or higher
   ```

### 404 Errors on Refresh

Make sure your hosting provider is configured for SPA routing:
- **Vercel**: Already configured in `vercel.json`
- **Netlify**: Already configured in `netlify.toml`

### API Errors

Update your API base URL for production:
```javascript
// src/utils/api.js
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';
```

---

## 📈 Performance Optimization

After deployment, check your site's performance:

1. **Lighthouse Score**:
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run audit
   - Target: 90+ score

2. **PageSpeed Insights**:
   - Visit [pagespeed.web.dev](https://pagespeed.web.dev)
   - Enter your deployed URL
   - Check recommendations

---

## 🎉 Deployment URLs

After deployment, you'll get URLs like:

- **Vercel**: `https://mechanic-setu.vercel.app`
- **Netlify**: `https://mechanic-setu.netlify.app`
- **GitHub Pages**: `https://yourusername.github.io/mechanic-setu`

You can then add a custom domain!

---

## 💡 Pro Tips

1. **Auto-Deploy**: Connect your Git repo for automatic deployments on push
2. **Preview Deployments**: Get unique URLs for each branch/PR
3. **Analytics**: Enable analytics in Vercel/Netlify dashboard
4. **Edge Functions**: Use serverless functions if needed
5. **CDN**: Both platforms use global CDN for fast loading

---

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Expo Web**: [docs.expo.dev/workflow/web](https://docs.expo.dev/workflow/web)

---

**Ready to deploy? Choose your platform and follow the steps above!** 🚀
