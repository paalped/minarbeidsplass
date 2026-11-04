-- Profil med CV. Undersøkelse kun for tidligere arbeidsplasser.

create table if not exists public.cv_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_orgnr text not null references public.companies (orgnr) on delete restrict,
  title text,
  started_on date not null,
  ended_on date,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cv_entries_dates check (ended_on is null or ended_on >= started_on),
  constraint cv_entries_current check (is_current = (ended_on is null))
);

create unique index if not exists cv_entries_user_company_start
  on public.cv_entries (user_id, company_orgnr, started_on);

create unique index if not exists cv_entries_one_current
  on public.cv_entries (user_id)
  where is_current;

create index if not exists cv_entries_user_idx
  on public.cv_entries (user_id, is_current);

alter table public.cv_entries enable row level security;

drop policy if exists cv_select_own on public.cv_entries;
create policy cv_select_own on public.cv_entries
  for select using (auth.uid() = user_id);

drop policy if exists cv_insert_own on public.cv_entries;
create policy cv_insert_own on public.cv_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists cv_update_own on public.cv_entries;
create policy cv_update_own on public.cv_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists cv_delete_own on public.cv_entries;
create policy cv_delete_own on public.cv_entries
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.cv_entries to authenticated;

create or replace function public.can_survey_company(target_orgnr text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cv_entries e
    where e.user_id = auth.uid()
      and e.company_orgnr = target_orgnr
      and e.is_current = false
      and e.ended_on is not null
  );
$$;

revoke all on function public.can_survey_company(text) from public;
grant execute on function public.can_survey_company(text) to authenticated;

drop policy if exists responses_insert_own on public.survey_responses;
create policy responses_insert_own on public.survey_responses
  for insert with check (
    auth.uid() = user_id
    and public.can_survey_company(company_orgnr)
  );

drop policy if exists responses_update_own on public.survey_responses;
create policy responses_update_own on public.survey_responses
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and public.can_survey_company(company_orgnr)
  );
