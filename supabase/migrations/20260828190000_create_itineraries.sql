begin;

create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid unique not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  summary text,
  generation_status text not null default 'draft',
  has_user_edits boolean not null default false,
  generation_version integer not null default 1,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint itineraries_status_check check (generation_status in ('draft','generating','ready','failed')),
  constraint itineraries_version_check check (generation_version >= 1)
);

create table public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  day_number integer not null,
  date date not null,
  title text,
  summary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint itinerary_days_number_check check (day_number >= 1),
  constraint itinerary_days_unique_number unique (itinerary_id, day_number),
  constraint itinerary_days_unique_date unique (itinerary_id, date)
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid not null references public.itinerary_days(id) on delete cascade,
  position integer not null,
  period text not null,
  start_time time,
  end_time time,
  title text not null,
  description text,
  location_name text,
  location_address text,
  category text not null,
  estimated_duration_minutes integer,
  estimated_cost numeric,
  currency text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint itinerary_items_position_check check (position >= 0),
  constraint itinerary_items_period_check check (period in ('morning','afternoon','evening','night')),
  constraint itinerary_items_category_check check (category in ('attraction','museum','food','nature','shopping','experience','transport','rest','nightlife','other')),
  constraint itinerary_items_duration_check check (estimated_duration_minutes is null or estimated_duration_minutes between 15 and 720),
  constraint itinerary_items_time_check check (end_time is null or start_time is null or end_time >= start_time)
);

create index itineraries_user_trip_idx on public.itineraries(user_id, trip_id);
create index itinerary_days_itinerary_idx on public.itinerary_days(itinerary_id, day_number);
create index itinerary_items_day_idx on public.itinerary_items(itinerary_day_id, position);

alter table public.itineraries enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;

revoke all on public.itineraries, public.itinerary_days, public.itinerary_items from anon;
grant select, insert, update, delete on public.itineraries, public.itinerary_days, public.itinerary_items to authenticated;

create policy "itineraries_select_own" on public.itineraries for select to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.trips where trips.id = itineraries.trip_id and trips.user_id = (select auth.uid())));
create policy "itineraries_insert_own" on public.itineraries for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.trips where trips.id = itineraries.trip_id and trips.user_id = (select auth.uid())));
create policy "itineraries_update_own" on public.itineraries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "itineraries_delete_own" on public.itineraries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "itinerary_days_select_own" on public.itinerary_days for select to authenticated using (exists (select 1 from public.itineraries where itineraries.id = itinerary_days.itinerary_id and itineraries.user_id = (select auth.uid())));
create policy "itinerary_days_insert_own" on public.itinerary_days for insert to authenticated with check (exists (select 1 from public.itineraries where itineraries.id = itinerary_days.itinerary_id and itineraries.user_id = (select auth.uid())));
create policy "itinerary_days_update_own" on public.itinerary_days for update to authenticated using (exists (select 1 from public.itineraries where itineraries.id = itinerary_days.itinerary_id and itineraries.user_id = (select auth.uid()))) with check (exists (select 1 from public.itineraries where itineraries.id = itinerary_days.itinerary_id and itineraries.user_id = (select auth.uid())));
create policy "itinerary_days_delete_own" on public.itinerary_days for delete to authenticated using (exists (select 1 from public.itineraries where itineraries.id = itinerary_days.itinerary_id and itineraries.user_id = (select auth.uid())));

create policy "itinerary_items_select_own" on public.itinerary_items for select to authenticated using (exists (select 1 from public.itinerary_days join public.itineraries on itineraries.id = itinerary_days.itinerary_id where itinerary_days.id = itinerary_items.itinerary_day_id and itineraries.user_id = (select auth.uid())));
create policy "itinerary_items_insert_own" on public.itinerary_items for insert to authenticated with check (exists (select 1 from public.itinerary_days join public.itineraries on itineraries.id = itinerary_days.itinerary_id where itinerary_days.id = itinerary_items.itinerary_day_id and itineraries.user_id = (select auth.uid())));
create policy "itinerary_items_update_own" on public.itinerary_items for update to authenticated using (exists (select 1 from public.itinerary_days join public.itineraries on itineraries.id = itinerary_days.itinerary_id where itinerary_days.id = itinerary_items.itinerary_day_id and itineraries.user_id = (select auth.uid()))) with check (exists (select 1 from public.itinerary_days join public.itineraries on itineraries.id = itinerary_days.itinerary_id where itinerary_days.id = itinerary_items.itinerary_day_id and itineraries.user_id = (select auth.uid())));
create policy "itinerary_items_delete_own" on public.itinerary_items for delete to authenticated using (exists (select 1 from public.itinerary_days join public.itineraries on itineraries.id = itinerary_days.itinerary_id where itinerary_days.id = itinerary_items.itinerary_day_id and itineraries.user_id = (select auth.uid())));

