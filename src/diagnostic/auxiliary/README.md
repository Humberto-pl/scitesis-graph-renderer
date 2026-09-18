# Auxiliary G_I / G_D boundary

This directory keeps a deliberately small auxiliary **reader boundary** and
also provides the executable full G_I structural contract. G_D still has no
executable full schema. The frozen diagnostic authorities establish separate snapshot
identity (`graph_ref`/`graph_version` and
`diagnostic_graph_ref`/`diagnostic_graph_version`) and exact ID resolution.
The conceptual simulator contract additionally documents an `entities[]`
collection with literal `id`, `canonical_type`, `label`, and `text` fields.

Within the explicitly selected G_I slot, the application first tries the full
contract and then the minimum auxiliary reader. It stores the successful result
as an explicit `FULL_GI` or `MINIMAL_AUXILIARY_GI` profile. This is role-local
fallback, not general artifact autodetection. `asGiAuxiliaryArtifact` exposes a
full artifact to exact reference resolution without copying its entities;
minimum artifacts participate directly.

The minimum auxiliary shape is limited to:

* G_I: `graph_ref`, `graph_version`, and `entities[]`;
* G_D: `diagnostic_graph_ref`, `diagnostic_graph_version`, and `entities[]`;
* entity: non-empty `id`, with optional literal `canonical_type`, `type_id`,
  `label`, and `text`.

All remaining fields at the minimum auxiliary boundary are opaque raw data. They are never used to
derive claims, inference states, transitions, breakpoints, downstream effects,
or frontier membership. A minimum artifact is auxiliary-only and never gains
missing relations or other structural collections. Only `FULL_GI` may feed a
future `GiGraphViewModel`; no structural rendering exists yet. The full G_I
contract likewise does not infer, repair, or render any structure.
