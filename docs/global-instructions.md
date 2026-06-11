# Global Instructions

These instructions summarize reusable global rules and memories from Helmut's existing Codex and Claude setup.

## Read These First

For new projects, agents should read:

1. `README.md`
2. `AGENTS.md` or `CLAUDE.md`
3. `spec-driven-development.md`
4. `docs/helmut-context.md` (local-only, not in repo — skip if not present or add your own one)

## Personal Context

Use `docs/helmut-context.md` (local-only, skip if not present) when writing:

- Portfolio content.
- About pages.
- Job-search materials.
- Case studies.
- Founder or product-lead positioning.
- AI product narratives.

Do not expose personal details unless the project context calls for it.

## Branding Defaults

For public web projects and experiments:

- Include a meaningful first-screen experience.
- Include a standard footer linking to `https://helmutfritz.fyi/`.
- Show enough product context that the page feels intentional.

For internal tools or dense workflows:

- Prioritize utility, speed, and scannability.
- Keep branding minimal.
- Still include attribution if the project is public.

## AI Collaboration Defaults

- Use AI to accelerate discovery, specs, implementation, review, and iteration.
- Keep human judgment responsible for product direction and tradeoffs.
- Ask agents to state assumptions and risks.
- Use a separate reviewer pass for meaningful work.
- Verify generated code, metrics, and factual claims.

