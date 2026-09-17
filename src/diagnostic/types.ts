/** Canonical SciTesis Diagnostic Output contract, schema version 0.1.2. */
export const DIAGNOSTIC_OUTPUT_SCHEMA_VERSION = '0.1.2' as const;

export const TRI_STATE_VALUES = ['TRUE', 'FALSE', 'UNKNOWN'] as const;
export type TriState = (typeof TRI_STATE_VALUES)[number];

export const RESOLUTION_STATUS_VALUES = ['RESOLVED', 'REVIEW_REQUIRED'] as const;
export type ResolutionStatus = (typeof RESOLUTION_STATUS_VALUES)[number];

export const TRACE_KIND_VALUES = [
  'ORIGIN',
  'DIAGNOSTIC_EVIDENCE',
  'INFERENCE_STEP',
  'LOST_ROUTE',
  'ALTERNATIVE_ROUTE',
  'DEFENDIBILITY_DECISION',
  'FRONTIER_DECISION',
  'OTHER',
] as const;
export type TraceKind = (typeof TRACE_KIND_VALUES)[number];

export const DIAGNOSTIC_GRAPH_ORIGIN_VALUES = ['PROVIDED', 'DERIVED'] as const;
export type DiagnosticGraphOrigin = (typeof DIAGNOSTIC_GRAPH_ORIGIN_VALUES)[number];

export const SIMULATOR_OR_ENGINE_VALUES = ['SIMULATOR_AI', 'DIAGNOSTIC_ENGINE'] as const;
export type SimulatorOrEngine = (typeof SIMULATOR_OR_ENGINE_VALUES)[number];

export const ACTIVE_STATE_VALUES = ['ACTIVE', 'INACTIVE', 'UNKNOWN'] as const;
export type ActiveState = (typeof ACTIVE_STATE_VALUES)[number];

export const FAILURE_MODE_VALUES = [
  'UNSATISFIED_REQUIRED_PREMISE',
  'UNSATISFIED_REQUIRED_WARRANT_OR_ASSUMPTION',
  'INAPPLICABLE_STEP',
  'UNDERCUT_INFERENCE',
  'UNDERMINED_REQUIRED_INPUT',
  'REBUTTED_CONCLUSION',
  'BLOCKING_DIAGNOSTIC_CONDITION',
  null,
] as const;
export type FailureMode = (typeof FAILURE_MODE_VALUES)[number];

export const AFFECTED_STATE_VALUES = ['AFFECTED', 'NOT_AFFECTED', 'UNKNOWN'] as const;
export type AffectedState = (typeof AFFECTED_STATE_VALUES)[number];

export const MAXIMUM_KIND_VALUES = ['TRUE_GLOBAL_MAXIMUM', 'ROUTE_LOCAL_MAXIMUM'] as const;
export type MaximumKind = (typeof MAXIMUM_KIND_VALUES)[number];

export const SUMMARY_STATUS_VALUES = ['COMPLETE', 'PARTIAL_REVIEW_REQUIRED'] as const;
export type SummaryStatus = (typeof SUMMARY_STATUS_VALUES)[number];

export interface TraceItem {
  sequence: number;
  trace_kind: TraceKind;
  subject_ref: string | null;
  rule_ref: string | null;
  message: string;
}

export interface RunMetadata {
  run_id: string;
  graph_ref: string;
  graph_version: string;
  diagnostic_graph_ref: string;
  diagnostic_graph_version: string;
  diagnostic_graph_origin: DiagnosticGraphOrigin;
  evaluation_state_id: string;
  diagnostic_rule_version: string;
  simulator_or_engine: SimulatorOrEngine;
  implementation_version: string;
  active_adjudication_refs: string[];
  active_diagnostic_condition_refs: string[];
  active_defeater_refs: string[];
}

export interface DiagnosticScope {
  scope_id: string;
  target_claim_ids: string[];
  objective_refs: string[];
  component_refs: string[];
  scope_payload: Record<string, unknown> | null;
  scope_status: ResolutionStatus;
  scope_notes: string | null;
}

