# 🚀 EAS (Expo Application Services) Setup Guide

## 📝 Step 1: Create Expo Account

### Method 1: Via Browser (Opened for you!)

A browser window should have opened to: https://expo.dev/signup

1. **Fill in the form**:
   - Email address
   - Username (e.g., "man-navlakha")
   - Password
   - Agree to terms

2. **Verify your email**:
   - Check your inbox
   - Click the verification link

3. **Done!** Your account is created

### Method 2: Via CLI

If the browser didn't open, run:
```bash
npx expo register
```

---

## 🔐 Step 2: Login to EAS

Once your account is created:

```bash
eas login
```

Enter:
- **Email or username**: (the one you just created)
- **Password**: (your password)

---

## 🎯 Step 3: Configure Your Project

After logging in, initialize EAS for your project:

```bash
eas build:configure
```

This will:
1. Create `eas.json` with build profiles
2. Link your project to your Expo account
3. Generate a project ID

---

## 📱 Step 4: Build Your App

### For Android:

```bash
eas build --platform android --profile production
```

### For iOS (requires Mac or EAS Build):

```bash
eas build --platform ios --profile production
```

---

## 🆓 EAS Free Tier

**What you get for free:**
- ✅ Unlimited builds for personal projects
- ✅ 30 builds per month (shared across all projects)
- ✅ Cloud builds (no need for Mac for iOS)
- ✅ Over-the-air (OTA) updates
- ✅ App signing management

**Paid plans** (if you need more):
- Production: $29/month (unlimited builds)
- Enterprise: Custom pricing

---

## 🔧 Common Commands

```bash
# Login
eas login

# Check who's logged in
eas whoami

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all

# Check build status
eas build:list

# Submit to Play Store
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

---

## 📋 What Happens During Build

1. **Upload**: Your code is uploaded to EAS servers
2. **Install**: Dependencies are installed
3. **Build**: App is compiled (Android APK/AAB or iOS IPA)
4. **Sign**: App is signed with your credentials
5. **Download**: You get a link to download the built app

---

## 🎯 After Your First Build

You'll get:
- **Download link**: Direct link to APK/AAB/IPA
- **QR code**: For easy installation on devices
- **Build details**: Logs, artifacts, etc.

---

## 💡 Pro Tips

1. **Use profiles**: Create different profiles for development, staging, production
2. **Auto-submit**: Configure automatic submission to stores
3. **OTA updates**: Push updates without rebuilding
4. **Credentials**: EAS manages signing certificates for you
5. **Build locally**: Use `eas build --local` for faster iteration

---

## 🔍 Troubleshooting

### "Not logged in"
```bash
eas logout
eas login
```

### "Project not configured"
```bash
eas build:configure
```

### "Invalid credentials"
- Make sure you verified your email
- Try resetting password at expo.dev

### "Build failed"
- Check build logs in EAS dashboard
- Common issues: missing dependencies, incorrect config

---

## 📊 Your Current Setup

Based on your `app.json`:

- **App Name**: Mechanic Setu
- **Bundle ID (iOS)**: com.man.mechanicsetu
- **Package Name (Android)**: com.man.mechanicsetu
- **Version**: 1.0.6

---

## 🚀 Quick Start Commands

```bash
# 1. Login (after creating account)
eas login

# 2. Configure project
eas build:configure

# 3. Build for Android
eas build --platform android --profile production

# 4. Wait for build to complete (~10-20 minutes)

# 5. Download and install APK
```

---

## 📱 Installing Your Built App

### Android:
1. Download APK from EAS build page
2. Transfer to your phone
3. Enable "Install from unknown sources"
4. Install the APK

### iOS:
1. Download IPA from EAS build page
2. Use TestFlight or direct installation
3. Trust the developer certificate

---

## 🌐 EAS Dashboard

Access your builds at: https://expo.dev/accounts/[your-username]/projects

You can:
- View all builds
- Download artifacts
- Check build logs
- Manage credentials
- Configure webhooks

---

## 💰 Billing

- **Free tier**: 30 builds/month
- **Builds reset**: Monthly
- **No credit card required**: For free tier
- **Upgrade anytime**: If you need more builds

---

## ✅ Next Steps

1. **Create account** at expo.dev/signup (already opened!)
2. **Verify email**
3. **Run**: `eas login`
4. **Run**: `eas build:configure`
5. **Run**: `eas build --platform android`

---

**Your signup page should be open in your browser now!** 🎉

Complete the signup, verify your email, then run:
```bash
eas login
```