create trigger itineraries_set_updated_at before update on public.itineraries for each row execute function public.set_profiles_updated_at();
create trigger itinerary_days_set_updated_at before update on public.itinerary_days for each row execute function public.set_profiles_updated_at();
create trigger itinerary_items_set_updated_at before update on public.itinerary_items for each row execute function public.set_profiles_updated_at();

create or replace function public.claim_itinerary_generation(p_trip_id uuid)
returns table(itinerary_id uuid, had_existing boolean)
language plpgsql security invoker set search_path = '' as $$
declare v_itinerary public.itineraries%rowtype; v_new_itinerary_id uuid;
begin
  if not exists (select 1 from public.trips where id=p_trip_id and user_id=(select auth.uid())) then raise exception 'trip_not_found' using errcode='P0002'; end if;
  select * into v_itinerary from public.itineraries where trip_id=p_trip_id for update;
  if found then
    if v_itinerary.generation_status='generating' and v_itinerary.updated_at > now()-interval '10 minutes' then raise exception 'generation_in_progress' using errcode='P0001'; end if;
    update public.itineraries set generation_status='generating' where id=v_itinerary.id;
    return query select v_itinerary.id, v_itinerary.generated_at is not null;
  else
    insert into public.itineraries(trip_id,user_id,generation_status) values(p_trip_id,(select auth.uid()),'generating') returning id into v_new_itinerary_id;
    return query select v_new_itinerary_id, false;
  end if;
end; $$;

create or replace function public.complete_itinerary_generation(p_trip_id uuid,p_title text,p_summary text,p_days jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_itinerary_id uuid; v_day jsonb; v_day_id uuid; v_item jsonb; v_position integer;
begin
  select id into v_itinerary_id from public.itineraries where trip_id=p_trip_id and user_id=(select auth.uid()) for update;
  if v_itinerary_id is null then raise exception 'itinerary_not_found' using errcode='P0002'; end if;
  delete from public.itinerary_days where itinerary_id=v_itinerary_id;
  for v_day in select value from jsonb_array_elements(p_days) loop
    insert into public.itinerary_days(itinerary_id,day_number,date,title,summary,notes) values(v_itinerary_id,(v_day->>'dayNumber')::integer,(v_day->>'date')::date,v_day->>'title',v_day->>'summary',v_day->>'notes') returning id into v_day_id;
    v_position:=0;
    for v_item in select value from jsonb_array_elements(v_day->'items') loop
      insert into public.itinerary_items(itinerary_day_id,position,period,start_time,end_time,title,description,location_name,location_address,category,estimated_duration_minutes,estimated_cost,currency,notes)
      values(v_day_id,v_position,v_item->>'period',nullif(v_item->>'startTime','')::time,nullif(v_item->>'endTime','')::time,v_item->>'title',v_item->>'description',v_item->>'locationName',null,v_item->>'category',nullif(v_item->>'estimatedDurationMinutes','')::integer,null,null,v_item->>'notes');
      v_position:=v_position+1;
    end loop;
  end loop;
  update public.itineraries set title=p_title,summary=p_summary,generation_status='ready',has_user_edits=false,generation_version=case when generated_at is null then 1 else generation_version+1 end,generated_at=now() where id=v_itinerary_id;
  return v_itinerary_id;
end; $$;

create or replace function public.fail_itinerary_generation(p_trip_id uuid)
returns void language sql security invoker set search_path='' as $$
  update public.itineraries set generation_status=case when generated_at is null then 'failed' else 'ready' end where trip_id=p_trip_id and user_id=(select auth.uid());
$$;

revoke execute on function public.claim_itinerary_generation(uuid) from public,anon;
revoke execute on function public.complete_itinerary_generation(uuid,text,text,jsonb) from public,anon;
revoke execute on function public.fail_itinerary_generation(uuid) from public,anon;
grant execute on function public.claim_itinerary_generation(uuid), public.complete_itinerary_generation(uuid,text,text,jsonb), public.fail_itinerary_generation(uuid) to authenticated;

commit;
