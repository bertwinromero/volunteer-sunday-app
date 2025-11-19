# Quick Start Guide

Get your Sunday Program Volunteer App running in minutes!

## Prerequisites

- Node.js 18+ installed
- Expo CLI (will be installed with dependencies)
- Expo Go app on your phone (iOS/Android)
- Supabase account (free tier is fine)

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
cd volunteer-sunday-app
npm install
```

### 2. Setup Supabase (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and project name
   - Wait for project to initialize (~2 minutes)

2. **Run Database Schema**
   - In Supabase dashboard, go to **SQL Editor**
   - Click "New Query"
   - Copy entire contents of `supabase-schema.sql`
   - Paste and click "Run"
   - You should see "Success. No rows returned"

3. **Enable Realtime**
   - Go to **Database** → **Replication**
   - Find these tables and toggle them ON:
     - profiles
     - programs
     - program_items
     - tasks

4. **Get API Credentials**
   - Go to **Settings** → **API**
   - Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy your **anon public** key (long string starting with `eyJ...`)

### 3. Configure Environment Variables (1 minute)

1. Create `.env` file (already exists, just edit it):
   ```bash
   # Edit the .env file
   ```

2. Replace the placeholder values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
   EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
   ```

   > **Note**: You can leave `EXPO_PUBLIC_PROJECT_ID` as is for now. You'll set it up later when you want push notifications.

### 4. Start the App (1 minute)

```bash
npm start
```

This will:
- Start the Expo development server
- Show a QR code in your terminal
- Open Expo Dev Tools in your browser

### 5. Run on Your Phone

1. **Install Expo Go** (if you haven't already)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan QR Code**
   - iOS: Open Camera app and scan the QR code
   - Android: Open Expo Go app and scan the QR code

3. **Wait for Build** (~30 seconds first time)
   - The app will download and build on your phone
   - You'll see the login screen when ready

### 6. Create Your First User

1. Tap "Don't have an account? Sign Up"
2. Fill in the form:
   - Full Name: Your Name
   - Email: your-email@example.com
   - Password: Choose a password (min 6 characters)
   - Account Type: Select "Admin/Coordinator"
3. Tap "Sign Up"
4. You'll be redirected to the Admin Dashboard

## 🎉 You're Ready!

The app is now running with:
- ✅ Authentication working
- ✅ Database connected
- ✅ Real-time updates enabled
- ✅ Basic navigation set up

## Next Steps

### Test the Basic Flow

1. **Create a Test Volunteer**
   - Sign out from admin account
   - Sign up with a different email as "Volunteer"
   - Sign in and see the volunteer home screen

2. **Verify Supabase Data**
   - Go to Supabase dashboard
   - Open **Table Editor**
   - Check `profiles` table - you should see both users!

### Start Building Features

The foundation is complete, but these features still need implementation:
- Program creation interface
- Task assignment
- Real-time program updates
- Push notifications
- Countdown timer

See `DEVELOPMENT.md` for the full roadmap and implementation guide.

## Troubleshooting

### "Cannot connect to Metro server"
```bash
# Kill any existing processes
npx kill-port 8081
npm start -- --clear
```

### "Supabase URL is undefined"
- Make sure you created the `.env` file
- Check that the values don't have quotes or extra spaces
- Restart the Expo server after changing .env

### "Authentication error"
- Verify your Supabase project is running
- Check that you ran the schema SQL
- Ensure RLS policies are created (check in Supabase dashboard)

### "No data showing"
- Open Supabase **Table Editor** and verify data exists
- Check browser console for errors
- Verify Realtime is enabled for the tables

### App crashes on startup
```bash
# Clear cache and restart
npm start -- --clear
```

## Development Tips

### Hot Reload
Any changes you make to the code will automatically reload the app. Just save the file!

### Debugging
- Shake your phone to open the Expo menu
- Tap "Debug Remote JS" to use Chrome DevTools
- Check terminal for errors

### View Database
- Use Supabase Table Editor to see real-time data
- Use SQL Editor to run queries
- Use Realtime logs to monitor subscriptions

### Test on Multiple Devices
- Multiple phones can scan the same QR code
- Test admin and volunteer flows simultaneously

## Useful Commands

```bash
# Start development server
npm start

# Start with clear cache
npm start -- --clear

# Run on specific platform
npm run ios
npm run android
npm run web

# Type checking
npx tsc --noEmit

# View all scheduled notifications (useful for testing)
# Add this in your app code:
# await Notifications.getAllScheduledNotificationsAsync()
```

## Getting Help

- Check `README.md` for full documentation
- See `DEVELOPMENT.md` for implementation details
- Open an issue on GitHub for bugs
- Check Expo docs: https://docs.expo.dev
- Check Supabase docs: https://supabase.com/docs

## What's Next?

Now that your app is running, you can:

1. **Explore the code structure**
   - `app/` - All screens
   - `services/` - API calls
   - `types/` - TypeScript definitions

2. **Start implementing features**
   - Begin with program creation (admin screen)
   - Add real-time listeners
   - Build out volunteer interface

3. **Customize the UI**
   - Modify the theme in `app/_layout.tsx`
   - Update colors and styles

Happy coding! 🚀
