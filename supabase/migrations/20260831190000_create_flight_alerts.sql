begin;
create table public.flight_alerts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 origin text not null, destination text not null, departure_date date, return_date date, currency text not null default 'USD',
 target_price numeric, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint flight_alert_route_check check(char_length(origin) between 2 and 40 and char_length(destination) between 2 and 40),
 constraint flight_alert_date_check check(return_date is null or departure_date is null or return_date>=departure_date),
 constraint flight_alert_currency_check check(currency in ('USD','EUR','BRL','ARS','GBP')),
 constraint flight_alert_price_check check(target_price is null or (target_price>0 and target_price<=1000000))
);
create index flight_alerts_user_idx on public.flight_alerts(user_id,created_at desc);
alter table public.flight_alerts enable row level security; revoke all on public.flight_alerts from anon; grant select,insert,update,delete on public.flight_alerts to authenticated;
create policy "flight_alerts_select_own" on public.flight_alerts for select to authenticated using((select auth.uid())=user_id);
create policy "flight_alerts_insert_own" on public.flight_alerts for insert to authenticated with check((select auth.uid())=user_id);
create policy "flight_alerts_update_own" on public.flight_alerts for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "flight_alerts_delete_own" on public.flight_alerts for delete to authenticated using((select auth.uid())=user_id);
create trigger flight_alerts_set_updated_at before update on public.flight_alerts for each row execute function public.set_profiles_updated_at();
commit;
