# Sunday Program Volunteer App

A React Native mobile application for managing volunteer Sunday program flows with real-time notifications.

## Features

- **Role-Based Access**: Admin and Volunteer roles with different permissions
- **Program Management**: Admins can create and manage program flows
- **Task Assignment**: Assign specific tasks to volunteers
- **Real-Time Updates**: Live updates using Supabase Realtime
- **Push Notifications**: Get notified when service starts and for next items
- **Task Tracking**: Volunteers can mark tasks as completed
- **Countdown Timer**: Shows time until service starts

## Tech Stack

- React Native with Expo
- TypeScript
- Supabase (Auth, Database, Realtime)
- Expo Notifications
- React Navigation
- React Native Paper (UI)

## 🤖 Development Agent

This project is configured with a specialized **React Native Supabase development agent** to accelerate your development.

**Quick Start:**
```
@react-native-supabase-dev [describe what you want to build]
```

**Example:**
```
@react-native-supabase-dev Create the program creation screen for admins with form validation and Supabase integration
```

**Documentation:**
- See `.claude/AGENT_GUIDE.md` for complete documentation
- Run `/agent` for quick reference
- The agent can help with features, debugging, optimization, and best practices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase project dashboard, go to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` and run it
4. Get your Supabase credentials:
   - Go to Settings → API
   - Copy your `Project URL` and `anon public` key

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
   ```

### 4. Enable Supabase Realtime

1. In your Supabase dashboard, go to Database → Replication
2. Enable replication for these tables:
   - `profiles`
   - `programs`
   - `program_items`
   - `tasks`

### 5. Run the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
volunteer-sunday-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (admin)/           # Admin screens
│   └── (volunteer)/       # Volunteer screens
├── components/            # Reusable components
├── contexts/              # React contexts (Auth)
├── services/              # API services (Supabase, Auth)
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── constants/             # App constants
└── legal-pages/           # Legal documents (Terms, Privacy Policy)
    ├── index.html         # Homepage
    ├── terms.html         # Terms of Service
    ├── privacy.html       # Privacy Policy
    └── styles.css         # Styling

```

## User Roles

### Admin/Coordinator
- Create and edit program flows
- Assign tasks to volunteers
- View all programs and tasks
- Send notifications to volunteers

### Volunteer
- View today's program schedule
- See assigned tasks
- Mark tasks as complete
- Receive notifications

## Database Schema

### Tables
- **profiles**: User profiles with roles
- **programs**: Sunday program information
- **program_items**: Individual items in a program (with time, duration)
- **tasks**: Tasks assigned to volunteers

### Row Level Security (RLS)
- Profiles: Public read, users can update their own
- Programs: Public read, admins can create/update/delete
- Program Items: Public read, admins can create/update/delete
- Tasks: Users see their own tasks, admins see all

## Features Implementation Status

- ✅ Authentication (Login/Register)
- ✅ Role-based navigation
- ✅ Database schema with RLS
- ⏳ Program creation and management
- ⏳ Task assignment system
- ⏳ Real-time updates
- ⏳ Push notifications
- ⏳ Countdown timer
- ⏳ Task completion tracking

## Development

### Adding New Screens

1. Create a new file in the appropriate folder under `app/`
2. Add it to the corresponding `_layout.tsx` file if needed

### Adding New Database Tables

1. Create the table in Supabase
2. Update `types/database.ts` with the new table definition
3. Add RLS policies for the table
4. Enable Realtime replication if needed

### Testing

```bash
# Run tests (when implemented)
npm test
```

## Deployment

### Building for Production

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

### Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for production
eas build --platform all
```

## Legal Pages

The Terms of Service and Privacy Policy pages are deployed on **Cloudflare Pages** and accessible via the custom domain.

### Live URLs

- **Homepage**: [https://volunteer-app.migokartel.xyz](https://volunteer-app.migokartel.xyz)
- **Terms of Service**: [https://volunteer-app.migokartel.xyz/terms.html](https://volunteer-app.migokartel.xyz/terms.html)
- **Privacy Policy**: [https://volunteer-app.migokartel.xyz/privacy.html](https://volunteer-app.migokartel.xyz/privacy.html)

### Local Files

The legal pages are located in the `legal-pages/` directory:
- `index.html` - Homepage with app information and features
- `terms.html` - Terms of Service page
- `privacy.html` - Privacy Policy page
- `styles.css` - Shared styling for all pages

### Deployment

The legal pages are deployed to Cloudflare Pages. For deployment instructions, see:
- `DEPLOY_TO_CLOUDFLARE.md` - Detailed step-by-step deployment guide
- `CLOUDFLARE_QUICK_START.md` - Quick reference checklist

### Updating Legal Pages

1. Edit the HTML files in `legal-pages/`
2. Commit changes to git
3. Deploy to Cloudflare Pages (see deployment guides above)
4. Changes will be live at the URLs above

**Note**: These URLs are used in the Google Play Store listing and should be kept up-to-date.

## Troubleshooting

### Common Issues

1. **"Supabase URL is undefined"**
   - Make sure you've created a `.env` file and added your Supabase credentials

2. **"Auth session not persisting"**
   - Check that `expo-secure-store` is properly installed
   - Clear app data and reinstall

3. **"Realtime not working"**
   - Ensure you've enabled replication for all tables in Supabase dashboard
   - Check that RLS policies allow reading the data

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
