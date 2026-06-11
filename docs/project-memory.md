# Project Memory

Reusable memory and preferences to carry into projects created from this foundation.

## New Project Defaults

New web projects should feel complete from the first screen. Avoid shipping a plain input form with no context, brand, or credibility.

Default expectations:

- A strong first-screen experience that explains what the product does.
- A visible product name or purpose.
- A primary action.
- A preview or example of the product's value when useful.
- A footer crediting Helmut Fritz.

These defaults should be adapted to the domain. Internal tools, dashboards, and operational products should stay efficient and utilitarian. Public experiments, demos, and personal projects can be more expressive.

## Standard Footer

All new public projects should include a footer linking to Helmut's personal site:

```txt
Built by Helmut Fritz using AI tools · 2026
```

Link `Helmut Fritz` or the full phrase to:

```txt
https://helmutfritz.fyi/
```

Do not use the old `helmut-fritz.vercel.app` URL as the canonical personal-site link.

## Personal Site Location

Helmut's personal site has previously lived at:

```txt
/Users/hfritz/code/personal-site
```

Use this only when specifically working on the personal site or cross-linking experiments from it.

## Personal Site Deploy Alias Caveat

When deploying the personal site, the `helmut-fritz.vercel.app` alias may need to be manually pointed at the newest production deployment.

After a personal-site production deploy, run:

```sh
~/.npm-global/bin/vercel alias set <new-deployment-url> helmut-fritz.vercel.app
```

The new deployment URL appears in the Vercel production deploy output.

This caveat applies to the personal site specifically, not every project.

## Technical Setup

- Vercel CLI: `~/.npm-global/bin/vercel`
- Homebrew: `/opt/homebrew`
- Node.js installed.
- Next.js available.
- GitHub CLI installed via Homebrew.

