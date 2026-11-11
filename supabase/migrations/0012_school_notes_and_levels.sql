-- Additive. Keeps every existing grade and note.
-- Run in the Supabase SQL editor.

alter type public.grade_level add value if not exists 'Tronc commun';
alter type public.grade_level add value if not exists '1ère Bac Sciences expérimentales';
alter type public.grade_level add value if not exists '1ere Bac Sciences mathématiques';
alter type public.grade_level add value if not exists '2ème Bac Sciences Sciences expérimentales';

alter table public.student_profiles
  add column if not exists math_control_2026_score numeric,
  add column if not exists math_control_2026_max numeric,
  add column if not exists math_s2_2025_score numeric,
  add column if not exists math_s2_2025_max numeric,
  add column if not exists math_regional_2025_score numeric,
  add column if not exists math_regional_2025_max numeric;
