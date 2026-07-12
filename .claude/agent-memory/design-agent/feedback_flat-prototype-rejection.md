---
name: feedback-flat-prototype-rejection
description: New feature sections must not reuse existing card chrome verbatim — they read as flat/unprominent when they do
metadata:
  type: feedback
---

When a new feature sits directly below/beside an existing prominent card (e.g., the daily quote card), do not reuse that card's exact background treatment, border, blur, padding, and internal pill/chip shape language. Doing so makes the new feature pattern-match as "more of the same card" and it recedes instead of announcing itself.

Concretely observed in [[project-todays-lenses]]: three prototype variants (accordion, tabs+panel, swipe carousel) for the "Today's Lenses" feature all reused `quote-card.tsx`'s exact `CARD_STYLE` (rgba(250,247,242,0.70) + blur(12px) + border-gold-light/60 + rounded-2xl) and the same pill/chip shape already used for the Sign/Moon/Retrograde chips. All text was small (text-xs/sm), the section label was a 10px muted caption, and the "featured" distinction was just a tiny gold-dark text label — no size/color/layout difference. Product owner (Helmut) rejected all three: "I don't like the design. I don't think right now is prominent or eye-catching enough."

**Why:** Visual weight comes from contrast against the existing system, not from correctness within it. Repeating identical chrome, matching text scale, and using only a label change to signal "featured"/"new" is not enough contrast to register as a highlight — especially on a page whose dominant visual event (the quote, Cormorant italic text-2xl/3xl) already sets a high bar for what "important" looks like.

**How to apply:** When designing a new section/feature on a page with an existing hero-style card, deliberately introduce at least one strong differentiator sanctioned by the design system rather than inventing off-brand treatment — e.g., Lumora's ui-spec already defines a `gradient-gold` token explicitly for "feature highlights" that was unused in all three rejected variants. Also give any "featured"/"primary" item within a section real scale/content weight (bigger card, serif heading-scale text, always-visible detail, larger icon) — not just a caption-sized label — while keeping secondary items visually subordinate (smaller, muted, teaser-only). See [[project-todays-lenses]] for the full critique and redesign recommendations delivered 2026-07-12.
