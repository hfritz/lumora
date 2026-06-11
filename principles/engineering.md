# Engineering Principles

## Optimize For Change

The best foundation is one that allows the product to change without making the system brittle. Prefer clear boundaries, understandable code, and small increments.

## Use The Boring Tool First

Choose mature, well-understood tools unless the project has a clear reason to do otherwise. Novelty should earn its place.

## Preserve Local Patterns

When working in an existing codebase, follow the established architecture, naming, and testing style. Consistency is a feature.

## Make Behavior Observable

Important systems should be debuggable. Add logs, metrics, error states, and test coverage where they help future collaborators understand behavior.

## Build The Smallest Coherent Version

Avoid both throwaway hacks and overbuilt platforms. Build the smallest version that proves the product and technical direction honestly.

## Treat Tests As Confidence Tools

Tests should protect important behavior and risky integration points. Let test depth match product and technical risk.

## Document Decisions, Not Every Detail

Code should explain local mechanics. Docs should explain context, tradeoffs, constraints, and decisions that are hard to infer later.

