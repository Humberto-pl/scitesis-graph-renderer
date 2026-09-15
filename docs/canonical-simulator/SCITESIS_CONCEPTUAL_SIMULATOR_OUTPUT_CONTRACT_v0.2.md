# SCITESIS CONCEPTUAL SIMULATOR OUTPUT CONTRACT v0.2

**Estado:** FROZEN / CANONICAL OUTPUT CONTRACT v0.2 / DERIVED FROM FROZEN SPEC v0.2 AND FROZEN MASTER PROMPT v0.2  
**Fecha:** 14 de septiembre de 2026  
**Depende normativamente de:** `SCITESIS_CONCEPTUAL_SIMULATOR_SPEC_v0.2.md` — FROZEN / CANONICAL SIMULATOR SPEC v0.2; `SCITESIS_CONCEPTUAL_SIMULATOR_MASTER_PROMPT_v0.2.md` — FROZEN / CANONICAL MASTER PROMPT v0.2  
**Sustituye para nuevas simulaciones:** `SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_CONTRACT_v0.1.md`  
**No reescribe:** outputs históricos, IAM v0.1, Graph v0.2, Candidate Schema, Motor ni renderer.  
**Freeze declaration:** esta versión queda congelada como contrato canónico de salida del simulador conceptual rico de SciTesis. Cualquier cambio sustantivo posterior deberá realizarse mediante una nueva versión explícita y no por edición silenciosa de v0.2.

---

# 0. PROPÓSITO Y FRONTERA

Este contrato define la forma machine-readable de los outputs del simulador conceptual v0.2.

Su principio rector es:

> **La salida debe preservar la riqueza del IAM simulado rico. No debe reducirse a lo que cabe hoy en IAM v0.1, Graph v0.2, Candidate Schema, renderer o Motor.**

La frontera es:

```text
ARQUITECTURA CANÓNICA RICA
        ↓
IAM SIMULADO RICO
        ↓
OUTPUT CONTRACT v0.2
        ↓
confirmed_simulated_graph.json
        ↓  adapter / compatibility mapping posterior
IAM v0.1 OPERATIVO
        ↓
VALIDATOR → GRAPH COMPILER → GRAPH v0.2
```

`confirmed_simulated_graph.json` NO es Graph v0.2 confirmado del producto.

---

# 1. PRINCIPIOS NORMATIVOS DE SERIALIZACIÓN

1. El universo semántico de reconocimiento es el canon completo ENT-001–ENT-039 y REL-001–REL-074.
2. Conocer el canon completo no obliga a instanciarlo completo en un caso.
3. Ningún objeto o relación canónica legítima debe degradarse por limitaciones de IAM v0.1 o del runtime.
4. `projection_status` describe compatibilidad downstream; nunca determina existencia semántica.
5. `functional_relevance` es el único nombre de la dimensión de relevancia dentro del simulador; `importance` pertenece únicamente a una eventual proyección IAM v0.1.
6. `review_state`, `confidence`, `explicitness`, `projection_status` y `functional_relevance` son dimensiones distintas.
7. `SourceUnit/provenance != EVIDENCE`.
8. ENT-004 conocimiento externo != ENT-023 evidencia del estudio != ENT-025 evidencia diagnóstica.
9. ENT-022 resultado/hallazgo no es automáticamente ENT-023 evidencia.
10. ENT-011 CLAIM no es ENT-039 INFERENCE_STEP.
11. WARRANT, BACKING y PREMISE no son entidades raíz.
12. ENT-006, ENT-007 y REL-026 son tombstones históricos y no se instancian como objetos activos nuevos.
13. No se serializa `SUPPORTS` genérico como sustituto de una relación canónica.
14. `ONTOLOGY_GAP` es un hallazgo interno de cobertura, no un nuevo ENT/REL, subtype o review_state.
15. Los outputs no pueden introducir tipos cualitativos ad hoc tales como `QUALITATIVE_RESULT`, `EMPIRICAL_PATTERN`, `INTERPRETIVE_FINDING` o `THEMATIC_OR_CATEGORICAL_SYNTHESIS`; esos fenómenos deben representarse con ENT canónicos, típicamente ENT-020/021/022/023 según función.
16. `necessity_status`, `contribution_mode` y `structural_status` no son campos canónicos normativos de v0.2; solo pueden aparecer en sidecar experimental explícitamente identificado como no canónico.

