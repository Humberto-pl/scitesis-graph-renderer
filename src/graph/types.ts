export const NODE_KINDS = ['CLAIM','SUBCLAIM','EVIDENCE','METHOD','INSTRUMENT','SAMPLE','TEST','RULE','STATE','REPAIR','AGGREGATION'] as const;
export type NodeKind = typeof NODE_KINDS[number];
export const EDGE_KINDS = ['SUPPORTS','MEASURES','ESTIMATES','TARGETS','DEPENDS_ON','DERIVED_FROM','CONTRADICTS','RESTRICTS','REQUIRES','DECOMPOSES_TO','AGGREGATES_TO','FIRES_ON'] as const;
export type EdgeKind = typeof EDGE_KINDS[number];
export const DIAGNOSTIC_STATES = ['DEFENDIBLE','DEFENDIBLE_CON_RESTRICCIONES','NO_SOSTENIDO_EN_SU_FORMULACION_ACTUAL','NO_RESPALDADO_POR_DATOS_DEL_ESTUDIO','NO_ADJUDICABLE_HASTA_RECONCILIACION','NO_EXIGIBLE_AUN','JUSTIFICACION_DE_RECOMENDACION_LIMITADA','HIPOTESIS_PLAUSIBLE_NO_DEMOSTRADA'] as const;
export type DiagnosticState = typeof DIAGNOSTIC_STATES[number];
export interface CanonicalEntity { id: string; kind: NodeKind; text?: string; sourceRefs?: string[]; [key: string]: unknown }
export interface CanonicalRelation { id?: string; sourceId: string; targetId: string; kind: EdgeKind; label?: string }
export interface CandidateArtifact { caseId: string; schemaVersion?: string; claims: Array<CanonicalEntity & { composition_type?: 'ATOMIC' | 'COMPOSITE_SEPARABLE' | 'COMPOSITE_INSEPARABLE'; subclaims?: CanonicalEntity[]; aggregation_policy?: 'NONE' | 'COMPONENTWISE_RECOVERABLE' }>; entities?: CanonicalEntity[]; relations?: CanonicalRelation[] }
export interface DiagnosisEntry { subjectId: string; state?: DiagnosticState; rules?: string[]; supportPath?: string[]; maximumDefendableClaim?: string; isMaximumDefendable?: boolean; gravity?: string; reparability?: string }
export interface DiagnosisArtifact { caseId?: string; entries?: DiagnosisEntry[]; entities?: CanonicalEntity[]; relations?: CanonicalRelation[] }
export interface GraphNode { id: string; canonicalId: string; kind: NodeKind; label: string; text?: string; state?: DiagnosticState; rules: string[]; supportPath: string[]; sourceRefs: string[]; maximumDefendableClaim?: string; isMaximumDefendable: boolean; gravity?: string; reparability?: string; parentClaimId?: string; position: { x: number; y: number }; collapseCapabilities: Array<'subclaims'|'evidence'> }
export interface GraphEdge { id: string; source: string; target: string; kind: EdgeKind; label: string }
export interface GraphViewModel<Node = GraphNode, Edge = GraphEdge, Metadata = { adapterVersion: '0.1'; sourceSchemaVersion: string; generatedDeterministically: true }> { graphId: string; sourceCaseId: string; nodes: Node[]; edges: Edge[]; metadata: Metadata }
export interface GraphOptions { direction?: 'LR'|'TB' }

export interface SimulatorEntity {
  id: string;
  canonical_type: string;
  canonical_name: string;
  subtype: string | null;
  label: string;
  text: string;
  attributes: Record<string, unknown>;
  discourse_role: string | null;
  argumentative_role: string | null;
  epistemic_plane: string | null;
  explicitness: string;
  confidence: unknown;
  review_state: string;
  functional_relevance: string;
  projection_status: string;
  provenance: SimulatorProvenanceRef[];
  origin?: string;
  version?: unknown;
  iam_source?: unknown;
}

/** A provenance entry is open to contract-compatible extensions; known fields are retained without normalization. */
export interface SimulatorProvenanceRef {
  source_ref?: string;
  source_unit_id?: string | null;
  source_span?: unknown;
  location?: unknown;
  page?: number | string | null;
  section?: string | null;
  literal?: string | null;
  attribution: unknown;
  derivation?: unknown;
  [key: string]: unknown;
}

export interface SimulatorRelation {
  id: string;
  canonical_type: string;
  canonical_name: string;
  source_id: string;
  target_id: string;
  attributes: Record<string, unknown>;
  explicitness: string;
  confidence: unknown;
  review_state: string;
  projection_status: string;
  provenance: SimulatorProvenanceRef[];
  origin?: string;
  version?: unknown;
  iam_source?: unknown;
}

