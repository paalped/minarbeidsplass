-- Admin: flagg på profil, RLS for å lese alle svar, og eksport med e-post.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to anon, authenticated;

create or replace function public.prevent_is_admin_escalation()
returns trigger
language plpgsql
as $$
begin
  -- auth.uid() er satt via appen, men null i SQL-editoren.
  if new.is_admin is distinct from old.is_admin and auth.uid() is not null then
    raise exception 'is_admin kan bare endres i SQL-editoren';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_admin on public.profiles;
create trigger profiles_protect_admin
  before update on public.profiles
  for each row execute function public.prevent_is_admin_escalation();

drop policy if exists responses_select_admin on public.survey_responses;
create policy responses_select_admin on public.survey_responses
  for select using (public.current_user_is_admin());

create or replace function public.admin_user_rows()
returns table (
  id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  is_admin boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    u.email::text,
    p.display_name,
    p.created_at,
    p.is_admin
  from public.profiles p
  left join auth.users u on u.id = p.id
  where public.current_user_is_admin();
$$;

revoke all on function public.admin_user_rows() from public;
grant execute on function public.admin_user_rows() to authenticated;
