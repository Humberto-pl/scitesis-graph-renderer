import type {
  DiagnosticClaimView,
  DiagnosticBreakpointView,
  DiagnosticDownstreamEffectView,
  DiagnosticFrontierView,
  DiagnosticGraphViewModel,
  DiagnosticInferenceStepView,
  DiagnosticTransitionView,
} from './diagnosticGraphViewModel';
import { buildDiagnosticTracePanelModels, type DiagnosticTracePanelModel } from './diagnosticTracePanelModel';

export interface DiagnosticClaimRenderNode {
  id: string;
  kind: 'CLAIM';
  canonicalId: string;
  position: { x: number; y: number };
  claim: DiagnosticClaimView;
  downstreamEffectIds: string[];
  isFrontierMember: boolean;
}

export interface DiagnosticInferenceRenderNode {
  id: string;
  kind: 'INFERENCE_STEP';
  canonicalId: string;
  position: { x: number; y: number };
  inferenceStep: DiagnosticInferenceStepView;
  breakpointIds: string[];
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

export interface DiagnosticBreakpointRenderItem {
  id: string;
  canonicalId: string;
  breakpoint: DiagnosticBreakpointView;
  inferenceNodeId: string | null;
  targetClaimNodeId: string | null;
  downstreamEffectIds: string[];
}

/** The id is renderer-only: the canonical downstream record has no id. */
export interface DiagnosticDownstreamEffectRenderItem {
  id: string;
  downstreamEffect: DiagnosticDownstreamEffectView;
  targetClaimNodeId: string | null;
  relatedBreakpointId: string | null;
}

/** The fixed id is renderer-only; Diagnostic Output materializes one frontier per output. */
export interface DiagnosticFrontierRenderItem {
  id: 'defendability-frontier';
  frontier: DiagnosticFrontierView;
  visibleMemberClaimNodeIds: string[];
  unavailableMemberClaimIds: string[];
}

export type UnavailableDiagnosticReferenceRole =
  | 'BREAKPOINT_STEP'
  | 'BREAKPOINT_TARGET'
  | 'DOWNSTREAM_TARGET'
  | 'FAILURE_REF';

export interface UnavailableDiagnosticReference {
  role: UnavailableDiagnosticReferenceRole;
  canonicalId: string;
  ownerId: string;
}

export interface DiagnosticGraphRenderModel {
  nodes: DiagnosticRenderNode[];
  edges: DiagnosticRenderEdge[];
  unavailableSourceReferences: UnavailableSourceReference[];
  unavailableTransitionReferences: UnavailableTransitionReference[];
  breakpoints: DiagnosticBreakpointRenderItem[];
  downstreamEffects: DiagnosticDownstreamEffectRenderItem[];
  frontier: DiagnosticFrontierRenderItem;
  unavailableDiagnosticReferences: UnavailableDiagnosticReference[];
  traceSources: DiagnosticTracePanelModel[];
}

const claimNodeId = (id: string) => `claim:${id}`;
const inferenceNodeId = (id: string) => `inference:${id}`;

/**
 * Maps canonical materialized records without deriving diagnostic relationships.
 * Frontier membership comes exclusively from frontier.member_claim_ids.
 */
export function adaptDiagnosticGraphForRender(
  viewModel: DiagnosticGraphViewModel,
): DiagnosticGraphRenderModel {
  const claimIds = new Set(viewModel.claims.map(claim => claim.claim_id));
  const inferenceIds = new Set(viewModel.inferenceSteps.map(step => step.inference_step_id));
  const breakpointCanonicalIds = new Set(viewModel.breakpoints.map(item => item.breakpoint_id));
  const frontierMemberIds = new Set(viewModel.frontier.member_claim_ids);
  const frontier: DiagnosticFrontierRenderItem = {
    id: 'defendability-frontier',
    frontier: {
      ...viewModel.frontier,
      member_claim_ids: [...viewModel.frontier.member_claim_ids],
      active_adjudication_refs: [...viewModel.frontier.active_adjudication_refs],
      explanation_trace: viewModel.frontier.explanation_trace.map(item => ({ ...item })),
    },
    visibleMemberClaimNodeIds: viewModel.frontier.member_claim_ids.filter(id => claimIds.has(id)).map(claimNodeId),
    unavailableMemberClaimIds: viewModel.frontier.member_claim_ids.filter(id => !claimIds.has(id)),
  };
  const downstreamEffects: DiagnosticDownstreamEffectRenderItem[] = viewModel.downstreamEffects.map((effect, index) => {
    const id = `downstream:${effect.failure_ref}:${effect.target_claim_id}:${index}`;
    return {
      id,
      downstreamEffect: {
        ...effect,
        lost_viable_derivation_ids: [...effect.lost_viable_derivation_ids],
        remaining_viable_derivation_ids: [...effect.remaining_viable_derivation_ids],
        required_dependency_refs: [...effect.required_dependency_refs],
        alternative_route_refs: [...effect.alternative_route_refs],
        explanation_trace: effect.explanation_trace.map(item => ({ ...item })),
      },
      targetClaimNodeId: claimIds.has(effect.target_claim_id) ? claimNodeId(effect.target_claim_id) : null,
      relatedBreakpointId: breakpointCanonicalIds.has(effect.failure_ref) ? `breakpoint:${effect.failure_ref}` : null,
    };
  });
  const breakpoints: DiagnosticBreakpointRenderItem[] = viewModel.breakpoints.map(breakpoint => {
    const id = `breakpoint:${breakpoint.breakpoint_id}`;
    return {
      id,
      canonicalId: breakpoint.breakpoint_id,
      breakpoint: {
        ...breakpoint,
        explanation_trace: breakpoint.explanation_trace.map(item => ({ ...item })),
      },
      inferenceNodeId: inferenceIds.has(breakpoint.breakpoint_step_id) ? inferenceNodeId(breakpoint.breakpoint_step_id) : null,
      targetClaimNodeId: claimIds.has(breakpoint.affected_transition_target_id) ? claimNodeId(breakpoint.affected_transition_target_id) : null,
      downstreamEffectIds: downstreamEffects
        .filter(effect => effect.downstreamEffect.failure_ref === breakpoint.breakpoint_id)
        .map(effect => effect.id),
    };
  });
  const nodes: DiagnosticRenderNode[] = [
    ...viewModel.claims.map((claim, index): DiagnosticClaimRenderNode => ({
      id: claimNodeId(claim.claim_id),
      kind: 'CLAIM',
      canonicalId: claim.claim_id,
      position: { x: 40, y: 40 + index * 170 },
      claim: { ...claim },
      downstreamEffectIds: downstreamEffects.filter(effect => effect.downstreamEffect.target_claim_id === claim.claim_id).map(effect => effect.id),
      isFrontierMember: frontierMemberIds.has(claim.claim_id),
    })),
    ...viewModel.inferenceSteps.map((inferenceStep, index): DiagnosticInferenceRenderNode => ({
      id: inferenceNodeId(inferenceStep.inference_step_id),
      kind: 'INFERENCE_STEP',
      canonicalId: inferenceStep.inference_step_id,
      position: { x: 420, y: 40 + index * 170 },
      inferenceStep: { ...inferenceStep },
      breakpointIds: breakpoints.filter(item => item.breakpoint.breakpoint_step_id === inferenceStep.inference_step_id).map(item => item.id),
    })),
  ];
  const edges: DiagnosticRenderEdge[] = [];
  const unavailableSourceReferences: UnavailableSourceReference[] = [];
  const unavailableTransitionReferences: UnavailableTransitionReference[] = [];
  const unavailableDiagnosticReferences: UnavailableDiagnosticReference[] = [];

  breakpoints.forEach(item => {
    if (item.inferenceNodeId === null) unavailableDiagnosticReferences.push({ role: 'BREAKPOINT_STEP', canonicalId: item.breakpoint.breakpoint_step_id, ownerId: item.id });
    if (item.targetClaimNodeId === null) unavailableDiagnosticReferences.push({ role: 'BREAKPOINT_TARGET', canonicalId: item.breakpoint.affected_transition_target_id, ownerId: item.id });
  });
  downstreamEffects.forEach(item => {
    if (item.targetClaimNodeId === null) unavailableDiagnosticReferences.push({ role: 'DOWNSTREAM_TARGET', canonicalId: item.downstreamEffect.target_claim_id, ownerId: item.id });
    if (item.relatedBreakpointId === null) unavailableDiagnosticReferences.push({ role: 'FAILURE_REF', canonicalId: item.downstreamEffect.failure_ref, ownerId: item.id });
  });

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

  return { nodes, edges, unavailableSourceReferences, unavailableTransitionReferences, breakpoints, downstreamEffects, frontier, unavailableDiagnosticReferences, traceSources: buildDiagnosticTracePanelModels(viewModel) };
}
