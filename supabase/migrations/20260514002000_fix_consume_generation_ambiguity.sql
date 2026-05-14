create or replace function public.consume_generation(p_anon_session_id text)
returns table (
  total_generations integer,
  free_generations_used integer,
  paid_credits_remaining integer,
  has_unlimited boolean,
  unlimited_until timestamptz,
  no_watermark boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.usage_sessions%rowtype;
begin
  insert into public.usage_sessions (anon_session_id)
  values (p_anon_session_id)
  on conflict (anon_session_id) do nothing;

  select * into s
  from public.usage_sessions us
  where us.anon_session_id = p_anon_session_id
  for update;

  if s.has_unlimited and (s.unlimited_until is null or s.unlimited_until > now()) then
    update public.usage_sessions us
    set total_generations = us.total_generations + 1
    where us.anon_session_id = p_anon_session_id
    returning us.* into s;
  elsif s.paid_credits_remaining > 0 then
    update public.usage_sessions us
    set total_generations = us.total_generations + 1,
        paid_credits_remaining = us.paid_credits_remaining - 1
    where us.anon_session_id = p_anon_session_id
    returning us.* into s;
  elsif s.free_generations_used < 5 then
    update public.usage_sessions us
    set total_generations = us.total_generations + 1,
        free_generations_used = us.free_generations_used + 1
    where us.anon_session_id = p_anon_session_id
    returning us.* into s;
  else
    raise exception 'PAYWALL_REQUIRED';
  end if;

  return query select
    s.total_generations,
    s.free_generations_used,
    s.paid_credits_remaining,
    s.has_unlimited,
    s.unlimited_until,
    s.no_watermark;
end;
$$;

revoke all on function public.consume_generation(text) from public, anon, authenticated;
grant execute on function public.consume_generation(text) to service_role;
