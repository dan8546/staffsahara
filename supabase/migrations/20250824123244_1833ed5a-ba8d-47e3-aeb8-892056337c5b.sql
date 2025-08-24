-- Enrollments — SELECT
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='enrollments' and policyname='enroll_self_select'
  ) then
    create policy enroll_self_select on public.enrollments
    for select using (
      talent_id = auth.uid()
      or exists (select 1 from public.profiles p where p.user_id=auth.uid() and p.role in ('ops','recruiter','finance'))
    );
  end if;
end$$;

-- Enrollments — INSERT
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='enrollments' and policyname='enroll_self_insert'
  ) then
    create policy enroll_self_insert on public.enrollments
    for insert with check (
      talent_id = auth.uid()
      or exists (select 1 from public.profiles p where p.user_id=auth.uid() and p.role in ('ops','recruiter','finance'))
    );
  end if;
end$$;

-- Enrollments — UPDATE (staff)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='enrollments' and policyname='enroll_staff_update'
  ) then
    create policy enroll_staff_update on public.enrollments
    for update using (
      exists (select 1 from public.profiles p where p.user_id=auth.uid() and p.role in ('ops','recruiter','finance'))
    );
  end if;
end$$;

-- Certificates — SELECT
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='certificates' and policyname='cert_self_select'
  ) then
    create policy cert_self_select on public.certificates
    for select using (
      talent_id = auth.uid()
      or exists (select 1 from public.profiles p where p.user_id=auth.uid() and p.role in ('ops','recruiter','finance'))
    );
  end if;
end$$;

-- Certificates — INSERT (staff)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='certificates' and policyname='cert_staff_insert'
  ) then
    create policy cert_staff_insert on public.certificates
    for insert with check (
      exists (select 1 from public.profiles p where p.user_id=auth.uid() and p.role in ('ops','recruiter','finance'))
    );
  end if;
end$$;