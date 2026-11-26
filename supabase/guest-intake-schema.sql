-- Review and apply through a migration in staging before enabling intake.
create table public.guest_transport_inquiries (
 id uuid primary key default gen_random_uuid(),
 service text not null check (service in ('drive_my_car','chauffeur','vehicle_delivery','book_a_ride','scheduled_assistance','business')),
 name text not null check (char_length(name) between 2 and 120),
 email text not null check (char_length(email) between 3 and 254),
 phone text not null check (char_length(phone) between 7 and 40),
 pickup text not null check (char_length(pickup) between 3 and 500),
 destination text not null check (char_length(destination) between 3 and 500),
 requested_for timestamptz not null,
 notes text not null default '' check (char_length(notes)<=2000),
 status text not null default 'pending_review' check (status in ('pending_review','contacted','quoted','declined','cancelled')),
 created_at timestamptz not null default now()
);
alter table public.guest_transport_inquiries enable row level security;
revoke all on public.guest_transport_inquiries from public, anon, authenticated;
grant select, update(status) on public.guest_transport_inquiries to authenticated;
grant select, insert on public.guest_transport_inquiries to service_role;
create policy guest_admin_read on public.guest_transport_inquiries for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy guest_admin_update on public.guest_transport_inquiries for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create index guest_inquiries_queue_idx on public.guest_transport_inquiries(status,created_at);
