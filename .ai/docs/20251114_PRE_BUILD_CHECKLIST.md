# Pre-Build Checklist for Play Store Publishing

Use this checklist before building your production app for the Google Play Store.

## ✅ Environment Variables Setup

Your app requires these environment variables to work:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Set Environment Variables in EAS

You need to configure these in EAS so they're available during the build:

```bash
# Set Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"

# Set Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"
```

**Or use the EAS Dashboard:**
1. Go to [expo.dev](https://expo.dev)
2. Select your project
3. Go to **Secrets** tab
4. Add each environment variable:
   - Name: `EXPO_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Name: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key

### Verify Secrets

```bash
# List all secrets for your project
eas secret:list
```

## ✅ App Configuration Check

Verify these in `app.json`:

- [x] App name: "Mindnistry Volunteers"
- [x] Package name: `com.mindnistry.volunteerapp`
- [x] Version: `1.0.0`
- [x] Version code: `1` (increment for each release)
- [x] EAS project ID: Already configured
- [x] Android permissions: Configured
- [x] App icon: `./assets/icon.png` exists
- [x] Adaptive icon: `./assets/adaptive-icon.png` exists
- [x] Splash screen: `./assets/splash-icon.png` exists

## ✅ Test Preview Build First

**Before building for production, test with a preview build:**

```bash
npm run build:android:preview
```

This creates an APK you can install directly on your device to test:
- App functionality
- Environment variables are working
- Supabase connection
- All features work as expected

**Install the preview APK:**
1. Download the APK from the build link
2. Transfer to your Android device
3. Enable "Install from unknown sources" if needed
4. Install and test thoroughly

## ✅ Production Build

Once preview build works correctly:

```bash
npm run build:android
```

This creates an AAB (Android App Bundle) for Play Store submission.

## ✅ Play Store Assets Preparation

Before submitting to Play Store, prepare:

### Required Graphics:
- [ ] **App icon** (512x512 PNG, no transparency)
- [ ] **Feature graphic** (1024x500 PNG)
- [ ] **Phone screenshots** (at least 2, recommended: 4-8)
  - Aspect ratio: 16:9 or 9:16
  - Minimum: 320px, Maximum: 3840px
- [ ] **Tablet screenshots** (optional but recommended)
  - Aspect ratio: 7:10 or 10:7

### Required Text:
- [ ] **Short description** (80 characters max)
- [ ] **Full description** (4000 characters max)
- [ ] **Release notes** (500 characters max)

### Other Requirements:
- [ ] **Privacy policy URL** (required if app collects user data)
- [ ] **Content rating** (complete questionnaire)
- [ ] **Target audience** (age groups)

## ✅ Testing Checklist

Before submitting, test on a real device:

- [ ] App launches without crashes
- [ ] Login/Registration works
- [ ] Supabase connection works
- [ ] Push notifications work (if applicable)
- [ ] All navigation flows work
- [ ] Deep links work (if applicable)
- [ ] App handles offline gracefully
- [ ] No console errors in production build

## ✅ Version Management

For future updates:

1. **Update version in `app.json`:**
   ```json
   "version": "1.0.1"  // User-facing version
   ```

2. **Increment versionCode in `app.json`:**
   ```json
   "versionCode": 2  // Must be higher than previous
   ```

3. **Build and submit:**
   ```bash
   npm run build:android
   ```

## Quick Commands

```bash
# Set environment variables
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_URL"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_KEY"

# List secrets
eas secret:list

# Build preview (APK for testing)
npm run build:android:preview

# Build production (AAB for Play Store)
npm run build:android

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

## Next Steps After Building

1. Download the AAB file from the build link
2. Go to [Google Play Console](https://play.google.com/console)
3. Create your app (if not done)
4. Upload the AAB file
5. Complete store listing
6. Submit for review

See `PLAY_STORE_PUBLISHING.md` for detailed submission steps.

