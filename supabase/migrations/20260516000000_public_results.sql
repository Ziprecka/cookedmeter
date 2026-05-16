create table if not exists public.public_results (
  id uuid primary key default gen_random_uuid(),
  share_slug text not null unique,
  situation_excerpt text not null,
  category text not null,
  cooked_score integer null,
  cooked_level text not null,
  one_line_diagnosis text not null,
  meme_verdict text not null,
  share_card_summary text not null,
  generated_json jsonb not null,
  views_count integer not null default 0,
  is_public boolean not null default true,
  featured boolean not null default false,
  anon_session_id text null,
  created_at timestamptz not null default now()
);

create index if not exists public_results_score_idx
on public.public_results (cooked_score desc nulls last, views_count desc, created_at desc);

create index if not exists public_results_created_idx
on public.public_results (created_at desc);

alter table public.public_results enable row level security;

drop policy if exists "service role manages public results" on public.public_results;
create policy "service role manages public results"
on public.public_results
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
