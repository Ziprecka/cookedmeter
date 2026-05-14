create table if not exists public.usage_sessions (
  id uuid primary key default gen_random_uuid(),
  anon_session_id text not null unique,
  user_id uuid null,
  total_generations integer not null default 0,
  free_generations_used integer not null default 0,
  paid_credits_remaining integer not null default 0,
  has_unlimited boolean not null default false,
  unlimited_until timestamptz null,
  no_watermark boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  anon_session_id text null references public.usage_sessions(anon_session_id) on delete set null,
  stripe_session_id text not null unique,
  stripe_customer_id text null,
  product_type text not null check (product_type in ('refill', 'extra_crispy', 'unlimited')),
  credits_added integer not null default 0,
  amount_paid integer null,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

alter table public.usage_sessions enable row level security;
alter table public.purchases enable row level security;

drop policy if exists "service role manages usage sessions" on public.usage_sessions;
create policy "service role manages usage sessions"
on public.usage_sessions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "service role manages purchases" on public.purchases;
create policy "service role manages purchases"
on public.purchases
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists usage_sessions_set_updated_at on public.usage_sessions;
create trigger usage_sessions_set_updated_at
before update on public.usage_sessions
for each row
execute function public.set_updated_at();

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
  from public.usage_sessions
  where anon_session_id = p_anon_session_id
  for update;

  if s.has_unlimited and (s.unlimited_until is null or s.unlimited_until > now()) then
    update public.usage_sessions
    set total_generations = total_generations + 1
    where anon_session_id = p_anon_session_id
    returning * into s;
  elsif s.paid_credits_remaining > 0 then
    update public.usage_sessions
    set total_generations = total_generations + 1,
        paid_credits_remaining = paid_credits_remaining - 1
    where anon_session_id = p_anon_session_id
    returning * into s;
  elsif s.free_generations_used < 5 then
    update public.usage_sessions
    set total_generations = total_generations + 1,
        free_generations_used = free_generations_used + 1
    where anon_session_id = p_anon_session_id
    returning * into s;
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

create or replace function public.grant_purchase(
  p_anon_session_id text,
  p_stripe_session_id text,
  p_stripe_customer_id text,
  p_product_type text,
  p_amount_paid integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  credits integer := 0;
begin
  if p_product_type = 'refill' then
    credits := 10;
  elsif p_product_type = 'extra_crispy' then
    credits := 25;
  elsif p_product_type = 'unlimited' then
    credits := 0;
  else
    raise exception 'Unknown product type: %', p_product_type;
  end if;

  insert into public.usage_sessions (anon_session_id)
  values (p_anon_session_id)
  on conflict (anon_session_id) do nothing;

  insert into public.purchases (
    anon_session_id,
    stripe_session_id,
    stripe_customer_id,
    product_type,
    credits_added,
    amount_paid,
    status
  )
  values (
    p_anon_session_id,
    p_stripe_session_id,
    p_stripe_customer_id,
    p_product_type,
    credits,
    p_amount_paid,
    'paid'
  )
  on conflict (stripe_session_id) do nothing;

  if not found then
    return;
  end if;

  if p_product_type = 'unlimited' then
    update public.usage_sessions
    set has_unlimited = true,
        unlimited_until = now() + interval '1 month',
        no_watermark = true
    where anon_session_id = p_anon_session_id;
  else
    update public.usage_sessions
    set paid_credits_remaining = paid_credits_remaining + credits,
        no_watermark = no_watermark or p_product_type = 'extra_crispy'
    where anon_session_id = p_anon_session_id;
  end if;
end;
$$;

revoke all on function public.consume_generation(text) from anon, authenticated;
revoke all on function public.grant_purchase(text, text, text, text, integer) from anon, authenticated;
