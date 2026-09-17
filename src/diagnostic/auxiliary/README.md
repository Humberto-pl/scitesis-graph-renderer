# Auxiliary G_I / G_D boundary

This directory implements a deliberately small **reader boundary**, not a new
canonical schema. The repository does not contain executable G_I or G_D
schemas. The frozen diagnostic authorities establish separate snapshot
identity (`graph_ref`/`graph_version` and
`diagnostic_graph_ref`/`diagnostic_graph_version`) and exact ID resolution.
The conceptual simulator contract additionally documents an `entities[]`
collection with literal `id`, `canonical_type`, `label`, and `text` fields.

Accordingly, the supported test shape is limited to:

* G_I: `graph_ref`, `graph_version`, and `entities[]`;
* G_D: `diagnostic_graph_ref`, `diagnostic_graph_version`, and `entities[]`;
* entity: non-empty `id`, with optional literal `canonical_type`, `type_id`,
  `label`, and `text`.

All remaining fields are opaque raw auxiliary data. They are never used to
derive claims, inference states, transitions, breakpoints, downstream effects,
or frontier membership. A future executable graph contract should replace
this minimum reader rather than expanding it by inference.
