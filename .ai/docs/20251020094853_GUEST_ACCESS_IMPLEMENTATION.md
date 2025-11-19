# Guest Access Implementation Progress

## Overview
This document tracks the implementation of the hybrid guest + authenticated access system, allowing volunteers to join programs via public links without creating accounts, while still supporting registered users with enhanced features.

## ✅ Completed (Phase 1: Database & Services)

### 1. Database Schema Updates
**Files Modified:**
- `supabase-schema.sql` - Complete schema with new tables and fields
- `supabase-migration-guest-access.sql` - Migration for existing databases

**Changes:**
- **Programs table**: Added `share_code`, `share_token`, `public_access_enabled`, `active_participants_count`
- **New table**: `participant_roles` - Predefined volunteer roles (Usher, Worship Team, Tech Team, etc.)
- **New table**: `program_participants` - Tracks both guest and registered participants
- **Auto-generate share codes**: 6-character unique codes (e.g., "ABC123") via database trigger
- **RLS policies**: Public read access for programs with valid tokens, guest participant insertion
- **Indexes**: Optimized for share code/token lookups and participant queries
- **Default roles**: 8 predefined roles inserted automatically

### 2. TypeScript Type Definitions
**Files Modified:**
- `types/database.ts` - Added database table types for new tables
- `types/models.ts` - Added business logic types

**New Types:**
- `ParticipantRole`, `ParticipantRoleInsert`, `ParticipantRoleUpdate`
- `ProgramParticipant`, `ProgramParticipantInsert`, `ProgramParticipantUpdate`
- `ProgramWithParticipants`, `ProgramWithItemsAndParticipants`
- `GuestSession`, `ShareLink`, `JoinProgramRequest`

### 3. Core Services
**Files Created:**

#### `services/shareService.ts`
- `getShareLink(programId)` - Generate shareable link for program
- `getProgramByCode(code)` - Find program by 6-character code
- `getProgramByToken(token)` - Find program by UUID token
- `regenerateShareCode(programId)` - Generate new share code
- `setPublicAccess(programId, enabled)` - Enable/disable public access
- `formatShareMessage(shareLink, title)` - Format message for sharing

#### `services/participantService.ts`
- `joinProgram(request)` - Join as guest or registered user
- `getGuestSession()` - Retrieve guest session from AsyncStorage
- `clearGuestSession()` - Clear guest session
- `updateLastActive(participantId)` - Heartbeat update
- `startHeartbeat(participantId)` - Auto-update last_active every 30s
- `stopHeartbeat(intervalId)` - Stop heartbeat
- `getParticipants(programId)` - Get all participants
- `getActiveParticipants(programId)` - Get active participants (last 5 min)
- `updateParticipantCount(programId)` - Update active count
- `getParticipantRoles()` - Get available roles
- `getDeviceId()` - Generate unique device identifier
- `leaveProgram(participantId, programId)` - Mark as inactive

**Files Modified:**

#### `services/database.ts`
Added functions:
- `getParticipantRoles()` - CRUD for participant roles
- `createParticipantRole(role)`
- `updateParticipantRole(id, updates)`
- `deleteParticipantRole(id)`
- `getProgramParticipants(programId)` - CRUD for program participants
- `getActiveProgramParticipants(programId)`
- `createProgramParticipant(participant)`
- `updateProgramParticipant(id, updates)`
- `deleteProgramParticipant(id)`
- `getUserParticipationHistory(userId)` - Get user's past programs

## ✅ Completed (Phase 2: UI Components)

### Dependencies Installed
- ✅ `@react-native-async-storage/async-storage` - Guest session persistence
- ✅ `expo-clipboard` - Copy share codes and links

### UI Screens Created

1. **Welcome Screen** (`app/index.tsx`) ✅
   - Three options: Sign In | Sign Up | Join Program
   - Similar to Zoom meeting entry
   - Auto-redirects authenticated users

2. **Guest Flow Screens** (`app/(guest)/`) ✅
   - `join.tsx` - Enter 6-digit code or process deep link
   - `details.tsx` - Enter full name and select role
   - `program/[id].tsx` - View live program timeline with countdown

3. **Admin Screens** (`app/(admin)/programs/`) ✅
   - `create.tsx` - Program creation with auto-generated share codes
   - `[id]/share.tsx` - View/share program link and code
   - `[id]/participants.tsx` - Live participants panel (like Zoom)

