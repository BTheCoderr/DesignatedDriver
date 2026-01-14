# Testing Guide - Designated Driver MVP

## Quick Start: Testing All Roles

### Step 1: Create Test Accounts

You need **3 different accounts** to test everything:

1. **User Account** - Request rescues, rate drivers
2. **Driver Account** - Accept jobs, complete trips
3. **Admin Account** - Verify driver gear (you already have this!)

---

## Testing Flow

### A) User Flow (Request Rescue)

1. **Logout** from admin panel
2. **Sign up** as a new user (or login if you have one)
3. **Select role**: Choose "User" when prompted
4. **Add a vehicle**:
   - Tap "Manage Vehicles" on home screen
   - Add: Make: "Toyota", Model: "Camry", Year: "2020"
5. **Request Rescue**:
   - Tap the big blue "RESCUE" button
   - Select your vehicle
   - Enter destination: "123 Main St, San Francisco, CA"
   - Review price and confirm
   - You'll see trip tracking screen

---

### B) Driver Flow (Complete Job)

1. **Logout** from current account
2. **Sign up** as a new driver (use different email)
3. **Select role**: Choose "Driver" when prompted
4. **Upload Gear** (for Solo-Scoot):
   - Tap "+ Add Gear for Solo-Scoot"
   - Select gear type: "Folding Scooter"
   - Take/upload photos of your device
   - Submit for verification
5. **View Available Jobs**:
   - Dashboard shows available trips
   - Tap a job to see details
6. **Accept Job**:
   - Review trip details
   - Tap "Accept Job"
7. **Mark Arrived**:
   - Navigate to pickup location
   - Tap "Mark Arrived"
8. **Trunk Photo** (if Solo-Scoot):
   - Take photo of device in trunk
   - Check "Device secured" checkbox
   - Submit
9. **Start Trip**:
   - Tap "Start Trip" (binds insurance)
   - Navigate to destination
10. **End Trip**:
    - Tap "End Trip" when arrived
    - View earnings summary
    - Wait for customer rating

---

### C) Admin Flow (Verify Gear)

1. **Login** as admin (you're already here!)
2. **Gear Verification**:
   - Tap "Gear Verifications" card
   - See list of pending verifications
   - Tap a gear submission
   - Review photos and details
   - Add admin notes (optional)
   - Tap "Approve" or "Reject"
3. **After Approval**:
   - Driver can now accept Solo-Scoot jobs
   - Status updates in real-time

---

## Testing Checklist

### ✅ User Features
- [ ] Sign up as user
- [ ] Add vehicle
- [ ] Request rescue
- [ ] View trip tracking
- [ ] Complete trip and rate driver
- [ ] Add tip
- [ ] Report damage claim

### ✅ Driver Features
- [ ] Sign up as driver
- [ ] Upload gear photos
- [ ] View available jobs
- [ ] Accept job
- [ ] Mark arrived
- [ ] Take trunk photo (Solo-Scoot)
- [ ] Start trip
- [ ] End trip
- [ ] View earnings

### ✅ Admin Features
- [ ] View pending gear verifications
- [ ] Review gear photos
- [ ] Approve gear
- [ ] Reject gear with notes

### ✅ Real-time Features
- [ ] Open trip tracking on user device
- [ ] Update trip status on driver device
- [ ] See status change in real-time

---

## Quick Navigation Tips

### Switch Between Accounts
1. Tap "Logout" on any screen
2. Login with different email
3. Or create new account

### Test Different Scenarios

**Solo-Scoot Trip:**
- User requests rescue
- Driver with verified gear accepts
- Driver takes trunk photo
- Trip completes

**Chase Car Trip:**
- User requests rescue
- Two drivers needed (or one driver can accept as primary)
- No trunk photo needed
- Trip completes

**Damage Claim:**
- Complete a trip as user
- On trip complete screen, tap "Report Damage"
- Upload photos, describe damage
- Submit claim

---

## Common Issues & Solutions

### "No jobs available"
- Make sure a user has requested a rescue first
- Check that trip status is "requested"

### "Gear not verified"
- Admin needs to approve driver's gear first
- Check admin panel for pending verifications

### "Can't upload photos"
- Check Supabase Storage buckets are created:
  - `driver-gear-photos`
  - `trunk-photos`
  - `damage-claims`

### "Trip not updating"
- Check Supabase Realtime is enabled
- Refresh the screen
- Check network connection

---

## Test Accounts (Optional)

You can create these accounts for quick testing:

**User:**
- Email: `testuser@test.com`
- Password: `test123456`
- Role: User

**Driver:**
- Email: `testdriver@test.com`
- Password: `test123456`
- Role: Driver

**Admin:**
- Email: `admin@test.com`
- Password: `test123456`
- Role: Admin (set in Supabase dashboard)

---

## Next Steps

1. **Test User Flow**: Logout → Sign up as user → Request rescue
2. **Test Driver Flow**: Logout → Sign up as driver → Upload gear → Accept job
3. **Test Admin Flow**: Login as admin → Verify gear
4. **Test Full Cycle**: User requests → Driver accepts → Complete trip → Rate

Happy testing! 🚗