export interface SimulatorPremiseGroup {
  id: string;
  mode: string;
  member_ids: string[];
  target_inference_step_id: string;
  review_state: string;
  provenance: SimulatorProvenanceRef[];
  origin?: string;
  version?: unknown;
  iam_source?: unknown;
}

export interface SimulatorInferenceStep {
  id: string;
  canonical_type: string;
  premise_ids: string[];
  premise_group_ids: string[];
  assumption_ids: string[];
  warrant_assertion_ids: string[];
  backing_ids: string[];
  conclusion_id: string;
  explicitness: string;
  review_state: string;
  provenance: SimulatorProvenanceRef[];
  origin?: string;
  version?: unknown;
  iam_source?: unknown;
}

type SimulatorOrigin = 'AI' | 'RULE' | 'HUMAN';

/** Auxiliary literature record. Open schema extensions remain available verbatim. */
export interface SimulatorLiteratureUse {
  literature_use_id: string;
  citation: string | null;
  source_unit_ids: string[];
  used_for: unknown[];
  target_entity_ids: string[];
  necessity: 'NECESSARY' | 'USEFUL' | 'OPTIONAL' | 'NO_CLEAR_FUNCTION' | 'UNRESOLVED';
  sufficiency: 'SUFFICIENT' | 'PARTIALLY_SUFFICIENT' | 'INSUFFICIENT' | 'NOT_ASSESSABLE';
  authority: 'HIGH' | 'ADEQUATE' | 'QUESTIONABLE' | 'UNKNOWN' | 'NOT_EXTERNALLY_VERIFIED';
  currency: unknown;
  disciplinary_relevance: unknown;
  epistemic_diversity_or_coverage: unknown;
  review_state: string;
  provenance: SimulatorProvenanceRef[];
  origin?: SimulatorOrigin;
  version?: unknown;
  iam_source?: unknown;
  [key: string]: unknown;
}

export interface SimulatorReferenceBinding {
  binding_id: string;
  source_object_id: string;
  reference_text: string;
  resolved_target_id: string | null;
  status: 'RESOLVED' | 'AMBIGUOUS' | 'UNRESOLVED' | 'ABSTAIN';
  candidate_target_ids: string[];
  provenance: SimulatorProvenanceRef[];
  origin?: SimulatorOrigin;
  version?: unknown;
  iam_source?: unknown;
  [key: string]: unknown;
}

export interface SimulatorOntologyGap {
  gap_id: string;
  gap_type: 'ONTOLOGY_GAP';
  description: string;
  source_refs: unknown[];
  affected_object_ids: string[];
  blocking: boolean;
  review_state: 'UNRESOLVED';
  [key: string]: unknown;
}

export interface SimulatorProjectionGap {
  projection_gap_id: string;
  object_or_relation_id: string;
  target_contract: string;
  status: 'UNSUPPORTED_MAPPING';
  reason: string;
  [key: string]: unknown;
}

export interface SimulatorValidation {
  status: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  gate_status: Record<string, unknown>;
  conceptual_blockers: unknown[];
  open_review_items: unknown[];
  ontology_gaps_open: unknown[];
  projection_gaps: unknown[];
  checks: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ConfirmedSimulatedGraphArtifact {
  artifact_type: 'CONFIRMED_SIMULATED_GRAPH';
  contract_version: string;
  case_id: string;
  execution_id: string;
  source_document: Record<string, unknown>;
  execution: Record<string, unknown>;
  entities: SimulatorEntity[];
  relations: SimulatorRelation[];
  premise_groups: SimulatorPremiseGroup[];
  inference_steps: SimulatorInferenceStep[];
  literature_use: SimulatorLiteratureUse[];
  reference_bindings: SimulatorReferenceBinding[];
  ontology_gaps: SimulatorOntologyGap[];
  projection_gaps: SimulatorProjectionGap[];
  validation: SimulatorValidation;
}

export interface SimulatorGraphNode extends SimulatorEntity {
  position: { x: number; y: number };
}

export interface SimulatorGraphEdge extends SimulatorRelation {
  source: string;
  target: string;
}

export type CanonicalSimulatorGraphViewModel = GraphViewModel<SimulatorGraphNode, SimulatorGraphEdge, {
  adapterVersion: 'canonical-simulator-0.1';
  sourceSchemaVersion: string;
  sourceArtifactType: 'CONFIRMED_SIMULATED_GRAPH';
  generatedDeterministically: true;
  premiseGroups: SimulatorPremiseGroup[];
  inferenceSteps: SimulatorInferenceStep[];
  literatureUse: SimulatorLiteratureUse[];
  referenceBindings: SimulatorReferenceBinding[];
  ontologyGaps: SimulatorOntologyGap[];
  projectionGaps: SimulatorProjectionGap[];
  validation: SimulatorValidation;
}>;
