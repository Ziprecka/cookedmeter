# CookedMeter

CookedMeter is a viral consumer web app that lets users enter any situation and instantly find out how cooked they are. It returns a Cooked Score, cooked level, diagnosis, reasons, survival case, recovery plan, meme verdict, and shareable card.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI API
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
NEXT_PUBLIC_SITE_URL=https://cookedmeter.vercel.app
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_RESULT_SLOT_ID=0000000000
NEXT_PUBLIC_ADSENSE_GALLERY_SLOT_ID=0000000000
```

## Routes

- `/` main CookedMeter flow
- `/result` latest local result or encoded public link
- `/examples` example inputs and future mode ideas
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/api/check-cooked` server-side OpenAI route

## Prompting

The production system prompt lives in:

```text
src/lib/prompts/cookedPrompt.ts
```

Input and output validation live in:

```text
src/lib/schemas.ts
```

## Public Links

This MVP does not require auth or a database. Public links use encoded URL state:

```text
/result?c=<encoded-result>
```

A future Supabase implementation can add a `public_results` table with:

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
4. To enable AdSense, add the `NEXT_PUBLIC_ADSENSE_*` variables and set `NEXT_PUBLIC_ADSENSE_ENABLED=true`.
5. Deploy.

The app uses standard Next.js defaults and does not require a custom build command.
