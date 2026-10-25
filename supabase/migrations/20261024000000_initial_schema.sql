-- Community Problems & Public Service Website — Supabase schema
-- Run this file in the Supabase SQL Editor (or apply it as a migration).
--
-- Security model:
--   * Anonymous visitors can submit a report only through the submit_report() RPC.
--   * Anonymous visitors can upload an image to the private report-images bucket,
--     but cannot read, list, update or delete any report or image.
--   * Authenticated users can read/update reports only when their user id exists
--     in public.admins. RLS is the source of truth; the UI is not trusted.
--   * Public statistics are exposed only as aggregate counts through a
--     SECURITY DEFINER function.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 20 and 2000),
  category text not null check (
    category in (
      'roads',
      'drainage',
      'water',
      'electricity',
      'waste',
      'public_safety',
      'education',
      'healthcare',
      'other'
    )
  ),
  area text not null check (char_length(area) between 2 and 80),
  reporter_name text check (
    reporter_name is null or char_length(reporter_name) between 2 and 80
  ),
  reporter_phone text check (
    reporter_phone is null
    or reporter_phone ~ '^\+?8801[3-9][0-9]{8}$'
    or reporter_phone ~ '^01[3-9][0-9]{8}$'
  ),
  image_path text check (
    image_path is null
    or (
      char_length(image_path) <= 300
      and image_path ~ '^reports/[0-9a-fA-F-]{36}/[0-9]+-[A-Za-z0-9._-]+$'
    )
  ),
  status text not null default 'received' check (
    status in ('received', 'in_progress', 'resolved')
  ),
  client_submission_id uuid,
  constraint reports_client_submission_id_key unique (client_submission_id)
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_area_idx on public.reports (area);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.reports is
  'Community problem reports. Contact details are private and visible only to admins.';
comment on table public.admins is
  'Allow-list of Supabase Auth users who may access the admin dashboard.';

-- ---------------------------------------------------------------------------
-- Defaults and idempotency
-- ---------------------------------------------------------------------------

create or replace function public.set_report_defaults()
returns trigger
language plpgsql
as $$
begin
  -- Never trust a client-provided id, timestamp or status.
  new.id := gen_random_uuid();
  new.created_at := now();
  new.status := 'received';
  return new;
end;
$$;

drop trigger if exists reports_set_defaults on public.reports;
create trigger reports_set_defaults
before insert on public.reports
for each row execute function public.set_report_defaults();

-- ---------------------------------------------------------------------------
-- Admin authorization helper
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.reports enable row level security;
alter table public.admins enable row level security;

drop policy if exists "admins_can_read_reports" on public.reports;
create policy "admins_can_read_reports"
on public.reports for select
to authenticated
using (public.is_admin());

drop policy if exists "admins_can_update_reports" on public.reports;
create policy "admins_can_update_reports"
on public.reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- There is intentionally no anonymous INSERT policy on reports. Public writes
-- go through submit_report(), which is a SECURITY DEFINER function below.
-- There is also no DELETE policy: reports can only be removed with a
-- service-role/administrative database operation.

-- Only authenticated users may attempt reads/updates. RLS restricts them to admins.
grant select, update on table public.reports to authenticated;

-- The admins table is not directly readable through the API. is_admin() is the
-- only supported way to check membership.

-- ---------------------------------------------------------------------------
-- Public submission RPC
-- ---------------------------------------------------------------------------

create or replace function public.submit_report(
  p_title text,
  p_description text,
  p_category text,
  p_area text,
  p_reporter_name text default null,
  p_reporter_phone text default null,
  p_image_path text default null,
  p_client_submission_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_client_submission_id is null then
    raise exception 'client_submission_id is required' using errcode = '22023';
  end if;

  -- Tie an uploaded image to the submission id used as its storage folder.
  -- This prevents a caller from attaching an arbitrary known image path.
  if p_image_path is not null
    and p_image_path not like ('reports/' || p_client_submission_id::text || '/%')
  then
    raise exception 'image_path does not belong to this submission' using errcode = '22023';
  end if;

  insert into public.reports (
    title,
    description,
    category,
    area,
    reporter_name,
    reporter_phone,
    image_path,
    client_submission_id
  )
  values (
    btrim(p_title),
    btrim(p_description),
    p_category,
    btrim(p_area),
    nullif(btrim(coalesce(p_reporter_name, '')), ''),
    nullif(btrim(coalesce(p_reporter_phone, '')), ''),
    p_image_path,
    p_client_submission_id
  )
  on conflict (client_submission_id) do nothing
  returning id into v_id;

  -- A null return means this submission id was already stored. The client
  -- treats that as a successful duplicate rather than creating another report.
  return v_id;
end;
$$;

revoke all on function public.submit_report(
  text, text, text, text, text, text, text, uuid
) from public;
grant execute on function public.submit_report(
  text, text, text, text, text, text, text, uuid
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Aggregate public statistics
-- ---------------------------------------------------------------------------

create or replace function public.get_public_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_reports', count(*),
    'total_submitters', count(distinct coalesce(nullif(reporter_phone, ''), id::text)),
    'received', count(*) filter (where status = 'received'),
    'in_progress', count(*) filter (where status = 'in_progress'),
    'resolved', count(*) filter (where status = 'resolved')
  )
  from public.reports;
$$;

revoke all on function public.get_public_stats() from public;
grant execute on function public.get_public_stats() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Private image storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-images',
  'report-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anonymous visitors may upload a new, uniquely named image. They cannot list,
-- read, overwrite or delete objects.
drop policy if exists "public_can_upload_report_images" on storage.objects;
create policy "public_can_upload_report_images"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'report-images'
  and name ~ '^reports/[0-9a-fA-F-]{36}/[0-9]+-[A-Za-z0-9._-]+$'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "admins_can_read_report_images" on storage.objects;
create policy "admins_can_read_report_images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'report-images'
  and public.is_admin()
);

drop policy if exists "admins_can_delete_report_images" on storage.objects;
create policy "admins_can_delete_report_images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'report-images'
  and public.is_admin()
);

-- ---------------------------------------------------------------------------
-- One-time admin setup (run manually after creating a user in Auth > Users)
-- ---------------------------------------------------------------------------
--
-- insert into public.admins (user_id)
-- values ('<paste-the-auth-user-uuid-here>');
--
-- Disable public sign-ups in Supabase Auth settings. Admin accounts should be
-- created deliberately, not through the public website.

notify pgrst, 'reload schema';
