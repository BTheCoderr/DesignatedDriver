# How to Create Test Accounts for MVP

## Quick Setup (5 minutes)

### Option 1: Create via App (Easiest)

1. **Create User Account:**
   - Open app → Sign up
   - Email: `testuser@example.com`
   - Password: `test123`
   - Select "User" role
   - Add a vehicle (any make/model/year is fine)

2. **Create Driver Account:**
   - Open app in incognito/private window (or logout)
   - Sign up with: `testdriver@example.com`
   - Password: `test123`
   - Select "Driver" role
   - (Optional) Upload gear photo for Solo-Scoot capability

3. **Create Admin Account:**
   - Sign up with: `admin@example.com`
   - Password: `test123`
   - Select "User" role (we'll change it)
   - Then go to Supabase Dashboard → SQL Editor → Run:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
     ```

### Option 2: Create via Supabase Dashboard

1. **Create Users:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User"
   - Email: `testdriver@example.com`
   - Password: `test123`
   - Click "Create User"

2. **Create Profile:**
   - Go to SQL Editor → Run:
     ```sql
     INSERT INTO public.profiles (id, email, phone, full_name, role)
     VALUES (
       'USER_ID_FROM_AUTH_DASHBOARD',
       'testdriver@example.com',
       '4015550002',
       'Test Driver',
       'driver'
     );
     ```
   - Replace `USER_ID_FROM_AUTH_DASHBOARD` with the actual user ID from the Auth dashboard

## Verify Test Accounts

Run in Supabase SQL Editor:

```sql
SELECT id, email, role, full_name FROM public.profiles ORDER BY role;
```

You should see:
- 1+ user accounts
- 1+ driver accounts  
- 1 admin account (optional)

## Test Flow

1. **Login as User:**
   - Email: `testuser@example.com`
   - Password: `test123`
   - Request a rescue

2. **Login as Driver:**
   - Email: `testdriver@example.com`
   - Password: `test123`
   - Accept the job from dashboard

3. **Test Trip Flow:**
   - User requests → Status: "Looking for driver"
   - Driver accepts → Status: "Driver accepted - En route"
   - Driver starts trip → Status: "In progress"
   - Driver ends trip → Status: "Completed"
   - User leaves feedback

## Quick SQL Commands

**Make someone a driver:**
```sql
UPDATE public.profiles SET role = 'driver' WHERE email = 'YOUR_EMAIL';
```

**Make someone an admin:**
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';
```

**View all trips:**
```sql
SELECT 
  t.id, 
  t.status, 
  t.dispatch_mode,
  p.email as user_email,
  t.pickup_address,
  t.destination_address,
  t.created_at
FROM public.trips t 
JOIN public.profiles p ON t.user_id = p.id 
ORDER BY t.created_at DESC;
```

**Delete test trips (cleanup):**
```sql
DELETE FROM public.trips WHERE status = 'requested';
```

## Recommended Test Accounts

| Email | Role | Password | Purpose |
|-------|------|----------|---------|
| `testuser1@example.com` | user | `test123` | Request trips |
| `testuser2@example.com` | user | `test123` | Request trips |
| `testdriver1@example.com` | driver | `test123` | Accept jobs |
| `testdriver2@example.com` | driver | `test123` | Accept jobs |
| `admin@example.com` | admin | `test123` | Verify gear, manage |

## Notes

- **Passwords:** Keep them simple for testing (`test123`, `password`, etc.)
- **Emails:** Use `@example.com` (not real emails) for testing
- **Roles:** Can be changed anytime with SQL `UPDATE` command
- **Vehicles:** Users need at least 1 vehicle to request trips
- **Gear:** Drivers need verified gear to accept Solo-Scoot trips (optional for Chase Car)

---

**Troubleshooting:**

If signup fails:
- Check Supabase Auth settings (email confirmation might be enabled - disable for testing)
- Check browser console for errors
- Verify Supabase API keys in `.env`

If profile not created:
- Check if trigger exists: `CREATE_PROFILE_ON_SIGNUP`
- Manually create: `INSERT INTO public.profiles (id, email, phone, full_name, role) VALUES (...)`
