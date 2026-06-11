# UI Spec: Lumora

## Status

Draft

## Aesthetic Direction

Luxury wellness meets minimal astrology. The visual language is warm, airy, and intentional — closer to a premium self-care brand (Worthy, The Nue Co.) than a traditional dark astrology app. Cream and greige base, gold accents, gentle gradients. Every screen should feel like a quiet morning ritual, not a mystical night.

**Mood keywords:** warm, serene, elevated, intentional, soft glow

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#FAF7F2` | Page background (warm cream) |
| `surface` | `#F5EFE6` | Cards, panels (slightly warmer cream) |
| `surface-muted` | `#EDE4D8` | Subtle section separators, inputs |
| `gold` | `#C9A96E` | Primary accent — logo, headings, icons, borders |
| `gold-light` | `#E8D5B0` | Gradient endpoints, decorative elements |
| `gold-dark` | `#9E7A45` | Hover states, active elements |
| `text-primary` | `#2C2420` | Headings and body (warm near-black) |
| `text-secondary` | `#7A6B5D` | Supporting text, labels (warm mid-brown) |
| `text-muted` | `#B0A090` | Placeholders, metadata |
| `gradient-warm` | `from-[#FAF7F2] to-[#F0E4D4]` | Hero sections, quote cards |
| `gradient-gold` | `from-[#E8D5B0] to-[#FAF7F2]` | Feature highlights, subscription CTA |

No pure black (`#000`). No pure white (`#fff`). All neutrals stay warm.

---

## Typography

### Fonts

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / Hero headings | Cormorant Garamond | 300–400 | Elegant, editorial serif. Wide tracking. |
| Section headings (H2–H3) | Cormorant Garamond | 500 | Slightly tighter tracking |
| Body text | DM Sans | 400 | Clean, readable, modern |
| UI labels, navigation | DM Sans | 500 | Medium weight for clarity |
| Quotes (AI-generated) | Cormorant Garamond | 400 italic | Centered, generous line height |
| Metadata, small labels | DM Sans | 400 | `text-muted` color |

### Scale

```
Display:  56–72px / tracking-wide / Cormorant
H1:       40–48px / tracking-normal / Cormorant
H2:       28–32px / Cormorant
H3:       20–24px / Cormorant or DM Sans
Body:     16px / DM Sans / leading-relaxed
Small:    14px / DM Sans
Micro:    12px / DM Sans / tracking-wide / uppercase
```

---

## Spacing & Layout

- Base unit: `4px`
- Section padding: `64–96px` vertical
- Card padding: `24–32px`
- Max content width: `1100px`
- Mobile-first — all layouts start single column

---

## Elevation & Depth

No harsh drop shadows. Use warm, diffuse shadows only.

```
card:    box-shadow: 0 4px 24px rgba(180, 140, 100, 0.10)
hover:   box-shadow: 0 8px 32px rgba(180, 140, 100, 0.16)
modal:   box-shadow: 0 16px 48px rgba(180, 140, 100, 0.20)
```

---

## Border Radius

| Element | Radius |
|---------|--------|
| Cards | `rounded-2xl` (16px) |
| Buttons (primary) | `rounded-full` (pill) |
| Buttons (secondary) | `rounded-full` (pill) |
| Input fields | `rounded-xl` (12px) |
| Badges / tags | `rounded-full` |
| Images | `rounded-2xl` |

---

## Buttons

### Primary
- Background: `gold` (`#C9A96E`)
- Text: `#FAF7F2` (cream)
- Shape: pill (`rounded-full`)
- Padding: `px-8 py-3`
- Hover: `gold-dark` (`#9E7A45`)

### Secondary / Outlined
- Background: transparent
- Border: `1.5px solid #C9A96E`
- Text: `gold` (`#C9A96E`)
- Shape: pill
- Hover: `surface` background

### Ghost
- No border, no background
- Text: `text-secondary`
- Hover: `text-primary`

---

## Gradients & Decorative Elements

### Hero gradient
Soft warm-to-peach radial or linear gradient behind the hero quote. Inspired by the Passion Finder golden glow and Worthy's hero overlay.

```css
background: linear-gradient(135deg, #FAF7F2 0%, #F0E4D4 50%, #E8D5B0 100%);
```

### Celestial orb
A soft, blurred circular glow (inspired by Image 7 and Passion Finder) — used as a decorative background element behind quotes or hero sections. Implemented as a blurred div or SVG radial gradient, not an image.

```css
background: radial-gradient(circle, rgba(232,213,176,0.6) 0%, rgba(250,247,242,0) 70%);
filter: blur(40px);
```

### Thin line illustrations
Celestial motifs — moon phases, star constellations, zodiac glyphs — rendered as thin SVG line art in `gold-light` (`#E8D5B0`). Used as watermarks and card accents. Subtle, never dominant.

### Circular watermark
Inspired by Worthy's footer: a large, faint concentric-circle or orbital ring motif used as a background watermark. Opacity 5–8%.

---

## Cards

Standard content card:
- Background: `surface` (`#F5EFE6`)
- Border: `1px solid #E8D5B0` (gold-light)
- Radius: `rounded-2xl`
- Shadow: warm card shadow
- Padding: `p-6` or `p-8`

Feature / highlight card:
- Glassmorphism variant: `backdrop-blur-sm bg-white/60 border border-white/40`
- Used for the daily quote card and key stat callouts

---

## Iconography

- Style: thin line icons, 1.5px stroke, rounded line caps
- Color: `text-secondary` default, `gold` for active/accent states
- Source: Lucide React (matches stroke style)
- Celestial custom icons (moon, sun, star, planet) as SVG — thin line, consistent with brand

---

## Illustrations

- Style: minimal line art, single-weight stroke
- Color: `gold-light` to `gold` range
- Subject matter: moon phases, zodiac wheels, stars, celestial bodies
- Never photographic — always illustrative
- Used as card accents and section dividers, not full-bleed

---

## Motion & Animation

- Subtle and intentional — this is a calm, meditative app
- Page transitions: `fade` (200ms ease-in-out)
- Card hover: `scale-[1.01]` with shadow lift (150ms ease)
- Quote reveal: fade-in with slight upward drift (300ms)
- No bouncy, springy, or fast animations

---

## Tone of Voice (for UI copy)

- Warm, assured, slightly mystical — not clinical or chatty
- Short sentences. No exclamation marks.
- Address the user directly: "Your energy today.", "What the stars are saying."
- Avoid: "Amazing!", "Let's go!", "Oops!"
- Use: "Something feels off.", "The universe has a message.", "Today calls for stillness."

---

## Reference Images

Synthesized from:
- Worthy Self-Care Studio — cream/gold brand palette, pill buttons, watermark circles
- Sofia wellness app — card layout, warm sand background, rounded cards, gradient accents
- Passion Finder — golden orb glow, glassmorphism cards, warm ethereal gradients
- Astrology app (Christine) — thin celestial line illustrations, cream base
- Cryptonews — frosted glass orb motif, editorial grid structure

---

## What This Style Is Not

- Not dark, not moody, not "occult"
- Not pastel pink or girlish
- Not clinical white with flat colors
- Not loud, high-contrast, or gamified
- Not Co-Star (dark), not generic horoscope app (cluttered)
