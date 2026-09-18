# Auxiliary G_I / G_D boundary

This directory keeps a deliberately small auxiliary **reader boundary** and
also provides the executable full G_I structural contract. G_D still has no
executable full schema. The frozen diagnostic authorities establish separate snapshot
identity (`graph_ref`/`graph_version` and
`diagnostic_graph_ref`/`diagnostic_graph_version`) and exact ID resolution.
The conceptual simulator contract additionally documents an `entities[]`
collection with literal `id`, `canonical_type`, `label`, and `text` fields.

The application validates and stores complete G_I files through
`loadFullGiArtifact`; `asGiAuxiliaryArtifact` then exposes the same validated
object to exact reference resolution without copying or reducing its entities.
The legacy minimum reader remains available to existing callers.

The minimum auxiliary shape is limited to:

* G_I: `graph_ref`, `graph_version`, and `entities[]`;
* G_D: `diagnostic_graph_ref`, `diagnostic_graph_version`, and `entities[]`;
* entity: non-empty `id`, with optional literal `canonical_type`, `type_id`,
  `label`, and `text`.

All remaining fields at the minimum auxiliary boundary are opaque raw data. They are never used to
derive claims, inference states, transitions, breakpoints, downstream effects,
or frontier membership. The full G_I contract likewise does not infer, repair,
or render any structure.
