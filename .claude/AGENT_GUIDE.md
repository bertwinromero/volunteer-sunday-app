# React Native Supabase Development Agent Guide

This project now has access to the specialized **@react-native-supabase-dev** agent for accelerated development.

## 🎯 What is the Agent?

The `@react-native-supabase-dev` agent is a specialized AI assistant optimized for:
- React Native mobile app development
- Supabase backend integration
- Authentication and database operations
- Real-time subscriptions
- Push notifications
- Performance optimization
- TypeScript type safety

## ✅ Your Current Setup

Your app foundation is complete with:
- ✅ Supabase configured and connected
- ✅ Authentication system (Login/Register)
- ✅ Role-based navigation (Admin/Volunteer)
- ✅ Database schema with RLS policies
- ✅ TypeScript types for full type safety
- ✅ Services layer (auth, database, notifications)

## 🚀 How to Use the Agent

### Syntax
```
@react-native-supabase-dev <your request>
```

### Example Commands

#### 1. Building Admin Features
```
@react-native-supabase-dev Help me create a program creation screen where admins can:
- Enter program title and date
- Add multiple program items with times
- Assign tasks to volunteers
- Activate the program
```

#### 2. Real-Time Features
```
@react-native-supabase-dev Implement real-time subscriptions so when an admin updates a program, all volunteers see the changes immediately on their home screen
```

#### 3. Notification Setup
```
@react-native-supabase-dev Set up push notifications to alert volunteers 15 minutes before service starts and 2 minutes before each program item
```

#### 4. Database Queries
```
@react-native-supabase-dev Create a hook to fetch today's active program with all its items and tasks for the current user
```

#### 5. UI Components
```
@react-native-supabase-dev Build a timeline component for volunteers showing today's program items with countdown timers
```

#### 6. Authentication Enhancements
```
@react-native-supabase-dev Add password reset functionality and email verification
```

#### 7. Performance Optimization
```
@react-native-supabase-dev Optimize the program list rendering and add pull-to-refresh functionality
```

#### 8. Testing
```
@react-native-supabase-dev Help me test the task assignment flow - I need to assign multiple tasks to different volunteers
```

## 📋 Current Implementation Priorities

### High Priority (Next Steps)
1. **Program Creation Screen** (Admin)
   - Form to create new programs
   - Add/edit/delete program items
   - Time picker for each item
   - Save to Supabase

2. **Volunteer Home Screen**
   - Display today's program
   - Show assigned tasks
   - Countdown to service start
   - "What's Next" indicator

3. **Real-Time Updates**
   - Subscribe to program changes
   - Auto-update volunteer screens
   - Live task completion status

4. **Push Notifications**
   - Register push tokens
   - Schedule notifications
   - Handle notification taps

### Medium Priority
5. **Task Assignment Interface** (Admin)
6. **Task Completion** (Volunteer)
7. **Program History**
8. **Settings and Profile**

## 💡 Best Practices When Using the Agent

### 1. Be Specific
❌ "Add features"
✅ "Create a program editor screen with drag-to-reorder items, time pickers, and save to Supabase"

### 2. Reference Existing Code
```
@react-native-supabase-dev Looking at the existing authService in services/auth.ts, create a similar programService that handles CRUD operations for programs
```

### 3. Ask for Testing Help
```
@react-native-supabase-dev I created the program creation screen but it's not saving to Supabase. Can you debug the issue?
```

### 4. Request Best Practices
```
@react-native-supabase-dev What's the best way to structure real-time subscriptions in React Native? Should I use useEffect or a custom hook?
```

### 5. Get Code Reviews
```
@react-native-supabase-dev Review my notification scheduling logic in services/notifications.ts - is there a better approach?
```

## 🛠️ Common Tasks

### Adding a New Screen
```
@react-native-supabase-dev Create a new admin screen at app/(admin)/create-program.tsx for creating programs. Include:
- Title input
- Date picker using @react-native-community/datetimepicker
- Save button that calls databaseService.createProgram
- Navigation back to dashboard on success
```

### Creating a Custom Hook
```
@react-native-supabase-dev Create a custom hook useProgram(programId) that:
- Fetches program details from Supabase
- Subscribes to real-time updates
- Returns loading and error states
- Automatically cleans up subscriptions
```

### Implementing a Feature
```
@react-native-supabase-dev Implement the complete flow for admins to activate a program:
1. Update program status to 'active' in database
2. Deactivate any other programs on the same date
3. Schedule notifications for all volunteers
4. Show success message
```

## 📁 Project Structure Reference

```
/app
  /(auth)           # Login/Register screens
  /(admin)          # Admin screens (dashboard, create program, etc.)
  /(volunteer)      # Volunteer screens (home, tasks, etc.)

/services
  supabase.ts       # Supabase client
  auth.ts           # Authentication service
  database.ts       # Database operations
  notifications.ts  # Push notification service

/contexts
  AuthContext.tsx   # Auth state management

/types
  database.ts       # Database schema types
  models.ts         # Application models

/components        # Reusable UI components
/hooks            # Custom React hooks
```

## 🔍 Debugging with the Agent

### Check Real-Time Connections
```
@react-native-supabase-dev My real-time subscription isn't working. Help me debug - should I check RLS policies or the subscription setup?
```

### Database Issues
```
@react-native-supabase-dev I'm getting "new row violates row-level security policy" when trying to create a program. What's wrong with my RLS policies?
```

### Performance Problems
```
@react-native-supabase-dev The volunteer home screen is slow when loading today's program. How can I optimize the query and reduce re-renders?
```

## 📚 Additional Resources

### Your Documentation
- `README.md` - Full project overview
- `QUICKSTART.md` - Setup guide
- `DEVELOPMENT.md` - Complete roadmap
- `supabase-schema.sql` - Database schema

### External Links
- [React Native Docs](https://reactnative.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## 🎯 Quick Start Examples

### Example 1: Build Program Creation Flow
```
@react-native-supabase-dev I need to build the complete program creation flow:

1. Create app/(admin)/create-program.tsx with:
   - Text input for program title
   - Date picker for program date
   - "Add Item" button
   - List of program items (can add/edit/delete)
   - Each item has: time, title, description, duration
   - Save button

2. Create a ProgramItemForm component for adding items

3. Use databaseService.createProgram and databaseService.createProgramItem

4. Show loading states and error messages

5. Navigate back to dashboard on success
```

### Example 2: Add Real-Time Updates
```
@react-native-supabase-dev Update app/(volunteer)/home.tsx to:

1. Subscribe to real-time changes for today's program
2. When the program is updated, automatically refresh the display
3. Show a toast notification when changes occur
4. Clean up subscription when component unmounts
5. Handle connection errors gracefully
```

### Example 3: Implement Task Completion
```
@react-native-supabase-dev In the volunteer home screen:

1. Display user's assigned tasks for today
2. Add a checkbox or button to mark tasks complete
3. Call databaseService.completeTask(taskId)
4. Update UI optimistically
5. Show success animation
6. Update the task list in real-time
```

## ⚡ Pro Tips

1. **Always provide context**: Mention which files you're working with
2. **Reference existing patterns**: Point to similar code already in the project
3. **Ask for explanations**: Don't just get code - understand how it works
4. **Request tests**: Ask for test scenarios and edge cases
5. **Iterate**: Start simple, then ask for enhancements

## 🚀 Get Started Now!

Try this first command:
```
@react-native-supabase-dev Create the program creation screen for admins. Use the existing databaseService and follow the patterns in the login screen for form handling.
```

Happy coding! 🎉
