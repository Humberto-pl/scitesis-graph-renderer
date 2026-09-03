export const NODE_KINDS = ['CLAIM','SUBCLAIM','EVIDENCE','METHOD','INSTRUMENT','SAMPLE','TEST','RULE','STATE','REPAIR','AGGREGATION'] as const;
export type NodeKind = typeof NODE_KINDS[number];
export const EDGE_KINDS = ['SUPPORTS','MEASURES','ESTIMATES','TARGETS','DEPENDS_ON','DERIVED_FROM','CONTRADICTS','RESTRICTS','REQUIRES','DECOMPOSES_TO','AGGREGATES_TO','FIRES_ON'] as const;
export type EdgeKind = typeof EDGE_KINDS[number];
export const DIAGNOSTIC_STATES = ['DEFENDIBLE','DEFENDIBLE_CON_RESTRICCIONES','NO_SOSTENIDO_EN_SU_FORMULACION_ACTUAL','NO_RESPALDADO_POR_DATOS_DEL_ESTUDIO','NO_ADJUDICABLE_HASTA_RECONCILIACION','NO_EXIGIBLE_AUN','JUSTIFICACION_DE_RECOMENDACION_LIMITADA','HIPOTESIS_PLAUSIBLE_NO_DEMOSTRADA'] as const;
export type DiagnosticState = typeof DIAGNOSTIC_STATES[number];
export interface CanonicalEntity { id: string; kind: NodeKind; text?: string; sourceRefs?: string[]; [key: string]: unknown }
export interface CanonicalRelation { id?: string; sourceId: string; targetId: string; kind: EdgeKind; label?: string }
export interface CandidateArtifact { caseId: string; schemaVersion?: string; claims: Array<CanonicalEntity & { decomposition?: 'COMPOSITE_SEPARABLE' | 'INDIVISIBLE'; subclaims?: CanonicalEntity[] }>; entities?: CanonicalEntity[]; relations?: CanonicalRelation[] }
export interface DiagnosisEntry { subjectId: string; state?: DiagnosticState; rules?: string[]; supportPath?: string[]; maximumDefendableClaim?: string; gravity?: string; reparability?: string }
export interface DiagnosisArtifact { caseId?: string; entries?: DiagnosisEntry[]; entities?: CanonicalEntity[]; relations?: CanonicalRelation[] }
export interface GraphNode { id: string; canonicalId: string; kind: NodeKind; label: string; text?: string; state?: DiagnosticState; rules: string[]; supportPath: string[]; sourceRefs: string[]; maximumDefendableClaim?: string; gravity?: string; reparability?: string; parentClaimId?: string; position: { x: number; y: number }; collapsible?: 'subclaims'|'evidence' }
export interface GraphEdge { id: string; source: string; target: string; kind: EdgeKind; label: string }
export interface GraphViewModel { graphId: string; sourceCaseId: string; nodes: GraphNode[]; edges: GraphEdge[]; metadata: { adapterVersion: '0.1'; sourceSchemaVersion: string; generatedDeterministically: true } }
export interface GraphOptions { direction?: 'LR'|'TB' }
