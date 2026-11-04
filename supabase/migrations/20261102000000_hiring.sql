-- Hiring flow: HR posts jobs, candidates apply, HR reviews applications.
--
-- Tables
--   profiles             one row per auth user; `role` says candidate or hr
--   jobs                 job postings, managed by HR
--   applications         one per candidate per job, with the full answers
--   application_events   status history of each application
-- Storage
--   bucket "applications" (private): <candidate uid>/<upload id>/<file>
--
-- Run once in the Supabase SQL editor. Safe to re-run: every object is
-- created only if missing, and policies are dropped and re-created.

-- ---------------------------------------------------------------- roles --

do $$ begin
    create type public.user_role as enum ('candidate', 'hr');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    role public.user_role not null default 'candidate',
    first_name text not null default '',
    last_name text not null default '',
    email text not null default '',
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A profile for every new account, from the sign-up metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, first_name, last_name, email)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'first_name', ''),
        coalesce(new.raw_user_meta_data ->> 'last_name', ''),
        coalesce(new.email, '')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Accounts that existed before this migration.
insert into public.profiles (id, first_name, last_name, email)
select
    id,
    coalesce(raw_user_meta_data ->> 'first_name', ''),
    coalesce(raw_user_meta_data ->> 'last_name', ''),
    coalesce(email, '')
from auth.users
on conflict (id) do nothing;

-- True when the signed-in user is HR. Security definer so policies on other
-- tables can call it without the caller needing to read profiles.
create or replace function public.is_hr()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'hr');
$$;

-- Users read their own profile; HR reads all. Nobody updates profiles from
-- the app (that would let a candidate make themselves HR); promote HR staff
-- in the SQL editor:
--   update public.profiles set role = 'hr' where email = 'someone@ascendus.com';
drop policy if exists "profiles: read own or hr" on public.profiles;
create policy "profiles: read own or hr" on public.profiles
    for select to authenticated
    using (id = (select auth.uid()) or (select public.is_hr()));

-- ----------------------------------------------------------------- jobs --

do $$ begin
    create type public.job_status as enum ('draft', 'published', 'on_hold', 'closed');
exception when duplicate_object then null; end $$;

create sequence if not exists public.job_code_seq start 10100;

create table if not exists public.jobs (
    id uuid primary key default gen_random_uuid(),
    job_code text not null unique default ('JOB-' || nextval('public.job_code_seq')),
    slug text not null unique,
    title text not null check (length(trim(title)) between 2 and 120),
    department text not null default '',
    location text not null default '',
    mode_of_work text not null default '',        -- On-site, Hybrid, Remote
    type_of_work text not null default 'Full-time', -- Full-time, Part-time, Contract, Internship
    experience_level text not null default '',
    categories text[] not null default '{}',
    about_job text not null default '',
    responsibilities text[] not null default '{}',
    qualifications text[] not null default '{}',
    skills text[] not null default '{}',
    vacancies integer not null default 1 check (vacancies between 1 and 999),
    status public.job_status not null default 'draft',
    posted_at timestamptz,                         -- first time it was published
    closes_on date,
    created_by uuid references auth.users (id) on delete set null default auth.uid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists jobs_status_posted_idx on public.jobs (status, posted_at desc);

-- Slug from the title and job code when none is given ("ui-ux-designer-job-10100"),
-- posted_at on first publish, and updated_at on every change.
create or replace function public.jobs_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.slug is null or new.slug = '' then
        new.slug := trim(both '-' from regexp_replace(lower(new.title || '-' || new.job_code), '[^a-z0-9]+', '-', 'g'));
    end if;
    if new.status = 'published' and new.posted_at is null then
        new.posted_at := now();
    end if;
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists jobs_before_write on public.jobs;
create trigger jobs_before_write
    before insert or update on public.jobs
    for each row execute function public.jobs_before_write();

alter table public.jobs enable row level security;

-- Published jobs are public (the careers pages, and the website if it reads
-- them); HR sees and manages every job.
drop policy if exists "jobs: read published" on public.jobs;
create policy "jobs: read published" on public.jobs
    for select to anon, authenticated
    using (status = 'published');

drop policy if exists "jobs: hr reads all" on public.jobs;
create policy "jobs: hr reads all" on public.jobs
    for select to authenticated
    using ((select public.is_hr()));

drop policy if exists "jobs: hr inserts" on public.jobs;
create policy "jobs: hr inserts" on public.jobs
    for insert to authenticated
    with check ((select public.is_hr()));

drop policy if exists "jobs: hr updates" on public.jobs;
create policy "jobs: hr updates" on public.jobs
    for update to authenticated
    using ((select public.is_hr()))
    with check ((select public.is_hr()));

drop policy if exists "jobs: hr deletes" on public.jobs;
create policy "jobs: hr deletes" on public.jobs
    for delete to authenticated
    using ((select public.is_hr()));

-- --------------------------------------------------------- applications --

do $$ begin
    create type public.application_status as enum (
        'applied', 'screening', 'shortlisted', 'assessment', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'
    );
exception when duplicate_object then null; end $$;

create sequence if not exists public.application_ref_seq start 1;

create table if not exists public.applications (
    id uuid primary key default gen_random_uuid(),
    reference text not null unique default ('ASC-' || lpad(nextval('public.application_ref_seq')::text, 6, '0')),
    job_id uuid not null references public.jobs (id) on delete restrict,
    candidate_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    status public.application_status not null default 'applied',
    -- Copied out of `answers` for listing and searching.
    first_name text not null,
    last_name text not null,
    email text not null,
    phone text not null default '',
    -- Every stage's answers as the apply flow keeps them (stepData).
    answers jsonb not null,
    -- Storage paths in the "applications" bucket.
    resume_path text not null,
    resume_name text not null,
    documents jsonb not null default '{}',         -- { field: path | [paths] }
    submitted_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (job_id, candidate_id),
    check (pg_column_size(answers) < 200000)
);

create index if not exists applications_job_idx on public.applications (job_id, submitted_at desc);
create index if not exists applications_candidate_idx on public.applications (candidate_id, submitted_at desc);
create index if not exists applications_status_idx on public.applications (status);

alter table public.applications enable row level security;

-- Candidates see their own applications; HR sees all.
drop policy if exists "applications: read own or hr" on public.applications;
create policy "applications: read own or hr" on public.applications
    for select to authenticated
    using (candidate_id = (select auth.uid()) or (select public.is_hr()));

-- A candidate submits for themselves, to a published job, as "applied", with
-- files from their own storage folder.
drop policy if exists "applications: candidate submits" on public.applications;
create policy "applications: candidate submits" on public.applications
    for insert to authenticated
    with check (
        candidate_id = (select auth.uid())
        and status = 'applied'
        and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'published')
        and split_part(resume_path, '/', 1) = (select auth.uid())::text
    );

