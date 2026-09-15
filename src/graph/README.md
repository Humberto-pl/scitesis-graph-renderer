# Canonical graph visibility

The canonical renderer follows a one-way presentation pipeline:

`FULL GRAPH → semantic filters → ELIGIBLE GRAPH → focus/neighborhood → VISIBLE GRAPH → semantic layout → React Flow`

Semantic layout is presentation only: **layout != semantics, layout != topology, and layout !=
filtering**. It receives the final visible node and relation ID sets and returns only session-local
positions. It does not transform the artifact or ViewModel, manufacture nodes/relations, or decide
eligibility or focus.

Canonical layout defaults to left-to-right (`LR`) and also supports top-to-bottom (`TB`). It finds
undirected connected components, orders them by descending size and minimum ID, derives
topological-ish layers from actual relation direction with deterministic cycle breaking, and uses
literal `epistemic_plane`, degree, `canonical_type`, and ID only as stable presentation heuristics.
Null planes remain null in the artifact; “Unspecified” is solely the UI/layout label for that
absence. Premise groups remain metadata rather than nodes, and ENT-039 remains an ordinary
canonical node near its explicitly related inputs and conclusion through the existing topology.

Visibility or direction changes recompute the complete visible layout once. Manual drag updates
only the current session positions and is retained until visibility/direction changes or the user
selects **REORGANIZE GRAPH**, which replaces manual positions with the current semantic layout.

Filters never rebuild the artifact or ViewModel and never mutate nodes, edges, topology, or metadata. Within a dimension selected values use OR; active dimensions combine with AND. `review_state` and `explicitness` apply literally to both entities and relations, while `epistemic_plane` applies only to entities. A missing or null value does not match a specific active selection.

“Filtered” means only “not currently visible in the UI”: **filtered ≠ deleted, invalid, or absent**. Resetting filters returns every node and edge in the current full ViewModel without reloading it. Auxiliary artifact inspection is outside graph visibility and remains complete.

Focus is a separate, reversible topological visibility layer: **focus ≠ semantic filtering,
deletion, or a new graph**. It receives only the eligible node and edge ID sets produced by the
semantic filters and never traverses through an ineligible node or edge. The full artifact and
ViewModel remain present and unchanged.

An explicit selected-node action activates a neighborhood with depth `1` and direction `both`.
Depth is bounded to `1`, `2`, or `3` topological hops. Direction is applied at every hop:
`incoming` follows edges toward their source, `outgoing` follows edges toward their target, and
`both` follows either direction. Breadth-first traversal and a visited-node set give each node its
minimum directed distance and safely handle cycles. Visible focus edges are the eligible edges
whose endpoints are both in the computed neighborhood.

The root must exist in the full ViewModel and remain eligible. If a semantic-filter change makes
it ineligible, the UI automatically exits focus rather than bypassing the filter; an eligible
isolated root remains visible. **EXIT FOCUS** clears only focus and restores the exact eligible
graph. **SHOW ALL / RESET FILTERS** clears semantic filters and focus together, restoring the full
graph. Selection never changes the root implicitly, and selection is cleared whenever its object
falls outside final visibility. Inferential highlighting is applied only to that final visible
subset, while Literature, References, Gaps, and Validation continue to inspect the complete
artifact.

## Artifact import

La aplicación acepta un único JSON local `CONFIRMED_SIMULATED_GRAPH`. Se valida sin transformarlo contra `docs/canonical-simulator/SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_SCHEMA_v0.3.json`; después, el adapter comprueba sus precondiciones de construcción. Se procesa en memoria y un archivo rechazado no reemplaza el artifact visible.
