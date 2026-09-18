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

G_I JSON
  → explicit G_I slot loader
  → FULL_GI executable structural contract, or minimum auxiliary G_I reader
  → stored tagged profile
  → FULL_GI only: GiGraphViewModel
  → GiGraphRenderAdapter (render identities and authoritative LR/TB positions)
  → structural topology

DiagnosticGraphViewModel + GiGraphRenderAdapter output
  → GiDiagnosticOverlayModel (exact-ID node annotations only)
  → GiDiagnosticConnectorModel (exact materialized references only)
  → GiStructuralGraphRenderer
  → compatibility classification
  → exact reference resolver
  → trace enrichment

G_D JSON
  → auxiliary loader
  → compatibility classification
  → exact reference resolver

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
- `GiGraphViewModel`: pure structural projection of a validated `FULL_GI`; no diagnosis or presentation.
- `GiGraphRenderAdapter`: the sole G_I layout authority; relayout changes node positions only.
- `GiDiagnosticOverlayModel`: pure, fail-closed association of diagnostic records to existing G_I nodes by exact, case-sensitive ID.
- `GiDiagnosticConnectorModel`: pure renderer-only projection of resolvable breakpoint and downstream references, kept separate from G_I edges.
- `GiStructuralGraphRenderer`: consumes adapter positions and an optional prepared overlay; it exposes structural selection, focus, filters, literal metadata inspection, and an explicit diagnostic toggle.
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

The executable full G_I contract validates materialized entities, relations, and, when present, inference steps and premise groups. It preserves compatible extensions and checks only declared shape, unique IDs, and internal references. It does not add relations, reconstruct topology, or assess methodological or diagnostic correctness. The structural renderer displays only materialized entities and relations as topology; inference steps and premise groups remain inspectable metadata.

The application G_I slot stores an explicit `FULL_GI` or `MINIMAL_AUXILIARY_GI` profile. Full artifacts retain their structural collections and compatible extensions; a read-only adapter exposes the same object's `entities` to exact reference resolution. The presence of `relations`, `inference_steps`, or `premise_groups` marks a full G_I attempt: failure of the full contract then fails the load, without fallback. Minimum artifacts remain auxiliary-only and never acquire missing structural collections. Only `FULL_GI` is eligible for `GiGraphViewModel` and structural rendering. The fallback is confined to marker-free artifacts in the explicitly selected G_I role and is not general artifact autodetection.

G_D remains auxiliary diagnostic context. Diagnostic Output remains the sole visible diagnostic authority: the renderer never derives diagnosis from G_I. `GiDiagnosticOverlayModel` annotates existing structural nodes only when Diagnostic Output `graph_ref` and `graph_version` exactly equal the render model identity. A mismatch produces no overlay. Claims map only when `claim_id === canonicalId`, inference steps only when `inference_step_id === canonicalId`, and review items only when `subject_ref === canonicalId`; matching is case-sensitive, without normalization, aliases, or heuristics. Exact-ID matching must also be unambiguous: duplicate `claim_id` or `inference_step_id` values block the entire overlay explicitly, with no last-wins policy, while the structural map remains visible and unchanged. Unmatched diagnostic IDs remain explicit in overlay coverage, and absence of a diagnostic record does not mean `UNKNOWN`.

G_I remains the sole authority for nodes, edges, endpoints, layout, focus, and structural filters. The optional overlay does not create, remove, hide, restyle, or diagnose edges and does not create nodes. Its ON/OFF toggle changes annotations only. Materialized H_e transitions may appear as literal inspector records when one of their three ID fields exactly matches the selected node, but they are never projected onto G_I relations or converted into React Flow edges.

