-- Chat er bare synlig for innloggede.

drop policy if exists "chat_select_all" on public.chat_messages;

create policy "chat_select_authenticated" on public.chat_messages
  for select using (auth.uid() is not null);
