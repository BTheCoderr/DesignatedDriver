# Disable Email Confirmation for Testing

## Quick Fix

To disable email confirmation so signup works immediately:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/dhukigiaeoombdzueklp

2. **Navigate to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "Settings" tab

3. **Disable Email Confirmation**
   - Find "Email Auth" section
   - Toggle OFF "Enable email confirmations"
   - Click "Save"

4. **Test Signup**
   - Now you can signup and immediately login
   - No email confirmation needed

## Alternative: Use Test Email

If you want to keep email confirmation enabled:
- Check your email inbox for the confirmation link
- Click the link to verify
- Then you can login

## Rate Limiting

If you see "429 Too Many Requests" or "wait X seconds":
- You've tried signing up too many times
- Wait 60 seconds before trying again
- This is Supabase's security feature to prevent spam