---

# 2. ARTEFACTOS OBLIGATORIOS

Toda ejecución completa produce tres artefactos principales:

1. `simulation_trace.json`
2. `confirmed_simulated_graph.json`
3. `simulation_manifest.json`

Los tres pertenecen a la misma ejecución y comparten `case_id` y `execution_id`.

---

# 3. `simulation_trace.json`

## 3.1 Función

Conservar el rastro auditable de S0–S8, gates G1–G6, propuestas, alternativas, rechazos, supersession, abstenciones, Human Review y gaps.

Responde a:

> **¿Cómo llegó el simulador desde el documento fuente hasta la representación adjudicada?**

## 3.2 Top-level mínimo

```json
{
  "artifact_type": "SIMULATION_TRACE",
  "contract_version": "0.2",
  "case_id": "...",
  "execution_id": "...",
  "authorities": {},
  "source_document": {},
  "stages": {},
  "gates": {},
  "human_review": {},
  "ontology_gaps": [],
  "projection_gaps": [],
  "audit_events": []
}
```

## 3.3 Registros por etapa

`stages` debe poder conservar, cuando existan:

- `SOURCE_UNIT_REGISTER`
- `CANDIDATE_UNIT_REGISTER`
- `RICH_MULTIAXIAL_INTERPRETATION_REGISTER`
- `CANONICAL_ENTITY_REGISTER`
- `CLAIM_REGISTER`
- `THEORETICAL_ASSERTION_REGISTER`
- `THEORETICAL_RESOURCE_REGISTER`
- `EXTERNAL_KNOWLEDGE_REGISTER`
- `LITERATURE_USE_REGISTER`
- `CANONICAL_RELATION_PROPOSAL_REGISTER`
- `PREMISE_GROUP_REGISTER`
- `INFERENCE_STEP_REGISTER`
- `REFERENCE_BINDING_REGISTER`
- `REVIEW_QUEUE`
- `CONFIRMED_ASSEMBLY_EVENTS`

El contrato v0.2 no utiliza como registros normativos `PROPOSITION_REGISTER`, `OPERATIONAL_ENTITY_REGISTER`, `SEMANTIC_ASSERTION_REGISTER` ni `MULTIAXIAL_TYPING_REGISTER` de v0.1, salvo lectura histórica.

## 3.4 Gates

`gates` debe registrar como mínimo:

- `G1_CANON_COVERAGE_GATE`
- `G2_THEORY_AND_EXTERNAL_KNOWLEDGE_COVERAGE_GATE`
- `G3_SCIENTIFIC_BACKBONE_COVERAGE_GATE`
- `G4_INFERENCE_AND_RELATION_COVERAGE_GATE`
- `G5_FUNCTIONAL_RELEVANCE_GATE`
- `G6_FINAL_SEMANTIC_COMPLETENESS_GATE`

Cada gate debe contener:

```json
{
  "status": "PASS | FAIL | REVIEW_REQUIRED",
  "checks": [],
  "blockers": [],
  "open_items": [],
  "evidence_refs": []
}
```

Un gate no puede declarar PASS por mera ausencia de errores técnicos; debe cumplir la cobertura semántica definida en SPEC/Master Prompt.

## 3.5 Human Review

`human_review` conserva:

- propuestas revisadas;
- decisiones;
- operaciones aplicadas;
- rationale;
- reviewer/provenance cuando exista;
- supersession resultante.

Operaciones mínimas representables:

- `CONFIRM`
- `REJECT`
- `CHANGE_TYPE`
- `CHANGE_RELATION`
- `ADD_RELATION`
- `DELETE_RELATION`
- `SPLIT_UNIT`
- `MERGE_UNITS`
- `CHANGE_PREMISE_GROUP`
- `CHANGE_CENTRALITY`
- `CHANGE_RELEVANCE`

---

# 4. `confirmed_simulated_graph.json`

## 4.1 Función

Es la materialización adjudicada y activa del **IAM simulado rico** para un caso.

