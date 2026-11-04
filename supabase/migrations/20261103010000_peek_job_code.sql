-- The job ID the next new job will get, for the Job ID field on the
-- Create Job form. Only reads the counter; next_job_code() still assigns
-- the real ID on insert (if two HR users create jobs at once, the later one
-- gets the following number). Needs 20261102030000_job_codes.sql first.
-- Run once in the Supabase SQL editor; safe to re-run.

create or replace function public.peek_next_job_code()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    code_year integer := extract(year from now() at time zone 'Asia/Kolkata')::integer;
    last_used integer;
begin
    if not public.is_hr() then
        raise exception 'Only HR can create jobs' using errcode = '42501';
    end if;
    select c.last_number into last_used from public.job_code_counters c where c.year = code_year;
    return 'ASC-' || code_year || '-' || lpad((coalesce(last_used, 0) + 1)::text, 3, '0');
end;
$$;

revoke all on function public.peek_next_job_code() from public, anon;
grant execute on function public.peek_next_job_code() to authenticated;
