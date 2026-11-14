-- Artikler slått sammen med nyheter, og innloggede kommentarer.

alter table public.news
  add column if not exists kind text not null default 'sak',
  add column if not exists search_query text;

alter table public.news drop constraint if exists news_kind_check;
alter table public.news
  add constraint news_kind_check check (kind in ('sak', 'artikkel'));

create index if not exists news_kind_published_idx on public.news (kind, published_at desc);

create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null default 'Anonym',
  body text not null check (char_length(body) between 3 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists article_comments_slug_idx
  on public.article_comments (article_slug, created_at);

alter table public.article_comments enable row level security;

drop policy if exists "article_comments_select_all" on public.article_comments;
create policy "article_comments_select_all" on public.article_comments
  for select using (true);

drop policy if exists "article_comments_insert_own" on public.article_comments;
create policy "article_comments_insert_own" on public.article_comments
  for insert with check (
    auth.uid() = user_id
    and char_length(trim(body)) between 3 and 2000
    and char_length(article_slug) between 1 and 80
  );

drop policy if exists "article_comments_delete_own" on public.article_comments;
create policy "article_comments_delete_own" on public.article_comments
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.article_comments to anon, authenticated;
