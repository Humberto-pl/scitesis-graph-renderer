import type { GiGraphRenderModel } from '../graph/giGraphRenderAdapter';
import type {
  DiagnosticClaimView,
  DiagnosticBreakpointView,
  DiagnosticDownstreamEffectView,
  DiagnosticFrontierView,
  DiagnosticGraphViewModel,
  DiagnosticInferenceStepView,
  DiagnosticReviewRequiredView,
  DiagnosticTransitionView,
} from './diagnosticGraphViewModel';

export interface GiNodeDiagnosticAnnotation {
  readonly nodeId: string;
  readonly claim?: DiagnosticClaimView;
  readonly inferenceStep?: DiagnosticInferenceStepView;
  readonly reviewItems: readonly DiagnosticReviewRequiredView[];
  /** Literal H_e records for inspection only; these never become graph edges. */
  readonly viableTransitions: readonly DiagnosticTransitionView[];
  readonly breakpointOrigins: readonly DiagnosticBreakpointView[];
  readonly breakpointTargets: readonly DiagnosticBreakpointView[];
  readonly downstreamEffects: readonly DiagnosticDownstreamEffectView[];
  readonly isFrontierMember: boolean;
}

export interface GiDiagnosticOverlayModel {
  readonly graphRef: string;
  readonly graphVersion: string;
  readonly annotationsByNodeId: ReadonlyMap<string, GiNodeDiagnosticAnnotation>;
  readonly unmatchedClaimIds: readonly string[];
  readonly unmatchedInferenceStepIds: readonly string[];
  readonly unmatchedReviewItemIds: readonly string[];
  readonly frontier: DiagnosticFrontierView;
  /** Complete materialized collection, retained for exact reference resolution only. */
  readonly breakpoints: readonly DiagnosticBreakpointView[];
  readonly unmatchedBreakpointStepIds: readonly string[];
  readonly unmatchedBreakpointTargetIds: readonly string[];
  readonly unmatchedDownstreamEffects: readonly DiagnosticDownstreamEffectView[];
  readonly unmatchedFrontierMemberIds: readonly string[];
}

export type GiDiagnosticOverlayResult =
  | { readonly status: 'COMPATIBLE'; readonly overlay: GiDiagnosticOverlayModel }
  | {
      readonly status: 'MISMATCH';
      readonly expectedGraphRef: string;
      readonly expectedGraphVersion: string;
      readonly actualGraphRef: string;
      readonly actualGraphVersion: string;
    }
  | {
      readonly status: 'AMBIGUOUS_DIAGNOSTIC_IDS';
      readonly duplicateClaimIds: readonly string[];
      readonly duplicateInferenceStepIds: readonly string[];
    };

const duplicateIds = (values: readonly string[]): string[] => {
  const counts = new Map<string, number>();
  values.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
  const emitted = new Set<string>();
  return values.filter(value => {
    if ((counts.get(value) ?? 0) < 2 || emitted.has(value)) return false;
    emitted.add(value);
    return true;
  });
};

/**
 * Associates materialized diagnosis with existing G_I nodes by exact,
 * case-sensitive canonical ID only. It neither derives nor changes topology.
 */
