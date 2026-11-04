-- Admin kan opprette, endre og slette nyhetssaker.

drop policy if exists "news_admin_insert" on public.news;
create policy "news_admin_insert" on public.news
  for insert with check (public.current_user_is_admin());

drop policy if exists "news_admin_update" on public.news;
create policy "news_admin_update" on public.news
  for update using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "news_admin_delete" on public.news;
create policy "news_admin_delete" on public.news
  for delete using (public.current_user_is_admin());
