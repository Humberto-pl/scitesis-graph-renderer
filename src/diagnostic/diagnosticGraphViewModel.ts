import type {
  Breakpoint,
  ClaimDefendibility,
  CompatibilityMaximum,
  DefendabilityFrontier,
  DiagnosticOutput,
  DownstreamEffect,
  ExplanationSummary,
  InferenceStepState,
  ReviewRequiredItem,
  TraceItem,
  ViableTransition,
} from './types';

export type DiagnosticClaimView = ClaimDefendibility;
export type DiagnosticInferenceStepView = InferenceStepState;
export type DiagnosticTransitionView = ViableTransition;
export type DiagnosticBreakpointView = Breakpoint;
export type DiagnosticDownstreamEffectView = DownstreamEffect;
export type DiagnosticFrontierView = DefendabilityFrontier;
export type DiagnosticCompatibilityMaximumView = CompatibilityMaximum;
export type DiagnosticReviewRequiredView = ReviewRequiredItem;

/** Canonical run, scope, viable-view, and summary context retained for future views. */
export interface DiagnosticGraphMetadataView {
  schema_version: DiagnosticOutput['schema_version'];
  run_metadata: DiagnosticOutput['run_metadata'];
  scope: DiagnosticOutput['scope'];
  viable_dependency_view: Omit<DiagnosticOutput['viable_dependency_view'], 'transitions'>;
  explanation_summary: ExplanationSummary;
}

/**
 * A renderer-neutral projection of an already validated Diagnostic Output.
 * Arrays remain the canonical authorities; this model deliberately adds no
 * inferred relationships, rankings, lookup collision policy, or visual state.
 */
export interface DiagnosticGraphViewModel {
  metadata: DiagnosticGraphMetadataView;
  claims: DiagnosticClaimView[];
  inferenceSteps: DiagnosticInferenceStepView[];
  transitions: DiagnosticTransitionView[];
  breakpoints: DiagnosticBreakpointView[];
  downstreamEffects: DiagnosticDownstreamEffectView[];
  frontier: DiagnosticFrontierView;
  compatibilityMaximums: DiagnosticCompatibilityMaximumView[];
  reviewRequiredItems: DiagnosticReviewRequiredView[];
}

const copyStrings = (values: string[]): string[] => [...values];
const copyTrace = (trace: TraceItem[]): TraceItem[] => trace.map(item => ({ ...item }));

/**
 * Projects canonical fields 1:1 without validating or deriving diagnostic
 * semantics. The loader is the validation boundary and must run beforehand.
 */
export function buildDiagnosticGraphViewModel(
  output: DiagnosticOutput,
): DiagnosticGraphViewModel {
  const { transitions, ...viableDependencyMetadata } = output.viable_dependency_view;

  return {
    metadata: {
      schema_version: output.schema_version,
      run_metadata: {
        ...output.run_metadata,
        active_adjudication_refs: copyStrings(output.run_metadata.active_adjudication_refs),
        active_diagnostic_condition_refs: copyStrings(output.run_metadata.active_diagnostic_condition_refs),
        active_defeater_refs: copyStrings(output.run_metadata.active_defeater_refs),
      },
      scope: {
        ...output.scope,
        target_claim_ids: copyStrings(output.scope.target_claim_ids),
        objective_refs: copyStrings(output.scope.objective_refs),
        component_refs: copyStrings(output.scope.component_refs),
        scope_payload: output.scope.scope_payload === null
          ? null
          : structuredClone(output.scope.scope_payload),
      },
      viable_dependency_view: { ...viableDependencyMetadata },
      explanation_summary: {
        ...output.explanation_summary,
        primary_findings: copyStrings(output.explanation_summary.primary_findings),
        review_required_summary: copyStrings(output.explanation_summary.review_required_summary),
      },
    },
    claims: output.claim_defendibility.map(claim => ({
      ...claim,
      viable_derivation_ids: copyStrings(claim.viable_derivation_ids),
      blocked_derivation_ids: copyStrings(claim.blocked_derivation_ids),
      blocking_condition_ids: copyStrings(claim.blocking_condition_ids),
      active_defeater_ids: copyStrings(claim.active_defeater_ids),
      explanation_trace: copyTrace(claim.explanation_trace),
    })),
    inferenceSteps: output.inference_step_states.map(step => ({
      ...step,
      blocking_reasons: copyStrings(step.blocking_reasons),
      supporting_diagnostic_evidence_ids: copyStrings(step.supporting_diagnostic_evidence_ids),
      explanation_trace: copyTrace(step.explanation_trace),
    })),
    transitions: transitions.map(transition => ({
      ...transition,
      alternative_route_refs: copyStrings(transition.alternative_route_refs),
      provenance_refs: copyStrings(transition.provenance_refs),
    })),
    breakpoints: output.breakpoints.map(breakpoint => ({
      ...breakpoint,
      explanation_trace: copyTrace(breakpoint.explanation_trace),
    })),
    downstreamEffects: output.downstream_effects.map(effect => ({
      ...effect,
      lost_viable_derivation_ids: copyStrings(effect.lost_viable_derivation_ids),
      remaining_viable_derivation_ids: copyStrings(effect.remaining_viable_derivation_ids),
      required_dependency_refs: copyStrings(effect.required_dependency_refs),
      alternative_route_refs: copyStrings(effect.alternative_route_refs),
      explanation_trace: copyTrace(effect.explanation_trace),
    })),
    frontier: {
      ...output.defendability_frontier,
      member_claim_ids: copyStrings(output.defendability_frontier.member_claim_ids),
      active_adjudication_refs: copyStrings(output.defendability_frontier.active_adjudication_refs),
      explanation_trace: copyTrace(output.defendability_frontier.explanation_trace),
    },
    compatibilityMaximums: output.compatibility_maximums.map(maximum => ({ ...maximum })),
    reviewRequiredItems: output.review_required_items.map(item => ({ ...item })),
  };
}
