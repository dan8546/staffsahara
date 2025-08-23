create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  name text not null,
  email text not null,
  phone text,
  site text,
  need_summary text,
  star_aviation jsonb,
  ticketing boolean,
  source text default 'get-quote',
  created_at timestamptz default now()
);

alter table public.leads enable row level security;

drop policy if exists leads_insert_public on public.leads;
create policy leads_insert_public on public.leads for insert with check (true);

drop policy if exists leads_select_staff on public.leads;
create policy leads_select_staff on public.leads
for select using (
  exists (select 1 from public.profiles p
          where p.user_id = auth.uid()
          and p.role in ('ops','recruiter','finance'))
);