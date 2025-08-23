create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  name text not null,
  email text not null,
  phone text,
  site text,
  need_summary text,
  star_aviation jsonb,    -- {air_personnel?:bool, air_charter?:bool, air_ondemand?:bool, air_medevac?:bool, air_ground?:bool, air_mro?:bool}
  ticketing boolean,
  source text default 'get-quote',
  created_at timestamptz default now()
);
alter table public.leads enable row level security;
create policy if not exists leads_insert_public on public.leads for insert with check (true);
create policy if not exists leads_select_staff on public.leads
for select using (
  exists (select 1 from public.profiles p
          where p.user_id = auth.uid()
          and p.role in ('ops','recruiter','finance'))
);