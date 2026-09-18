import type { GiGraphRenderModel } from '../graph/giGraphRenderAdapter';
import type {
  DiagnosticClaimView,
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
}

export interface GiDiagnosticOverlayModel {
  readonly graphRef: string;
  readonly graphVersion: string;
  readonly annotationsByNodeId: ReadonlyMap<string, GiNodeDiagnosticAnnotation>;
  readonly unmatchedClaimIds: readonly string[];
  readonly unmatchedInferenceStepIds: readonly string[];
  readonly unmatchedReviewItemIds: readonly string[];
}

export type GiDiagnosticOverlayResult =
  | { readonly status: 'COMPATIBLE'; readonly overlay: GiDiagnosticOverlayModel }
  | {
      readonly status: 'MISMATCH';
      readonly expectedGraphRef: string;
      readonly expectedGraphVersion: string;
      readonly actualGraphRef: string;
      readonly actualGraphVersion: string;
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
    if (claim || inferenceStep || reviewItems.length > 0 || viableTransitions.length > 0) {
      annotationsByNodeId.set(node.canonicalId, {
        nodeId: node.canonicalId,
        claim: claim === undefined ? undefined : structuredClone(claim),
        inferenceStep: inferenceStep === undefined ? undefined : structuredClone(inferenceStep),
        reviewItems: structuredClone(reviewItems),
        viableTransitions: structuredClone(viableTransitions),
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
    },
  };
}
