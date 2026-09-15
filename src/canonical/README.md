# Canonical semantic registry

The local **Conceptual Simulator SPEC v0.3** is the conceptual authority for the complete ENT-001–ENT-039 and REL-001–REL-074 vocabulary. The **Output Contract v0.2** and **Output Schema v0.3** define the artifact shape.

This immutable registry is a semantic presentation reference. The artifact remains the instance authority for objects, relations, identifiers, endpoints, canonical types, instance `canonical_name`, and instance metadata. An artifact-provided name therefore takes precedence; a registry name may only be used as a display fallback.

The registry is **not** a validator or transformer: it must not reject, normalize, repair, migrate, create, remove, or retag artifact content. In particular, domain/range descriptions never gate artifacts. The QUALIS fixture is a regression instance, **not** an ontology source.

`simulatorScope` records the SPEC's explicitly non-canonical simulator reachability dimension. `lifecycle` is present only on the three historical tombstones; no blanket `active` lifecycle is inferred.
