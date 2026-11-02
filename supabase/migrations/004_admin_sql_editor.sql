-- Tillat å sette is_admin i SQL-editoren (auth.uid() er null der).

create or replace function public.prevent_is_admin_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.uid() is not null then
    raise exception 'is_admin kan bare endres i SQL-editoren';
  end if;
  return new;
end;
$$;
