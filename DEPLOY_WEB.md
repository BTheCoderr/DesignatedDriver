# Deploy to Web for VC Demo

## Quick Deploy Options

### Option 1: Expo Web (Easiest - Share URL)
```bash
npm run web
```
Then share: `http://localhost:8081` (or your network IP)

### Option 2: Build Static Web (Best for VCs)
```bash
npx expo export:web
```
This creates a `web-build/` folder you can deploy to:
- **Netlify** (drag & drop `web-build/` folder)
- **Vercel** (connect GitHub repo)
- **Any static host**

### Option 3: Expo Hosting (Free)
```bash
npx expo publish --web
```
Gets you a shareable URL like: `https://designated-driver.web.app`

---

## For VC Demo - Recommended:

1. **Build static web:**
   ```bash
   npx expo export:web
   ```

2. **Deploy to Netlify:**
   - Go to netlify.com
   - Drag `web-build/` folder
   - Get instant URL: `https://your-app.netlify.app`
   - Share with VCs!

3. **Or use Expo's hosting:**
   ```bash
   npx expo publish --web
   ```

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
