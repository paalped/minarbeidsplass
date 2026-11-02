-- Verktøyundersøkelse + støtte for valgspørsmål.
-- Kåringen skal bare bruke arbeidsplassundersøkelsen.

alter table public.surveys
  add column if not exists sort_order integer not null default 0,
  add column if not exists teaser text,
  add column if not exists counts_toward_ranking boolean not null default false;

update public.surveys
set
  sort_order = 1,
  teaser = 'Ledelse, miljø, lønn, balanse, utvikling, kultur og anbefaling.',
  counts_toward_ranking = true
where slug = 'arbeidsplass-2026';

alter table public.survey_questions
  add column if not exists settings jsonb not null default '{}'::jsonb;

alter table public.survey_questions
  drop constraint if exists survey_questions_question_type_check;

alter table public.survey_questions
  add constraint survey_questions_question_type_check
  check (question_type in ('likert', 'text', 'single', 'multi'));

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
  from public.survey_responses r
  join public.surveys s on s.id = r.survey_id
  where r.company_orgnr = target_orgnr
    and s.counts_toward_ranking = true;

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
    round(avg(r.overall_score), 2),
    round(avg((r.category_scores ->> 'ledelse')::numeric), 2),
    round(avg((r.category_scores ->> 'miljo')::numeric), 2),
    round(avg((r.category_scores ->> 'lonn')::numeric), 2),
    round(avg((r.category_scores ->> 'balanse')::numeric), 2),
    round(avg((r.category_scores ->> 'utvikling')::numeric), 2),
    round(avg((r.category_scores ->> 'kultur')::numeric), 2),
    round(avg((r.category_scores ->> 'anbefaling')::numeric), 2),
    false,
    now()
  from public.survey_responses r
  join public.surveys s on s.id = r.survey_id
  where r.company_orgnr = target_orgnr
    and s.counts_toward_ranking = true
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

insert into public.surveys (
  id, slug, title, description, is_active, sort_order, teaser, counts_toward_ranking
) values (
  '22222222-2222-2222-2222-222222222222',
  'verktoy-2026',
  'Verktøy og systemer',
  'Hvilke systemer dere faktisk bruker, om de er hyllevare eller eget, og hvordan det føles å jobbe i dem. Svarene inngår ikke i kåringen — de bygger verktøykartet.',
  true,
  2,
  'Timesystem, GIS, CAD, kjernesystem, hyllevare vs egenutvikling, og hvor skoen trykker.',
  false
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  teaser = excluded.teaser,
  counts_toward_ranking = excluded.counts_toward_ranking;

delete from public.survey_questions
where survey_id = '22222222-2222-2222-2222-222222222222';

insert into public.survey_questions (survey_id, sort_order, category, prompt, question_type, required, settings)
values
-- Rolle
(
  '22222222-2222-2222-2222-222222222222', 1, 'rolle',
  'Hvilken type rolle har du primært?',
  'single', true,
  '{"options":[
    {"value":"fag","label":"Fag / produksjon / oppdrag"},
    {"value":"it","label":"IT / utvikling / data"},
    {"value":"stotte","label":"Administrasjon / støtte"},
    {"value":"ledelse","label":"Ledelse"},
    {"value":"annet","label":"Annet"}
  ],"allow_other":true}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 2, 'rolle',
  'Hvor lenge har du jobbet her?',
  'single', true,
  '{"options":[
    {"value":"under_1","label":"Under ett år"},
    {"value":"1_3","label":"1–3 år"},
    {"value":"3_7","label":"3–7 år"},
    {"value":"7_plus","label":"Mer enn 7 år"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 3, 'rolle',
  'Hva bruker du mesteparten av tiden i?',
  'single', true,
  '{"options":[
    {"value":"fag_kunde","label":"Fagsystemer mot oppdrag, kunder eller innbyggere"},
    {"value":"interne","label":"Interne støtteverktøy (tid, lønn, sak, samhandling)"},
    {"value":"begge","label":"Omtrent like mye av begge"},
    {"value":"vet_ikke","label":"Vet ikke"}
  ]}'::jsonb
),

