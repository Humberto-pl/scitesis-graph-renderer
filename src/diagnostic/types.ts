/** TypeScript representation of Diagnostic Output v0.1.2.
 *
 * This module models the diagnostic contract verbatim. It deliberately does not
 * translate diagnostic values into the renderer's legacy view-model concepts.
 */
export const DEFENDIBILITY_VALUES = ['TRUE', 'FALSE', 'UNKNOWN'] as const;
export type DefendibilityValue = (typeof DEFENDIBILITY_VALUES)[number];

export const ACTIVITY_VALUES = ['ACTIVE', 'INACTIVE', 'UNKNOWN'] as const;
export type ActivityValue = (typeof ACTIVITY_VALUES)[number];

export const REVIEW_STATUSES = ['RESOLVED', 'REVIEW_REQUIRED'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface DiagnosticArtifactRef {
  artifact_id: string;
  uri: string | null;
  sha256: string | null;
}

export interface DiagnosticRunMetadata {
  run_id: string;
  generated_at: string;
  diagnostic_engine: string;
  diagnostic_engine_version: string;
}

export interface DiagnosticScope {
  root_claim_ids: string[];
  claim_ids: string[];
  inference_ids: string[];
}

export interface DiagnosticState {
  Def_e: DefendibilityValue;
  Active_e: ActivityValue;
  review_status: ReviewStatus;
}

export interface InferenceState extends DiagnosticState {
  inference_id: string;
  reason_codes: string[];
}

export interface ClaimState extends DiagnosticState {
  claim_id: string;
  H_e_ids: string[];
  route_ids: string[];
  reason_codes: string[];
}

export interface DiagnosticHypothesis extends DiagnosticState {
  H_e_id: string;
  claim_id: string;
  inference_ids: string[];
}

export interface DiagnosticDerivation {
  sequence: number;
  inference_id: string;
  premise_ids: string[];
  conclusion_id: string;
}

export interface DiagnosticRoute extends DiagnosticState {
  route_id: string;
  target_claim_id: string;
  derivations: DiagnosticDerivation[];
}

export type DiagnosticSubjectType = 'CLAIM' | 'INFERENCE';

export interface DiagnosticBreakpoint {
  breakpoint_id: string;
  subject_id: string;
  subject_type: DiagnosticSubjectType;
  route_id: string | null;
  reason_code: string;
  review_status: ReviewStatus;
}

export type DownstreamEffectKind =
  | 'DEACTIVATED'
  | 'DEFENDIBILITY_CHANGED'
  | 'REVIEW_REQUIRED';

export interface DownstreamEffect {
  source_id: string;
  affected_id: string;
  effect: DownstreamEffectKind;
  path: string[];
}

export interface DiagnosticFrontierItem {
  claim_id: string;
  reason_code: string;
  review_status: ReviewStatus;
}

/** Compatibility-only projection supplied by the producer; never inferred here. */
export interface DiagnosticCompatibilityMaximum {
  claim_id: string;
  route_id: string | null;
}

export interface DiagnosticReviewRequiredItem {
  item_id: string;
  subject_id: string;
  reason_code: string;
  message: string;
}

export interface DiagnosticExplanation {
  summary: string | null;
  reason_codes: Record<string, string>;
}

export interface DiagnosticTraceEvent {
  sequence: number;
  rule_id: string;
  subject_id: string;
  input_refs: string[];
  output_refs: string[];
}

export interface DiagnosticOutputV012 {
  artifact_type: 'DIAGNOSTIC_OUTPUT';
  contract_version: '0.1.2';
  run: DiagnosticRunMetadata;
  graph_ref: DiagnosticArtifactRef;
  diagnostic_graph_ref: DiagnosticArtifactRef;
  scope: DiagnosticScope;
  inference_states: InferenceState[];
  claim_states: ClaimState[];
  H_e: DiagnosticHypothesis[];
  routes: DiagnosticRoute[];
  breakpoints: DiagnosticBreakpoint[];
  downstream_effects: DownstreamEffect[];
  frontier: DiagnosticFrontierItem[];
  compatibility_maximums: DiagnosticCompatibilityMaximum[];
  review_required_items: DiagnosticReviewRequiredItem[];
  explanation: DiagnosticExplanation;
  trace: DiagnosticTraceEvent[];
}
