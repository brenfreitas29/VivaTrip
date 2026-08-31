begin;
create table public.trip_checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_checklist_key_check check (item_key in ('documents','apps','connectivity','money','transport','packing','insurance','emergency')),
  constraint trip_checklist_notes_check check (notes is null or char_length(notes)<=500),
  constraint trip_checklist_unique unique (trip_id,item_key)
);
create index trip_checklist_user_trip_idx on public.trip_checklist_items(user_id,trip_id);
alter table public.trip_checklist_items enable row level security;
revoke all on public.trip_checklist_items from anon;
grant select,insert,update,delete on public.trip_checklist_items to authenticated;
create policy "trip_checklist_select_own" on public.trip_checklist_items for select to authenticated using ((select auth.uid())=user_id and exists(select 1 from public.trips where trips.id=trip_checklist_items.trip_id and trips.user_id=(select auth.uid())));
create policy "trip_checklist_insert_own" on public.trip_checklist_items for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.trips where trips.id=trip_checklist_items.trip_id and trips.user_id=(select auth.uid())));
create policy "trip_checklist_update_own" on public.trip_checklist_items for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "trip_checklist_delete_own" on public.trip_checklist_items for delete to authenticated using ((select auth.uid())=user_id);
create trigger trip_checklist_set_updated_at before update on public.trip_checklist_items for each row execute function public.set_profiles_updated_at();
commit;
