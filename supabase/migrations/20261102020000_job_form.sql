-- Fields the HR Create Job form adds to jobs. Needs 20261102000000_hiring.sql
-- first. Run once in the Supabase SQL editor; safe to re-run.

-- Minimum years of experience, asked when the experience level is
-- "Experienced"; null for freshers.
alter table public.jobs
    add column if not exists min_experience_years smallint
    check (min_experience_years between 0 and 50);
