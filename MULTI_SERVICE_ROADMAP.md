# Multi-service transportation rollout

## Phase 1 — Service discovery (this PR)
- Customer home opens the service chooser.
- Drive My Car routes to the existing rescue booking flow.
- Other services are clearly marked Coming Soon; no fabricated bookings or payment promises.
- Service catalog is typed in `lib/services.ts`.

## Phase 2 — Booking model
- Introduce a versioned `service_type` field to trips with safe default `drive_my_car` for legacy rows.
- Add service-specific intake schemas: customer vehicle, provider vehicle, scheduled time, passenger count, vehicle handoff authorization.
- Keep service availability controlled by backend configuration, not client-only flags.
- Add availability/eligibility checks before quoting or accepting any trip.
- Add server-side price calculation and booking state transitions.
- Implement explicit cancellation, refund and no-show states.

## Phase 3 — Driver and dispatch
- Driver capabilities, background checks, licensing and vehicle eligibility.
- Match only eligible drivers to each service type.
- Chauffeur: hourly booking and time extension.
- Vehicle delivery: authorized pickup, condition photos, key custody and recipient handoff.
- Provider vehicle rides: vehicle registration, passenger capacity and commercial insurance.
- Scheduled assistance: accessibility and accompaniment requirements; no implied medical transport certification.
- Business: organization billing and authorized bookers.

## Release blockers
- Current insurance binding is a stub; never claim a policy is active.
- Production payments are not integrated.
- Driver location, uploads and realtime flows require physical-device testing.
- Verify applicable commercial passenger transport, chauffeur, vehicle delivery, medical transport, driver screening and insurance requirements by jurisdiction before launch.
- Upgrade Expo SDK 51 through a separately tested compatibility plan.
- Verify Supabase RLS and evidence storage access for each service type.
- Do not deploy or merge without smoke tests and product approval.

## Manual acceptance checks for this PR
1. Sign in as customer and open home.
2. Tap Find a Driver; six options render.
3. Tap Drive My Car; existing request-rescue flow opens.
4. Tap each other service; Coming Soon appears and no trip is created.
5. Confirm back navigation, logout, and guest sign-in behavior.
6. Verify driver/admin navigation and existing booking lifecycle are unchanged.
