# Product Spec: Lumora

## Status

Draft

## Owner

Helmut Fritz

## Summary

Spiritually curious people wake up feeling off or anxious with no clear framework for why — they scatter across Co-Star, Google, and astrology accounts, but get generic content with no daily focus or uplift. Lumora gives them a daily ritual: an AI-generated inspirational quote every morning (delivered in-app and by email), plus a cosmic guidance layer that answers practical questions — Mercury retrograde, moon phases, what their sign should do or avoid today — in a focused, uplifting format.

## Context

The target user is spiritually curious but not a hardcore astrologer. They believe (or enjoy believing) that planetary events and lunar cycles have real effects on daily life — haircuts, decisions, mood, energy. They want a daily touchpoint that feels personal, positive, and useful — not an encyclopedia. Lumora is a personal project with a small but real audience goal: 50 email subscribers to validate the daily ritual habit.

## Target Users

Women 25–40 who are spiritually curious, occasionally check Co-Star or astrology content on social media, and want practical cosmic guidance delivered daily without having to seek it out.

## Problem

They have no focused daily ritual for cosmic guidance. The information they want exists (Mercury retrograde, moon phase advice, sign-specific energy) but is scattered, inconsistent, and rarely actionable. Nothing delivers it as a clean daily touchpoint with both uplift (quote) and context (what's happening cosmically today).

## Goals

- Deliver a daily AI-generated inspirational quote in-app and to email subscribers
- Answer practical astrology and moon phase questions in natural language ("should I cut my hair today?", "what does Mercury retrograde mean for Virgo?")
- Build a subscriber habit: 50 email subscribers as the v1 success target
- Keep the experience focused, uplifting, and spiritually themed — not a general-purpose chatbot

## Non-Goals

- Payments or premium tiers in v1
- Complex user profiles or account management
- Natal chart calculations or deep astrology engine
- Off-topic AI conversations (coding, finance, general knowledge)
- Native mobile app (PWA covers mobile needs for v1)

## Jobs To Be Done

When I wake up feeling unsettled or curious about what the universe has in store, I want a daily moment of cosmic guidance and inspiration, so I can start my day with clarity, intention, and a sense that things make sense.

## User Experience

Stubs — to be defined in a later spec pass.

## Key Flows

### Flow 1: Daily Quote

Stub.

### Flow 2: Email Subscription

Stub.

### Flow 3: Ask a Cosmic Question

Stub.

## Requirements

### Functional Requirements

- AI-generated daily quote, refreshed each day (universal or sign-specific TBD)
- Email subscription with daily quote delivery
- Natural language Q&A for astrology and moon phase topics
- Topic guardrail: AI must reject or redirect questions outside the cosmic/spiritual theme
- Daily question limit per user (exact cap TBD — freemium gate for future monetization)

### Non-Functional Requirements

- Performance: mobile-first PWA, fast first paint
- Accessibility: readable on small screens, good contrast for dark/cosmic aesthetic
- Security: no sensitive user data beyond email address
- Privacy: email used only for daily quote delivery, no third-party sharing
- Reliability: daily quote must be available even if AI generation fails (fallback to cached quote)

## Success Metrics

Primary metric: 50 email subscribers opted in for the daily quote.

Input metrics:
- Daily active opens (app or email)
- Questions asked per session

Guardrail metrics:
- Topic guardrail rejection rate (too high = over-filtering; too low = off-topic answers leaking through)

## Assumptions

- Users are willing to share their email for a daily cosmic quote — the value exchange is clear enough
- Moon phase and planetary data is available via a free or low-cost API
- A daily question limit of 3–5 is enough for casual users and creates a natural freemium gate without frustrating the core experience

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Topic guardrail is too aggressive and frustrates legit questions | Medium | Medium | Test with real queries; tune with examples |
| Daily quote feels repetitive or generic | Medium | High | Vary by sign, moon phase, or theme; use rich prompts |
| Email deliverability issues hurt subscriber experience | Low | High | Use a reliable transactional email provider (Resend, etc.) |

## Launch Plan

Stub — to be defined after technical spec.

## Learning Plan

After reaching 50 subscribers: survey 5–10 on what they open most (quote vs. Q&A) and whether the daily ritual is forming. Use open rates and question frequency as leading indicators.

## Decisions Made

- **Daily quotes:** Personalized by zodiac sign — 12 quotes generated per day, one per sign. Zodiac sign required at signup.
- **Daily question limit:** 1 question/day for anonymous users, 5/day for confirmed subscribers.
- **Planetary data:** Astronomy Engine (open-source npm library) + static ephemeris JSON for retrograde dates.
- **Push notifications:** Email only in v1. Web push deferred to v2.

## Open Questions

None — all resolved.