The structural diagnostic overlay projects PR6 records literally and case-sensitively: a breakpoint origin only when `breakpoint_step_id === node.canonicalId`, its target separately only when `affected_transition_target_id === node.canonicalId`, and a downstream effect only when `target_claim_id === node.canonicalId`. Frontier membership means only that the exact node ID occurs in `member_claim_ids`; it is never inferred from `Def_e`, H_e, downstream state, or compatibility maximums. Multiple records and input order are preserved, while unresolved step, target, downstream, and frontier references remain explicit in coverage. An empty frontier remains visible, including `REVIEW_REQUIRED`, and `frontier_cardinality` is displayed exactly as materialized rather than recalculated from the member array. None of these projections creates a G_I or diagnostic edge, reconstructs propagation, or changes focus/layout/topology. Compatibility maximums remain separate and unprojected.

Diagnostic connectors are a separate final-presentation collection; `GiGraphRenderModel.edges` continues to contain only `G_I.relations`. A `BREAKPOINT_ASSOCIATION` is the literal `breakpoint_step_id → affected_transition_target_id` reference and exists only when both exact, case-sensitive node IDs exist. A `DOWNSTREAM_REFERENCE` requires an exact `failure_ref → breakpoint_id` match to exactly one breakpoint, takes its source only from that breakpoint's `breakpoint_step_id`, and takes its target only from `target_claim_id`. Zero matches and ambiguous duplicate matches remain explicit unresolved attempts; no breakpoint is chosen arbitrarily.

Connector IDs (`diag:breakpoint:<input-index>:<escaped-id>` and `diag:downstream:<input-index>:<escaped-failure-ref>:<escaped-target-id>`) are deterministic renderer-only identities and are never evidence or written back to artifacts. Self-references are retained explicitly. Connectors are overlaid only when both endpoints are already visible and both diagnostic toggles are on. They do not participate in structural filters, structural edge counts, layout, or focus, and they never establish a propagation or causal path. H_e transitions, frontier members, and compatibility maximums generate no connectors.

Canonical G_I relation IDs and diagnostic connector technical IDs remain unchanged in their separate domains. ReactFlow receives a third, exclusively presentational identity (`rf:structural:<encoded-id>` or `rf:diagnostic:<encoded-id>`) plus explicit discriminated edge metadata; click handling never parses an ID or prefix. Hiding a connector through either diagnostic toggle, structural filters, or focus also hides its inspector, while leaving the connector model unchanged so the selection may reappear when visibility is restored.

The structural inspector retains the PR36 presentation policy of omitting both `undefined` and `null` fields. The separate diagnostic inspector omits `undefined` but displays materialized `null`, because nullability can be canonical diagnostic content.

`GiGraphViewModel` is a deterministic, presentation-neutral projection available only for `FULL_GI`. Its nodes and edges correspond 1:1, in input order, to materialized entities and relations. It retains materialized inference steps, premise groups, and structural metadata separately; absent optional collections become empty view-model collections only for consumption convenience. It neither reconstructs relations nor turns inference steps or premise groups into nodes or edges. It performs no layout and contains no diagnostic state. Layout belongs exclusively to `GiGraphRenderAdapter` and its pure relayout helper; the renderer consumes the resulting positions without recalculating them.

`MINIMAL_AUXILIARY_GI` remains auxiliary-only and cannot feed this structural ViewModel. The ViewModel uses cloned projection records (including compatible entity, relation, and root extensions) rather than treating presentation data as canonical authority, and creates no topology indexes. Relations retain only their canonical `source_id` and `target_id` endpoints; rendering aliases belong in a future render adapter. Compatible extensions, including producer fields named `source` or `target`, are preserved without reinterpretation or replacement.

There is still no complete executable G_D schema. Its current reader accepts only the documented snapshot identity plus `entities[]` fields needed for inspection; other data remains opaque.

## Known limits and future work

- an authoritative executable G_D schema;
- any future propagation connectors require a separate PR and may use only explicit materialized diagnostic references, never reconstructed paths;
- dedicated compatibility-maximums presentation;
- richer layout (including broader claim/inference placement needs), without changing topology;
- production packaging and operational hardening;
- expansion beyond the experimental PILOT-R01 acceptance corpus.

No item above is implemented implicitly in v0.2.
