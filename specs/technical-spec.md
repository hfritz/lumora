# Technical Spec: Lumora

## Status

Draft

## Owner

Helmut Fritz

## Related Docs

- Product spec: [specs/product-spec.md](product-spec.md)
- UI spec: [specs/ui-spec.md](ui-spec.md)

---

## Summary

Lumora is a Next.js 16 PWA that delivers daily AI-generated inspirational quotes and answers cosmic/astrology questions. The app combines static ephemeris data with the Astronomy Engine library for planetary positions, Groq (Llama 3.3 70B) for all LLM work, Resend for email delivery, and Supabase for subscriber storage and question rate limiting. No user authentication — email address is the identity primitive.

---

## Goals

- Ship a working PWA with daily quote, email subscription, and cosmic Q&A
- Keep infrastructure cost at zero (free tiers only)
- Rate-limit questions per email without auth — 1/day anonymous, 5/day subscriber
- Deliver daily quotes via email to all subscribers via a scheduled job
- Restrict AI responses to cosmic/astrology topics only

## Non-Goals

- User accounts, passwords, or auth sessions
- Natal chart calculations or deep astrology engine
- Push notifications (v1 — email only)
- Payments or premium tiers
- Admin dashboard

---

## Architecture

```
Browser (PWA)
  │
  ├── GET /                    → Daily quote page (SSR, generated at request time)
  ├── POST /api/ask            → Cosmic Q&A endpoint (rate-limited by email)
  ├── POST /api/subscribe      → Email subscription endpoint
  └── GET /api/quote/today     → Today's quote (cached, shared across users)

Cron (Vercel Cron / external)
  └── POST /api/cron/daily-send → Generate quote + send to all subscribers

External Services
  ├── Groq API                 → LLM (Llama 3.3 70B) for quote generation + Q&A
  ├── Astronomy Engine (npm)   → Planetary positions (runs server-side, no API key)
  ├── Static ephemeris JSON    → Retrograde dates, moon phase calendar (pre-computed)
  ├── Resend                   → Transactional email (daily quote + subscription confirm)
  └── Supabase                 → PostgreSQL (subscribers table + question_log table)
```

---

## Data Model

### Supabase tables

#### `subscribers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `email` | `text` | Unique, not null |
| `zodiac_sign` | `text` | Optional — used to personalise quotes |
| `confirmed` | `boolean` | Default false — set true on email confirmation click |
| `created_at` | `timestamptz` | Default now() |

#### `question_log`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `email` | `text` | Not null — anonymous users provide email to ask |
| `asked_at` | `timestamptz` | Default now() |
| `date` | `date` | Computed from `asked_at` — used for daily count query |

No PII beyond email address. No question content stored.

### Static data files

`/src/data/ephemeris.json` — pre-computed for the current year:
```json
{
  "retrogrades": [
    { "planet": "Mercury", "start": "2026-03-15", "end": "2026-04-07", "affected_signs": ["Gemini", "Virgo"] }
  ],
  "moon_phases": [
    { "date": "2026-06-11", "phase": "Waning Gibbous", "sign": "Capricorn" }
  ]
}
```

---

## Key Interfaces

### `POST /api/ask`

Request:
```json
{ "email": "user@example.com", "question": "Is today a good day to start something new?" }
```

Response:
```json
{ "answer": "...", "questions_remaining": 3 }
```

Rate limiting logic:
1. Look up email in `question_log` for today's date
2. If email is in `subscribers` (confirmed): limit = 5
3. Otherwise: limit = 1
4. If count >= limit: return 429 with `{ "error": "daily_limit_reached" }`
5. Otherwise: insert row, call Groq, return answer

Topic guardrail — system prompt includes:
> "You are Lumora, a cosmic guidance assistant. You only answer questions related to astrology, zodiac signs, moon phases, planetary events, Mercury retrograde, and spiritual energy. If the question is unrelated to these topics, respond: 'That's outside my cosmic expertise. Ask me something about the stars, moon, or planetary energy.'"

### `POST /api/subscribe`

Request:
```json
{ "email": "user@example.com", "zodiac_sign": "Scorpio" }
```

- Insert into `subscribers` with `confirmed: false`
- Send confirmation email via Resend with a magic link: `/api/confirm?token=<jwt>`
- On click: set `confirmed: true`

### `POST /api/cron/daily-send`

- Protected by `CRON_SECRET` header check
- Fetch all `subscribers` where `confirmed = true`
- Generate today's quote via Groq (one call, shared for all)
- Send via Resend batch API
- Scheduled: 7:00 AM UTC daily (Vercel Cron)

### `GET /api/quote/today`

- Generates (or returns cached) today's quote
- Cache: in-memory or Supabase row keyed by date — same quote served to all users on a given day
- Quote prompt includes: current date, moon phase, any active retrograde, optional zodiac sign if provided

---

