# Claude Code Rules for Volunteer Sunday App

## Database Migrations

### Migration File Naming Convention

Migration files in `supabase/migrations/` MUST follow this format:

```
YYYYMMDDHHMMSS_description.sql
```

**Format Requirements:**
- `YYYY` - 4-digit year (e.g., 2025)
- `MM` - 2-digit month (01-12)
- `DD` - 2-digit day (01-31)
- `HH` - 2-digit hour in 24-hour format (00-23)
- `MM` - 2-digit minute (00-59)
- `SS` - 2-digit second (00-59)
- `description` - Snake_case description of the migration

**Examples:**
- ✅ `20251020091500_initial_schema.sql`
- ✅ `20251020102030_add_guest_access.sql`
- ❌ `20251020000000_initial_schema.sql` (invalid time - midnight with all zeros)
- ❌ `initial_schema.sql` (missing timestamp)

**Why?**
- Supabase uses timestamps to determine migration order
- Invalid timestamps (like 000000 for time) can cause issues with migration tracking
- Proper timestamps ensure migrations run in the correct sequence

### Creating New Migrations

When creating a new migration:

```bash
# Let Supabase CLI generate the timestamp
supabase migration new description_of_change

# Or manually create with current timestamp
# Format: YYYYMMDDHHMMSS_description.sql
```

## Project Structure

This is a React Native Expo app with Supabase backend for managing volunteer Sunday programs.

**Key Technologies:**
- React Native with Expo SDK 54
- TypeScript
- Supabase (PostgreSQL, Auth, Realtime)
- React Native Paper (UI)
- Expo Router (file-based routing)

**Platform Support:**
- iOS (native)
- Android (native)
- Web

## Environment Variables

All client-side environment variables MUST use the `EXPO_PUBLIC_` prefix:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Platform-Specific Code

When using platform-specific features:

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific code (use localStorage)
} else {
  // Native code (use SecureStore, AsyncStorage)
}
```

**Common Platform Differences:**
- Storage: `localStorage` (web) vs `SecureStore`/`AsyncStorage` (native)
- Deep linking: Different URL schemes
- Notifications: Different permission handling

## Authentication Flow

### Email Confirmation

The remote Supabase project has email confirmation enabled. The registration workflow:

1. **User registers** → `app/(auth)/register.tsx`
2. **Signup succeeds** → Redirect to `app/(auth)/confirm-email.tsx`
3. **User checks email** → Clicks confirmation link
4. **Email confirmed** → User can sign in via `app/(auth)/login.tsx`

**Resend Email Functionality:**

The confirm-email screen includes a "Resend Email" button using:

```typescript
await supabase.auth.resend({
  type: 'signup',
  email: email,
});
```

**Important:**
- Users cannot sign in until email is confirmed
- The database trigger creates the profile automatically on signup
- No manual profile insertion needed in application code
