# Agents

Agents are reusable collaboration roles for AI-assisted product development.

They are not imaginary autonomous employees. They are focused working modes that help structure product thinking, implementation, review, and iteration.

Use them with Codex, Claude, ChatGPT, or another AI tool when a task benefits from a specific lens.

## Agent Standard

All agents should include Claude-style metadata followed by the product-base structure.

```md
---
name: agent-name
description: "Use this agent when..."
tools: "Read, WebSearch, WebFetch"
model: inherit
color: blue
memory: project
---

# Agent Title

## Purpose
## When To Use
## Responsibilities
## Inputs
## Operating Rules
## Output
## Quality Bar
## Typical Prompts
```

Use `agent-template.md` when creating a new agent.

## Quick Reference

| Agent | Tier | Description | Tools | Model | Color |
|---|---|---|---|---|---|
| `head-of-product-agent.md` | Core | Strategic product thought partner for vision, strategy, roadmaps, OKRs, prioritization, executive narratives, and stakeholder alignment. | Read, WebSearch, WebFetch | inherit | green |
| `product-manager-agent.md` | Core | Turns product intent into scoped features, acceptance criteria, delivery slices, and cross-functional plans. | Read, WebSearch, WebFetch | inherit | green |
| `project-manager-agent.md` | Core | Converts specs into milestones, dependencies, risks, sequencing, and delivery tracking. | Read | inherit | slate |
| `game-designer-agent.md` | Core | Designs game loops, mechanics, progression, difficulty, onboarding, retention, and fun. | Read, WebSearch, WebFetch | inherit | purple |
| `game-developer-agent.md` | Core | Builds browser games with practical attention to gameplay code, inputs, performance, assets, and QA. | Read, Edit, Bash | inherit | purple |
| `ai-engineer-agent.md` | Core | Implements AI product features with prompts, APIs, structured outputs, fallbacks, streaming, and eval hooks. | Read, Edit, Bash, WebSearch, WebFetch | inherit | cyan |
| `llm-architect-agent.md` | Core | Designs AI-native systems across models, context, RAG, agents, memory, cost, latency, safety, and evals. | Read, WebSearch, WebFetch | inherit | cyan |
| `data-analyst-agent.md` | Core | Interprets product metrics, funnels, retention, cohorts, experiments, and business impact. | Read, Bash | inherit | blue |
| `data-scientist-agent.md` | Core | Handles statistical thinking, causal inference, segmentation, prediction, experiment validity, and modeling assumptions. | Read, Bash, WebSearch | inherit | blue |
| `machine-learning-engineer-agent.md` | Core | Designs production ML pipelines, serving, evaluation, monitoring, drift, retraining, and cost/performance tradeoffs. | Read, Edit, Bash, WebSearch | inherit | blue |
| `ux-researcher-agent.md` | Useful | Plans user research, interviews, synthesis, assumption testing, and insight communication. | Read, WebSearch, WebFetch | inherit | pink |
| `market-researcher-agent.md` | Useful | Researches markets, competitors, segments, positioning, pricing signals, and opportunity size. | Read, WebSearch, WebFetch | inherit | orange |
| `project-idea-validator-agent.md` | Useful | Pressure-tests project ideas before build: problem, audience, differentiation, feasibility, cost, and validation path. | Read, WebSearch, WebFetch | inherit | yellow |
| `prompt-engineer-agent.md` | Useful | Improves prompts, structured outputs, eval examples, failure handling, and AI product behavior. | Read, Edit, WebSearch | inherit | cyan |
| `accessibility-tester-agent.md` | Useful | Reviews accessibility basics: semantics, keyboard paths, contrast, focus, labels, and assistive technology expectations. | Read, Bash | inherit | indigo |
| `performance-engineer-agent.md` | Useful | Improves speed, latency, bundle size, Core Web Vitals, rendering, and perceived performance. | Read, Bash, WebSearch | inherit | red |
| `documentation-engineer-agent.md` | Useful | Keeps README, specs, architecture notes, API docs, onboarding, and decision records clear and useful. | Read, Edit | inherit | gray |
| `dx-optimizer-agent.md` | Useful | Improves local setup, scripts, repo ergonomics, CI, automation, and agent workflow quality. | Read, Edit, Bash | inherit | gray |
| `context-manager-agent.md` | Useful | Curates what context agents need, reduces prompt bloat, and keeps memory/specs useful instead of noisy. | Read, Edit | inherit | teal |
| `agile-coach-agent.md` | Later | Improves rituals, planning, team flow, async collaboration, retros, and delivery habits without corporate theater. | Read | inherit | slate |
| `monetization-strategist-agent.md` | Later | Explores pricing, packaging, free/paid boundaries, willingness to pay, and monetization experiments. | Read, WebSearch, WebFetch | inherit | amber |
| `growth-agent.md` | Later | Works on acquisition, activation, retention, referral, growth loops, and lightweight experiments. | Read, WebSearch, WebFetch | inherit | lime |
| `brand-strategist-agent.md` | Later | Shapes positioning, naming, messaging, tone, and brand consistency for public projects. | Read, WebSearch, WebFetch | inherit | rose |
| `executive-agent.md` | Existing | Business framing, strategic focus, sequencing, and opportunity cost. | Read, WebSearch, WebFetch | inherit | green |
| `product-agent.md` | Existing | Sharpens product intent, scope, metrics, UX clarity, and specs. | Read, WebSearch, WebFetch | inherit | green |
| `research-agent.md` | Existing | Gathers evidence, synthesizes assumptions, and identifies open questions. | Read, WebSearch, WebFetch | inherit | pink |
| `design-agent.md` | Existing | Reviews UX flows, visual coherence, interaction quality, states, and accessibility. | Read | inherit | purple |
| `software-architect-agent.md` | Existing | Defines technical architecture, system boundaries, tradeoffs, and failure modes. | Read, WebSearch, WebFetch | inherit | cyan |
| `code-writer-agent.md` | Existing | Implements scoped changes following existing patterns. | Read, Edit, Bash | inherit | blue |
| `engineering-agent.md` | Existing | General engineering lens for small work that combines planning and implementation. | Read, Edit, Bash | inherit | blue |
| `reviewer-agent.md` | Existing | Reviews specs, code, launches, and risks. | Read | inherit | red |
| `qa-agent.md` | Existing | Verifies functional, visual, responsive, and release behavior. | Read, Bash | inherit | red |
| `ai-safety-content-quality-agent.md` | Existing | Reviews AI behavior, generated content quality, safety, and fallback behavior. | Read, WebSearch, WebFetch | inherit | cyan |

## How To Use

Give each agent:

- The relevant spec or context.
- The specific question or task.
- The expected output.
- Any constraints, deadlines, or decision criteria.

Examples:

```txt
Review this idea as Head Of Product Agent. What is the strategic bet, what is missing, and what would you recommend?
```

```txt
Act as LLM Architect Agent and propose the simplest AI system for this feature.
```

```txt
Use Game Designer Agent and Game Developer Agent to turn this game idea into a small playable first version.
```

```txt
QA this feature on desktop and mobile. What works, what breaks, and what blocks release?
```

Keep roles focused. A good agent assignment should be narrow enough to complete well.

