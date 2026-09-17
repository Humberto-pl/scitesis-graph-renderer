# PILOT-R01 renderer acceptance fixture

> **PILOT / EXPERIMENTAL — NOT FOR CLIENT DELIVERY**

This directory contains a renderer acceptance fixture, not a frozen canonical
baseline and not evidence of production readiness. Human review has
**NOT_YET_PERFORMED**.

## Provenance

- Run: `PILOT-R01-RUN-001`
- Source thesis: *Inteligência Emocional e Assertividade nos Enfermeiros*
- Author: Alexandra Monge Godinho Costa
- Year: 2009
- Purpose: renderer acceptance

The Diagnostic Output starts at the renderer's canonical v0.1.2 ingestion
boundary. It is a provisional, experimental representation of the source case;
its materialized diagnosis is preserved literally rather than corrected or
completed for presentation.

The G_I and G_D files are **minimal acceptance auxiliary fixtures**. They only
contain entities needed to exercise literal references already present in the
Diagnostic Output. They are not complete snapshots of either provisional
graph.

## What this demonstrates

- Diagnostic Output ingestion and faithful semantic representation;
- renderer traceability, including empty frontier and mixed states;
- optional auxiliary reference resolution without changing the diagnosis.

It does **not** demonstrate methodological correctness of the thesis, extractor
correctness, IAM correctness, G_I correctness, G_D completeness, production
readiness, or any part of the `PDF → IAM → G_I` process. The source PDF is not
included or validated.
