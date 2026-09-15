# Canonical graph visibility

The canonical renderer follows a one-way presentation pipeline:

`FULL CanonicalSimulatorGraphViewModel → visibility filters → visible node/edge ID sets → rendered subset`

Filters never rebuild the artifact or ViewModel and never mutate nodes, edges, topology, or metadata. Within a dimension selected values use OR; active dimensions combine with AND. `review_state` and `explicitness` apply literally to both entities and relations, while `epistemic_plane` applies only to entities. A missing or null value does not match a specific active selection.

“Filtered” means only “not currently visible in the UI”: **filtered ≠ deleted, invalid, or absent**. Resetting filters returns every node and edge in the current full ViewModel without reloading it. Auxiliary artifact inspection is outside graph visibility and remains complete.
