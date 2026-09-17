import type {
  DiagnosticClaimView,
  DiagnosticGraphViewModel,
  DiagnosticInferenceStepView,
  DiagnosticTransitionView,
} from './diagnosticGraphViewModel';

export interface DiagnosticClaimRenderNode {
  id: string;
  kind: 'CLAIM';
  canonicalId: string;
  position: { x: number; y: number };
  claim: DiagnosticClaimView;
}

export interface DiagnosticInferenceRenderNode {
  id: string;
  kind: 'INFERENCE_STEP';
  canonicalId: string;
  position: { x: number; y: number };
  inferenceStep: DiagnosticInferenceStepView;
}

export type DiagnosticRenderNode = DiagnosticClaimRenderNode | DiagnosticInferenceRenderNode;

export interface DiagnosticRenderEdge {
  id: string;
  source: string;
  target: string;
  segment: 'SOURCE_TO_STEP' | 'STEP_TO_TARGET';
  transition: DiagnosticTransitionView;
}

export interface UnavailableSourceReference {
  sourceClaimOrInputId: string;
  inferenceStepId: string;
  targetClaimId: string;
  transitionState: DiagnosticTransitionView['transition_state'];
}

export interface DiagnosticGraphRenderModel {
  nodes: DiagnosticRenderNode[];
  edges: DiagnosticRenderEdge[];
  unavailableSourceReferences: UnavailableSourceReference[];
}

const claimNodeId = (id: string) => `claim:${id}`;
const inferenceNodeId = (id: string) => `inference:${id}`;

/**
 * Maps only canonical claims, inference steps, and explicitly materialized
 * transitions. It intentionally does not inspect any other ViewModel array.
 */
export function adaptDiagnosticGraphForRender(
  viewModel: DiagnosticGraphViewModel,
): DiagnosticGraphRenderModel {
  const claimIds = new Set(viewModel.claims.map(claim => claim.claim_id));
  const inferenceIds = new Set(viewModel.inferenceSteps.map(step => step.inference_step_id));
  const nodes: DiagnosticRenderNode[] = [
    ...viewModel.claims.map((claim, index): DiagnosticClaimRenderNode => ({
      id: claimNodeId(claim.claim_id),
      kind: 'CLAIM',
      canonicalId: claim.claim_id,
      position: { x: 40, y: 40 + index * 170 },
      claim: { ...claim },
    })),
    ...viewModel.inferenceSteps.map((inferenceStep, index): DiagnosticInferenceRenderNode => ({
      id: inferenceNodeId(inferenceStep.inference_step_id),
      kind: 'INFERENCE_STEP',
      canonicalId: inferenceStep.inference_step_id,
      position: { x: 420, y: 40 + index * 170 },
      inferenceStep: { ...inferenceStep },
    })),
  ];
  const edges: DiagnosticRenderEdge[] = [];
  const unavailableSourceReferences: UnavailableSourceReference[] = [];

  viewModel.transitions.forEach((transition, index) => {
    const baseId = `transition:${transition.source_claim_or_input_id}:${transition.inference_step_id}:${transition.target_claim_id}:${index}`;
    const hasInference = inferenceIds.has(transition.inference_step_id);

    if (claimIds.has(transition.source_claim_or_input_id) && hasInference) {
      edges.push({
        id: `${baseId}:source-step`,
        source: claimNodeId(transition.source_claim_or_input_id),
        target: inferenceNodeId(transition.inference_step_id),
        segment: 'SOURCE_TO_STEP',
        transition: { ...transition },
      });
    } else if (!claimIds.has(transition.source_claim_or_input_id)) {
      unavailableSourceReferences.push({
        sourceClaimOrInputId: transition.source_claim_or_input_id,
        inferenceStepId: transition.inference_step_id,
        targetClaimId: transition.target_claim_id,
        transitionState: transition.transition_state,
      });
    }

    if (hasInference && claimIds.has(transition.target_claim_id)) {
      edges.push({
        id: `${baseId}:step-target`,
        source: inferenceNodeId(transition.inference_step_id),
        target: claimNodeId(transition.target_claim_id),
        segment: 'STEP_TO_TARGET',
        transition: { ...transition },
      });
    }
  });

  return { nodes, edges, unavailableSourceReferences };
}
