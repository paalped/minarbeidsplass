-- Person–miljø-match: kulturspørsmål utenom kåringen, og brukerens arbeidstil.

alter table public.profiles
  add column if not exists work_style jsonb not null default '{}'::jsonb;

alter table public.survey_responses
  add column if not exists fit_scores jsonb not null default '{}'::jsonb;

create table if not exists public.company_culture (
  orgnr text primary key references public.companies (orgnr) on delete cascade,
  response_count integer not null default 0,
  score_autonomy numeric(4, 2),
  score_learning numeric(4, 2),
  score_results numeric(4, 2),
  score_change numeric(4, 2),
  score_collaboration numeric(4, 2),
  score_balance numeric(4, 2),
  is_seeded boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.company_culture enable row level security;

drop policy if exists culture_select_all on public.company_culture;
create policy culture_select_all on public.company_culture for select using (true);

grant select on public.company_culture to anon, authenticated;

create or replace function public.refresh_company_culture(target_orgnr text)
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
  where company_orgnr = target_orgnr
    and coalesce(fit_scores, '{}'::jsonb) <> '{}'::jsonb;

  if n = 0 then
    return;
  end if;

  if n < 3 then
    perform 1 from public.company_culture where orgnr = target_orgnr and is_seeded;
    if found then
      return;
    end if;
  end if;

  insert into public.company_culture as cc (
    orgnr,
    response_count,
    score_autonomy,
    score_learning,
    score_results,
    score_change,
    score_collaboration,
    score_balance,
    is_seeded,
    updated_at
  )
  select
    target_orgnr,
    count(*)::integer,
    round(avg((fit_scores ->> 'autonomy')::numeric), 2),
    round(avg((fit_scores ->> 'learning')::numeric), 2),
    round(avg((fit_scores ->> 'results')::numeric), 2),
    round(avg((fit_scores ->> 'change')::numeric), 2),
    round(avg((fit_scores ->> 'collaboration')::numeric), 2),
    round(avg((fit_scores ->> 'balance')::numeric), 2),
    false,
    now()
  from public.survey_responses
  where company_orgnr = target_orgnr
    and coalesce(fit_scores, '{}'::jsonb) <> '{}'::jsonb
  on conflict (orgnr) do update set
    response_count = excluded.response_count,
    score_autonomy = excluded.score_autonomy,
    score_learning = excluded.score_learning,
    score_results = excluded.score_results,
    score_change = excluded.score_change,
    score_collaboration = excluded.score_collaboration,
    score_balance = excluded.score_balance,
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
    perform public.refresh_company_culture(old.company_orgnr);
    return old;
  end if;
  perform public.refresh_company_stats(new.company_orgnr);
  perform public.refresh_company_culture(new.company_orgnr);
  return new;
end;
$$;

insert into public.survey_questions (
  id, survey_id, sort_order, category, prompt, question_type, required, settings
)
values
(
  '11111111-1111-1111-1111-1111111111a1',
  '11111111-1111-1111-1111-111111111111',
  24, 'fit',
  'Folk tar avgjørelser selv på sparket, uten å vente på formell forankring gjennom linjen.',
  'likert', true,
  '{"counts_toward_score":false,"fit_key":"autonomy","poles":{"low":"Tydelig struktur og forankring","high":"Frihet til å ta avgjørelser selv"}}'::jsonb
),
(
  '11111111-1111-1111-1111-1111111111a2',
  '11111111-1111-1111-1111-111111111111',
  25, 'fit',
  'Det er rom for å prøve, feile og lære — ikke bare å minimere risiko.',
  'likert', true,
  '{"counts_toward_score":false,"fit_key":"learning","poles":{"low":"Risikominimering og kontroll","high":"Eksperimentering og læring av feil"}}'::jsonb
),
(
  '11111111-1111-1111-1111-1111111111a3',
  '11111111-1111-1111-1111-111111111111',
  26, 'fit',
  'Suksess måles på det som blir levert, ikke på timer ved pulten.',
  'likert', true,
  '{"counts_toward_score":false,"fit_key":"results","poles":{"low":"Timer og synlighet teller mest","high":"Det er leveransen som teller"}}'::jsonb
),
(
  '11111111-1111-1111-1111-1111111111a4',
  '11111111-1111-1111-1111-111111111111',
  27, 'fit',
  'Tempoet er høyt, og ting endrer seg ofte.',
  'likert', true,
  '{"counts_toward_score":false,"fit_key":"change","poles":{"low":"Stabile rutiner og forutsigbarhet","high":"Høyt tempo og stadig endring"}}'::jsonb
),
(
  '11111111-1111-1111-1111-1111111111a5',
  '11111111-1111-1111-1111-111111111111',
  28, 'fit',
  'Vi lykkes sammen. Intern konkurranse styrer i liten grad hverdagen.',
  'likert', true,
  '{"counts_toward_score":false,"fit_key":"collaboration","poles":{"low":"Intern konkurranse og individuelle mål","high":"Samarbeid foran intern konkurranse"}}'::jsonb
),
(
  '11111111-1111-1111-1111-1111111111a6',
  '11111111-1111-1111-1111-111111111111',
  29, 'fit',
  'Arbeidspresset er til å leve med, og det er rom for livet utenfor jobben.',
  'likert', true,
  '{"counts_toward_score":false,"fit_key":"balance","poles":{"low":"Høyt arbeidspress over tid","high":"Rom for liv utenfor jobben"}}'::jsonb
)
on conflict (id) do update set
  prompt = excluded.prompt,
  settings = excluded.settings,
  sort_order = excluded.sort_order,
  category = excluded.category;

insert into public.company_culture (
  orgnr, response_count,
  score_autonomy, score_learning, score_results, score_change, score_collaboration, score_balance,
  is_seeded
)
values
  ('923609016', 12, 3.2, 3.4, 4.2, 3.8, 3.6, 3.1, true),
  ('984851006', 9, 2.4, 2.6, 3.5, 2.8, 3.8, 3.4, true),
  ('982463718', 8, 3.8, 3.9, 3.6, 4.0, 3.5, 3.2, true)
on conflict (orgnr) do nothing;
