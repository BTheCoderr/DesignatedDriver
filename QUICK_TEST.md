# Quick Test Guide - See All Screens

## 🎯 You're Currently: **Admin** (Admin Panel)

To test all screens, you need to **logout and login as different roles**.

---

## Step-by-Step Testing

### 1️⃣ Test USER Screens

**Logout → Sign Up as User → Test:**

```
Admin Panel (you're here)
    ↓ [Tap "Logout"]
Login Screen
    ↓ [Tap "Sign up"]
Signup Screen
    ↓ [Enter email, password, name]
Role Select Screen
    ↓ [Tap "I need a driver"]
User Home Screen ✅
    ↓ [Tap "RESCUE" button]
Request Rescue Screen ✅
    ↓ [Add vehicle → Enter destination → Confirm]
Trip Tracking Screen ✅
    ↓ [After trip completes]
Trip Complete Screen ✅
    ↓ [Rate driver → Tap "Report Damage"]
Damage Claims Screen ✅
```

**User Screens You'll See:**
- ✅ User Home (RESCUE button)
- ✅ Request Rescue (multi-step flow)
- ✅ Vehicles (add/edit cars)
- ✅ Trip Tracking (real-time status)
- ✅ Trip Complete (rating & tip)
- ✅ Damage Claims (photo upload)

---

### 2️⃣ Test DRIVER Screens

**Logout → Sign Up as Driver → Test:**

```
User Home (or any screen)
    ↓ [Tap "Logout"]
Login Screen
    ↓ [Tap "Sign up"]
Signup Screen
    ↓ [Enter DIFFERENT email, password, name]
Role Select Screen
    ↓ [Tap "I'm a driver"]
Driver Dashboard ✅
    ↓ [Tap "+ Add Gear for Solo-Scoot"]
Gear Upload Screen ✅
    ↓ [Upload photos → Submit]
Driver Dashboard (gear pending)
    ↓ [Wait for admin approval OR]
    ↓ [Tap available job]
Accept Job Screen ✅
    ↓ [Tap "Accept Job"]
Arrive Screen ✅
    ↓ [Tap "Mark Arrived"]
Trunk Photo Screen ✅ (if Solo-Scoot)
    ↓ [Take photo → Submit]
Drive Screen ✅
    ↓ [Tap "Start Trip"]
Drive Screen (in progress)
    ↓ [Tap "End Trip"]
End Trip Screen ✅
```

**Driver Screens You'll See:**
- ✅ Driver Dashboard (available jobs)
- ✅ Gear Upload (photos for verification)
- ✅ Accept Job (trip details)
- ✅ Arrive (mark arrived)
- ✅ Trunk Photo (Solo-Scoot only)
- ✅ Drive (start/end trip)
- ✅ End Trip (earnings summary)

---

### 3️⃣ Test ADMIN Screens (You're Already Here!)

**From Admin Panel:**

```
Admin Panel ✅ (you're here)
    ↓ [Tap "Gear Verifications"]
Gear Verification Screen ✅
    ↓ [Tap a pending gear]
Gear Review Screen ✅
    ↓ [Approve or Reject]
```

**Admin Screens:**
- ✅ Admin Panel (home)
- ✅ Gear Verification (review & approve)

---

## 🔄 Quick Role Switching

### Option 1: Multiple Accounts (Recommended)
1. **User Account**: `user@test.com` / `test123`
2. **Driver Account**: `driver@test.com` / `test123`
3. **Admin Account**: `admin@test.com` / `test123` (you have this!)

### Option 2: Same Email, Different Roles
- Logout
- Sign up with same email (if allowed)
- Select different role
- Note: Supabase may require different emails

---

## 📱 Screen Navigation Map

```
┌─────────────────────────────────────┐
│         AUTH SCREENS                │
├─────────────────────────────────────┤
│ Login → Signup → Role Select        │
└─────────────────────────────────────┘
           ↓
    ┌─────────────┐
    │ Choose Role │
    └─────────────┘
      ↓    ↓    ↓
   USER  DRIVER  ADMIN
    ↓      ↓      ↓
   ┌─────────────────────┐
   │  USER FLOW          │
   ├─────────────────────┤
   │ Home                │
   │ → Request Rescue    │
   │ → Trip Tracking     │
   │ → Trip Complete     │
   │ → Damage Claims     │
   └─────────────────────┘
   
   ┌─────────────────────┐
   │  DRIVER FLOW         │
   ├─────────────────────┤
   │ Dashboard            │
   │ → Gear Upload        │
   │ → Accept Job         │
   │ → Arrive             │
   │ → Trunk Photo        │
   │ → Drive              │
   │ → End Trip           │
   └─────────────────────┘
   
   ┌─────────────────────┐
   │  ADMIN FLOW          │
   ├─────────────────────┤
   │ Admin Panel         │
   │ → Gear Verification  │
   └─────────────────────┘
```

---

## 🧪 Test Checklist

### ✅ User Flow
- [ ] Sign up as user
- [ ] Add vehicle
- [ ] Request rescue
- [ ] View trip tracking
- [ ] Complete trip & rate
- [ ] Report damage

### ✅ Driver Flow
- [ ] Sign up as driver
- [ ] Upload gear
- [ ] Accept job
- [ ] Mark arrived
- [ ] Take trunk photo
- [ ] Start trip
- [ ] End trip

### ✅ Admin Flow
- [ ] View pending gear
- [ ] Approve/reject gear

---

## 💡 Pro Tips

1. **Use Different Browsers/Tabs**: Open user in one tab, driver in another
2. **Mobile + Web**: Test on phone (Expo Go) and web simultaneously
3. **Real-time Testing**: Open trip tracking on user device, update status on driver device
4. **Storage Setup**: Make sure Supabase Storage buckets exist before testing photo uploads

---

## 🚀 Quick Start

**Right Now:**
1. Tap **"Logout"** on admin panel
2. Tap **"Sign up"**
3. Enter: `user@test.com` / `test123456`
4. Select **"I need a driver"**
5. You'll see the **User Home** with the big RESCUE button!

**Then:**
- Tap **RESCUE** → Test the full request flow
- Tap **"Manage Vehicles"** → Add a car
- Complete a trip → Rate the driver

---

Ready to test! Start by logging out and creating a user account. 🚗
