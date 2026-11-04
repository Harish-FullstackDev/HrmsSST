-- Optional "Note" list on a job posting, written in the HR Create Job form
-- under Qualifications and shown on the careers job page when not empty.
-- Needs 20261102000000_hiring.sql first. Run once in the Supabase SQL
-- editor; safe to re-run.

alter table public.jobs
    add column if not exists notes text[] not null default '{}';

-- Make PostgREST see the new column straight away.
notify pgrst, 'reload schema';