Debe preservar cualquier ENT/REL canónico legítimamente instanciado aunque todavía no exista mapping operacional hacia IAM v0.1 o Graph v0.2.

No incluye propuestas históricas rechazadas o superseded como estado activo; esas permanecen en `simulation_trace.json`.

`UNRESOLVED` y `ABSTAIN` actuales permanecen visibles cuando la SPEC exige conservar incertidumbre activa y no equivalen a semántica confirmada afirmativa.

## 4.2 Top-level mínimo

```json
{
  "artifact_type": "CONFIRMED_SIMULATED_GRAPH",
  "contract_version": "0.2",
  "case_id": "...",
  "execution_id": "...",
  "source_document": {},
  "execution": {},
  "entities": [],
  "relations": [],
  "premise_groups": [],
  "inference_steps": [],
  "literature_use": [],
  "reference_bindings": [],
  "ontology_gaps": [],
  "projection_gaps": [],
  "validation": {}
}
```

---

# 5. `source_document`

Forma mínima:

```json
{
  "document_id": "...",
  "title": "...",
  "document_type": "...",
  "source_uri": "...",
  "pages_processed": [],
  "total_pages": null,
  "scope_processed": "...",
  "document_complete": true
}
```

No completar datos bibliográficos ausentes salvo fuente explícita adicional con provenance.

---

# 6. `execution`

Forma mínima:

```json
{
  "simulator_spec": "SCITESIS_CONCEPTUAL_SIMULATOR_SPEC_v0.2",
  "master_prompt": "SCITESIS_CONCEPTUAL_SIMULATOR_MASTER_PROMPT_v0.2",
  "output_contract": "SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_CONTRACT_v0.2",
  "simulation_state": "CONFIRMED_SIMULATED_GRAPH",
  "human_review_state": "COMPLETE | PARTIAL | NOT_PERFORMED",
  "diagnostic_execution": "NOT_PERFORMED",
  "canon_coverage": "ENT-001..ENT-039 / REL-001..REL-074"
}
```

---

# 7. ENTIDADES

## 7.1 Regla de identidad

Cada objeto canónico se serializa con su `canonical_type` ENT-ID. Los labels legibles son auxiliares y nunca sustituyen el ID canónico.

Forma común mínima:

```json
{
  "id": "OBJ-...",
  "canonical_type": "ENT-011",
  "canonical_name": "CLAIM",
  "subtype": null,
  "label": "...",
  "text": "...",
  "attributes": {},
  "discourse_role": null,
  "argumentative_role": null,
  "epistemic_plane": null,
  "explicitness": "EXPLICIT | IMPLICIT_RECONSTRUCTED | SYSTEM_INFERRED",
  "confidence": null,
  "review_state": "CONFIRMED | PROBABLE | TENTATIVE | AMBIGUOUS | UNRESOLVED | ABSTAIN | REJECTED",
  "functional_relevance": "CORE_INFERENTIAL | SUPPORTING | CONTEXTUALLY_NECESSARY | METHODOLOGICALLY_NECESSARY | PERIPHERAL | REDUNDANT | IRRELEVANT_TO_DEFENDIBILITY | UNRESOLVED",
  "projection_status": "...",
  "provenance": []
}
```

## 7.2 `canonical_type`

Valores activos posibles: cualquier ENT canónico vigente permitido por la SPEC, con restricciones de alcance y tombstones.

- ENT-006 y ENT-007 no pueden aparecer como entidades activas nuevas.
- ENT-024–ENT-035, ENT-002 y ENT-003 pueden conocerse como downstream/gobernanza y solo instanciarse si la SPEC y el caso lo autorizan.

## 7.3 Subtipos

`subtype` solo admite subtipos autorizados por el Diccionario canónico vigente.

Ejemplos relevantes:

- ENT-004: `PRIOR_EMPIRICAL_FINDING`, `LITERATURE_SYNTHESIS`, `KNOWLEDGE_GAP_CLAIM`, `CONTEXTUAL_FACT`.
- ENT-018: `CONCEPT`, `CONSTRUCT`, `DIMENSION`, `VARIABLE`, `ANALYTIC_CATEGORY`, `PHENOMENON`.
- ENT-036: `DEFINITION`, `STRUCTURE_ASSERTION`, `RELATION_PROPOSITION`, `MECHANISM_PROPOSITION`, `THEORETICAL_EXPECTATION`, `BOUNDARY_CONDITION`.

