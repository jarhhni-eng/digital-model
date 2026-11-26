-- =============================================================================
-- 0013 — Account archive (soft delete) for student and teacher accounts
-- =============================================================================
-- Run in the Supabase SQL editor AFTER setup.sql and migrations 0010–0012.
-- Idempotent: re-running is safe. Additive: no row is deleted.
--
-- Model
--   • `profiles.archived_at` marks an account archived. Nothing is deleted, so a
--     super admin can restore it.
--   • A RESTRICTIVE RLS policy on every table hides archived accounts and their
--     data from EVERY signed-in user, the super admin included. It also locks
--     an archived user out of all data, even with a still-valid access token.
--   • The super admin reaches archived accounts only through the SECURITY
--     DEFINER functions below. They check the caller in the database, write an
--     append-only audit row, and are the only path that can change the archive
--     columns (enforced by the profiles guard trigger).
--   • The service-role key bypasses RLS. Server code that reads with it must
--     filter archived accounts itself (see lib/admin/archived-accounts.ts).
--
-- Rollback: supabase/migrations/0013_account_archive.down.sql
-- Verify:   supabase/tests/0013_account_archive.verify.sql
-- =============================================================================


-- 1. Columns ------------------------------------------------------------------
alter table public.profiles
  add column if not exists archived_at     timestamptz,
  add column if not exists archived_by     uuid references public.profiles(id) on delete set null,
  add column if not exists archived_email  text,
  add column if not exists archive_reason  text;

create index if not exists profiles_archived_idx
  on public.profiles (archived_at) where archived_at is not null;


-- 2. Audit log (append-only; written only by the functions below) -------------
create table if not exists public.account_archive_events (
  id            bigserial primary key,
  -- No FK on purpose: the trail must survive a later hard delete.
  target_id     uuid not null,
  target_email  text,
  target_role   public.user_role,
  actor_id      uuid not null,
  action        text not null check (action in ('archive', 'restore')),
  reason        text,
  created_at    timestamptz not null default now()
);
create index if not exists account_archive_events_target_idx
  on public.account_archive_events (target_id, created_at desc);

alter table public.account_archive_events enable row level security;

drop policy if exists archive_events_super_admin_read on public.account_archive_events;
create policy archive_events_super_admin_read on public.account_archive_events
  for select to authenticated using (public.is_super_admin());

revoke all on public.account_archive_events from anon;
revoke insert, update, delete on public.account_archive_events from authenticated;
grant select on public.account_archive_events to authenticated;
revoke all on sequence public.account_archive_events_id_seq from anon, authenticated;


-- 3. Helpers (SECURITY DEFINER: read profiles without RLS recursion) ----------
create or replace function public.is_active_account(uid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = uid and archived_at is null)
$$;

create or replace function public.caller_is_active()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.is_active_account(auth.uid())
$$;

create or replace function public.session_owner_active(sid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.test_sessions s
    join public.profiles p on p.id = s.user_id
    where s.id = sid and p.archived_at is null
  )
$$;


-- 4. Guard: archive columns change only through archive/restore ---------------
-- Same function as setup.sql, plus the archive-column check at the end.
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  -- No end-user JWT: SQL editor, Auth triggers, or the secret key.
  if auth.uid() is null then
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'profiles.id cannot be changed' using errcode = '42501';
  end if;
  if new.email is distinct from old.email then
    raise exception 'profiles.email is managed by Supabase Auth' using errcode = '42501';
  end if;
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'Only a super admin can change roles' using errcode = '42501';
  end if;
  if new.school_id is distinct from old.school_id and not public.is_admin() then
    raise exception 'Only an admin can change school affiliation' using errcode = '42501';
  end if;
  if (new.archived_at    is distinct from old.archived_at
      or new.archived_by    is distinct from old.archived_by
      or new.archived_email is distinct from old.archived_email
      or new.archive_reason is distinct from old.archive_reason)
     and coalesce(current_setting('app.account_archive', true), '') <> 'on' then
    raise exception 'Archive fields change only through archive_account / restore_account'
      using errcode = '42501';
  end if;
  return new;
end$$;

