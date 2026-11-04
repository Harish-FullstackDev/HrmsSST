-- Job codes now start with SST- instead of ASC- (SST-2026-001,
-- SST-2026-002, ...). Same per-year numbering and counters as
-- 20261102030000_job_codes.sql; only the prefix changes. Needs
-- 20261103000000_code_function_grants.sql and 20261103010000_peek_job_code.sql
-- first. Run once in the Supabase SQL editor; safe to re-run.

-- Same as 20261103000000_code_function_grants.sql, with the new prefix.
create or replace function public.next_job_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    code_year integer := extract(year from now() at time zone 'Asia/Kolkata')::integer;
    code_number integer;
begin
    -- Only HR creates jobs. auth.uid() is null for the service role and the
    -- SQL editor, which may also insert jobs.
    if auth.uid() is not null and not public.is_hr() then
        raise exception 'Only HR can create jobs' using errcode = '42501';
    end if;
    insert into public.job_code_counters as c (year, last_number)
    values (code_year, 1)
    on conflict (year) do update set last_number = c.last_number + 1
    returning last_number into code_number;
    return 'SST-' || code_year || '-' || lpad(code_number::text, 3, '0');
end;
$$;

-- Same as 20261103010000_peek_job_code.sql, with the new prefix.
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
    return 'SST-' || code_year || '-' || lpad((coalesce(last_used, 0) + 1)::text, 3, '0');
end;
$$;

-- create or replace keeps existing grants; repeated so this file stands alone.
revoke all on function public.next_job_code() from public, anon;
grant execute on function public.next_job_code() to authenticated;
revoke all on function public.peek_next_job_code() from public, anon;
grant execute on function public.peek_next_job_code() to authenticated;

-- Rename existing jobs' codes, keeping their numbers (ASC-2026-001 becomes
-- SST-2026-001). Slugs stay as they are, so links to those jobs keep working.
update public.jobs
set job_code = 'SST-' || substr(job_code, 5)
where job_code ~ '^ASC-\d{4}-\d+$';
