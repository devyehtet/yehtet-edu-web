begin;

create table if not exists public.enrollment_requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  state text not null check (state in ('uploading', 'submitted', 'failed')),
  name text not null,
  email text not null,
  phone text not null,
  course text not null,
  course_fee integer not null,
  payment_status text not null,
  payment_plan text not null,
  payment_account text not null,
  contact_preference text not null,
  payment_reference text not null default '',
  note text not null default '',
  slip_path text,
  slip_type text,
  slip_size bigint,
  request_hash text not null
);
create index if not exists enrollment_requests_created_idx on public.enrollment_requests (created_at desc);
alter table public.enrollment_requests enable row level security;
revoke all on public.enrollment_requests from public, anon, authenticated;
grant select, insert, update on public.enrollment_requests to service_role;

create table if not exists public.enrollment_rate_limits (
  key text primary key,
  window_start timestamptz not null,
  attempts integer not null
);
alter table public.enrollment_rate_limits enable row level security;
revoke all on public.enrollment_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.enrollment_rate_limits to service_role;

-- The Edge Function is the only caller. No public SQL or storage writes are granted.
create or replace function public.reserve_enrollment(
  p_id uuid, p_hash text, p_rate_key text, p_details jsonb,
  p_slip_path text, p_slip_type text, p_slip_size bigint
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  existing public.enrollment_requests%rowtype;
  v_now timestamptz := now();
  hour_start timestamptz := date_trunc('hour', now());
  day_start timestamptz := date_trunc('day', now());
  hour_key text := 'ip:' || p_rate_key || ':' || hour_start::text;
  day_key text := 'global:' || day_start::text;
  hour_count integer;
  day_count integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(733617001);
  select * into existing from public.enrollment_requests where id = p_id for update;
  if found then
    if existing.request_hash <> p_hash then return 'conflict'; end if;
    if existing.state = 'submitted' then return 'submitted'; end if;
    if existing.state = 'uploading' and existing.updated_at > v_now - interval '2 minutes' then return 'busy'; end if;
  end if;
  delete from public.enrollment_rate_limits where window_start < v_now - interval '2 days';
  select attempts into hour_count from public.enrollment_rate_limits where key = hour_key;
  select attempts into day_count from public.enrollment_rate_limits where key = day_key;
  if coalesce(hour_count, 0) >= 5 or coalesce(day_count, 0) >= 100 then return 'rate_limited'; end if;
  insert into public.enrollment_rate_limits values (hour_key, hour_start, 1)
    on conflict (key) do update set attempts = public.enrollment_rate_limits.attempts + 1;
  insert into public.enrollment_rate_limits values (day_key, day_start, 1)
    on conflict (key) do update set attempts = public.enrollment_rate_limits.attempts + 1;
  insert into public.enrollment_requests (
    id, state, name, email, phone, course, course_fee, payment_status, payment_plan,
    payment_account, contact_preference, payment_reference, note, slip_path, slip_type, slip_size, request_hash
  ) values (
    p_id, 'uploading', p_details->>'name', p_details->>'email', p_details->>'phone',
    p_details->>'course', (p_details->>'course_fee')::integer,
    p_details->>'payment_status', p_details->>'payment_plan', p_details->>'payment_account',
    p_details->>'contact_preference', p_details->>'payment_reference', p_details->>'note',
    p_slip_path, p_slip_type, p_slip_size, p_hash
  ) on conflict (id) do update set state = 'uploading', updated_at = v_now;
  return 'reserved';
end;
$$;
revoke all on function public.reserve_enrollment(uuid, text, text, jsonb, text, text, bigint) from public, anon, authenticated;
grant execute on function public.reserve_enrollment(uuid, text, text, jsonb, text, text, bigint) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('enrollment-slips', 'enrollment-slips', false, 8388608,
  array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 8388608,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','application/pdf'];

drop policy if exists "isolate private enrollment slips" on storage.objects;
create policy "isolate private enrollment slips" on storage.objects as restrictive
  for all to anon, authenticated
  using (bucket_id <> 'enrollment-slips') with check (bucket_id <> 'enrollment-slips');

commit;
