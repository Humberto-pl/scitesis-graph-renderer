# SciTesis Graph Renderer v0.2 architecture

## Release boundary

v0.2 is a **stabilized development baseline**, not a production or client-delivery claim. It freezes the current import boundaries, diagnostic authority, auxiliary boundaries, and renderer semantics so later work has an explicit reference point. The freeze does not amend any canonical upstream contract or schema.

## Authority boundaries

| Input | Responsibility | Authority |
| --- | --- | --- |
| Diagnostic Output v0.1.2 | Materialized claims, inference states, H_e transitions, breakpoints, downstream effects, frontier, traces, and review items | Sole authority for the visible diagnosis |
| G_I full graph contract | Materialized interpreted-graph structure; currently available as a validated, read-only contract only | Structural, never diagnostic |
| G_D | Optional diagnostic context for exact reference resolution | Auxiliary only |
| Legacy Confirmed Simulated Graph | Compatibility view through its existing pipeline | Separate from Diagnostic Output |
| Renderer | Projection and display | Never diagnoses or repairs input |

An auxiliary identity mismatch blocks resolution from that artifact. It does **not** invalidate Diagnostic Output, alter its diagnosis, or discard the last valid auxiliary artifact.

## Pipelines

```text
Diagnostic Output JSON
  → DiagnosticOutputLoader
  → DiagnosticGraphViewModel
  → DiagnosticGraphRenderAdapter
  → DiagnosticGraphRenderer

G_I / G_D
  → auxiliary loaders
  → compatibility classification
  → exact reference resolver
  → trace enrichment

Legacy JSON
  → legacy loader
  → legacy ViewModel
  → GraphRenderer
```

The import UI routes by the role selected by the user. `JsonFileInput` only reads and parses local JSON into `unknown`; the selected loader validates the applicable contract. The application never tries Legacy, Diagnostic Output, G_I, and G_D automatically in sequence.

## Component responsibilities

- `JsonFileInput`: local file constraints, reading, and JSON parsing only.
- `PrimaryArtifactLoader`: explicit primary-role UI routing; it does not detect contracts.
- `AuxiliaryArtifactLoader`: explicit G_I/G_D import UI.
- `DiagnosticOutputLoader`: fail-closed validation against the canonical v0.1.2 schema without coercion, defaults, or mutation.
- `DiagnosticGraphViewModel`: pure, deterministic projection of materialized diagnostic records.
- `DiagnosticGraphRenderAdapter`: renderer-only identities and display projection; no diagnostic derivation.
- `DiagnosticGraphRenderer`: display and selection.
- Auxiliary resolver: exact, case-sensitive reference resolution without reinterpretation.
- Legacy loader/ViewModel/`GraphRenderer`: preserved independent compatibility pipeline.

## Diagnostic invariants

1. Diagnostic Output is the visible diagnostic authority.
2. The renderer never recomputes diagnosis, `Def_e`, or `Active_e`.
3. Visible H_e uses only the materialized `viable_dependency_view.transitions`; the renderer never reconstructs routes.
4. Frontier membership uses only `defendability_frontier.member_claim_ids`. It is not inferred from TRUE claims, H_e, downstream effects, or compatibility maximums. An empty frontier with `REVIEW_REQUIRED` is valid.
5. Breakpoints and downstream effects are displayed 1:1 from their separate Diagnostic Output collections; neither collection generates the other.
6. G_I/G_D cannot alter the diagnostic render model. Mismatch blocks auxiliary resolution only.
7. Legacy remains a separate pipeline.
8. Reference resolution is exact, case-sensitive, non-fuzzy, and fail-closed: `RESOLVED`, `UNRESOLVED`, `AMBIGUOUS`, or `AUXILIARY_MISMATCH`.

`compatibility_maximums` are distinct from the defendability frontier. They do not fill the frontier and do not imply a global maximum defendable claim. v0.2 intentionally has no dedicated compatibility-maximums UI.

## Trace preservation

`explanation_trace` entries and their order are preserved literally. Reference strings remain visible even when no auxiliary is loaded. Compatible G_I/G_D artifacts may resolve those exact strings for inspection; resolution does not rewrite, reorder, reinterpret, or validate the diagnosis.

## Renderer-only technical IDs

These identities support selection and React Flow rendering; they are not canonical domain fields:

- claim node: `claim:<claim_id>`;
- inference node: `inference:<inference_step_id>`;
- transition key: `transition:<source_claim_or_input_id>:<inference_step_id>:<target_claim_id>:<index>`;
- transition segment edge: `<transitionKey>:source-step` or `<transitionKey>:step-target`;
- breakpoint item: `breakpoint:<breakpoint_id>`;
- downstream item: `downstream:<failure_ref>:<target_claim_id>:<index>`;
- frontier item: `defendability-frontier`;
- run metadata trace selection: `run-metadata`;
- review item trace selection: `review:<item_id>`.

These IDs must not be read back as diagnostic conclusions. Canonical IDs and fields remain unchanged.

## G_I structural contract and auxiliary boundaries

The executable full G_I contract validates materialized entities, relations, and, when present, inference steps and premise groups. It preserves compatible extensions and checks only declared shape, unique IDs, and internal references. It does not add relations, reconstruct topology, or assess methodological or diagnostic correctness. This PR exposes that contract without claiming that the renderer already supports a complete structural map.

The existing minimum G_I reader remains the auxiliary path for exact Diagnostic Output reference resolution, while a validated full G_I is structurally compatible with that path through its `entities`. G_D remains auxiliary diagnostic context. Diagnostic Output remains the sole visible diagnostic authority: the renderer must never derive diagnosis from G_I. A future map will be built from materialized G_I structure and annotated by Diagnostic Output, not inferred or repaired by the renderer.

There is still no complete executable G_D schema. Its current reader accepts only the documented snapshot identity plus `entities[]` fields needed for inspection; other data remains opaque.

## Known limits and future work

- an authoritative executable G_D schema and structural G_I rendering;
- dedicated compatibility-maximums presentation;
- richer layout (including broader claim/inference placement needs), without changing topology;
- production packaging and operational hardening;
- expansion beyond the experimental PILOT-R01 acceptance corpus.

No item above is implemented implicitly in v0.2.
