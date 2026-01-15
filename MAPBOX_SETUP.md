# Mapbox Setup for Maps

## Get Your Mapbox Token

1. Go to [mapbox.com](https://mapbox.com) → Sign up (free)
2. Go to **Account** → **Access tokens**
3. Copy your **Default public token**

## Add to Netlify Environment Variables

1. Go to Netlify → Your site → **Site settings** → **Environment variables**
2. Add:
   - **Key**: `EXPO_PUBLIC_MAPBOX_TOKEN`
   - **Value**: Your Mapbox token
3. **Redeploy** your site

## Add to Local .env (Optional)

For local development, add to `.env`:
```
EXPO_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here
```

## What Maps Show

- **Pickup location** (blue marker)
- **Destination** (green marker) - when trip is active
- **Route line** - when trip is in progress
- **Auto-zoom** to show both locations

## Free Tier

Mapbox free tier includes:
- 50,000 map loads/month
- Perfect for MVP/demo
- No credit card required

---

**After adding the token, maps will appear automatically!** 🗺️
