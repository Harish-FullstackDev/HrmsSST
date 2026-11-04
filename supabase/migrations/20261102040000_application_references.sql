-- Application references in the form APP-<year>-<number>, numbered from 0001
-- within each year (APP-2026-0001, APP-2026-0002, ... then APP-2027-0001), so
-- they can't be mistaken for job codes (ASC-2026-001). The year is India's.
-- Needs 20261102000000_hiring.sql first. Run once in the Supabase SQL editor;
-- safe to re-run.

-- The last number used in each year. Written only by
-- next_application_reference().
create table if not exists public.application_ref_counters (
    year integer primary key,
    last_number integer not null
);

alter table public.application_ref_counters enable row level security;
-- No policies: nobody reads or writes it from the app.

-- The next reference for the current year. The upsert takes a row lock, so
-- two applications submitted at the same moment still get different numbers.
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
    insert into public.application_ref_counters as c (year, last_number)
    values (ref_year, 1)
    on conflict (year) do update set last_number = c.last_number + 1
    returning last_number into ref_number;
    return 'APP-' || ref_year || '-' || lpad(ref_number::text, 4, '0');
end;
$$;

revoke all on function public.next_application_reference() from public, anon, authenticated;

alter table public.applications alter column reference set default public.next_application_reference();

-- Renumber applications that still have an old ASC-###### reference, in the
-- order they were submitted, within their year.
with renumbered as (
    select
        id,
        extract(year from submitted_at at time zone 'Asia/Kolkata')::integer as ref_year,
        row_number() over (
            partition by extract(year from submitted_at at time zone 'Asia/Kolkata')
            order by submitted_at, id
        ) as ref_number
    from public.applications
    where reference ~ '^ASC-\d{6}$'
)
update public.applications a
set reference = 'APP-' || r.ref_year || '-' || lpad(
    (r.ref_number + coalesce((select c.last_number from public.application_ref_counters c where c.year = r.ref_year), 0))::text,
    4,
    '0'
)
from renumbered r
where a.id = r.id;

-- Move each year's counter past the references now in use.
insert into public.application_ref_counters (year, last_number)
select
    split_part(reference, '-', 2)::integer,
    max(split_part(reference, '-', 3)::integer)
from public.applications
where reference ~ '^APP-\d{4}-\d+$'
group by 1
on conflict (year) do update
set last_number = greatest(public.application_ref_counters.last_number, excluded.last_number);

-- The old sequence is no longer used.
drop sequence if exists public.application_ref_seq;