-- A student cannot be (re)assigned to an archived teacher. An unchanged
-- teacher_id is still allowed, so a restore reconnects existing students.
create or replace function public.check_student_profile_teacher()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if new.teacher_id is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and new.teacher_id is not distinct from old.teacher_id then
    return new;
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = new.teacher_id and p.role = 'teacher' and p.archived_at is null
  ) then
    raise exception 'teacher_id must reference an active teacher profile' using errcode = '23514';
  end if;
  return new;
end$$;


-- 5. Archive / restore / list (super admin only, checked in the database) -----
create or replace function public.archive_account(target uuid, reason text)
returns table (id uuid, role public.user_role, archived_email text, already_archived boolean)
language plpgsql security definer
set search_path = public
as $$
declare
  caller        uuid := auth.uid();
  clean_reason  text := nullif(btrim(coalesce(reason, '')), '');
  t             public.profiles%rowtype;
begin
  if caller is null or not public.is_super_admin() or not public.caller_is_active() then
    raise exception 'Only an active super admin can archive accounts' using errcode = '42501';
  end if;
  if target is null or target = caller then
    raise exception 'You cannot archive your own account' using errcode = '42501';
  end if;
  if clean_reason is null or char_length(clean_reason) < 3 or char_length(clean_reason) > 500 then
    raise exception 'A reason of 3 to 500 characters is required' using errcode = '22023';
  end if;

  select * into t from public.profiles p where p.id = target for update;
  if not found then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;
  if t.role not in ('student', 'teacher') then
    raise exception 'Only student and teacher accounts can be archived' using errcode = '42501';
  end if;

  -- Already archived: report it so the caller can safely retry the Auth steps.
  if t.archived_at is not null then
    return query select t.id, t.role, t.archived_email, true;
    return;
  end if;

  perform set_config('app.account_archive', 'on', true);
  update public.profiles p
     set archived_at    = now(),
         archived_by    = caller,
         archived_email = t.email,
         archive_reason = clean_reason
   where p.id = target;
  perform set_config('app.account_archive', 'off', true);

  insert into public.account_archive_events (target_id, target_email, target_role, actor_id, action, reason)
  values (t.id, t.email, t.role, caller, 'archive', clean_reason);

  return query select t.id, t.role, t.email, false;
end$$;

create or replace function public.restore_account(target uuid)
returns table (id uuid, role public.user_role, already_active boolean)
language plpgsql security definer
set search_path = public
as $$
declare
  caller  uuid := auth.uid();
  t       public.profiles%rowtype;
begin
  if caller is null or not public.is_super_admin() or not public.caller_is_active() then
    raise exception 'Only an active super admin can restore accounts' using errcode = '42501';
  end if;

  select * into t from public.profiles p where p.id = target for update;
  if not found then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;
  if t.role not in ('student', 'teacher') then
    raise exception 'Only student and teacher accounts can be restored' using errcode = '42501';
  end if;
  if t.archived_at is null then
    return query select t.id, t.role, true;
    return;
  end if;

  perform set_config('app.account_archive', 'on', true);
  update public.profiles p
     set archived_at    = null,
         archived_by    = null,
         archived_email = null,
         archive_reason = null
   where p.id = target;
  perform set_config('app.account_archive', 'off', true);

  insert into public.account_archive_events (target_id, target_email, target_role, actor_id, action, reason)
  values (t.id, t.archived_email, t.role, caller, 'restore', null);

  return query select t.id, t.role, false;
end$$;

create or replace function public.list_archived_accounts()
returns table (
  id              uuid,
  role            public.user_role,
  full_name       text,
  archived_email  text,
  archived_at     timestamptz,
  archive_reason  text,
  archived_by_email text
)
language plpgsql stable security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_super_admin() or not public.caller_is_active() then
    raise exception 'Only an active super admin can list archived accounts' using errcode = '42501';
  end if;
  return query
    select p.id, p.role, p.full_name, p.archived_email, p.archived_at, p.archive_reason, a.email
    from public.profiles p
    left join public.profiles a on a.id = p.archived_by
    where p.archived_at is not null
    order by p.archived_at desc;
end$$;


