# CookedMeter

CookedMeter is a viral consumer web app that lets users enter any situation and instantly find out how cooked they are. It returns a Cooked Score, cooked level, diagnosis, reasons, survival case, recovery plan, meme verdict, and shareable card.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI API
- Supabase usage tracking
- Stripe Checkout paywalls
- Zod validation
- `html-to-image` PNG share cards
- Vercel-ready deployment

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `OPENAI_API_KEY` in `.env.local` for live AI results. If the key is missing, the app returns a local demo result so the UI remains testable.

## Environment

```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SITE_URL=https://cookedmeter.com
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_RESULT_SLOT_ID=0000000000
NEXT_PUBLIC_ADSENSE_GALLERY_SLOT_ID=0000000000
NEXT_PUBLIC_SUPABASE_URL=https://pxibfyqbzrefeaufvomi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_REFILL=
NEXT_PUBLIC_STRIPE_PRICE_EXTRA_CRISPY=
NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED=
STRIPE_PRICE_REFILL=
STRIPE_PRICE_EXTRA_CRISPY=
STRIPE_PRICE_UNLIMITED=
```

`SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are server-only. Never expose them with a `NEXT_PUBLIC_` prefix.

## Routes

- `/` main CookedMeter flow
- `/result` latest local result or encoded public link
- `/examples` example inputs and future mode ideas
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/success`
- `/cancel`
- `/api/check-cooked` server-side OpenAI route
- `/api/stripe/create-checkout-session`
- `/api/stripe/webhook`
- `/api/stripe/verify-session`
- `/api/usage/status`

## Prompting

The production system prompt lives in:

```text
src/lib/prompts/cookedPrompt.ts
```

Input and output validation live in:

```text
src/lib/schemas.ts
```

## Usage Limits

Anonymous users get 5 free cooked checks. After that, Stripe Checkout unlocks:

- Cooked Refill: $2.99 one-time, +10 checks
- Extra Crispy Pack: $4.99 one-time, +25 checks and no-watermark cards
- Unlimited Cooked: $4.99/month, unlimited checks and no-watermark cards

The app stores an anonymous session id in localStorage/cookies and, when configured, tracks usage in Supabase. Without `SUPABASE_SERVICE_ROLE_KEY`, it falls back to local cookie tracking for MVP testing.

Apply the Supabase migration in `supabase/migrations/20260514000000_usage_and_purchases.sql` to create `usage_sessions`, `purchases`, and the credit-consumption RPCs.

## Public Links

Public links use encoded URL state:

```text
/result?c=<encoded-result>
```

A future public-results upgrade can add:

- `id`
- `situation_excerpt`
- `category`
- `intensity`
- `cooked_score`
- `cooked_level`
- `generated_json`
- `created_at`
- `views_count`

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in Project Settings.
4. Add the Supabase URL, publishable key, and service-role key.
5. Add Stripe keys, webhook secret, and price IDs.
6. Point the Stripe webhook to `/api/stripe/webhook`.
7. To enable AdSense, add the `NEXT_PUBLIC_ADSENSE_*` variables and set `NEXT_PUBLIC_ADSENSE_ENABLED=true`.
8. Deploy.

The app uses standard Next.js defaults and does not require a custom build command.