-- Only HR changes applications (status). Candidates withdraw through
-- withdraw_application() below.
drop policy if exists "applications: hr updates" on public.applications;
create policy "applications: hr updates" on public.applications
    for update to authenticated
    using ((select public.is_hr()))
    with check ((select public.is_hr()));

-- ------------------------------------------------------ status history --

create table if not exists public.application_events (
    id bigint generated always as identity primary key,
    application_id uuid not null references public.applications (id) on delete cascade,
    status public.application_status not null,
    changed_by uuid references auth.users (id) on delete set null,
    changed_at timestamptz not null default now()
);

create index if not exists application_events_app_idx on public.application_events (application_id, changed_at);

alter table public.application_events enable row level security;

drop policy if exists "application events: read own or hr" on public.application_events;
create policy "application events: read own or hr" on public.application_events
    for select to authenticated
    using (
        (select public.is_hr())
        or exists (select 1 from public.applications a where a.id = application_id and a.candidate_id = (select auth.uid()))
    );

-- Records the first status and every change; keeps updated_at current.
-- Security definer: written by the trigger only, never by the app.
create or replace function public.applications_track_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'INSERT' or new.status is distinct from old.status then
        insert into public.application_events (application_id, status, changed_by)
        values (new.id, new.status, auth.uid());
    end if;
    return new;
end;
$$;

create or replace function public.applications_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists applications_touch on public.applications;
create trigger applications_touch
    before update on public.applications
    for each row execute function public.applications_touch();

drop trigger if exists applications_track_status on public.applications;
create trigger applications_track_status
    after insert or update of status on public.applications
    for each row execute function public.applications_track_status();

-- A candidate withdraws their own application while it's still open.
create or replace function public.withdraw_application(application uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.applications
    set status = 'withdrawn'
    where id = application
      and candidate_id = auth.uid()
      and status not in ('hired', 'rejected', 'withdrawn');
    if not found then
        raise exception 'Application not found or can no longer be withdrawn.';
    end if;
end;
$$;

revoke all on function public.withdraw_application(uuid) from public, anon;
grant execute on function public.withdraw_application(uuid) to authenticated;

-- -------------------------------------------------------------- storage --

-- Private bucket for resumes and documents, 5 MB a file (the apply flow's
-- limit), documents and images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'applications',
    'applications',
    false,
    5242880,
    array[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Candidates upload into, read and replace files in their own folder
-- (<uid>/...); HR reads every file.
drop policy if exists "applications bucket: upload own" on storage.objects;
create policy "applications bucket: upload own" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'applications' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "applications bucket: update own" on storage.objects;
create policy "applications bucket: update own" on storage.objects
    for update to authenticated
    using (bucket_id = 'applications' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "applications bucket: read own or hr" on storage.objects;
create policy "applications bucket: read own or hr" on storage.objects
    for select to authenticated
    using (
        bucket_id = 'applications'
        and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_hr()))
    );
