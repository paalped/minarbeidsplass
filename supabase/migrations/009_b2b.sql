-- B2B-bedriftsportal: verifisert eierskap, RBAC, merkevare, arbeidsgiverrespons
-- og innsikt med k-anonymitet (k >= 5) pluss tidsforsinkelse.

alter table public.survey_responses
  add column if not exists employer_visible_at timestamptz;

update public.survey_responses
set employer_visible_at = created_at
where employer_visible_at is null;

create or replace function public.set_employer_visible_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.employer_visible_at is not null then
    new.employer_visible_at := old.employer_visible_at;
    return new;
  end if;
  if new.employer_visible_at is null then
    new.employer_visible_at :=
      now() + interval '48 hours' + (random() * interval '48 hours');
  end if;
  return new;
end;
$$;

drop trigger if exists survey_responses_employer_delay on public.survey_responses;
create trigger survey_responses_employer_delay
  before insert or update on public.survey_responses
  for each row execute function public.set_employer_visible_at();

create table if not exists public.company_claims (
  id uuid primary key default gen_random_uuid(),
  orgnr text not null references public.companies (orgnr) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  declared_role text not null check (declared_role in ('daglig_leder', 'styreleder', 'hr')),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  brreg_roles jsonb not null default '[]'::jsonb,
  note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (orgnr, user_id)
);

create table if not exists public.company_members (
  orgnr text not null references public.companies (orgnr) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'responder')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  primary key (orgnr, user_id)
);

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  orgnr text not null references public.companies (orgnr) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'responder')),
  created_at timestamptz not null default now(),
  unique (orgnr, email)
);

