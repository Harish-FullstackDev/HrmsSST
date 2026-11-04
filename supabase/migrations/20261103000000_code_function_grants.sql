-- Fix: creating a job or submitting an application failed with "permission
-- denied for function next_job_code / next_application_reference".
--
-- A column default runs with the inserting user's rights, so signed-in users
-- need EXECUTE on the functions behind jobs.job_code and
-- applications.reference (20261102030000 and 20261102040000 revoked it).
-- Each function now checks its caller itself, so nobody else can call them
-- directly (over the API) to use up numbers. Run once in the Supabase SQL
-- editor; safe to re-run.

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
    return 'ASC-' || code_year || '-' || lpad(code_number::text, 3, '0');
end;
$$;

create or replace function public.next_application_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    ref_year integer := extract(year from now() at time zone 'Asia/Kolkata')::integer;
    ref_number integer;
begin
    -- Only signed-in users (or the service role) submit applications.
    if auth.role() = 'anon' then
        raise exception 'Sign in to apply' using errcode = '42501';
    end if;
    insert into public.application_ref_counters as c (year, last_number)
    values (ref_year, 1)
    on conflict (year) do update set last_number = c.last_number + 1
    returning last_number into ref_number;
    return 'APP-' || ref_year || '-' || lpad(ref_number::text, 4, '0');
end;
$$;

revoke all on function public.next_job_code() from public, anon;
revoke all on function public.next_application_reference() from public, anon;
grant execute on function public.next_job_code() to authenticated;
grant execute on function public.next_application_reference() to authenticated;
