# Claude Configuration for Sunday Volunteer App

This directory contains specialized configurations for accelerating development with Claude Code.

## 🤖 Available Agents

### @react-native-supabase-dev
Specialized agent for React Native + Supabase development.

**Use it for:**
- Building new features
- Implementing real-time updates
- Setting up push notifications
- Database operations
- Performance optimization
- Debugging issues

**Quick start:**
```
@react-native-supabase-dev Create the program creation screen for admins
```

See `AGENT_GUIDE.md` for comprehensive documentation and examples.

## 📋 Available Slash Commands

### /agent
Quick reference for using the React Native Supabase agent.

**Usage:**
```
/agent
```

## 📚 Documentation Files

- **AGENT_GUIDE.md** - Complete guide to using the React Native Supabase agent
  - Syntax and examples
  - Common tasks
  - Best practices
  - Debugging tips
  - Project structure reference

## 🚀 Quick Reference

### For Building Features
```
@react-native-supabase-dev [describe what you want to build]
```

### For Getting Help
```
/agent
```

### For Debugging
```
@react-native-supabase-dev [describe the issue you're facing]
```

## 📍 Current Project Status

✅ **Complete:**
- Project setup with TypeScript
- Supabase configuration
- Authentication system
- Database schema with RLS
- Navigation structure
- Core services (auth, database, notifications)

⏳ **In Progress:**
- Admin program creation interface
- Volunteer timeline view
- Real-time updates
- Push notification scheduling

See `../DEVELOPMENT.md` for the complete roadmap.

## 💡 Pro Tips

1. **Be specific** - The more context you provide, the better the agent can help
2. **Reference existing code** - Point to files and patterns already in the project
3. **Ask for explanations** - Don't just get code, understand how it works
4. **Iterate** - Start simple, then ask for enhancements
5. **Use the slash commands** - Quick access to documentation and examples

## 🎯 Your Next Development Steps

1. **Build Program Creation Screen**
   ```
   @react-native-supabase-dev Create app/(admin)/create-program.tsx with form to create programs and add items
   ```

2. **Implement Volunteer Timeline**
   ```
   @react-native-supabase-dev Update app/(volunteer)/home.tsx to display today's program as a timeline with countdown
   ```

3. **Add Real-Time Updates**
   ```
   @react-native-supabase-dev Set up Supabase real-time subscriptions for program changes
   ```

4. **Setup Notifications**
   ```
   @react-native-supabase-dev Implement push notification scheduling when a program is activated
   ```

Happy coding! 🚀
