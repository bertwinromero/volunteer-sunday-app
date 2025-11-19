# Building the Volunteer Sunday App

## Prerequisites

1. **Install EAS CLI** (Already done ✓)
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

## Build for iOS

### Development Build (Internal Testing)
```bash
eas build --platform ios --profile development
```

### Production Build (App Store)
```bash
eas build --platform ios --profile production
```

**Note:** You'll need an Apple Developer account ($99/year)

## Build for Android

### Development Build (Internal Testing)
```bash
eas build --platform android --profile development
```

### Production Build (Google Play)
```bash
eas build --platform android --profile production
```

**Note:** Google Play requires a one-time $25 fee

## Testing Builds

### iOS
- Development: Install on registered devices via TestFlight or direct download
- Production: Submit to App Store for review

### Android
- Development: Download and install APK directly
- Production: Submit to Google Play for review

## Deep Link Testing

After building:
- Links will use: `volunteerapp://program/[token]`
- Works from anywhere (not just local network)
- Can be shared via SMS, email, WhatsApp, etc.

## Current Development Setup

For now, you can continue testing with:
- **Expo Go app** - Scan QR code to test
- **Share codes** - 6-character codes always work
- **Local network links** - Work during development

## More Information

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Submission](https://docs.expo.dev/submit/ios/)
- [Google Play Submission](https://docs.expo.dev/submit/android/)