-- Hyllevare vs eget
(
  '22222222-2222-2222-2222-222222222222', 4, 'stacktype',
  'Er arbeidsplassen mest hyllevare, egenutvikling, eller mix?',
  'single', true,
  '{"options":[
    {"value":"hylle","label":"Nesten bare hyllevare"},
    {"value":"hylle_pluss","label":"Hyllevare med en del tilpasning"},
    {"value":"mix","label":"Omtrent 50/50"},
    {"value":"eget_pluss","label":"Mest egenutviklet, noe kjøpt"},
    {"value":"eget","label":"Nesten alt er eget"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 5, 'stacktype',
  'De egenutviklede systemene vi har, er jeg stolt av.',
  'likert', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 6, 'stacktype',
  'Hyllevaren vi kjøper inn, er godt tilpasset jobben vi faktisk gjør.',
  'likert', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 7, 'stacktype',
  'Hva er det viktigste dere har bygget selv? Hopp over hvis dere nesten ikke har eget.',
  'text', false, '{}'::jsonb
),

-- Time
(
  '22222222-2222-2222-2222-222222222222', 8, 'time',
  'Fører du timer i et digitalt system?',
  'single', true,
  '{"options":[
    {"value":"ja","label":"Ja"},
    {"value":"nei","label":"Nei"},
    {"value":"vet_ikke","label":"Vet ikke"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 9, 'time',
  'Hvilket timesystem bruker dere mest?',
  'single', true,
  '{"show_if":{"same_category_first":"ja"},"allow_other":true,"options":[
    {"value":"visma_tid","label":"Visma Tid / Visma.net Calendar"},
    {"value":"tripletex","label":"Tripletex"},
    {"value":"timelog","label":"TimeLog"},
    {"value":"harvest","label":"Harvest"},
    {"value":"clockify","label":"Clockify / Toggl"},
    {"value":"sap","label":"SAP CATS / SuccessFactors"},
    {"value":"ms_project","label":"Microsoft Project / Planner"},
    {"value":"planday","label":"Planday / Quinyx"},
    {"value":"gat","label":"GAT / Min Tid"},
    {"value":"excel","label":"Excel / SharePoint-liste"},
    {"value":"eget","label":"Eget system"},
    {"value":"annet","label":"Annet"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 10, 'time',
  'Timeføringen flyter — jeg bruker lite tid på å kjempe med systemet.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 11, 'time',
  'Jeg stoler på at timene som kommer ut, er riktige.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 12, 'time',
  'Jeg vil gjerne fortsette med dette timesystemet.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),

-- GIS
(
  '22222222-2222-2222-2222-222222222222', 13, 'gis',
  'Jobber du med kart, GIS eller geodata?',
  'single', true,
  '{"options":[
    {"value":"ja","label":"Ja"},
    {"value":"nei","label":"Nei"},
    {"value":"vet_ikke","label":"Vet ikke"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 14, 'gis',
  'Hvilket GIS- eller kartverktøy bruker dere mest?',
  'single', true,
  '{"show_if":{"same_category_first":"ja"},"allow_other":true,"options":[
    {"value":"arcgis","label":"ArcGIS (Esri)"},
    {"value":"qgis","label":"QGIS"},
    {"value":"mapinfo","label":"MapInfo"},
    {"value":"geomedia","label":"GeoMedia"},
    {"value":"fme","label":"FME"},
    {"value":"google_earth","label":"Google Earth / Earth Engine"},
    {"value":"novapoint","label":"Novapoint"},
    {"value":"gemini","label":"Gemini"},
    {"value":"nvdb","label":"NVDB / Statens vegvesen"},
    {"value":"kartverket","label":"Kartverket / GeoNorge"},
    {"value":"eget","label":"Eget system"},
    {"value":"annet","label":"Annet"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 15, 'gis',
  'GIS-verktøyet lar meg gjøre jobben uten unødige omveier.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 16, 'gis',
  'Kartdataene jeg trenger, er tilgjengelige og til å stole på.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 17, 'gis',
  'Jeg vil gjerne fortsette med dette GIS-verktøyet.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),

-- CAD
(
  '22222222-2222-2222-2222-222222222222', 18, 'cad',
  'Jobber du med CAD, BIM eller tegning?',
  'single', true,
  '{"options":[
    {"value":"ja","label":"Ja"},
    {"value":"nei","label":"Nei"},
    {"value":"vet_ikke","label":"Vet ikke"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 19, 'cad',
  'Hvilket CAD- eller BIM-verktøy bruker dere mest?',
  'single', true,
  '{"show_if":{"same_category_first":"ja"},"allow_other":true,"options":[
    {"value":"autocad","label":"AutoCAD"},
    {"value":"revit","label":"Revit"},
    {"value":"civil3d","label":"Civil 3D"},
    {"value":"novapoint","label":"Novapoint"},
    {"value":"gemini","label":"Gemini"},
    {"value":"tekla","label":"Tekla"},
    {"value":"solidworks","label":"SolidWorks"},
    {"value":"inventor","label":"Inventor"},
    {"value":"archicad","label":"ArchiCAD"},
    {"value":"microstation","label":"MicroStation"},
    {"value":"fusion","label":"Fusion 360"},
    {"value":"eget","label":"Eget system"},
    {"value":"annet","label":"Annet"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 20, 'cad',
  'CAD/BIM-verktøyet lar meg tegne og modellere uten konstant kamping.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 21, 'cad',
  'Filer og modeller flyter greit mellom meg og andre fag.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 22, 'cad',
  'Jeg vil gjerne fortsette med dette CAD/BIM-verktøyet.',
  'likert', true, '{"show_if":{"same_category_first":"ja"}}'::jsonb
),

-- Kjernesystem
(
  '22222222-2222-2222-2222-222222222222', 23, 'fag',
  'Hva slags system styrer mest av hverdagen — kjernen i jobben?',
  'single', true,
  '{"options":[
    {"value":"erp","label":"ERP / økonomi / lønn (Visma, SAP, Dynamics, Tripletex…)"},
    {"value":"prosjekt","label":"Prosjekt, sak eller time"},
    {"value":"bransje","label":"Bransjefagsystem (helse, bygg, kommune, energi, samferdsel…)"},
    {"value":"utvikling","label":"Utviklingsplattform / kode"},
    {"value":"ingen","label":"Vi har ikke ett kjerne"},
    {"value":"vet_ikke","label":"Vet ikke"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 24, 'fag',
  'Hva heter hovedsystemet? Produktnavn, eller «eget» hvis dere har bygget det.',
  'text', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 25, 'fag',
  'Er kjernesystemet hyllevare, tungt tilpasset, eller eget?',
  'single', true,
  '{"options":[
    {"value":"hylle","label":"Hyllevare, lite tilpasset"},
    {"value":"tilpasset","label":"Hyllevare, tungt tilpasset"},
    {"value":"eget","label":"Egenutviklet"},
    {"value":"vet_ikke","label":"Vet ikke"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 26, 'fag',
  'Kjernesystemet gjør meg mer effektiv.',
  'likert', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 27, 'fag',
  'Når noe feiler der, får jeg hjelp raskt nok.',
  'likert', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 28, 'fag',
  'Jeg vil gjerne fortsette med dette kjernesystemet.',
  'likert', true, '{}'::jsonb
),

-- Samhandling
(
  '22222222-2222-2222-2222-222222222222', 29, 'samhandling',
  'Hvilke samhandlingsverktøy bruker du ukentlig? Flere valg.',
  'multi', true,
  '{"allow_other":true,"options":[
    {"value":"teams","label":"Microsoft Teams"},
    {"value":"slack","label":"Slack"},
    {"value":"google","label":"Google Chat / Meet"},
    {"value":"epost","label":"E-post som hovedkanal"},
    {"value":"notion","label":"Notion"},
    {"value":"confluence","label":"Confluence"},
    {"value":"jira","label":"Jira"},
    {"value":"planner","label":"Microsoft Planner / Loop"},
    {"value":"annet","label":"Annet"}
  ]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 30, 'samhandling',
  'Verktøyene hjelper oss å samarbeide — de lager ikke mest støy.',
  'likert', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 31, 'samhandling',
  'Jeg vet hvor jeg skal legge og finne informasjon.',
  'likert', true, '{}'::jsonb
),

-- Innkjøp
(
  '22222222-2222-2222-2222-222222222222', 32, 'innkjop',
  'De som lider av et dårlig system, blir hørt når vi skal bytte eller beholde det.',
  'likert', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 33, 'innkjop',
  'Det er mulig å kvitte seg med verktøy som åpenbart ikke virker.',
  'likert', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 34, 'innkjop',
  'Hvem opplever du egentlig bestemmer hvilke systemer dere skal ha?',
  'single', true,
  '{"options":[
    {"value":"ledelse","label":"Ledelsen"},
    {"value":"it","label":"IT"},
    {"value":"fag","label":"Folkene som bruker det til daglig"},
    {"value":"innkjop","label":"Innkjøp / økonomi"},
    {"value":"leverandor","label":"Leverandøren"},
    {"value":"vet_ikke","label":"Vet ikke"}
  ]}'::jsonb
),

-- Oppsummering
(
  '22222222-2222-2222-2222-222222222222', 35, 'oppsummering',
  'Hvilket verktøy stjeler mest energi akkurat nå — og hvorfor?',
  'text', true, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 36, 'oppsummering',
  'Hvilket verktøy ville du tatt med deg til neste jobb?',
  'text', false, '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222', 37, 'oppsummering',
  'Samlet sett er verktøystacken her noe jeg ville anbefalt en kollega i samme fag.',
  'likert', true, '{}'::jsonb
);
