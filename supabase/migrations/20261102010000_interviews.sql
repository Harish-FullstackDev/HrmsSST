-- Interviews scheduled for applications (the HR Interview Schedule page).
-- Needs 20261102000000_hiring.sql first. Run once in the Supabase SQL editor;
-- safe to re-run.

do $$ begin
    create type public.interview_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.interview_mode as enum ('online', 'in_person', 'phone');
exception when duplicate_object then null; end $$;

create table if not exists public.interviews (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications (id) on delete cascade,
    title text not null check (length(trim(title)) between 2 and 120),   -- e.g. "Portfolio Review"
    interviewer text not null default '',
    scheduled_at timestamptz not null,
    duration_minutes integer not null default 45 check (duration_minutes between 5 and 480),
    mode public.interview_mode not null default 'online',
    location text not null default '',
    meeting_link text not null default '' check (meeting_link = '' or meeting_link ~ '^https://'),
    status public.interview_status not null default 'scheduled',
    created_by uuid references auth.users (id) on delete set null default auth.uid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists interviews_scheduled_idx on public.interviews (scheduled_at);
create index if not exists interviews_application_idx on public.interviews (application_id);

drop trigger if exists interviews_touch on public.interviews;
create trigger interviews_touch
    before update on public.interviews
    for each row execute function public.applications_touch();

alter table public.interviews enable row level security;

-- HR sees every interview; a candidate sees the ones for their own
-- applications (for the meeting time and link).
drop policy if exists "interviews: read own or hr" on public.interviews;
create policy "interviews: read own or hr" on public.interviews
    for select to authenticated
    using (
        (select public.is_hr())
        or exists (select 1 from public.applications a where a.id = application_id and a.candidate_id = (select auth.uid()))
    );

drop policy if exists "interviews: hr inserts" on public.interviews;
create policy "interviews: hr inserts" on public.interviews
    for insert to authenticated
    with check ((select public.is_hr()));

drop policy if exists "interviews: hr updates" on public.interviews;
create policy "interviews: hr updates" on public.interviews
    for update to authenticated
    using ((select public.is_hr()))
    with check ((select public.is_hr()));

drop policy if exists "interviews: hr deletes" on public.interviews;
create policy "interviews: hr deletes" on public.interviews
    for delete to authenticated
    using ((select public.is_hr()));