## Tailwind Theme (from UI Spec)

Configure in `src/app/globals.css` as CSS custom properties, consumed by Tailwind:

```css
:root {
  --background: #FAF7F2;
  --surface: #F5EFE6;
  --surface-muted: #EDE4D8;
  --gold: #C9A96E;
  --gold-light: #E8D5B0;
  --gold-dark: #9E7A45;
  --text-primary: #2C2420;
  --text-secondary: #7A6B5D;
  --text-muted: #B0A090;
}
```

Fonts loaded via `next/font/google`: Cormorant Garamond (300, 400, 400i, 500) + DM Sans (400, 500).

---

## LLM Prompts

### Daily quote prompt
```
System: You are Lumora, a cosmic inspiration guide. Generate a single, short inspirational quote (1–2 sentences) that reflects today's cosmic energy. Today is {date}. Moon phase: {moon_phase} in {moon_sign}. {retrograde_context}. The quote should feel warm, wise, and uplifting — not mystical jargon. No attribution. No quotation marks.

User: Generate today's quote.
```

### Cosmic Q&A prompt
```
System: You are Lumora, a cosmic guidance assistant. You only answer questions related to astrology, zodiac signs, moon phases, planetary events, Mercury retrograde, and spiritual energy. Keep answers short (2–4 sentences), warm, and practical. Today is {date}. Current cosmic context: {cosmic_context}. If the question is off-topic, respond: "That's outside my cosmic expertise. Ask me something about the stars, moon, or planetary energy."

User: {question}
```

---

## Edge Cases

- **Groq API down** — daily send falls back to a pre-written fallback quote from a local pool of 30 quotes
- **Duplicate subscription** — upsert on email, resend confirmation if `confirmed = false`
- **Unsubscribe** — one-click unsubscribe link in every email (Resend handles this + CAN-SPAM compliance)
- **Anonymous user hits limit** — return 429 with a soft prompt to subscribe for more questions
- **Invalid email on ask** — basic email format validation, no MX check
- **Question too long** — truncate at 500 characters before sending to LLM
- **Off-topic question passes guardrail** — LLM handles gracefully via system prompt; no secondary classifier in v1

---

## Security and Privacy

- `CRON_SECRET` env var protects the daily send endpoint from public calls
- Supabase Row Level Security (RLS) enabled — app uses service role key server-side only, never exposed to client
- Confirmation token is a short-lived JWT (24h expiry) signed with `JWT_SECRET`
- No question content stored — only email + timestamp in `question_log`
- Groq API key server-side only (Next.js API routes / Server Actions)
- Email addresses never exposed to client-side code

---

## Performance and Reliability

- Daily quote generated once per day, cached — not per-user LLM call
- Groq Llama 3.3 70B: ~1–2s latency for Q&A responses (acceptable)
- Supabase free tier: 500MB storage, 2 compute hours/day — more than sufficient for 50–500 subscribers
- Resend free tier: 3,000 emails/month, 100/day — sufficient until ~100 daily subscribers
- If Resend daily limit is hit: queue excess sends for next day (v2 problem)

---

## Observability

- Vercel function logs capture API errors
- Supabase dashboard for subscriber count and question volume
- Resend dashboard for email open rates and delivery status
- No custom metrics instrumentation in v1

---

## Testing Plan

- **Unit:** Prompt construction functions, rate limit logic, date/ephemeris utilities
- **Integration:** `/api/ask` with mock Groq, `/api/subscribe` with Supabase test project
- **Manual:** Full subscribe → confirm → receive email flow; ask question as anonymous and subscriber; hit rate limit
- **E2E:** Not in v1

---

## Rollout Plan

1. Deploy to Vercel (preview URL first)
2. Seed `ephemeris.json` for current year
3. Configure env vars: `GROQ_API_KEY`, `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CRON_SECRET`
4. Set up Vercel Cron job for daily send
5. Test full flow manually
6. Share URL with first subscribers

---

## Tradeoffs

| Decision | Chosen | Alternative | Reason |
|----------|--------|-------------|--------|
| LLM provider | Groq (free) | Claude Haiku | Cost — zero vs ~$0.25/1M tokens |
| Planetary data | Astronomy Engine + static JSON | Paid astrology API | Zero cost, no API key, accurate enough |
| User identity | Email only | Auth (Supabase Auth) | No friction, sufficient for rate limiting |
| Database | Supabase | Vercel KV | Familiar, relational queries for subscriber management |
| Email | Resend | Mailchimp | Developer-friendly, React Email, free tier fits v1 |

---

## Open Questions

- [ ] Should the daily quote be the same for all users or vary by zodiac sign?
- [ ] What is the exact daily question limit? (Proposed: 1 anonymous, 5 subscriber)
- [ ] PWA manifest and service worker — use `next-pwa` package or manual setup?
- [ ] Should zodiac sign be required at subscription, or optional?
