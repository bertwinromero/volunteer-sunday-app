# 🧪 Testing Guest/Volunteer Access (No Account Needed)

## Test Flow Overview

Volunteers can join and view programs **without creating an account**!

## 📱 Step-by-Step Testing

### **Step 1: Admin Creates & Shares Program**

1. **Login as Admin**
   - Email: (your admin account)
   - Password: (your password)

2. **Create a Program**
   - Tap "New Program" button
   - Fill in program details
   - Add program items
   - Tap "Create Program"

3. **Get Share Code**
   - Tap on the program card
   - Tap the purple share icon
   - Toggle "Public Access" ON
   - You'll see:
     - **6-character code** (e.g., "T5Z835")
     - **Share link** (e.g., "exp://...")

4. **Share with Volunteer**
   - Tap "Copy Code" or "Copy Link"
   - Send via SMS, WhatsApp, etc.

---

### **Step 2: Volunteer Joins (Guest - No Account)**

#### **Option A: Using the Share Code** ✅ (Recommended for testing)

1. **Open App** (as a different user/device)
   - You should see the **Welcome Screen**

2. **Tap "Join Program"**

3. **Enter the 6-Character Code**
   - Type: "T5Z835" (or whatever code you got)
   - Tap "Continue"

4. **Enter Your Details**
   - Name (optional for guests)
   - No login required!

5. **View Live Program** 🎉
   - See all program items
   - Live timeline updates
   - "What's Next" section
   - Current item highlighted

#### **Option B: Using the Share Link** (Works on same network)

1. **Tap the shared link**
   - Opens app automatically
   - Skips code entry
   - Goes straight to program view

---

## 🧑‍💻 Testing on Different Devices

### **Single Device Testing:**
1. Logout from admin account
2. Return to welcome screen
3. Tap "Join Program"
4. Enter the share code

### **Multiple Device Testing:**
1. **Device 1**: Admin account - Create program
2. **Device 2**: Guest - Join with code
3. Both see the same program!

---

## ✅ What to Test

### Guest Volunteer Features:
- ✅ Join without creating account
- ✅ Enter share code
- ✅ View program timeline
- ✅ See current item highlighted
- ✅ "What's Next" section
- ✅ Time countdown for upcoming items
- ✅ Pull to refresh
- ✅ Leave program button

### Share Features:
- ✅ Copy code to clipboard
- ✅ Copy link to clipboard
- ✅ Native share dialog
- ✅ Toggle public access on/off
- ✅ Regenerate code

---

## 🎯 Expected Results

### When Code is Valid:
- ✅ Volunteer joins instantly
- ✅ Sees live program flow
- ✅ Auto-updates current item

### When Code is Invalid:
- ❌ "Program not found" message
- Volunteer can try again

### When Public Access is OFF:
- ❌ Code doesn't work
- "Program not found" message

---

## 🐛 Common Issues & Fixes

### Issue: "Program not found"
**Fix:** 
- Check public access is ON
- Verify the code is correct
- Program must exist and be active

### Issue: Link doesn't work
**Fix:**
- Use share code instead (always works!)
- Links only work on same network in development

### Issue: Can't see program
**Fix:**
- Make sure volunteer is on Join screen, not login
- Guest access doesn't require account

---

## 📝 Testing Checklist

- [ ] Admin creates program
- [ ] Admin enables public access
- [ ] Admin copies share code
- [ ] Volunteer taps "Join Program"
- [ ] Volunteer enters code
- [ ] Volunteer sees program timeline
- [ ] Current item updates automatically
- [ ] Volunteer can leave program
- [ ] Code stops working when public access disabled

---

## 🚀 Next Steps

After testing works well:
1. Build production app (see BUILD_INSTRUCTIONS.md)
2. Share links will work from anywhere
3. Ready to deploy to volunteers!