export function buildGiDiagnosticOverlay(
  giModel: GiGraphRenderModel,
  diagnosticModel: DiagnosticGraphViewModel,
): GiDiagnosticOverlayResult {
  const run = diagnosticModel.metadata.run_metadata;
  if (run.graph_ref !== giModel.graphRef || run.graph_version !== giModel.graphVersion) {
    return {
      status: 'MISMATCH',
      expectedGraphRef: run.graph_ref,
      expectedGraphVersion: run.graph_version,
      actualGraphRef: giModel.graphRef,
      actualGraphVersion: giModel.graphVersion,
    };
  }

  const duplicateClaimIds = duplicateIds(diagnosticModel.claims.map(claim => claim.claim_id));
  const duplicateInferenceStepIds = duplicateIds(diagnosticModel.inferenceSteps.map(step => step.inference_step_id));
  if (duplicateClaimIds.length > 0 || duplicateInferenceStepIds.length > 0) {
    return {
      status: 'AMBIGUOUS_DIAGNOSTIC_IDS',
      duplicateClaimIds,
      duplicateInferenceStepIds,
    };
  }

  const nodeIds = new Set(giModel.nodes.map(node => node.canonicalId));
  const claims = new Map(diagnosticModel.claims.map(claim => [claim.claim_id, claim]));
  const inferenceSteps = new Map(diagnosticModel.inferenceSteps.map(step => [step.inference_step_id, step]));
  const annotationsByNodeId = new Map<string, GiNodeDiagnosticAnnotation>();

  for (const node of giModel.nodes) {
    const claim = claims.get(node.canonicalId);
    const inferenceStep = inferenceSteps.get(node.canonicalId);
    const reviewItems = diagnosticModel.reviewRequiredItems.filter(item => item.subject_ref === node.canonicalId);
    const viableTransitions = diagnosticModel.transitions.filter(transition =>
      transition.source_claim_or_input_id === node.canonicalId
      || transition.inference_step_id === node.canonicalId
      || transition.target_claim_id === node.canonicalId);
    const breakpointOrigins = diagnosticModel.breakpoints.filter(item => item.breakpoint_step_id === node.canonicalId);
    const breakpointTargets = diagnosticModel.breakpoints.filter(item => item.affected_transition_target_id === node.canonicalId);
    const downstreamEffects = diagnosticModel.downstreamEffects.filter(item => item.target_claim_id === node.canonicalId);
    const isFrontierMember = diagnosticModel.frontier.member_claim_ids.includes(node.canonicalId);
    if (claim || inferenceStep || reviewItems.length > 0 || viableTransitions.length > 0 || breakpointOrigins.length > 0 || breakpointTargets.length > 0 || downstreamEffects.length > 0 || isFrontierMember) {
      annotationsByNodeId.set(node.canonicalId, {
        nodeId: node.canonicalId,
        claim: claim === undefined ? undefined : structuredClone(claim),
        inferenceStep: inferenceStep === undefined ? undefined : structuredClone(inferenceStep),
        reviewItems: structuredClone(reviewItems),
        viableTransitions: structuredClone(viableTransitions),
        breakpointOrigins: structuredClone(breakpointOrigins),
        breakpointTargets: structuredClone(breakpointTargets),
        downstreamEffects: structuredClone(downstreamEffects),
        isFrontierMember,
      });
    }
  }

  return {
    status: 'COMPATIBLE',
    overlay: {
      graphRef: giModel.graphRef,
      graphVersion: giModel.graphVersion,
      annotationsByNodeId,
      unmatchedClaimIds: diagnosticModel.claims.filter(claim => !nodeIds.has(claim.claim_id)).map(claim => claim.claim_id),
      unmatchedInferenceStepIds: diagnosticModel.inferenceSteps.filter(step => !nodeIds.has(step.inference_step_id)).map(step => step.inference_step_id),
      unmatchedReviewItemIds: diagnosticModel.reviewRequiredItems.filter(item => !nodeIds.has(item.subject_ref)).map(item => item.item_id),
      frontier: structuredClone(diagnosticModel.frontier),
      breakpoints: structuredClone(diagnosticModel.breakpoints),
      unmatchedBreakpointStepIds: diagnosticModel.breakpoints.filter(item => !nodeIds.has(item.breakpoint_step_id)).map(item => item.breakpoint_step_id),
      unmatchedBreakpointTargetIds: diagnosticModel.breakpoints.filter(item => !nodeIds.has(item.affected_transition_target_id)).map(item => item.affected_transition_target_id),
      unmatchedDownstreamEffects: structuredClone(diagnosticModel.downstreamEffects.filter(item => !nodeIds.has(item.target_claim_id))),
      unmatchedFrontierMemberIds: diagnosticModel.frontier.member_claim_ids.filter(id => !nodeIds.has(id)),
    },
  };
}
