-- Multi-service request intake, additive and isolated from legacy trips.
-- Review on staging before applying. No driver dispatch or payment implied.
create table if not exists public.transport_requests (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 service_type text not null check (service_type in ('chauffeur','vehicle_delivery','book_a_ride','scheduled_assistance','business')),
 pickup_address text not null check (char_length(trim(pickup_address)) between 3 and 500),
 destination_address text not null check (char_length(trim(destination_address)) between 3 and 500),
 requested_for timestamptz not null,
 notes text check (char_length(notes) <= 2000),
 status text not null default 'pending_review' check (status in ('pending_review','declined','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists transport_requests_customer_created_idx on public.transport_requests(customer_id, created_at desc);
create index if not exists transport_requests_status_idx on public.transport_requests(status, requested_for);
alter table public.transport_requests enable row level security;
revoke all on public.transport_requests from anon, authenticated;
grant select, insert on public.transport_requests to authenticated;
create policy "Customers can read own transport requests" on public.transport_requests
 for select to authenticated using ((select auth.uid()) = customer_id);
create policy "Customers can create pending transport requests" on public.transport_requests
 for insert to authenticated with check ((select auth.uid()) = customer_id and status = 'pending_review');
-- Customer cannot update status or edit submitted requests directly.
-- Operations review requires a separately authenticated, audited server-side workflow.