create table if not exists public.company_accounts (
  orgnr text primary key references public.companies (orgnr) on delete cascade,
  plan text not null default 'basic' check (plan in ('basic', 'insights', 'talent')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.company_branding (
  orgnr text primary key references public.companies (orgnr) on delete cascade,
  logo_url text,
  banner_url text,
  intro text,
  career_url text,
  values_text text,
  updated_at timestamptz not null default now()
);

create table if not exists public.employer_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts (id) on delete cascade,
  orgnr text not null references public.companies (orgnr) on delete cascade,
  body text not null check (char_length(body) between 3 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_claims_status_idx on public.company_claims (status, created_at desc);
create index if not exists company_members_user_idx on public.company_members (user_id, status);
create index if not exists employer_replies_orgnr_idx on public.employer_replies (orgnr, created_at desc);
create index if not exists survey_responses_employer_visible_idx
  on public.survey_responses (company_orgnr, employer_visible_at);

create or replace function public.is_company_member(target_orgnr text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_is_admin(), false)
    or exists (
      select 1
      from public.company_members m
      where m.user_id = auth.uid()
        and m.orgnr = target_orgnr
        and m.status = 'active'
    );
$$;

create or replace function public.is_company_admin(target_orgnr text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_is_admin(), false)
    or exists (
      select 1
      from public.company_members m
      where m.user_id = auth.uid()
        and m.orgnr = target_orgnr
        and m.status = 'active'
        and m.role = 'admin'
    );
$$;

revoke all on function public.is_company_member(text) from public;
revoke all on function public.is_company_admin(text) from public;
grant execute on function public.is_company_member(text) to authenticated;
grant execute on function public.is_company_admin(text) to authenticated;

create or replace function public.employer_reply_guard()
returns trigger
language plpgsql
as $$
declare
  post_orgnr text;
begin
  select company_orgnr into post_orgnr from public.posts where id = new.post_id;
  if post_orgnr is null or post_orgnr is distinct from new.orgnr then
    raise exception 'Arbeidsgiversvar må gjelde samme bedrift som innlegget';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists employer_replies_guard on public.employer_replies;
create trigger employer_replies_guard
  before insert or update on public.employer_replies
  for each row execute function public.employer_reply_guard();

create or replace function public.accept_company_invites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  n integer := 0;
begin
  if auth.uid() is null then
    return 0;
  end if;

  select lower(email) into user_email from auth.users where id = auth.uid();
  if user_email is null then
    return 0;
  end if;

  insert into public.company_members (orgnr, user_id, role, status)
  select i.orgnr, auth.uid(), i.role, 'active'
  from public.company_invites i
  where lower(i.email) = user_email
  on conflict (orgnr, user_id) do update set
    role = excluded.role,
    status = 'active';

  get diagnostics n = row_count;

  delete from public.company_invites i
  where lower(i.email) = user_email;

  return n;
end;
$$;

revoke all on function public.accept_company_invites() from public;
grant execute on function public.accept_company_invites() to authenticated;

create or replace function public.company_insights(target_orgnr text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  n integer;
  n_fit integer;
  plan text;
  overall numeric;
  cats jsonb;
  series jsonb;
  culture jsonb;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if not public.is_company_member(target_orgnr) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select a.plan into plan from public.company_accounts a where a.orgnr = target_orgnr;
  if plan is null or plan = 'basic' then
    return jsonb_build_object('eligible', false, 'reason', 'plan', 'min', 5);
  end if;

  select count(*) into n
  from public.survey_responses r
  join public.surveys s on s.id = r.survey_id
  where r.company_orgnr = target_orgnr
    and s.counts_toward_ranking = true
    and r.employer_visible_at is not null
    and r.employer_visible_at <= now();

  if n < 5 then
    return jsonb_build_object('eligible', false, 'reason', 'k_anonymity', 'min', 5);
  end if;

  select
    round(avg(r.overall_score), 2),
    jsonb_build_object(
      'ledelse', round(avg((r.category_scores ->> 'ledelse')::numeric), 2),
      'miljo', round(avg((r.category_scores ->> 'miljo')::numeric), 2),
      'lonn', round(avg((r.category_scores ->> 'lonn')::numeric), 2),
      'balanse', round(avg((r.category_scores ->> 'balanse')::numeric), 2),
      'utvikling', round(avg((r.category_scores ->> 'utvikling')::numeric), 2),
      'kultur', round(avg((r.category_scores ->> 'kultur')::numeric), 2),
      'anbefaling', round(avg((r.category_scores ->> 'anbefaling')::numeric), 2)
    )
  into overall, cats
  from public.survey_responses r
  join public.surveys s on s.id = r.survey_id
  where r.company_orgnr = target_orgnr
    and s.counts_toward_ranking = true
    and r.employer_visible_at <= now();

  select coalesce(jsonb_agg(item order by period), '[]'::jsonb) into series
  from (
    select
      date_trunc('quarter', r.created_at) as period,
      jsonb_build_object(
        'period', to_char(date_trunc('quarter', r.created_at), 'YYYY-"Q"Q'),
        'overall', round(avg(r.overall_score), 2),
        'count', count(*)::integer
      ) as item
    from public.survey_responses r
    join public.surveys s on s.id = r.survey_id
    where r.company_orgnr = target_orgnr
      and s.counts_toward_ranking = true
      and r.employer_visible_at <= now()
    group by date_trunc('quarter', r.created_at)
    having count(*) >= 5
  ) q;

  select count(*) into n_fit
  from public.survey_responses r
  where r.company_orgnr = target_orgnr
    and coalesce(r.fit_scores, '{}'::jsonb) <> '{}'::jsonb
    and r.employer_visible_at <= now();

  if n_fit >= 5 then
    select jsonb_build_object(
      'count', n_fit,
      'autonomy', round(avg((r.fit_scores ->> 'autonomy')::numeric), 2),
      'learning', round(avg((r.fit_scores ->> 'learning')::numeric), 2),
      'results', round(avg((r.fit_scores ->> 'results')::numeric), 2),
      'change', round(avg((r.fit_scores ->> 'change')::numeric), 2),
      'collaboration', round(avg((r.fit_scores ->> 'collaboration')::numeric), 2),
      'balance', round(avg((r.fit_scores ->> 'balance')::numeric), 2)
    )
    into culture
    from public.survey_responses r
    where r.company_orgnr = target_orgnr
      and coalesce(r.fit_scores, '{}'::jsonb) <> '{}'::jsonb
      and r.employer_visible_at <= now();
  end if;

  return jsonb_build_object(
    'eligible', true,
    'reason', null,
    'min', 5,
    'respondent_count', n,
    'overall', overall,
    'categories', cats,
    'series', series,
    'culture', culture
  );
end;
$$;

revoke all on function public.company_insights(text) from public;
grant execute on function public.company_insights(text) to authenticated;

alter table public.company_claims enable row level security;
alter table public.company_members enable row level security;
alter table public.company_invites enable row level security;
alter table public.company_accounts enable row level security;
alter table public.company_branding enable row level security;
alter table public.employer_replies enable row level security;

drop policy if exists claims_select on public.company_claims;
create policy claims_select on public.company_claims
  for select using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists claims_insert_own on public.company_claims;
create policy claims_insert_own on public.company_claims
  for insert with check (user_id = auth.uid());

drop policy if exists claims_update_admin on public.company_claims;
create policy claims_update_admin on public.company_claims
  for update using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists claims_update_own on public.company_claims;
create policy claims_update_own on public.company_claims
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = 'pending');

drop policy if exists members_select on public.company_members;
create policy members_select on public.company_members
  for select using (
    user_id = auth.uid()
    or public.is_company_admin(orgnr)
    or public.current_user_is_admin()
  );

drop policy if exists members_insert_admin on public.company_members;
create policy members_insert_admin on public.company_members
  for insert with check (public.is_company_admin(orgnr) or public.current_user_is_admin());

drop policy if exists members_update_admin on public.company_members;
create policy members_update_admin on public.company_members
  for update using (public.is_company_admin(orgnr) or public.current_user_is_admin())
  with check (public.is_company_admin(orgnr) or public.current_user_is_admin());

drop policy if exists invites_select on public.company_invites;
create policy invites_select on public.company_invites
  for select using (public.is_company_admin(orgnr) or public.current_user_is_admin());

drop policy if exists invites_insert on public.company_invites;
create policy invites_insert on public.company_invites
  for insert with check (public.is_company_admin(orgnr));

drop policy if exists invites_delete on public.company_invites;
create policy invites_delete on public.company_invites
  for delete using (public.is_company_admin(orgnr) or public.current_user_is_admin());

drop policy if exists accounts_select on public.company_accounts;
create policy accounts_select on public.company_accounts
  for select using (public.is_company_member(orgnr) or public.current_user_is_admin());

drop policy if exists accounts_insert_admin on public.company_accounts;
create policy accounts_insert_admin on public.company_accounts
  for insert with check (public.current_user_is_admin());

drop policy if exists accounts_update_admin on public.company_accounts;
create policy accounts_update_admin on public.company_accounts
  for update using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists branding_select_all on public.company_branding;
create policy branding_select_all on public.company_branding for select using (true);

drop policy if exists branding_upsert_admin on public.company_branding;
create policy branding_upsert_admin on public.company_branding
  for insert with check (public.is_company_admin(orgnr));

drop policy if exists branding_update_admin on public.company_branding;
create policy branding_update_admin on public.company_branding
  for update using (public.is_company_admin(orgnr)) with check (public.is_company_admin(orgnr));

drop policy if exists replies_select_all on public.employer_replies;
create policy replies_select_all on public.employer_replies for select using (true);

drop policy if exists replies_insert_member on public.employer_replies;
create policy replies_insert_member on public.employer_replies
  for insert with check (public.is_company_member(orgnr));

drop policy if exists replies_update_member on public.employer_replies;
create policy replies_update_member on public.employer_replies
  for update using (public.is_company_member(orgnr)) with check (public.is_company_member(orgnr));

grant select, insert, update on public.company_claims to authenticated;
grant select, insert, update on public.company_members to authenticated;
grant select, insert, delete on public.company_invites to authenticated;
grant select, insert, update on public.company_accounts to authenticated;
grant select on public.company_branding to anon, authenticated;
grant insert, update on public.company_branding to authenticated;
grant select on public.employer_replies to anon, authenticated;
grant insert, update on public.employer_replies to authenticated;