4. **Shared Components** ✅
   - `components/ParticipantsList.tsx` - Reusable participants UI

### Features Implemented

**Guest Flow:**
- 6-character code entry with validation
- Deep link support (auto-join via link)
- Role selection from database
- Real-time program timeline
- "What's Next" indicator
- Heartbeat system (30s updates)
- Pull-to-refresh
- Session persistence

**Admin Flow:**
- Multi-item program creation
- Auto-generated unique share codes
- Copy code/link to clipboard
- Share via native share dialog
- Regenerate share codes
- Toggle public access
- Live participant tracking
- Real-time participant updates
- Filter by active/all/guests/registered
- Statistics dashboard

## 📋 Pending (Phase 3: Advanced Features)

1. **Deep Linking** (`app.json` + linking config)
   - Universal links: `myapp://program/[token]`
   - Handle deep link navigation

2. **Notification Scheduler** (`services/notificationScheduler.ts`)
   - Background service to monitor active programs
   - Send notifications 1 min before each program item
   - Target ALL participants (registered + guests with push tokens)

3. **Routing Updates** (`app/_layout.tsx`)
   - Support guest vs authenticated routing
   - Persist guest sessions

## Database Schema Highlights

### Programs Table (Updated)
```sql
- share_code: text (unique, 6 chars like "ABC123")
- share_token: uuid (for deep links)
- public_access_enabled: boolean (default true)
- active_participants_count: integer
```

### Participant Roles Table (New)
```sql
- id, role_name, description, display_order, is_active
- Default roles: Usher, Worship Team, Tech Team, etc.
```

### Program Participants Table (New)
```sql
- program_id, user_id (nullable for guests)
- full_name, role, expo_push_token
- is_guest, device_id
- joined_at, last_active
```

## Key Features Implemented

### Share Code Auto-Generation
- Database trigger automatically generates unique 6-character codes
- Uses characters: A-Z (excluding I, O) and 2-9 (avoiding 0, 1)
- Collision detection with retry logic

### Guest Session Management
- Stored in AsyncStorage for persistence
- Heartbeat every 30 seconds to update `last_active`
- Active status: last_active within 5 minutes

### Real-time Participant Tracking
- Supabase Realtime enabled on `program_participants`
- Live count updates for coordinators
- See who's currently viewing (like Zoom participants)

## User Flow Examples

### Guest Volunteer Flow
1. Receives link: `myapp://program/abc-123-def`
2. Opens app → "Join Program" screen auto-populated
3. Enters name: "John Smith"
4. Selects role: "Usher"
5. Views live program flow + receives notifications

### Registered Volunteer Flow
1. Signs in with account
2. Can join via link OR browse active programs
3. Gets task assignments (guests cannot)
4. Views participation history
5. Customizes notification preferences

### Admin/Coordinator Flow
1. Creates program flow
2. Clicks "Generate Share Link"
3. Gets code "XYZ789" + link
4. Shares via message/email
5. Sees live participant list with names and roles

## Migration Instructions

### For New Databases
Run the complete schema:
```sql
supabase-schema.sql
```

### For Existing Databases
Run the migration:
```sql
supabase-migration-guest-access.sql
```

This will:
- Add new columns to programs table
- Create participant_roles and program_participants tables
- Add indexes and RLS policies
- Insert default participant roles
- Generate share codes/tokens for existing programs

## Next Session Tasks

Priority order for continuing implementation:

1. ✅ Install `@react-native-async-storage/async-storage`
2. Create welcome screen with 3 options
3. Build guest join flow (code entry + details)
4. Implement deep linking configuration
5. Create participants list component
6. Build admin program creation with share link
7. Add participant panel for coordinators
8. Implement notification scheduler

## Notes

- Guest sessions persist across app restarts via AsyncStorage
- Device ID prevents duplicate guest entries
- Registered users can still be assigned tasks (guests cannot)
- Public access can be toggled per program
- Share codes can be regenerated if compromised
- Participant history retained for analytics

## Testing Checklist

Once UI is complete, test:
- [ ] Guest can join via 6-digit code
- [ ] Guest can join via deep link
- [ ] Registered user joins via link
- [ ] Heartbeat updates last_active
- [ ] Active participant count accurate
- [ ] Coordinator sees live participant list
- [ ] Share link generation works
- [ ] Share code regeneration works
- [ ] Public access toggle works
- [ ] Guests receive notifications
- [ ] Registered users see participation history
