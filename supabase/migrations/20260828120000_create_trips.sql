create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  destination_country text not null,
  destination_city text not null,
  start_date date not null,
  end_date date not null,
  accommodation_name text,
  accommodation_address text,
  travelers_count integer not null default 1,
  trip_style text,
  budget_level text,
  interests text[] not null default '{}',
  notes text,
  status text not null default 'planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_country_iso_check check (destination_country ~ '^[A-Z]{2}$'),
  constraint trips_dates_check check (end_date >= start_date),
  constraint trips_travelers_check check (travelers_count between 1 and 20),
  constraint trips_style_check check (trip_style is null or trip_style in ('relaxed', 'moderate', 'intensive')),
  constraint trips_budget_check check (budget_level is null or budget_level in ('budget', 'moderate', 'comfort', 'luxury')),
  constraint trips_status_check check (status in ('planning', 'upcoming', 'ongoing', 'completed')),
  constraint trips_interests_check check (interests <@ array['culture','history','food','nature','beaches','nightlife','shopping','photography','adventure','relaxation','family','romantic']::text[])
);

create index trips_user_start_date_idx on public.trips (user_id, start_date);

alter table public.trips enable row level security;
revoke all on table public.trips from anon;
grant select, insert, update, delete on table public.trips to authenticated;

create policy "trips_select_own" on public.trips for select to authenticated using ((select auth.uid()) = user_id);
create policy "trips_insert_own" on public.trips for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "trips_update_own" on public.trips for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "trips_delete_own" on public.trips for delete to authenticated using ((select auth.uid()) = user_id);

create trigger trips_set_updated_at
before update on public.trips
for each row
execute function public.set_profiles_updated_at();

