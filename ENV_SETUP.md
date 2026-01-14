# Environment Variables Setup

## The Problem

You're seeing "Invalid API key" errors because the Supabase API key in your `.env` file is either:
1. Missing
2. Incorrect
3. Not being loaded properly

## Quick Fix

1. **Check your `.env` file** in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://dhukigiaeoombdzueklp.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-key-here
   ```

2. **Get your API key from Supabase**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the **anon public** key (the long JWT token)
   - Paste it in your `.env` file

3. **Restart Expo**:
   - Stop the server (Ctrl+C)
   - Run `npx expo start` again
   - The new env vars will load

## Verify It's Working

After restarting, check the browser console. You should see:
```
✓ Supabase configured
URL: https://dhukigiaeoombdzueklp.supabase.co
Key: eyJhbGciOiJIUzI1NiIsIn...
```

If you see "❌ Missing Supabase environment variables!" then the .env file isn't being read.

## Common Issues

- **File name**: Must be exactly `.env` (not `.env.local` or `.env.txt`)
- **Location**: Must be in the project root (same folder as `package.json`)
- **Format**: No spaces around the `=` sign
- **Restart**: Must restart Expo after changing .env
