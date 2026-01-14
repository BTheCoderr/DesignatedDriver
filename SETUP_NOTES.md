# DesignatedDriver Setup Notes

## Supabase Email Confirmation

By default, Supabase requires email confirmation for new signups. To disable this for testing:

1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Email Auth" section
3. Toggle OFF "Enable email confirmations"
4. Save changes

This will allow immediate signup without email verification.

## Testing Signup

If email confirmation is enabled:
- User will receive an email
- Must click confirmation link
- Then can login

If email confirmation is disabled:
- User can signup and immediately login
- Profile is created automatically
- Redirects to role selection

## Web vs Mobile

The app works on both web and mobile. The signup/login flow is identical.

## Troubleshooting Signup

If signup isn't working:
1. Check browser console for errors (F12)
2. Check Supabase Dashboard → Authentication → Users (see if user was created)
3. Check Supabase Dashboard → Table Editor → profiles (see if profile was created)
4. Check if email confirmation is required
