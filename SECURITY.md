# Security Policy

Security fixes target the current default branch.

Report vulnerabilities privately through GitHub when they could expose customer/driver accounts, location/trip data, uploaded vehicle evidence, Supabase records, dispatcher/admin operations, or privileged credentials.

Extra review is expected for Auth/RLS, role routing, trip-state transitions, dispatch logic, Storage policies, inspection/photo evidence, admin controls, and cancellation/payment-adjacent state.

Never commit service-role keys, production secrets, customer addresses, driver PII, or real trip evidence.
