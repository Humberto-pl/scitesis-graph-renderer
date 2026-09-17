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
  transitionKey: string;
  source: string;
  target: string;
  segment: 'SOURCE_TO_STEP' | 'STEP_TO_TARGET';
  source_claim_or_input_id: string;
  inference_step_id: string;
  target_claim_id: string;
  transition_state: DiagnosticTransitionView['transition_state'];
  required_for_step: DiagnosticTransitionView['required_for_step'];
  required_for_target: DiagnosticTransitionView['required_for_target'];
  alternative_route_refs: string[];
  why_active: string;
  provenance_refs: string[];
  transition: DiagnosticTransitionView;
}

export type UnavailableTransitionReferenceRole = 'SOURCE' | 'INFERENCE' | 'TARGET';

export interface UnavailableTransitionReference {
  role: UnavailableTransitionReferenceRole;
  canonicalId: string;
  transitionKey: string;
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
  unavailableTransitionReferences: UnavailableTransitionReference[];
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
  const unavailableTransitionReferences: UnavailableTransitionReference[] = [];

  viewModel.transitions.forEach((transition, index) => {
    const transitionKey = `transition:${transition.source_claim_or_input_id}:${transition.inference_step_id}:${transition.target_claim_id}:${index}`;
    const hasInference = inferenceIds.has(transition.inference_step_id);
    const hasSource = claimIds.has(transition.source_claim_or_input_id);
    const hasTarget = claimIds.has(transition.target_claim_id);
    const transitionCopy: DiagnosticTransitionView = {
      ...transition,
      alternative_route_refs: [...transition.alternative_route_refs],
      provenance_refs: [...transition.provenance_refs],
    };
    const commonEdgeFields = {
      transitionKey,
      source_claim_or_input_id: transition.source_claim_or_input_id,
      inference_step_id: transition.inference_step_id,
      target_claim_id: transition.target_claim_id,
      transition_state: transition.transition_state,
      required_for_step: transition.required_for_step,
      required_for_target: transition.required_for_target,
      alternative_route_refs: [...transition.alternative_route_refs],
      why_active: transition.why_active,
      provenance_refs: [...transition.provenance_refs],
      transition: transitionCopy,
    };

    if (hasSource && hasInference) {
      edges.push({
        ...commonEdgeFields,
        id: `${transitionKey}:source-step`,
        source: claimNodeId(transition.source_claim_or_input_id),
        target: inferenceNodeId(transition.inference_step_id),
        segment: 'SOURCE_TO_STEP',
      });
    } else if (!hasSource) {
      unavailableSourceReferences.push({
        sourceClaimOrInputId: transition.source_claim_or_input_id,
        inferenceStepId: transition.inference_step_id,
        targetClaimId: transition.target_claim_id,
        transitionState: transition.transition_state,
      });
      unavailableTransitionReferences.push({ role: 'SOURCE', canonicalId: transition.source_claim_or_input_id, transitionKey });
    }

    if (!hasInference) {
      unavailableTransitionReferences.push({ role: 'INFERENCE', canonicalId: transition.inference_step_id, transitionKey });
    }
    if (!hasTarget) {
      unavailableTransitionReferences.push({ role: 'TARGET', canonicalId: transition.target_claim_id, transitionKey });
    }

    if (hasInference && hasTarget) {
      edges.push({
        ...commonEdgeFields,
        id: `${transitionKey}:step-target`,
        source: inferenceNodeId(transition.inference_step_id),
        target: claimNodeId(transition.target_claim_id),
        segment: 'STEP_TO_TARGET',
      });
    }
  });

  return { nodes, edges, unavailableSourceReferences, unavailableTransitionReferences };
}