-- 6. RESTRICTIVE policies: AND-ed with every existing permissive policy -------
-- `(select ...)` lets Postgres evaluate the caller check once per query.
drop policy if exists archive_gate on public.profiles;
create policy archive_gate on public.profiles
  as restrictive for all to authenticated
  using      (archived_at is null and (select public.caller_is_active()))
  with check (archived_at is null and (select public.caller_is_active()));

drop policy if exists archive_gate on public.student_profiles;
create policy archive_gate on public.student_profiles
  as restrictive for all to authenticated
  using      (public.is_active_account(user_id) and (select public.caller_is_active()))
  with check (public.is_active_account(user_id) and (select public.caller_is_active()));

drop policy if exists archive_gate on public.test_sessions;
create policy archive_gate on public.test_sessions
  as restrictive for all to authenticated
  using      (public.is_active_account(user_id) and (select public.caller_is_active()))
  with check (public.is_active_account(user_id) and (select public.caller_is_active()));

drop policy if exists archive_gate on public.metrics;
create policy archive_gate on public.metrics
  as restrictive for all to authenticated
  using      (public.is_active_account(user_id) and (select public.caller_is_active()))
  with check (public.is_active_account(user_id) and (select public.caller_is_active()));

drop policy if exists archive_gate on public.external_results;
create policy archive_gate on public.external_results
  as restrictive for all to authenticated
  using      (public.is_active_account(student_id) and (select public.caller_is_active()))
  with check (public.is_active_account(student_id) and (select public.caller_is_active()));

drop policy if exists archive_gate on public.trial_results;
create policy archive_gate on public.trial_results
  as restrictive for all to authenticated
  using      (public.session_owner_active(session_id) and (select public.caller_is_active()))
  with check (public.session_owner_active(session_id) and (select public.caller_is_active()));

drop policy if exists archive_gate on public.geometry_session_part_scores;
create policy archive_gate on public.geometry_session_part_scores
  as restrictive for all to authenticated
  using      (public.session_owner_active(session_id) and (select public.caller_is_active()))
  with check (public.session_owner_active(session_id) and (select public.caller_is_active()));

drop policy if exists archive_gate on public.geometry_session_capacity_scores;
create policy archive_gate on public.geometry_session_capacity_scores
  as restrictive for all to authenticated
  using      (public.session_owner_active(session_id) and (select public.caller_is_active()))
  with check (public.session_owner_active(session_id) and (select public.caller_is_active()));

-- Tables with no per-user owner: only lock out archived callers.
drop policy if exists archive_gate on public.schools;
create policy archive_gate on public.schools
  as restrictive for all to authenticated
  using ((select public.caller_is_active())) with check ((select public.caller_is_active()));

drop policy if exists archive_gate on public.tests;
create policy archive_gate on public.tests
  as restrictive for all to authenticated
  using ((select public.caller_is_active())) with check ((select public.caller_is_active()));

drop policy if exists archive_gate on public.questions;
create policy archive_gate on public.questions
  as restrictive for all to authenticated
  using ((select public.caller_is_active())) with check ((select public.caller_is_active()));

drop policy if exists archive_gate on public.import_batches;
create policy archive_gate on public.import_batches
  as restrictive for all to authenticated
  using ((select public.caller_is_active())) with check ((select public.caller_is_active()));

drop policy if exists archive_gate on public.account_archive_events;
create policy archive_gate on public.account_archive_events
  as restrictive for all to authenticated
  using ((select public.caller_is_active()));


-- 7. Function grants ----------------------------------------------------------
revoke execute on function public.is_active_account(uuid)     from public, anon;
revoke execute on function public.caller_is_active()          from public, anon;
revoke execute on function public.session_owner_active(uuid)  from public, anon;
revoke execute on function public.archive_account(uuid, text) from public, anon;
revoke execute on function public.restore_account(uuid)       from public, anon;
revoke execute on function public.list_archived_accounts()    from public, anon;
grant  execute on function public.is_active_account(uuid)     to authenticated, service_role;
grant  execute on function public.caller_is_active()          to authenticated, service_role;
grant  execute on function public.session_owner_active(uuid)  to authenticated, service_role;
grant  execute on function public.archive_account(uuid, text) to authenticated;
grant  execute on function public.restore_account(uuid)       to authenticated;
grant  execute on function public.list_archived_accounts()    to authenticated;