Prohibiciones:

- `ASSUMPTION` no es subtype de ENT-036; corresponde a ENT-014.
- `ALTERNATIVE_EXPLANATION` no es subtype de ENT-036 cuando funciona como amenaza/rival; corresponde a ENT-015.
- no inventar subtipos cualitativos para ENT-022/023.

## 7.4 Claims y subclaims

SUBCLAIM no es entidad raíz nueva. Se representa como ENT-011 con atributos estructurales, por ejemplo:

```json
{
  "canonical_type": "ENT-011",
  "attributes": {
    "structural_role": "SUBCLAIM",
    "parent_claim_id": "OBJ-..."
  }
}
```

No usar `COMPOSITE_SEPARABLE` como tipo ontológico del simulador. Si el análisis requiere estructura compuesta, debe expresarse mediante relaciones/atributos autorizados por el canon y conservar cualquier detalle operacional legacy solo en sidecar no canónico.

---

# 8. RELACIONES

## 8.1 Forma mínima

```json
{
  "id": "RELATION-...",
  "canonical_type": "REL-067",
  "canonical_name": "PREMISE_IN",
  "source_id": "OBJ-...",
  "target_id": "OBJ-...",
  "attributes": {},
  "explicitness": "EXPLICIT | IMPLICIT_RECONSTRUCTED | SYSTEM_INFERRED",
  "confidence": null,
  "review_state": "CONFIRMED | PROBABLE | TENTATIVE | AMBIGUOUS | UNRESOLVED | ABSTAIN | REJECTED",
  "projection_status": "...",
  "provenance": []
}
```

## 8.2 Regla canónica

Toda relación activa debe usar REL-ID canónico vigente.

Fronteras obligatorias:

- REL-019 `SUSTENTA`: ENT-023 evidencia del estudio → ENT-011 claim propio.
- REL-055 `JUSTIFICA_TEORICAMENTE` != REL-068 `WARRANTS`.
- REL-056 `APORTA_SOPORTE_EMPIRICO_EXTERNO` no convierte ENT-004 en ENT-023.
- REL-029 `JUSTIFICA` pertenece a frontera diagnóstica/decisional.
- REL-064 `INTERPRETA` sustituye la semántica activa de REL-026.
- REL-026 es tombstone.
- REL-025 `CONTRASTA_CON` es comparación neutral; incompatibilidad proposicional usa REL-065 `CONTRADICE` cuando corresponda.
- no existe `SUPPORTS` genérico.

Si la relación exacta no puede adjudicarse, no se crea una relación genérica; la incertidumbre queda en trace/review.

---

# 9. `premise_groups`

Los grupos de premisas son estructura argumental auxiliar, no nueva entidad raíz.

Forma mínima:

```json
{
  "id": "PG-...",
  "mode": "JOINT | CONVERGENT | ALTERNATIVE | UNRESOLVED",
  "member_ids": [],
  "target_inference_step_id": "OBJ-...",
  "review_state": "...",
  "provenance": []
}
```

No colapsar JOINT en soportes independientes.

---

# 10. `inference_steps`

ENT-039 es la entidad canónica de transición inferencial.

El array `inference_steps` es una vista conveniente de las instancias ENT-039 y sus relaciones argumentales; no crea un tipo alternativo.

Forma mínima:

```json
{
  "id": "OBJ-...",
  "canonical_type": "ENT-039",
  "premise_ids": [],
  "premise_group_ids": [],
  "assumption_ids": [],
  "warrant_assertion_ids": [],
  "backing_ids": [],
  "conclusion_id": "OBJ-...",
  "explicitness": "EXPLICIT | IMPLICIT_RECONSTRUCTED | SYSTEM_INFERRED",
  "review_state": "...",
  "provenance": []
}
```

Reglas:

1. exactamente una conclusión inmediata por ENT-039;
2. las conexiones se expresan además mediante REL-067/068/069/070/071 cuando corresponda;
3. warrants y backing no se convierten en entidades raíz nuevas;
4. `SYSTEM_INFERRED` debe permanecer revisable.

