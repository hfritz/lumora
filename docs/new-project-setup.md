# New Project Setup

How to start a new project using product-base as a foundation.

## When To Use This

Use product-base as the foundation whenever starting a new project — web app, tool, experiment, or portfolio piece. It carries the principles, agents, skills, rituals, specs, and personal context that should travel with every project.

## Steps

### 1. Copy the foundation

```bash
rsync -a --exclude='.git' --exclude='.DS_Store' /Users/hfritz/code/product-base/ /Users/hfritz/code/<project-name>/
```

### 2. Remove session-specific files

```bash
rm -f /Users/hfritz/code/<project-name>/.claude/settings.local.json
```

### 3. Replace README.md

Rewrite `README.md` for the new project. Include:
- Project name and tagline
- What it does (2–3 sentences)
- Links to `specs/product-spec.md` and `specs/technical-spec.md`
- Tech stack (if known)
- Getting started instructions (once the app is scaffolded)
- Standard footer: `Built by [Helmut Fritz](https://helmutfritz.fyi/) using AI tools · [year]`

### 4. Replace CLAUDE.md

Rewrite `CLAUDE.md` for the new project. Include:
- Project description (2–3 sentences)
- Role for Claude in this project
- Default reading list (reference the project's own specs)
- Tech stack (if applicable)
- Key conventions specific to this project
- Hard rules specific to this project

Keep the agent use section and public project defaults from the product-base version.

### 5. Write the product spec

Fill in `specs/product-spec.md` with the project's actual content. Delete or archive the template version in `specs/templates/product-spec.md` if it creates confusion (or leave it as a reference — both is fine).

Use the agent workflow: spawn `product-agent` or `head-of-product-agent` to challenge the spec before build.

### 6. Write the technical spec

Fill in `specs/technical-spec.md` before writing code. Include:
- System architecture
- AI contract (if AI-powered) — provider, call strategy, schema, prompt structure
- UI state machine (if interactive)
- API surface
- Failure modes and mitigations
- File structure target

Use `engineering-agent` or `software-architect-agent` to review the technical spec.

### 7. Run the agent review

Before building, run the default agent set on the product and technical specs:
- `head-of-product-agent` — strategic review
- `product-agent` — scope and spec quality
- `design-agent` — UX and flow critique
- `engineering-agent` — technical approach
- `reviewer-agent` — risks and blockers

This surfaces problems before they are expensive.

### 8. Initialize git

```bash
cd /Users/hfritz/code/<project-name>
git init
git add -A
git commit -m "Initialize <project-name> from product-base foundation."
```

### 9. Scaffold the application (if applicable)

For Next.js projects:
```bash
cd /Users/hfritz/code/<project-name>
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Then install additional dependencies:
```bash
npm install ai @ai-sdk/anthropic zod
npx shadcn@latest init
```

---

## Checklist

- [ ] Foundation copied (rsync, no .git)
- [ ] `settings.local.json` removed
- [ ] `README.md` written for this project
- [ ] `CLAUDE.md` written for this project
- [ ] `specs/product-spec.md` filled in
- [ ] `specs/technical-spec.md` filled in
- [ ] Agent review completed before build
- [ ] Git initialized and first commit made
- [ ] App scaffolded (if applicable)

---

## Reference

First project created from this foundation: [ProdWise](../../../prodwise) — 2026-05-12
