-- Brukerundersøkelser: innloggede kan lage kladd, publisere og dele en lenke.
-- Svar krever innlogging. Eieren ser bare antall svar, aldri hvem.
-- Teller aldri i kåringen.

alter table public.surveys
  add column if not exists owner_id uuid references auth.users (id) on delete cascade,
  add column if not exists share_token text,
  add column if not exists status text not null default 'published',
  add column if not exists published_at timestamptz;

alter table public.surveys
  drop constraint if exists surveys_status_check;

alter table public.surveys
  add constraint surveys_status_check
  check (status in ('draft', 'published'));

alter table public.surveys
  drop constraint if exists surveys_user_no_ranking;

alter table public.surveys
  add constraint surveys_user_no_ranking
  check (owner_id is null or counts_toward_ranking = false);

create unique index if not exists surveys_share_token_idx
  on public.surveys (share_token)
  where share_token is not null;

create index if not exists surveys_owner_idx
  on public.surveys (owner_id)
  where owner_id is not null;

update public.surveys
set status = 'published'
where owner_id is null and status is distinct from 'published';

create or replace function public.enforce_user_survey_rules()
returns trigger
language plpgsql
as $$
declare
  token text;
begin
  if tg_op = 'UPDATE' and old.owner_id is null then
    new.owner_id := null;
    new.share_token := null;
    return new;
  end if;

  if tg_op = 'UPDATE' and old.owner_id is not null then
    new.owner_id := old.owner_id;
    new.share_token := old.share_token;
    new.slug := old.slug;
  end if;

  if new.owner_id is null then
    return new;
  end if;

  new.counts_toward_ranking := false;
  new.sort_order := 1000;

  if new.status is null or new.status not in ('draft', 'published') then
    new.status := 'draft';
  end if;

  if new.share_token is null or new.share_token = '' then
    loop
      token := encode(gen_random_bytes(8), 'hex');
      exit when not exists (
        select 1 from public.surveys s where s.share_token = token
      );
    end loop;
    new.share_token := token;
  end if;

  if new.slug is null or new.slug = '' then
    new.slug := 'u-' || new.share_token;
  end if;

  if new.status = 'published' then
    new.is_active := true;
    if new.published_at is null then
      new.published_at := now();
    end if;
  else
    new.is_active := false;
  end if;

  return new;
end;
$$;

drop trigger if exists surveys_user_rules on public.surveys;
create trigger surveys_user_rules
  before insert or update on public.surveys
  for each row execute function public.enforce_user_survey_rules();

drop policy if exists "surveys_select_all" on public.surveys;
drop policy if exists surveys_select_official on public.surveys;
drop policy if exists surveys_select_own on public.surveys;
drop policy if exists surveys_select_published_user on public.surveys;
drop policy if exists surveys_insert_own on public.surveys;
drop policy if exists surveys_update_own on public.surveys;
drop policy if exists surveys_delete_own on public.surveys;

create policy surveys_select_official
  on public.surveys for select
  using (owner_id is null);

create policy surveys_select_own
  on public.surveys for select
  using (owner_id = auth.uid());

create policy surveys_select_published_user
  on public.surveys for select
  using (
    owner_id is not null
    and status = 'published'
    and is_active = true
  );

create policy surveys_insert_own
  on public.surveys for insert
  with check (
    auth.uid() is not null
    and owner_id = auth.uid()
    and counts_toward_ranking = false
  );

create policy surveys_update_own
  on public.surveys for update
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and counts_toward_ranking = false
  );

create policy surveys_delete_own
  on public.surveys for delete
  using (owner_id = auth.uid());

drop policy if exists "questions_select_all" on public.survey_questions;
drop policy if exists questions_select_visible on public.survey_questions;
drop policy if exists questions_write_own on public.survey_questions;

create policy questions_select_visible
  on public.survey_questions for select
  using (
    exists (
      select 1
      from public.surveys s
      where s.id = survey_id
        and (
          s.owner_id is null
          or s.owner_id = auth.uid()
          or (s.status = 'published' and s.is_active)
        )
    )
  );

create policy questions_write_own
  on public.survey_questions for all
  using (
    exists (
      select 1 from public.surveys s
      where s.id = survey_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.surveys s
      where s.id = survey_id and s.owner_id = auth.uid()
    )
  );

create or replace function public.can_respond_to_survey(target_survey uuid, target_orgnr text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.surveys s
    where s.id = target_survey
      and s.is_active
      and (
        (
          s.owner_id is null
          and public.can_survey_company(target_orgnr)
        )
        or (
          s.owner_id is not null
          and s.status = 'published'
          and s.counts_toward_ranking = false
        )
      )
  );
$$;

revoke all on function public.can_respond_to_survey(uuid, text) from public;
grant execute on function public.can_respond_to_survey(uuid, text) to authenticated;

drop policy if exists responses_insert_own on public.survey_responses;
create policy responses_insert_own on public.survey_responses
  for insert with check (
    auth.uid() = user_id
    and public.can_respond_to_survey(survey_id, company_orgnr)
  );

drop policy if exists responses_update_own on public.survey_responses;
create policy responses_update_own on public.survey_responses
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and public.can_respond_to_survey(survey_id, company_orgnr)
  );

-- Bare antall. Ingen user_id, e-post eller enkelt svar.
create or replace function public.my_survey_stats()
returns table(survey_id uuid, response_count integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  return query
  select s.id, count(r.id)::integer
  from public.surveys s
  left join public.survey_responses r on r.survey_id = s.id
  where s.owner_id = auth.uid()
  group by s.id;
end;
$$;

revoke all on function public.my_survey_stats() from public;
grant execute on function public.my_survey_stats() to authenticated;