---

# 11. `literature_use`

`LITERATURE_USE` es registro analítico auxiliar del IAM simulado rico; no es ENT raíz.

Forma mínima:

```json
{
  "literature_use_id": "LU-...",
  "citation": "...",
  "source_unit_ids": [],
  "used_for": [],
  "target_entity_ids": [],
  "necessity": "NECESSARY | USEFUL | OPTIONAL | NO_CLEAR_FUNCTION | UNRESOLVED",
  "sufficiency": "SUFFICIENT | PARTIALLY_SUFFICIENT | INSUFFICIENT | NOT_ASSESSABLE",
  "authority": "HIGH | ADEQUATE | QUESTIONABLE | UNKNOWN | NOT_EXTERNALLY_VERIFIED",
  "currency": null,
  "disciplinary_relevance": null,
  "epistemic_diversity_or_coverage": null,
  "review_state": "...",
  "provenance": []
}
```

La autoridad de una fuente no debe asumirse por nombre o prestigio aparente si no fue verificada; usar `UNKNOWN` o `NOT_EXTERNALLY_VERIFIED` cuando corresponda.

`LITERATURE_USE` no sustituye ENT-004, ENT-005, ENT-018, ENT-036, ENT-037 o ENT-038.

---

# 12. `reference_bindings`

Debe conservar referencias resueltas y no resueltas relevantes.

Forma mínima:

```json
{
  "binding_id": "RB-...",
  "source_object_id": "...",
  "reference_text": "...",
  "resolved_target_id": null,
  "status": "RESOLVED | AMBIGUOUS | UNRESOLVED | ABSTAIN",
  "candidate_target_ids": [],
  "provenance": []
}
```

No elegir target por cercanía textual, frecuencia o confidence sin evidencia semántica suficiente.

---

# 13. `ontology_gaps`

Forma mínima:

```json
{
  "gap_id": "OG-...",
  "gap_type": "ONTOLOGY_GAP",
  "description": "...",
  "source_refs": [],
  "affected_object_ids": [],
  "blocking": true,
  "review_state": "UNRESOLVED"
}
```

`ONTOLOGY_GAP` nunca autoriza inventar ENT/REL/subtype.

---

# 14. `projection_gaps` Y `projection_status`

La compatibilidad downstream se registra sin alterar semántica.

Valores de `projection_status` pueden incluir los definidos por la SPEC, por ejemplo:

- `CONCEPTUAL_SIMULATION_ONLY`
- `TRACEABILITY_ONLY`
- `KNOWN_DOWNSTREAM`
- `SUPPORTED_MAPPING`
- `UNSUPPORTED_MAPPING`

Los valores de `projection_status` quedan cerrados a este vocabulario para v0.2. Un adapter puede aportar detalle adicional únicamente en un campo separado `projection_detail` o equivalente de sidecar; no puede crear nuevos valores de `projection_status`.

Si no existe mapping legal, registrar un projection gap, por ejemplo:

```json
{
  "projection_gap_id": "PGAP-...",
  "object_or_relation_id": "...",
  "target_contract": "IAM v0.1",
  "status": "UNSUPPORTED_MAPPING",
  "reason": "..."
}
```

Prohibido retipar o eliminar un objeto para evitar `UNSUPPORTED_MAPPING`.

---

# 15. `validation`

Forma mínima:

```json
{
  "status": "PASS | FAIL | REVIEW_REQUIRED",
  "gate_status": {},
  "conceptual_blockers": [],
  "open_review_items": [],
  "ontology_gaps_open": [],
  "projection_gaps": [],
  "checks": {}
}
```

Checks mínimos:

- canon completo cargado;
- tombstones no reactivados;
- no generic SUPPORTS;
- source/provenance separado de evidence;
- external knowledge separado de study evidence;
- theory separado de evidence;
- ENT-011 separado de ENT-039;
- single immediate conclusion por ENT-039;
- claims/subclaims cubiertos;
- cobertura teórica suficiente o ausencia justificada;
- backbone científico cubierto o ausencia/no aplicabilidad justificada;
- rutas inferenciales cubiertas o razón explícita de ausencia;
- unresolved/abstain visibles;
- functional relevance evaluada solo después de G1–G4;
- ausencia de tipos/relaciones inventados.

