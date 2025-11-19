# Next Steps for Play Store Publishing

Since you've connected your EAS account, here's what to do next:

## 🎯 Immediate Next Steps

### 1. Set Up Environment Variables (REQUIRED)

Your app needs Supabase credentials to work. Set them up as EAS secrets:

```bash
# Set your Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"

# Set your Supabase anon key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy the "Project URL" (for EXPO_PUBLIC_SUPABASE_URL)
4. Copy the "anon public" key (for EXPO_PUBLIC_SUPABASE_ANON_KEY)

**Verify secrets are set:**
```bash
eas secret:list
```

### 2. Test with Preview Build (RECOMMENDED)

Before building for production, test with a preview build:

```bash
npm run build:android:preview
```

This creates an APK you can install directly on your device to verify everything works.

### 3. Build for Production

Once you've tested the preview build:

```bash
npm run build:android
```

This will:
- Take 10-20 minutes
- Create an Android App Bundle (AAB) file
- Automatically sign it with EAS-managed keystore
- Give you a download link

### 4. Prepare Play Store Assets

While the build is running, prepare these assets:

**Graphics needed:**
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2, recommended 4-8)
  - Phone: 16:9 or 9:16 aspect ratio
  - Tablet: 7:10 or 10:7 (optional)

**Text needed:**
- Short description (80 chars max)
- Full description (4000 chars max)
- Privacy policy URL (if app collects data)

### 5. Submit to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create your app (if not done)
3. Upload the AAB file from step 3
4. Complete store listing with assets from step 4
5. Submit for review

## 📋 Quick Reference

**Check build status:**
```bash
eas build:list
```

**View build logs:**
```bash
eas build:view [BUILD_ID]
```

**Submit to Play Store (after building):**
```bash
npm run submit:android
```

## 📚 Detailed Guides

- **Pre-build checklist:** See `PRE_BUILD_CHECKLIST.md`
- **Publishing guide:** See `PLAY_STORE_PUBLISHING.md`

## ⚠️ Important Notes

- **Version Code**: Starts at `1` in `app.json`. Increment for each release (2, 3, 4...)
- **Package Name**: `com.mindnistry.volunteerapp` - cannot be changed after first release
- **Keystore**: EAS manages this automatically - don't lose access to your Expo account!

## 🚀 Ready to Start?

1. Set environment variables (step 1 above)
2. Build preview and test (step 2)
3. Build production (step 3)
4. Submit to Play Store (step 5)

Good luck! 🎉

