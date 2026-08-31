create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  name text,
  email text,
  nationality text,
  passport_country text,
  country_of_residence text,
  preferred_language text not null default 'pt',
  currency text not null default 'USD',
  home_airport text,
  travel_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nationality_iso_check check (nationality is null or nationality ~ '^[A-Z]{2}$'),
  constraint profiles_passport_country_iso_check check (passport_country is null or passport_country ~ '^[A-Z]{2}$'),
  constraint profiles_residence_iso_check check (country_of_residence is null or country_of_residence ~ '^[A-Z]{2}$'),
  constraint profiles_language_check check (preferred_language in ('pt', 'en', 'es')),
  constraint profiles_currency_check check (currency in ('USD', 'EUR', 'BRL', 'ARS', 'GBP', 'JPY')),
  constraint profiles_home_airport_check check (home_airport is null or home_airport ~ '^[A-Z]{3}$'),
  constraint profiles_travel_style_check check (travel_style is null or travel_style in ('relaxed', 'moderate', 'intensive'))
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.set_profiles_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();