---

# 16. `simulation_manifest.json`

## 16.1 Función

Registrar identidad, versiones, alcance, estado y outputs de una ejecución.

Forma mínima:

```json
{
  "artifact_type": "SIMULATION_MANIFEST",
  "contract_version": "0.2",
  "case_id": "...",
  "execution_id": "...",
  "authorities": {
    "spec": "SCITESIS_CONCEPTUAL_SIMULATOR_SPEC_v0.2",
    "master_prompt": "SCITESIS_CONCEPTUAL_SIMULATOR_MASTER_PROMPT_v0.2",
    "output_contract": "SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_CONTRACT_v0.2"
  },
  "execution_state": "CONFIRMED_SIMULATED_GRAPH",
  "document_complete": true,
  "human_review_state": "COMPLETE | PARTIAL | NOT_PERFORMED",
  "diagnostic_execution": "NOT_PERFORMED",
  "gates": {},
  "outputs": {
    "trace": "simulation_trace.json",
    "graph": "confirmed_simulated_graph.json",
    "manifest": "simulation_manifest.json"
  },
  "hashes": {}
}
```

---

# 17. REGLA DE RELEVANCIA / CASCARILLA

`functional_relevance` se evalúa solo después de cerrar G1–G4 y se valida en G5.

Valores autorizados:

- `CORE_INFERENTIAL`
- `SUPPORTING`
- `CONTEXTUALLY_NECESSARY`
- `METHODOLOGICALLY_NECESSARY`
- `PERIPHERAL`
- `REDUNDANT`
- `IRRELEVANT_TO_DEFENDIBILITY`
- `UNRESOLVED`

CASCARILLA no es entidad, relation kind ni subtype.

No inferir `IRRELEVANT_TO_DEFENDIBILITY` solo porque una función todavía no fue detectada. La evaluación debe considerar contribución funcional y, cuando aplique, remoción contrafactual/redundancia sin promover esas propiedades a primitivas ontológicas.

---

# 18. FRONTERA CON IAM v0.1 Y GRAPH v0.2

Este contrato no modifica IAM v0.1 ni su contrato hacia Graph v0.2.

La proyección operacional ocurre después del output conceptual:

```text
confirmed_simulated_graph.json
        ↓
compatibility adapter
        ↓
IAM v0.1 OPERATIVO
        ↓
VALIDATOR DETERMINISTA
        ↓
GRAPH COMPILER
        ↓
GRAPH v0.2 TENTATIVO
        ↓
HUMAN REVIEW DE PRODUCTO
        ↓
GRAPH v0.2 CONFIRMADO
```

El adapter:

- puede mapear solamente correspondencias legales;
- debe preservar gaps;
- no puede analizar libremente texto fuente para inventar semántica nueva;
- no puede degradar objetos ricos para hacerlos caber;
- no puede transformar un mapping faltante en ausencia conceptual.

---

# 19. FRONTERA CON RENDERER Y MOTOR

El renderer es semánticamente pasivo.

El Motor Diagnóstico consume una representación posterior autorizada; no redefine retroactivamente el output conceptual.

Arquitectura:

```text
THESIS / SOURCE DOCUMENT
    → CONCEPTUAL SIMULATOR v0.2
    → simulation_trace.json
    → HUMAN REVIEW
    → confirmed_simulated_graph.json
         → compatibility / diagnostic adapter
         → presentation adapter
              → renderer
```

Ni renderer, Candidate Schema ni Motor pueden ser usados para recortar el universo del Output Contract v0.2.

---

# 20. REGLA DE PROMOCIÓN

Este contrato permanece **DEVELOPMENT / SIMULATION-ONLY** hasta completar:

1. auditoría de solo lectura contra SPEC v0.2 y Master Prompt v0.2 congelados;
2. creación y validación de `SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_SCHEMA_v0.2.json`;
3. auditoría Contract ↔ Schema;
4. freeze explícito posterior.

Hasta entonces no modifica contratos operacionales existentes.
