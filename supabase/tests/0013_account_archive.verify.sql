-- =============================================================================
-- Verification for 0013_account_archive.sql
-- =============================================================================
-- Run in the Supabase SQL editor of a STAGING / branch project after 0013.
-- Everything happens inside one transaction that ends in ROLLBACK: fixture
-- users and rows are never kept. Any failed check raises 'FAIL: ...' and stops.
-- Success ends with the notice 'ALL ARCHIVE CHECKS PASSED'.
--
-- It impersonates real callers the way PostgREST does:
--   role `authenticated` + request.jwt.claims.sub = <user id>
-- =============================================================================
begin;

-- Fixture ids -----------------------------------------------------------------
create temp table fx (k text primary key, id uuid) on commit drop;
insert into fx values
  ('sa', gen_random_uuid()), ('ad', gen_random_uuid()), ('t1', gen_random_uuid()),
  ('s1', gen_random_uuid()), ('s2', gen_random_uuid());
grant select on fx to authenticated;

create function pg_temp.fx(key text) returns uuid language sql stable as
  $$ select id from fx where k = key $$;
create function pg_temp.act_as(key text) returns void language sql as
  $$ select set_config('request.jwt.claims',
       json_build_object('sub', pg_temp.fx(key), 'role', 'authenticated')::text, true) $$;
grant execute on function pg_temp.fx(text) to authenticated;

-- Fixture rows (as postgres: no JWT, RLS bypassed) ----------------------------
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
select id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'archive-verify-' || k || '-' || id || '@example.test',
       case when k = 't1' then '{"role":"teacher"}'::jsonb else '{"role":"student"}'::jsonb end,
       now(), now()
from fx;

update public.profiles set role = 'super_admin' where id = pg_temp.fx('sa');
update public.profiles set role = 'admin'       where id = pg_temp.fx('ad');

insert into public.student_profiles (user_id, teacher_id)
values (pg_temp.fx('s1'), pg_temp.fx('t1')), (pg_temp.fx('s2'), pg_temp.fx('t1'));

insert into public.test_sessions (id, user_id, test_id, status, completed_at, score)
values (gen_random_uuid(), pg_temp.fx('s1'), 'test-geo-space', 'completed', now(), 12),
       (gen_random_uuid(), pg_temp.fx('s2'), 'test-geo-space', 'completed', now(), 15);

insert into public.trial_results (session_id, question_index, question_id)
select s.id, 0, 'q1' from public.test_sessions s
where s.user_id in (pg_temp.fx('s1'), pg_temp.fx('s2'));


-- 1. Only an active super admin may archive -----------------------------------
select pg_temp.act_as('ad'); set local role authenticated;
do $$ begin
  perform public.archive_account(pg_temp.fx('s1'), 'verify');
  raise exception 'FAIL: admin was able to archive';
exception when insufficient_privilege then null; end $$;
do $$ begin
  perform public.list_archived_accounts();
  raise exception 'FAIL: admin was able to list archived accounts';
exception when insufficient_privilege then null; end $$;
reset role;

select pg_temp.act_as('t1'); set local role authenticated;
do $$ begin
  perform public.archive_account(pg_temp.fx('s1'), 'verify');
  raise exception 'FAIL: teacher was able to archive';
exception when insufficient_privilege then null; end $$;
reset role;

select pg_temp.act_as('s1'); set local role authenticated;
do $$ begin
  update public.profiles set archived_at = now() where id = pg_temp.fx('s1');
  raise exception 'FAIL: student set own archived_at';
exception when insufficient_privilege then null; end $$;
do $$ begin
  insert into public.account_archive_events (target_id, actor_id, action)
  values (pg_temp.fx('s1'), pg_temp.fx('s1'), 'restore');
  raise exception 'FAIL: student wrote to the audit log';
exception when insufficient_privilege then null; end $$;
reset role;

-- 2. Super admin guard rails --------------------------------------------------
select pg_temp.act_as('sa'); set local role authenticated;
do $$ begin
  update public.profiles set archived_at = now() where id = pg_temp.fx('s1');
  raise exception 'FAIL: super admin bypassed archive_account with a direct UPDATE';
exception when insufficient_privilege then null; end $$;
do $$ begin
  perform public.archive_account(pg_temp.fx('sa'), 'self');
  raise exception 'FAIL: super admin archived self';
exception when insufficient_privilege then null; end $$;
do $$ begin
  perform public.archive_account(pg_temp.fx('ad'), 'admin target');
  raise exception 'FAIL: an admin account was archived';
exception when insufficient_privilege then null; end $$;
do $$ begin
  perform public.archive_account(pg_temp.fx('s1'), '  ');
  raise exception 'FAIL: archived without a reason';
exception when invalid_parameter_value then null; end $$;

