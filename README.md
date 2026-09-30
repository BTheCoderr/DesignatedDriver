# DesignatedDriver

<!-- repo-intro:start -->
**Project snapshot:** DesignatedDriver is an Expo/React Native service prototype for getting a customer's own vehicle home safely, with separate customer, driver, and admin workflows backed by Supabase.

**What it demonstrates:** Expo/React Native · TypeScript · Supabase Auth/Postgres/Storage/Realtime/RLS · dispatch logic · role-based mobile flows · photo verification · trip lifecycle design.
<!-- repo-intro:end -->

DesignatedDriver models a **drive-my-car-home** service instead of a normal ride-hailing flow. The customer keeps their own vehicle; the platform coordinates the request, dispatch approach, driver workflow, verification, trip tracking, completion, and post-trip support.

## Product at a glance

| Role | Current flows |
| --- | --- |
| Customer | Rescue request, vehicle management, trip tracking, trip completion, damage claim |
| Driver | Job acceptance, arrival, trunk/device proof, vehicle inspection, active drive, trip end |
| Admin | Operations dashboard + gear verification |
| Platform | Hybrid dispatch rules, pricing logic, Supabase-backed data, role-aware navigation |

## Core operating model

The prototype supports two dispatch concepts:

- **Chase Car** — two-driver workflow where one driver operates the customer's vehicle and the second supports the team.
- **Solo-Scoot** — one-driver workflow using a transport device that must fit in the customer's vehicle.

That operating model drives the product's unusual verification steps: trunk photos, gear validation, vehicle inspection, and role-specific trip state.

## Current application surfaces

```text
app/
  (auth)/       account and session entry
  (user)/       rescue request, vehicles, tracking, completion, damage claims
  (driver)/     jobs, arrival, trunk proof, inspection, drive, end-trip
  (admin)/      operations + gear verification
```

The repository contains real Expo Router screens today; it is no longer just a screen map or pseudocode scaffold.

## Data + security

Supabase is used for:

- authentication
- PostgreSQL application data
- Row Level Security
- storage policies for uploaded evidence
- Realtime-backed operational state where needed

The repository also tracks schema/RLS fixes for vehicles and vehicle inspections instead of relying on dashboard-only changes.

## Media + verification

The product includes photo-oriented operational workflows such as:

- driver gear upload
- trunk/device-fit proof
- vehicle inspections
- damage-claim evidence

Cloudinary integration/optimization work is documented in-repo alongside Supabase storage/security decisions.

## Dispatch + pricing

The dispatch layer is rules-based, not machine learning. The repository includes explicit dispatcher/pricing logic and documentation so the product behavior can be reasoned about and tested instead of hiding key decisions in UI code.

## Tech stack

- Expo / React Native
- Expo Router
- TypeScript
- Supabase Auth + PostgreSQL + Storage + Realtime
- Row Level Security
- Cloudinary-supported media workflows
- Netlify web build support

## Local setup

```bash
npm install
npm start
```

Create local environment variables for the public Supabase URL/client key and follow the repository setup documents before connecting a new backend.

## Documentation

Key references include:

- `ARCHITECTURE.md`
- `BUILD_STEPS.md`
- `TEST_PLAN.md`
- `END_TO_END_TEST_GUIDE.md`
- `dispatcher_pricing_pseudocode.md`
- `CLOUDINARY_DECISION.md`
- `DEPLOY_WEB.md`

## MVP constraints

The current prototype still has deliberate limits:

- insurance binding is a stub rather than a production insurance integration
- dispatch is rules-based
- some operational verification remains manual/admin-assisted
- payments are not a production payment flow
- push-notification infrastructure is not the focus of the current build

---

Built as a marketplace/operations prototype where the hard part is the **service workflow**, not just drawing a map with a driver pin.
