---
name: project-todays-lenses
description: "Today's Lenses" feature — 5 daily life-area readings (Work/Love/Family/Money/Self) below the quote card, one model-picked featured lens
metadata:
  type: project
---

Lumora is adding "Today's Lenses" below the existing quote + briefing card on the home page (`src/components/quote-card.tsx`). Five life-area readings — Work, Love, Family, Money, Self — generated per zodiac sign per day from real transit data. Each lens has a 1-line teaser and a 2-3 sentence detail. One lens is "featured" per day, picked by the model as most relevant (not fixed to a weekday/rotation).

**Why:** Product explicitly rejected a simpler design (fixed weekday theme, e.g. "Monday always = Work") in favor of day-specific relevance, because the practical value of astrology guidance ("is today a good day to sign a contract") comes from that day's actual transits, not a calendar slot. Keep future designs data-driven per day, not calendar-keyed.

**How to apply:** The daily email teases only the ONE featured lens plus a "see your other 4 lenses" link/deep-link into the in-app view — the in-app page is where all 5 are readable in full. So the in-app featured lens needs a distinct hero treatment (see [[feedback_flat-prototype-rejection]] for why the first three prototypes failed) and the other 4 need to be clearly present but subordinate. Confirm with engineering whether the deep link needs to anchor-scroll to this section. Confirm with product whether the model guarantees exactly one featured flag and what the fallback is if not (open question raised in 2026-07-12 review, not yet answered).

Prototype source (throwaway, delete once a variant is chosen): `src/components/lens-prototype/prototype-lenses.tsx`, mounted via `?variant=A|B|C` at localhost:3002. As of 2026-07-12 this directory still exists — check before assuming it was cleaned up.
