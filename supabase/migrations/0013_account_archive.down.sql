-- =============================================================================
-- 0013 rollback — removes the account archive layer.
-- =============================================================================
-- WARNING: run this only after every archived account is restored, or decided
-- on. Once the archive_gate policies are gone, archived accounts and their data
-- become visible again, and their Auth ban / placeholder e-mail stay in place.
-- The audit table is kept unless you drop it by hand (last statement).
-- =============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'student_profiles', 'test_sessions', 'metrics', 'external_results',
    'trial_results', 'geometry_session_part_scores', 'geometry_session_capacity_scores',
    'schools', 'tests', 'questions', 'import_batches', 'account_archive_events'
  ] loop
    execute format('drop policy if exists archive_gate on public.%I', t);
  end loop;
end$$;

drop function if exists public.list_archived_accounts();
drop function if exists public.restore_account(uuid);
drop function if exists public.archive_account(uuid, text);

-- Original guard and teacher check (as in setup.sql).
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
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
  return new;
end$$;

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
    select 1 from public.profiles p where p.id = new.teacher_id and p.role = 'teacher'
  ) then
    raise exception 'teacher_id must reference a teacher profile' using errcode = '23514';
  end if;
  return new;
end$$;

drop function if exists public.session_owner_active(uuid);
drop function if exists public.caller_is_active();
drop function if exists public.is_active_account(uuid);

drop index if exists public.profiles_archived_idx;
alter table public.profiles
  drop column if exists archive_reason,
  drop column if exists archived_email,
  drop column if exists archived_by,
  drop column if exists archived_at;

-- drop table if exists public.account_archive_events;
