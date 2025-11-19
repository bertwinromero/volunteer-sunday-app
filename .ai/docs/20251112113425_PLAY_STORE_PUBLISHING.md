# Publishing to Google Play Store

This guide will walk you through publishing your Expo app to the Google Play Store.

## Prerequisites

✅ You have a Google Play Developer account (one-time $25 fee)  
✅ Your Expo project is configured with the correct package name:
   - Android package name: `com.mindnistry.volunteerapp`
   - iOS bundle ID (for reference): `com.mindnistry.volunteerapp`
✅ You have the Expo CLI and EAS CLI installed:
   - `npm install -g eas-cli`
   - Logged in: `eas login`

## Step 1: Install EAS CLI

If you haven't already, install the Expo Application Services (EAS) CLI:

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
eas login
```

If you don't have an Expo account, create one at [expo.dev](https://expo.dev).

## Step 3: Configure Your Project

Link your project to your Expo account:

```bash
eas build:configure
```

This will create/update the `eas.json` file (already configured for you).

## Step 4: Build Your App for Production

Build an Android App Bundle (AAB) for Google Play Store:

```bash
npm run build:android
```

Or directly:

```bash
eas build --platform android --profile production
```

**What happens:**
- EAS will build your app in the cloud
- The build will take 10-20 minutes
- You'll get a download link for the AAB file
- The app will be automatically signed with a managed keystore

**Note:** For the first build, EAS will ask you to create a keystore. Choose "Let EAS handle it" for automatic management.

## Step 5: Create Your App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in the required information:
   - **App name**: Mindnistry Volunteers
   - **Default language**: English (or your preferred language)
   - **App or game**: App
   - **Free or paid**: Free (or Paid, if applicable)
   - **Declarations**: Accept the declarations
4. Click **"Create app"**

## Step 6: Set Up Your App Store Listing

### Required Information:

1. **App details:**
   - App name: Mindnistry Volunteers
   - Short description (80 characters max)
   - Full description (4000 characters max)
   - App icon (512x512 PNG, no transparency)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2, recommended: phone, tablet)
   - Phone screenshots: 16:9 or 9:16 aspect ratio
   - Tablet screenshots: 7:10 or 10:7 aspect ratio

2. **Content rating:**
   - Complete the content rating questionnaire
   - This is required before publishing

3. **Privacy policy:**
   - You must provide a privacy policy URL
   - Required if your app collects user data

4. **Target audience:**
   - Select appropriate age groups
   - Answer content rating questions

## Step 7: Upload Your App Bundle

1. In Google Play Console, go to **Production** → **Create new release**
2. Click **"Upload"** and select your AAB file from Step 4
3. Add **Release notes** (what's new in this version)
4. Click **"Save"**

## Step 8: Complete Store Listing

Make sure all required sections are complete:

- ✅ App details
- ✅ Graphics (icon, screenshots, feature graphic)
- ✅ Content rating
- ✅ Privacy policy
- ✅ Target audience
- ✅ App access (if applicable)

## Step 9: Review and Publish

1. Go to **Production** → **Review release**
2. Review all the information
3. Click **"Start rollout to Production"**
4. Your app will be submitted for review

**Review time:** Typically 1-3 days for new apps

## Step 10: Monitor Your Submission

- Check the **"Dashboard"** for review status
- Address any issues if Google requests changes
- Once approved, your app will be live on the Play Store!

## Updating Your App

For future updates:

1. **Update version numbers:**
   - Update `version` in `app.json` (e.g., "1.0.1")
   - Increment `versionCode` in `app.json` (e.g., 2, 3, 4...)

2. **Build new version:**
   ```bash
   npm run build:android
   ```

3. **Submit to Play Store:**
   ```bash
   npm run submit:android
   ```
   
   Or manually upload the new AAB in Google Play Console.

## Troubleshooting

### Build Fails

- Check that all dependencies are compatible
- Review build logs in [expo.dev](https://expo.dev)
- Ensure your `app.json` is valid JSON

### Upload Fails

- Verify the AAB file is for production (not development)
- Check that versionCode is incremented
- Ensure package name matches exactly

### Review Rejected

- Read Google's feedback carefully
- Address all policy violations
- Update your app and resubmit

## Important Notes

- **Version Code**: Must be incremented for each release (1, 2, 3...)
- **Version Name**: User-facing version (1.0.0, 1.0.1, 1.1.0...)
- **Package Name**: Cannot be changed after first release
- **Keystore**: EAS manages this automatically - don't lose access to your Expo account!

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Expo Submit Documentation](https://docs.expo.dev/submit/android/)

## Quick Commands Reference

```bash
# Build for production
npm run build:android

# Build preview (APK for testing)
npm run build:android:preview

# Submit to Play Store (after building)
npm run submit:android

# Check build status
eas build:list

# View build logs
eas build:view
```

Good luck with your publication! 🚀
