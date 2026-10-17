-- Run after the migration. All fixtures and rate counters are rolled back.
begin;
do $$
declare
  test_id uuid := gen_random_uuid();
  test_key text := gen_random_uuid()::text;
  details jsonb := '{"name":"TEST ONLY","email":"test@example.com","phone":"+959900000000","course":"Digital Marketing Beginner to Professional","course_fee":620000,"payment_status":"Need payment instructions","payment_plan":"Full payment","payment_account":"Myanmar - KBZ Pay","contact_preference":"Email","payment_reference":"","note":"ROLLBACK TEST ONLY"}'::jsonb;
  result text;
  i integer;
begin
  result := public.reserve_enrollment(test_id, 'test-hash', test_key, details, null, null, null);
  if result <> 'reserved' then raise exception 'Expected reserved, got %', result; end if;
  result := public.reserve_enrollment(test_id, 'test-hash', test_key, details, null, null, null);
  if result <> 'busy' then raise exception 'Expected busy, got %', result; end if;
  result := public.reserve_enrollment(test_id, 'other-hash', test_key, details, null, null, null);
  if result <> 'conflict' then raise exception 'Expected conflict, got %', result; end if;
  update public.enrollment_requests set state = 'submitted' where id = test_id;
  result := public.reserve_enrollment(test_id, 'test-hash', test_key, details, null, null, null);
  if result <> 'submitted' then raise exception 'Expected submitted, got %', result; end if;
  for i in 2..5 loop
    result := public.reserve_enrollment(gen_random_uuid(), 'test-hash', test_key, details, null, null, null);
    if result <> 'reserved' then raise exception 'Unexpected result for attempt %: %', i, result; end if;
  end loop;
  result := public.reserve_enrollment(gen_random_uuid(), 'test-hash', test_key, details, null, null, null);
  if result <> 'rate_limited' then raise exception 'Expected rate_limited, got %', result; end if;
  if has_table_privilege('anon', 'public.enrollment_requests', 'SELECT')
     or has_table_privilege('authenticated', 'public.enrollment_requests', 'SELECT')
     or has_function_privilege('anon', 'public.reserve_enrollment(uuid,text,text,jsonb,text,text,bigint)', 'EXECUTE')
     or (select public from storage.buckets where id = 'enrollment-slips') then
    raise exception 'Private enrollment permission check failed';
  end if;
end $$;
rollback;