export interface InferenceStepState {
  inference_step_id: string;
  active_state: ActiveState;
  activity_adjudication_status: ResolutionStatus;
  required_inputs_satisfied: TriState;
  applicable: TriState;
  defeated: TriState;
  blocking_reasons: string[];
  supporting_diagnostic_evidence_ids: string[];
  rule_version: string;
  explanation_trace: TraceItem[];
}

export interface ClaimDefendibility {
  claim_id: string;
  scope_id: string;
  def_e_value: TriState;
  /** The schema permits any string except REVIEW_REQUIRED, or null. */
  defendibility_state: string | null;
  adjudication_status: ResolutionStatus;
  viable_derivation_ids: string[];
  blocked_derivation_ids: string[];
  blocking_condition_ids: string[];
  active_defeater_ids: string[];
  maximum_defensible_reformulation: string | null;
  explanation_trace: TraceItem[];
  rule_version: string;
}

export interface ViableTransition {
  source_claim_or_input_id: string;
  inference_step_id: string;
  target_claim_id: string;
  transition_state: 'ACTIVE';
  required_for_step: TriState;
  required_for_target: TriState;
  alternative_route_refs: string[];
  why_active: string;
  provenance_refs: string[];
}

export interface ViableDependencyView {
  view_id: string;
  scope_id: string;
  evaluation_state_id: string;
  transitions: ViableTransition[];
  view_status: ResolutionStatus;
  derivation_rule_version: string;
}

export interface Breakpoint {
  breakpoint_id: string;
  scope_id: string;
  route_or_path_ref: string;
  origin_of_failure_ref: string | null;
  breakpoint_step_id: string;
  affected_transition_target_id: string;
  failure_mode: FailureMode;
  active_defeater_or_blocking_condition_ref: string | null;
  first_break_on_route: TriState;
  adjudication_status: ResolutionStatus;
  explanation_trace: TraceItem[];
}

export interface DownstreamEffect {
  failure_ref: string;
  target_claim_id: string;
  affected_state: AffectedState;
  adjudication_status: ResolutionStatus;
  lost_viable_derivation_ids: string[];
  remaining_viable_derivation_ids: string[];
  required_dependency_refs: string[];
  alternative_route_refs: string[];
  propagation_reason: string | null;
  explanation_trace: TraceItem[];
}

export interface DefendabilityFrontier {
  scope_id: string;
  evaluation_state_id: string;
  member_claim_ids: string[];
  frontier_cardinality: number;
  graph_version: string;
  diagnostic_rule_version: string;
  active_adjudication_refs: string[];
  frontier_status: ResolutionStatus;
  explanation_trace: TraceItem[];
}

export interface CompatibilityMaximum {
  scope_id: string;
  route_or_path_ref: string | null;
  claim_id: string;
  maximum_kind: MaximumKind;
  basis: string;
}

export interface ReviewRequiredItem {
  item_id: string;
  subject_ref: string;
  review_reason: string;
  blocking_question: string;
  possible_impact: string;
  recommended_adjudication_target: string | null;
}

export interface ExplanationSummary {
  summary_status: SummaryStatus;
  primary_findings: string[];
  frontier_summary: string;
  breakpoint_summary: string;
  propagation_summary: string;
  review_required_summary: string[];
}

export interface DiagnosticOutput {
  schema_version: typeof DIAGNOSTIC_OUTPUT_SCHEMA_VERSION;
  run_metadata: RunMetadata;
  scope: DiagnosticScope;
  inference_step_states: InferenceStepState[];
  claim_defendibility: ClaimDefendibility[];
  viable_dependency_view: ViableDependencyView;
  breakpoints: Breakpoint[];
  downstream_effects: DownstreamEffect[];
  defendability_frontier: DefendabilityFrontier;
  compatibility_maximums: CompatibilityMaximum[];
  review_required_items: ReviewRequiredItem[];
  explanation_summary: ExplanationSummary;
}
