-- Min Arbeidsplass — initial schema, RLS, ranking view and seed data

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Anonym',
  created_at timestamptz not null default now()
);

create table public.companies (
  orgnr text primary key,
  name text not null,
  org_form text,
  nace_code text,
  nace_text text,
  municipality text,
  employee_count integer,
  is_verified boolean not null default false,
  brreg_fetched_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  company_orgnr text not null references public.companies (orgnr) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  nickname text not null default 'Anonym',
  body text not null check (char_length(body) between 3 and 2000),
  created_at timestamptz not null default now()
);

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  sort_order integer not null,
  category text not null,
  prompt text not null,
  question_type text not null check (question_type in ('likert', 'text')),
  required boolean not null default true
);

create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  company_orgnr text not null references public.companies (orgnr) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  overall_score numeric(4, 2) not null,
  category_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (survey_id, company_orgnr, user_id)
);

create table public.company_stats (
  orgnr text primary key references public.companies (orgnr) on delete cascade,
  response_count integer not null default 0,
  overall_score numeric(4, 2),
  score_ledelse numeric(4, 2),
  score_miljo numeric(4, 2),
  score_lonn numeric(4, 2),
  score_balanse numeric(4, 2),
  score_utvikling numeric(4, 2),
  score_kultur numeric(4, 2),
  score_anbefaling numeric(4, 2),
  is_seeded boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  body text not null,
  published_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null default 'Anonym',
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index posts_company_created_idx on public.posts (company_orgnr, created_at desc);
create index companies_name_idx on public.companies (lower(name));
create index news_published_idx on public.news (published_at desc);
create index chat_created_idx on public.chat_messages (created_at desc);
create index survey_questions_order_idx on public.survey_questions (survey_id, sort_order);
create index survey_responses_company_idx on public.survey_responses (company_orgnr);

-- ---------------------------------------------------------------------------
-- Ranking view (min. 3 svar)
-- ---------------------------------------------------------------------------

create or replace view public.company_rankings
with (security_invoker = true) as
select
  c.orgnr,
  c.name,
  c.org_form,
  c.nace_code,
  c.nace_text,
  c.municipality,
  c.employee_count,
  c.is_verified,
  c.brreg_fetched_at,
  c.created_at,
  s.response_count,
  s.overall_score,
  s.score_ledelse,
  s.score_miljo,
  s.score_lonn,
  s.score_balanse,
  s.score_utvikling,
  s.score_kultur,
  s.score_anbefaling
from public.company_stats s
join public.companies c on c.orgnr = s.orgnr
where s.response_count >= 3;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1),
      'Anonym'
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.refresh_company_stats(target_orgnr text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  select count(*) into n
  from public.survey_responses
  where company_orgnr = target_orgnr;

  if n = 0 then
    return;
  end if;

  insert into public.company_stats as cs (
    orgnr,
    response_count,
    overall_score,
    score_ledelse,
    score_miljo,
    score_lonn,
    score_balanse,
    score_utvikling,
    score_kultur,
    score_anbefaling,
    is_seeded,
    updated_at
  )
  select
    target_orgnr,
    count(*)::integer,
    round(avg(overall_score), 2),
    round(avg((category_scores ->> 'ledelse')::numeric), 2),
    round(avg((category_scores ->> 'miljo')::numeric), 2),
    round(avg((category_scores ->> 'lonn')::numeric), 2),
    round(avg((category_scores ->> 'balanse')::numeric), 2),
    round(avg((category_scores ->> 'utvikling')::numeric), 2),
    round(avg((category_scores ->> 'kultur')::numeric), 2),
    round(avg((category_scores ->> 'anbefaling')::numeric), 2),
    false,
    now()
  from public.survey_responses
  where company_orgnr = target_orgnr
  on conflict (orgnr) do update set
    response_count = excluded.response_count,
    overall_score = excluded.overall_score,
    score_ledelse = excluded.score_ledelse,
    score_miljo = excluded.score_miljo,
    score_lonn = excluded.score_lonn,
    score_balanse = excluded.score_balanse,
    score_utvikling = excluded.score_utvikling,
    score_kultur = excluded.score_kultur,
    score_anbefaling = excluded.score_anbefaling,
    is_seeded = false,
    updated_at = now();
end;
$$;

create or replace function public.on_survey_response_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_company_stats(old.company_orgnr);
    return old;
  end if;
  perform public.refresh_company_stats(new.company_orgnr);
  return new;
end;
$$;

drop trigger if exists survey_responses_stats on public.survey_responses;
create trigger survey_responses_stats
  after insert or update or delete on public.survey_responses
  for each row execute function public.on_survey_response_change();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.posts enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.company_stats enable row level security;
alter table public.news enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "companies_select_all" on public.companies for select using (true);
create policy "companies_insert_all" on public.companies for insert with check (true);
create policy "companies_update_all" on public.companies for update using (true) with check (true);

create policy "posts_select_all" on public.posts for select using (true);
create policy "posts_insert_all" on public.posts
  for insert with check (char_length(body) between 3 and 2000);

create policy "surveys_select_all" on public.surveys for select using (true);
create policy "questions_select_all" on public.survey_questions for select using (true);

create policy "responses_select_own" on public.survey_responses
  for select using (auth.uid() = user_id);
create policy "responses_insert_own" on public.survey_responses
  for insert with check (auth.uid() = user_id);
create policy "responses_update_own" on public.survey_responses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "stats_select_all" on public.company_stats for select using (true);

create policy "news_select_all" on public.news for select using (true);

create policy "chat_select_all" on public.chat_messages for select using (true);
create policy "chat_insert_own" on public.chat_messages
  for insert with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant select on public.company_rankings to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.chat_messages;

-- ---------------------------------------------------------------------------
-- Seed: survey
-- ---------------------------------------------------------------------------

insert into public.surveys (id, slug, title, description, is_active)
values (
  '11111111-1111-1111-1111-111111111111',
  'arbeidsplass-2026',
  'Arbeidsplassundersøkelsen',
  'Utfyllende spørsmål om hvordan det faktisk er å jobbe et sted. Svarene dine inngår i kåringen av Norges beste arbeidsplass.',
  true
);

insert into public.survey_questions (survey_id, sort_order, category, prompt, question_type, required)
values
  ('11111111-1111-1111-1111-111111111111', 1,  'ledelse',     'Ledelsen kommuniserer tydelig og ærlig.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 2,  'ledelse',     'Jeg har tillit til nærmeste leder.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 3,  'ledelse',     'Beslutninger tas på et fornuftig grunnlag.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 4,  'ledelse',     'Ledelsen tar tilbakemeldinger på alvor.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 5,  'miljo',       'Jeg trives med kollegaene mine.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 6,  'miljo',       'Det er trygt å si ifra når noe er galt.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 7,  'miljo',       'Konflikter håndteres på en voksen måte.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 8,  'miljo',       'Arbeidsplassen er inkluderende.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 9,  'lonn',        'Jeg blir rettferdig belønnet for jobben jeg gjør.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 10, 'lonn',        'Godene (pensjon, forsikring og andre goder) er konkurransedyktige.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 11, 'lonn',        'Lønnsutvikling og forhandlinger oppleves som ryddige.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 12, 'balanse',     'Jeg klarer å kombinere jobb og resten av livet.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 13, 'balanse',     'Arbeidspresset er til å leve med over tid.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 14, 'balanse',     'Det er rom for fleksibilitet når livet krever det.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 15, 'utvikling',   'Jeg får brukt og utviklet kompetansen min.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 16, 'utvikling',   'Det finnes reelle muligheter til å gå videre her.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 17, 'utvikling',   'Jeg får nyttig tilbakemelding på arbeidet mitt.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 18, 'kultur',      'Vi lever verdiene vi snakker om.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 19, 'kultur',      'Det er mer samarbeid enn intern konkurranse.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 20, 'kultur',      'Jeg er stolt av å si hvor jeg jobber.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 21, 'kultur',      'Humøret og kulturen gjør at jeg vil bli værende.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 22, 'anbefaling',  'Jeg ville anbefalt denne arbeidsplassen til en venn.', 'likert', true),
  ('11111111-1111-1111-1111-111111111111', 23, 'anbefaling',  'Er det noe mer du vil si om arbeidsplassen?', 'text', false);

-- ---------------------------------------------------------------------------
-- Seed: demo companies + ranking (so kåringen ikke er tom)
-- ---------------------------------------------------------------------------

insert into public.companies (
  orgnr, name, org_form, nace_code, nace_text, municipality, employee_count, is_verified, brreg_fetched_at
) values
  ('923609016', 'Equinor ASA', 'ASA · Allmennaksjeselskap', '06.100', 'Utvinning av råolje', 'STAVANGER', 21000, true, now()),
  ('984851006', 'DNB Bank ASA', 'ASA · Allmennaksjeselskap', '64.190', 'Bankvirksomhet ellers', 'OSLO', 9000, true, now()),
  ('982463718', 'Telenor ASA', 'ASA · Allmennaksjeselskap', '61.200', 'Trådløs telekommunikasjon', 'BÆRUM', 11000, true, now());

insert into public.company_stats (
  orgnr, response_count, overall_score,
  score_ledelse, score_miljo, score_lonn, score_balanse,
  score_utvikling, score_kultur, score_anbefaling, is_seeded
) values
  ('923609016', 47, 4.41, 4.35, 4.52, 4.48, 4.12, 4.38, 4.55, 4.47, true),
  ('984851006', 38, 4.18, 4.05, 4.28, 4.31, 4.02, 4.15, 4.22, 4.20, true),
  ('982463718', 29, 3.94, 3.72, 4.10, 4.05, 3.68, 3.91, 4.08, 3.95, true);

-- ---------------------------------------------------------------------------
-- Seed: news
-- ---------------------------------------------------------------------------

insert into public.news (slug, title, excerpt, body, published_at) values
(
  'velkommen',
  'Velkommen til Min Arbeidsplass',
  'Et sted for sladder, ærlige svar og kåringen av Norges beste arbeidsplass.',
  E'Arbeidslivet er fullt av fine strategidokumenter og kake i kantina. Det er også fullt av ting folk bare tør å si i gangen, etter at døra er lukket.\n\nMin Arbeidsplass er laget for det siste. Her kan du søke opp bedriften i Brønnøysundregistrene, ta en skikkelig undersøkelse og lese hva andre faktisk mener — uten at det skal se ut som en HR-kampanje.\n\nSladder er lov. Løgn er det ikke. Vi lagrer bedrifter med organisasjonsnummer når vi kan, slik at «Acme AS» og «ACME as» er samme sted.',
  now() - interval '2 days'
),
(
  'slik-kaarer-vi',
  'Slik kårer vi Norges beste arbeidsplass',
  'Syv kategorier, ett snitt, og minst tre svar før en bedrift får plass på listen.',
  E'Kåringen er ikke en jury av konsulenter. Den er et snitt av det folk som jobber der faktisk svarer.\n\nUndersøkelsen dekker ledelse, arbeidsmiljø, lønn og goder, balanse, faglig utvikling, kultur og om du ville anbefalt stedet til en venn. Hvert spørsmål scores fra 1 til 5. Bedriftens plassering er gjennomsnittet av alle innsendte undersøkelser.\n\nEn bedrift vises først når minst tre personer har svart. Det er et lavt tall med vilje — vi vil ha listen i live — men høyt nok til at én grumpy mandag ikke skal styre hele rangeringen.',
  now() - interval '1 day'
),
(
  'derfor-sladrer-vi',
  'Derfor sladrer vi — og hvorfor det er lov',
  'Anonyme innlegg på bedriftssiden. Innlogging først når det teller.',
  E'Det er en grunn til at de beste historiene om en arbeidsplass sjelden står i årsrapporten. Folk er redde for å bli gjenkjent. Derfor kan du sladre uten konto.\n\nUndersøkelsen og chatten krever innlogging. Der teller stemmen din i kåringen, og da trenger vi et minimum av vern mot at samme person stemmer 40 ganger.\n\nVi ber ikke om arbeidsgiver-ID eller lønnsslipp i første versjon. Vi ber deg være ærlig, og vi forbeholder oss retten til å fjerne åpenbart useriøst innhold senere.',
  now() - interval '18 hours'
),
(
  'forste-karing',
  'Første kåring: tre arbeidsplasser i tet',
  'Listen er åpen. Equinor, DNB og Telenor ligger an — inntil flere svar kommer inn.',
  E'Det er tidlig. Tallene du ser nå er startgropen, ikke fasit for evigheten. Tre kjente arbeidsplasser ligger i tet, basert på de første undersøkelsene.\n\nDet viktige er ikke hvem som leder i oktober. Det viktige er at neste svar kan flytte dem. Finn bedriften din, ta undersøkelsen, og se om kåringen fortsatt ser lik ut i morgen.',
  now() - interval '6 hours'
);
