import type { DiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import type { TraceItem } from './types';

export type DiagnosticTraceSourceType =
  | 'RUN_METADATA'
  | 'CLAIM'
  | 'INFERENCE_STEP'
  | 'TRANSITION'
  | 'BREAKPOINT'
  | 'DOWNSTREAM'
  | 'FRONTIER'
  | 'REVIEW_REQUIRED_ITEM';

export interface DiagnosticTraceReferenceGroup {
  kind: string;
  refs: string[];
}

export interface DiagnosticTraceLiteralField {
  name: string;
  value: string | null;
}

/** Renderer-neutral, literal trace data. References intentionally remain unresolved. */
export interface DiagnosticTracePanelModel {
  sourceType: DiagnosticTraceSourceType;
  sourceId: string;
  explanationTrace: TraceItem[];
  provenanceRefs: string[];
  adjudicationRefs: string[];
  diagnosticConditionRefs: string[];
  defeaterRefs: string[];
  alternativeRouteRefs: string[];
  otherRefs: DiagnosticTraceReferenceGroup[];
  literalFields: DiagnosticTraceLiteralField[];
}

const copyTrace = (trace: TraceItem[]) => trace.map(item => ({ ...item }));
const refs = (kind: string, values: string[]): DiagnosticTraceReferenceGroup => ({ kind, refs: [...values] });
const base = (sourceType: DiagnosticTraceSourceType, sourceId: string, explanationTrace: TraceItem[] = []): DiagnosticTracePanelModel => ({
  sourceType, sourceId, explanationTrace: copyTrace(explanationTrace), provenanceRefs: [], adjudicationRefs: [],
  diagnosticConditionRefs: [], defeaterRefs: [], alternativeRouteRefs: [], otherRefs: [], literalFields: [],
});

/**
 * Copies only fields materialized in the ViewModel. It performs no IO, lookup,
 * sorting, aggregation, topology reconstruction, or G_I/G_D resolution.
 */
export function buildDiagnosticTracePanelModels(viewModel: DiagnosticGraphViewModel): DiagnosticTracePanelModel[] {
  const run = base('RUN_METADATA', 'run-metadata');
  run.adjudicationRefs = [...viewModel.metadata.run_metadata.active_adjudication_refs];
  run.diagnosticConditionRefs = [...viewModel.metadata.run_metadata.active_diagnostic_condition_refs];
  run.defeaterRefs = [...viewModel.metadata.run_metadata.active_defeater_refs];

  const claims = viewModel.claims.map(claim => {
    const model = base('CLAIM', `claim:${claim.claim_id}`, claim.explanation_trace);
    model.diagnosticConditionRefs = [...claim.blocking_condition_ids];
    model.defeaterRefs = [...claim.active_defeater_ids];
    model.otherRefs = [refs('Viable derivation IDs', claim.viable_derivation_ids), refs('Blocked derivation IDs', claim.blocked_derivation_ids)];
    return model;
  });
  const inferenceSteps = viewModel.inferenceSteps.map(step => {
    const model = base('INFERENCE_STEP', `inference:${step.inference_step_id}`, step.explanation_trace);
    model.otherRefs = [refs('Supporting diagnostic evidence IDs', step.supporting_diagnostic_evidence_ids)];
    return model;
  });
  const transitions = viewModel.transitions.map((transition, index) => {
    const model = base('TRANSITION', `transition:${transition.source_claim_or_input_id}:${transition.inference_step_id}:${transition.target_claim_id}:${index}`);
    model.provenanceRefs = [...transition.provenance_refs];
    model.alternativeRouteRefs = [...transition.alternative_route_refs];
    return model;
  });
  const breakpoints = viewModel.breakpoints.map(breakpoint => {
    const model = base('BREAKPOINT', `breakpoint:${breakpoint.breakpoint_id}`, breakpoint.explanation_trace);
    model.otherRefs = [
      refs('Route or path ref', [breakpoint.route_or_path_ref]),
      refs('Origin of failure ref', breakpoint.origin_of_failure_ref === null ? [] : [breakpoint.origin_of_failure_ref]),
      refs('Breakpoint step ID', [breakpoint.breakpoint_step_id]),
      refs('Affected transition target ID', [breakpoint.affected_transition_target_id]),
      refs('Active defeater or blocking condition ref', breakpoint.active_defeater_or_blocking_condition_ref === null ? [] : [breakpoint.active_defeater_or_blocking_condition_ref]),
    ];
    return model;
  });
  const downstream = viewModel.downstreamEffects.map((effect, index) => {
    const model = base('DOWNSTREAM', `downstream:${effect.failure_ref}:${effect.target_claim_id}:${index}`, effect.explanation_trace);
    model.alternativeRouteRefs = [...effect.alternative_route_refs];
    model.otherRefs = [refs('Failure ref', [effect.failure_ref]), refs('Required dependency refs', effect.required_dependency_refs), refs('Lost viable derivation IDs', effect.lost_viable_derivation_ids), refs('Remaining viable derivation IDs', effect.remaining_viable_derivation_ids)];
    return model;
  });
  const frontier = base('FRONTIER', 'defendability-frontier', viewModel.frontier.explanation_trace);
  frontier.adjudicationRefs = [...viewModel.frontier.active_adjudication_refs];
  frontier.otherRefs = [refs('Member claim IDs', viewModel.frontier.member_claim_ids)];

  const reviewItems = viewModel.reviewRequiredItems.map(item => {
    const model = base('REVIEW_REQUIRED_ITEM', `review:${item.item_id}`);
    model.otherRefs = [refs('Subject ref', [item.subject_ref]), refs('Recommended adjudication target', item.recommended_adjudication_target === null ? [] : [item.recommended_adjudication_target])];
    model.literalFields = [
      { name: 'Item ID', value: item.item_id }, { name: 'Subject ref', value: item.subject_ref },
      { name: 'Review reason', value: item.review_reason }, { name: 'Blocking question', value: item.blocking_question },
      { name: 'Possible impact', value: item.possible_impact }, { name: 'Recommended adjudication target', value: item.recommended_adjudication_target },
    ];
    return model;
  });
  return [run, ...claims, ...inferenceSteps, ...transitions, ...breakpoints, ...downstream, frontier, ...reviewItems];
}
