create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.consume_generation(text) from public, anon, authenticated;
revoke all on function public.grant_purchase(text, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.consume_generation(text) to service_role;
grant execute on function public.grant_purchase(text, text, text, text, integer) to service_role;
