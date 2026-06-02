-- ============================================================
-- AutoPoster — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── POSTER STYLES ──────────────────────────────────────────
create table if not exists poster_styles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  prompt      text not null,           -- Full OpenAI image prompt
  example_image_url text,              -- Hero example image (Supabase Storage URL)
  price_cents integer not null default 499,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── EXAMPLE POSTERS ────────────────────────────────────────
-- Extra showcase images shown in the gallery for each style
create table if not exists example_posters (
  id          uuid primary key default gen_random_uuid(),
  style_id    uuid not null references poster_styles(id) on delete cascade,
  image_url   text not null,
  title       text,
  created_at  timestamptz not null default now()
);

-- ─── ORDERS ─────────────────────────────────────────────────
create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  session_id            text not null,
  style_id              uuid not null references poster_styles(id),
  uploaded_image_url    text not null,
  payment_intent_id     text unique,
  payment_status        text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  generation_status     text not null default 'pending' check (generation_status in ('pending','processing','completed','failed')),
  generated_poster_url  text,
  error_message         text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute procedure update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
-- All reads/writes go through your service role key in API routes.
-- Public users have NO direct access.
alter table poster_styles  enable row level security;
alter table example_posters enable row level security;
alter table orders          enable row level security;

-- Service role bypasses RLS by default — no extra policy needed.
-- If you want anon read on styles/examples, uncomment:
-- create policy "public read styles" on poster_styles for select using (is_active = true);
-- create policy "public read examples" on example_posters for select using (true);

-- ─── PAGE VIEWS ─────────────────────────────────────────────
create table if not exists page_views (
  id          bigint generated always as identity primary key,
  path        text not null,
  country     text,
  city        text,
  session_id  text,
  referrer    text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists page_views_path_idx       on page_views(path);
create index if not exists page_views_country_idx    on page_views(country);
create index if not exists page_views_created_at_idx on page_views(created_at);

alter table page_views enable row level security;

-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- Create in Supabase Dashboard → Storage, or via:
insert into storage.buckets (id, name, public)
values
  ('original-cars', 'original-cars', true),
  ('generated-cars', 'generated-cars', true)
on conflict (id) do nothing;

-- ─── SEED EXAMPLE STYLES ────────────────────────────────────
-- Replace prompts with your own. 'example_image_url' should be
-- a Supabase Storage URL you upload manually (or generate first).
insert into poster_styles (name, description, prompt, price_cents) values
(
  'Cinematic Drift',
  'Hollywood-style cinematic poster with dramatic lighting, motion blur, and lens flares.',
  'Create a stunning cinematic movie poster featuring the car in this photo. The car should be dramatically lit with rim lighting and warm golden hour tones. Add motion blur to the tires suggesting speed. Include lens flares, deep shadows, and a dark atmospheric background with distant city lights. Style: Hollywood blockbuster movie poster, high contrast, ultra detailed, 8K render, photorealistic.',
  499
),
(
  'JDM Retro',
  'Japanese retro-style poster with kanji typography and vibrant neon colors.',
  'Transform this car photo into a Japanese retro JDM poster. Use a vibrant color palette with neon pinks, electric blues, and yellows. Add Japanese kanji typography in the background, cherry blossom elements, and a grid/city backdrop at night. Style: 80s Japanese car culture, retrofuturism, anime-inspired, graphic art poster, highly detailed.',
  499
),
(
  'Rally Dirt',
  'Rally racing poster with dust, gravel, and dramatic action composition.',
  'Create a high-energy rally racing poster with this car. Show the car mid-action on a gravel or dirt stage with dust and rocks flying dramatically. Add motion lines, a dynamic low angle perspective, rally stage signage, and co-driver speed notes aesthetic. Style: WRC rally poster, sports photography, editorial, gritty, high contrast, photorealistic.',
  499
),
(
  'Studio Minimal',
  'Clean, minimal studio shot on a pure gradient background. Print-ready.',
  'Create a premium minimal automotive studio poster. Place this car on an ultra-clean gradient background transitioning from deep charcoal to pure black. Add subtle ground reflection, precision studio lighting with a beauty dish, and minimal geometric lines framing the composition. Style: luxury car brochure, minimalist design, Leica photography aesthetic, professional studio.',
  499
),
(
  'Neon Cyberpunk',
  'Futuristic cyberpunk cityscape with neon rain and holographic overlays.',
  'Generate a cyberpunk-style poster featuring this car in a futuristic rain-soaked city at night. Surround it with neon signs in multiple languages, holographic projections, puddle reflections, and rain streaks. Add data stream overlays and glitch effects. Style: Blade Runner 2049, cyberpunk 2077, hyper-detailed, neon noir, ultra wide angle.',
  499
),
(
  'Sunset Boulevard',
  'Golden California sunset with coastal highway vibes.',
  'Create a golden hour sunset poster with this car on a classic California coastal highway. The sky should be an explosion of oranges, pinks, and purples. Add desert mountains in the background, palm tree silhouettes, and heat shimmer on the asphalt. Style: California dreaming, Porsche lifestyle photography, film photography aesthetic, warm tones, epic composition.',
  499
)
on conflict do nothing;
