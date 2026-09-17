# SciTesis Graph Renderer v0.2.0

**Status: STABILIZED DEVELOPMENT BASELINE — not production-ready or client-ready.**

Internal React/TypeScript viewer for inspecting already-materialized SciTesis graph artifacts. It keeps the legacy conceptual-simulator view separate from the canonical Diagnostic Output v0.1.2 view. The renderer presents diagnosis; it does not produce or reinterpret it.

## Quick start

```sh
npm install
npm run dev
```

Quality checks:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Supported artifacts

The user explicitly selects an artifact role before importing JSON.

**Primary**

- Legacy Confirmed Simulated Graph (preserved compatibility pipeline).
- Diagnostic Output v0.1.2 (visible diagnostic authority).

**Optional auxiliary**

- G_I minimum reader boundary (structural context).
- G_D minimum reader boundary (diagnostic context).

G_I and G_D enrich exact-reference inspection only. They cannot add graph nodes, transitions, breakpoints, downstream effects, frontier members, or otherwise change the diagnostic render model. The repository has no complete executable G_I/G_D schemas; the deliberately narrow readers consume only the fields documented in [`src/diagnostic/auxiliary/README.md`](src/diagnostic/auxiliary/README.md). A future executable authority must replace—not inferentially expand—that boundary.

## Import and local processing

There is no heuristic auto-detection or sequential fallback among Legacy, Diagnostic Output, G_I, and G_D. `JsonFileInput` reads a selected local `.json` file (maximum 10 MB), parses it to `unknown`, and passes it to the explicitly selected contract loader. Invalid extension, size, JSON, or contract shape fails closed while the last valid artifact remains active.

Imports are processed in the browser. The import implementation has no backend upload and performs no network fetch.

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for pipelines, authority boundaries, renderer-only IDs, invariants, and intentionally deferred work. The v0.2 baseline freezes the current import boundaries, diagnostic authority, auxiliary boundaries, and renderer semantics as a development baseline; it does not modify upstream canonical documents.

## What this renderer does not do

- extract PDFs;
- construct IAM;
- compile G_I;
- generate G_D;
- recalculate diagnosis;
- decide `Def_e` or `Active_e`;
- calculate or complete the defendability frontier;
- repair a thesis;
- replace human review.

It also does not provide editing, persistence, export, search, AI summaries, production packaging, or general-purpose layout optimization.

## PILOT-R01

[`PILOT-R01`](src/diagnostic/fixtures/pilot-r01/README.md) is an experimental acceptance fixture marked **NOT FOR CLIENT DELIVERY**. It exercises the real ingestion-to-render pipeline, but does not establish production readiness, human review, PDF validation, or IAM validation.

## Development limits / future work

Intentionally deferred beyond v0.2: authoritative executable G_I/G_D schemas, a distinct compatibility-maximums UI, richer layout, production packaging, and expansion to a real pilot corpus. These are documented limits, not partially implemented features.
