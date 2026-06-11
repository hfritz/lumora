# Spec-Driven Development

Spec-driven development means the team agrees on the problem, constraints, tradeoffs, and expected outcomes before implementation becomes the main activity.

It is not about heavy documentation. It is about reducing ambiguity at the right moments.

## Workflow

```txt
Idea
  -> Problem Brief
  -> Product Spec
  -> Technical Spec
  -> Implementation Plan
  -> Build
  -> Review
  -> Release
  -> Learn
```

## 1. Idea

A rough opportunity, user pain, business need, or technical improvement.

Output: one or two paragraphs describing the opportunity.

## 2. Problem Brief

Clarifies the problem before solutioning.

Output:

- User or customer.
- Current pain or limitation.
- Why now.
- Evidence.
- Expected impact.

## 3. Product Spec

Defines what should be true for users and the business.

Output: a filled product spec with goals, non-goals, user flows, metrics, risks, and open questions.

## 4. Technical Spec

Defines how the solution will work.

Output: a filled technical spec with architecture, interfaces, data model, edge cases, risks, and test plan.

## 5. Implementation Plan

Breaks the work into small, verifiable steps.

Output:

- Milestones.
- Tasks.
- Dependencies.
- Verification plan.
- Rollout path.

## 6. Build

Implementation happens in increments. Each increment should be easy to review and verify.

## 7. Review

Review product behavior, technical quality, and spec alignment.

Review questions:

- Does this solve the stated problem?
- Did scope change?
- Are the tradeoffs still acceptable?
- What needs to be tested or observed after release?

## 8. Release

Release with a clear owner, rollout path, and monitoring plan.

## 9. Learn

Compare outcomes with expectations. Keep, iterate, scale, or stop.

## Lightweight Rule

Use the smallest spec that reduces meaningful ambiguity. A two-paragraph spec is enough for a small change. A strategic feature deserves more rigor.

