-- Job codes in the form ASC-<year>-<number>, numbered from 001 within each
-- year (ASC-2026-001, ASC-2026-002, ... then ASC-2027-001). The number grows
-- past three digits if a year ever needs it. The year is India's (where
-- Ascendus hires). Needs 20261102000000_hiring.sql first. Run once in the
-- Supabase SQL editor; safe to re-run.

-- The last number used in each year. Written only by next_job_code().
create table if not exists public.job_code_counters (
    year integer primary key,
    last_number integer not null
);

alter table public.job_code_counters enable row level security;
-- No policies: nobody reads or writes it from the app.

-- The next code for the current year. The upsert takes a row lock, so two
-- jobs created at the same moment still get different numbers.
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
    insert into public.job_code_counters as c (year, last_number)
    values (code_year, 1)
    on conflict (year) do update set last_number = c.last_number + 1
    returning last_number into code_number;
    return 'ASC-' || code_year || '-' || lpad(code_number::text, 3, '0');
end;
$$;

revoke all on function public.next_job_code() from public, anon, authenticated;

alter table public.jobs alter column job_code set default public.next_job_code();

-- Renumber jobs that still have an old JOB-##### code, in the order they were
-- created, within the year they were created. Their slugs stay as they are,
-- so links to them keep working.
with renumbered as (
    select
        id,
        extract(year from created_at at time zone 'Asia/Kolkata')::integer as code_year,
        row_number() over (
            partition by extract(year from created_at at time zone 'Asia/Kolkata')
            order by created_at, id
        ) as code_number
    from public.jobs
    where job_code like 'JOB-%'
)
update public.jobs j
set job_code = 'ASC-' || r.code_year || '-' || lpad(
    (r.code_number + coalesce((select c.last_number from public.job_code_counters c where c.year = r.code_year), 0))::text,
    3,
    '0'
)
from renumbered r
where j.id = r.id;

-- Move each year's counter past the codes now in use.
insert into public.job_code_counters (year, last_number)
select
    split_part(job_code, '-', 2)::integer,
    max(split_part(job_code, '-', 3)::integer)
from public.jobs
where job_code ~ '^ASC-\d{4}-\d+$'
group by 1
on conflict (year) do update set last_number = greatest(public.job_code_counters.last_number, excluded.last_number);

-- The old sequence is no longer used.
drop sequence if exists public.job_code_seq;
