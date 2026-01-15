# Deploy to Web for VC Demo

## ✅ Netlify GitHub Integration (Recommended)

**Already configured!** Just connect your repo:

1. **Go to [netlify.com](https://netlify.com)** → Sign in
2. **Click "Add new site"** → "Import an existing project"
3. **Connect to GitHub** → Select `BTheCoderr/DesignatedDriver`
4. **Settings are auto-configured:**
   - Build command: `npx expo export:web`
   - Publish directory: `web-build`
5. **Click "Deploy site"** → Done!

**Auto-deploys on every push to `main` branch!**

---

## Manual Deploy (If Needed)

```bash
npx expo export:web
```
Then drag `web-build/` folder to Netlify.

---

## Default Location: Rhode Island ✅

The app now defaults to **Providence, RI** if location permission is denied or unavailable. Perfect for your starting market!

---

## Environment Variables

Make sure `.env` has:
```
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

These are baked into the web build, so VCs can use it immediately.