-- 3. Archive the student ------------------------------------------------------
do $$
declare r record;
begin
  select * into r from public.archive_account(pg_temp.fx('s1'), 'verify archive');
  if r.already_archived then raise exception 'FAIL: first archive reported already_archived'; end if;
  select * into r from public.archive_account(pg_temp.fx('s1'), 'verify archive');
  if not r.already_archived then raise exception 'FAIL: second archive is not idempotent'; end if;
  if (select count(*) from public.account_archive_events
      where target_id = pg_temp.fx('s1') and action = 'archive') <> 1 then
    raise exception 'FAIL: expected exactly one archive audit row';
  end if;
  if (select count(*) from public.profiles where id = pg_temp.fx('s1')) <> 0 then
    raise exception 'FAIL: super admin still sees the archived profile through RLS';
  end if;
  if not exists (select 1 from public.list_archived_accounts() where id = pg_temp.fx('s1')) then
    raise exception 'FAIL: archived student missing from list_archived_accounts()';
  end if;
end $$;
reset role;

-- 4. Archived student is invisible to others ----------------------------------
select pg_temp.act_as('t1'); set local role authenticated;
do $$ begin
  if exists (select 1 from public.my_students where user_id = pg_temp.fx('s1')) then
    raise exception 'FAIL: teacher roster shows the archived student'; end if;
  if not exists (select 1 from public.my_students where user_id = pg_temp.fx('s2')) then
    raise exception 'FAIL: teacher roster lost the active student'; end if;
  if exists (select 1 from public.test_sessions where user_id = pg_temp.fx('s1')) then
    raise exception 'FAIL: teacher sees the archived student sessions'; end if;
  if exists (select 1 from public.trial_results tr join public.test_sessions s on s.id = tr.session_id
             where s.user_id = pg_temp.fx('s1')) then
    raise exception 'FAIL: teacher sees the archived student answers'; end if;
end $$;
reset role;

select pg_temp.act_as('ad'); set local role authenticated;
do $$ begin
  if exists (select 1 from public.profiles where id = pg_temp.fx('s1')) then
    raise exception 'FAIL: admin sees the archived profile'; end if;
  if exists (select 1 from public.student_profiles where user_id = pg_temp.fx('s1')) then
    raise exception 'FAIL: admin sees the archived student_profiles row'; end if;
  if (select count(*) from public.trial_results tr
      where tr.session_id in (select id from public.test_sessions where user_id = pg_temp.fx('s2'))) <> 1 then
    raise exception 'FAIL: admin lost the active student answers'; end if;
end $$;
reset role;

-- 5. Archived student is locked out (access token still valid) ----------------
select pg_temp.act_as('s1'); set local role authenticated;
do $$ begin
  if exists (select 1 from public.profiles where id = pg_temp.fx('s1')) then
    raise exception 'FAIL: archived user reads own profile'; end if;
  if exists (select 1 from public.tests) then
    raise exception 'FAIL: archived user reads the test catalogue'; end if;
end $$;
do $$ begin
  insert into public.test_sessions (user_id, test_id) values (pg_temp.fx('s1'), 'test-geo-space');
  raise exception 'FAIL: archived user started a session';
exception when insufficient_privilege then null; end $$;
reset role;

-- 6. Archive the teacher: link kept, directory hides it -----------------------
select pg_temp.act_as('sa'); set local role authenticated;
select * from public.archive_account(pg_temp.fx('t1'), 'verify teacher archive');
reset role;

select pg_temp.act_as('s2'); set local role authenticated;
do $$ begin
  if exists (select 1 from public.profiles where id = pg_temp.fx('t1')) then
    raise exception 'FAIL: teacher directory shows the archived teacher'; end if;
  if (select teacher_id from public.student_profiles where user_id = pg_temp.fx('s2'))
     is distinct from pg_temp.fx('t1') then
    raise exception 'FAIL: student lost the link to the archived teacher'; end if;
  update public.student_profiles set academic_track = 'verify' where user_id = pg_temp.fx('s2');
end $$;
do $$ begin
  update public.student_profiles set teacher_id = null where user_id = pg_temp.fx('s2');
  update public.student_profiles set teacher_id = pg_temp.fx('t1') where user_id = pg_temp.fx('s2');
  raise exception 'FAIL: student re-assigned to an archived teacher';
exception when check_violation then null; end $$;
reset role;

-- 7. Restore the student ------------------------------------------------------
select pg_temp.act_as('sa'); set local role authenticated;
do $$
declare r record;
begin
  select * into r from public.restore_account(pg_temp.fx('s1'));
  if r.already_active then raise exception 'FAIL: restore reported already_active'; end if;
  if not exists (select 1 from public.profiles where id = pg_temp.fx('s1')) then
    raise exception 'FAIL: restored profile not visible to super admin'; end if;
  if not exists (select 1 from public.account_archive_events
                 where target_id = pg_temp.fx('s1') and action = 'restore') then
    raise exception 'FAIL: restore not audited'; end if;
  select * into r from public.restore_account(pg_temp.fx('s1'));
  if not r.already_active then raise exception 'FAIL: second restore is not idempotent'; end if;
end $$;
reset role;

select pg_temp.act_as('ad'); set local role authenticated;
do $$ begin
  if not exists (select 1 from public.test_sessions where user_id = pg_temp.fx('s1')) then
    raise exception 'FAIL: restored student data still hidden'; end if;
  raise notice 'ALL ARCHIVE CHECKS PASSED';
end $$;
reset role;

rollback;
