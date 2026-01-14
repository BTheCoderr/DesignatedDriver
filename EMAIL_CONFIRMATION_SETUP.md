# Email Confirmation Setup - DesignatedDriver

## How It Works

When email confirmation is **enabled** in Supabase:

1. **User signs up** → Account created, but email not confirmed
2. **User receives email** → Confirmation link sent to their email
3. **User clicks link** → Email confirmed, profile auto-created via trigger
4. **User can login** → Now authenticated and can use the app

## Setup Steps

### 1. Enable Email Confirmation (Default)

In Supabase Dashboard:
- Go to **Authentication → Settings**
- Under **Email Auth**, make sure **"Enable email confirmations"** is **ON**
- Save changes

### 2. Run Database Trigger

Run this SQL in Supabase SQL Editor:

```sql
-- See email_confirmation_trigger.sql
```

This trigger automatically creates a profile when a user confirms their email.

### 3. Configure Email Templates (Optional)

In Supabase Dashboard:
- Go to **Authentication → Email Templates**
- Customize the confirmation email if desired
- Default template works fine for MVP

## Testing the Flow

1. **Sign up** with a real email address
2. **Check email** for confirmation link
3. **Click link** to confirm
4. **Login** with your credentials
5. **Should redirect** to role selection or home screen

## Troubleshooting

**User created but no profile?**
- Check if trigger is installed (run email_confirmation_trigger.sql)
- Check Supabase logs for errors
- Verify email was actually confirmed

**Not receiving emails?**
- Check spam folder
- Verify email address is correct
- Check Supabase Dashboard → Authentication → Users (see if email was sent)
- Check Supabase logs for email delivery errors

**Profile created but can't login?**
- Make sure email is confirmed (check auth.users table)
- Check if profile exists in profiles table
- Verify role is set correctly
