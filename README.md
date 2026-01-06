# Chauffer MVP

A "drive my car home" app prototype with hybrid dispatch system (Chase Car + Solo-Scoot).

## Quick Start

1. **Set up Supabase**
   - Create project at https://supabase.com
   - Run `schema.sql` in SQL Editor
   - Run `rls_policies.sql` in SQL Editor
   - Create storage buckets (see BUILD_STEPS.md)

2. **Install & Run**
   ```bash
   npm install
   # Create .env with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
   npm start
   ```

3. **Test**
   - Follow TEST_PLAN.md checklist
   - Create test users via Supabase Auth
   - Seed data using seed_data.sql

## Project Structure

```
├── schema.sql              # Database schema
├── rls_policies.sql        # Row-level security policies
├── dispatcher_pricing_pseudocode.md  # Dispatcher & pricing logic
├── ARCHITECTURE.md         # System architecture
├── SCREENS.md              # Screen map & navigation
├── BUILD_STEPS.md          # Step-by-step build guide
├── TEST_PLAN.md            # QA checklist
├── seed_data.sql           # Test data
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   ├── dispatcher.ts       # Dispatch logic
│   └── insurance.ts        # Insurance stub functions
└── app/                    # Expo Router screens (to be created)
```

## Core Features

- **One-tap Rescue Button** - Quick trip request
- **Hybrid Dispatch** - Chase Car (2 drivers) or Solo-Scoot (1 driver w/ device)
- **Trunk Photo Verification** - Proof device fits before trip
- **Insurance Switch** - Policy bound at Start Trip (stub)
- **Real-time Tracking** - Live driver location updates
- **Damage Claims** - Full workflow with photos
- **Pricing Engine** - Surge multipliers, tiered pricing

## Tech Stack

- React Native (Expo)
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Mapbox/Google Maps
- TypeScript

## Documentation

- **ARCHITECTURE.md** - System overview
- **SCREENS.md** - Screen structure & flows
- **BUILD_STEPS.md** - Detailed setup instructions
- **TEST_PLAN.md** - QA checklist
- **dispatcher_pricing_pseudocode.md** - Core logic

## MVP Constraints

- Insurance integration is stub (logs to console)
- Dispatch is rules-based (not ML)
- Manual gear verification (admin panel)
- No payment processing (placeholder)
- No push notifications

## License

Proprietary - MVP Prototype

