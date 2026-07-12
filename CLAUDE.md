# CLAUDE.md

Guidance for Claude or Claude Code when working in this repository.

## Project

Lumora is a daily cosmic guidance PWA for spiritually curious users (women 25–40). It delivers AI-generated inspirational quotes every day — in-app and via email subscription — and answers practical astrology questions like "is Mercury retrograde affecting Scorpio right now?" or "is today a good day to cut my hair?" based on moon phases and planetary events. The goal is a focused, uplifting daily ritual, not a general-purpose astrology reference.

## Role for Claude

Act as a product and engineering partner building a Next.js PWA. Help design and implement features across the stack: AI quote generation, cosmic Q&A with topic guardrails, email subscription, and PWA delivery. When new features are proposed, check `specs/product-spec.md` and `specs/technical-spec.md` first. If no spec exists, draft one before building.

## Default Reading List

Before major work, read:
- `README.md`
- `specs/product-spec.md`
- `specs/ui-spec.md`
- `specs/technical-spec.md` (when available)
- `AGENTS.md`
- `spec-driven-development.md`
- `docs/global-instructions.md` (local-only, not in repo) if it exists
- `docs/project-memory.md` (local-only, not in repo) if it exists

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **AI:** Groq (GPT-OSS 120B) via AI SDK + `@ai-sdk/groq` — quote generation (12 signs/day) and cosmic Q&A
- **Deployment:** Vercel
- **Type:** Progressive Web App (PWA) — mobile-first, installable, web push notifications

## Key Conventions

TBD — to be added after technical spec is written.

## Hard Rules

TBD — to be added after technical spec is written.

Key product constraints to enforce now:
- The AI Q&A must be topically restricted to astrology, moon phases, planetary events, and cosmic/spiritual guidance. Reject or redirect off-topic questions.
- Questions per user per day are limited (exact limit TBD in technical spec) — this is the freemium gate.
- No payments, complex user profiles, or account management in v1.

## AI Collaboration

Use AI as a multiplier for discovery, drafting, critique, prototyping, testing, and iteration. Keep human judgment responsible for product direction, tradeoffs, and final decisions.

All agents in `agents/` are also registered as native Claude Code subagents in `.claude/agents/`. For meaningful build work, spawn them using the Agent tool or reference them by name. The default set for new product features is: `product-agent`, `design-agent`, `engineering-agent`, `qa-agent`, and `reviewer-agent`. See `AGENTS.md` for the full catalog and workflow.

## Public Project Defaults

Include an intentional first-screen experience and a footer crediting Helmut Fritz with a link to `https://helmutfritz.fyi/`.

Do not use the old `helmut-fritz.vercel.app` URL as the canonical personal-site link.
