# Web + iPhone staging test run

## Gate 0: environment
- Use a separate Supabase staging project and test accounts. Do not use production customer records.
- Apply and review `supabase/migrations/20261122180000_transport_requests.sql` on staging only.
- Configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for staging; never expose service-role keys.
- Do not treat a passing TypeScript check as a running application test.

## Gate 1: local web
1. `npm ci`
2. `npx tsc --noEmit`
3. `npx expo start --web` and open the local URL.
4. Sign in as customer A, open Services, select Chauffeur, enter a future ISO date with offset, submit inquiry.
5. Open My Transport Requests and confirm the new pending-review request appears.
6. Sign in as customer B; confirm customer A's request is not visible.
7. Verify an unauthenticated user cannot insert requests.
8. Verify no request causes driver dispatch, a charge, or an insurance-bound claim.
9. Test web export using `npx expo export --platform web --output-dir web-build`.

## Gate 2: mobile
1. Use the same staging Supabase environment.
2. Run the Expo development workflow on a physical iPhone compatible with the current Expo SDK, or plan an isolated SDK upgrade if incompatible.
3. Repeat customer A submission and confirm it appears on web; repeat from web and confirm it appears on iPhone.
4. Check keyboard, scrolling, safe areas, navigation, sign-out and sign-in, offline/error states.
5. Test the original Drive My Car flow separately; do not make real trips while insurance is stubbed.

## Gate 3: operational readiness
- Real dispatch eligibility, commercial insurance, payments, licensing, driver verification and cancellation workflows are NOT implemented for new services.
- Do not merge, deploy to production, generate EAS builds or submit to Apple until these gates are evidenced.
- A preview URL is not available until a staging site is actually deployed.
