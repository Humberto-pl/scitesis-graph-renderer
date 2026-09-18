import type { GiGraphRenderModel } from '../graph/giGraphRenderAdapter';
import type { DiagnosticBreakpointView, DiagnosticDownstreamEffectView } from './diagnosticGraphViewModel';
import type { GiDiagnosticOverlayModel } from './giDiagnosticOverlayModel';

export type GiDiagnosticConnectorKind = 'BREAKPOINT_ASSOCIATION' | 'DOWNSTREAM_REFERENCE';
export type GiDiagnosticConnectorResolution = 'RESOLVED' | 'SELF_REFERENCE';
export type GiBreakpointConnectorFailure = 'SOURCE_UNRESOLVED' | 'TARGET_UNRESOLVED' | 'BOTH_UNRESOLVED';
export type GiDownstreamConnectorFailure = 'FAILURE_REF_UNRESOLVED' | 'FAILURE_REF_AMBIGUOUS' | 'SOURCE_UNRESOLVED' | 'TARGET_UNRESOLVED' | 'BOTH_ENDPOINTS_UNRESOLVED';

interface GiDiagnosticConnectorBase {
  /** Deterministic ReactFlow identity only; never canonical diagnostic evidence. */
  readonly id: string;
  readonly kind: GiDiagnosticConnectorKind;
  readonly source: string;
  readonly target: string;
  readonly resolution: GiDiagnosticConnectorResolution;
}
export interface GiBreakpointDiagnosticConnector extends GiDiagnosticConnectorBase {
  readonly kind: 'BREAKPOINT_ASSOCIATION';
  readonly recordIndex: number;
  readonly breakpoint: DiagnosticBreakpointView;
}
export interface GiDownstreamDiagnosticConnector extends GiDiagnosticConnectorBase {
  readonly kind: 'DOWNSTREAM_REFERENCE';
  readonly recordIndex: number;
  readonly matchedBreakpointIndex: number;
  readonly matchedBreakpoint: DiagnosticBreakpointView;
  readonly downstreamEffect: DiagnosticDownstreamEffectView;
}
export type GiDiagnosticConnector = GiBreakpointDiagnosticConnector | GiDownstreamDiagnosticConnector;

export interface GiUnresolvedBreakpointConnector {
  readonly recordIndex: number;
  readonly resolution: GiBreakpointConnectorFailure;
  readonly breakpoint: DiagnosticBreakpointView;
}
export interface GiUnresolvedDownstreamConnector {
  readonly recordIndex: number;
  readonly resolution: GiDownstreamConnectorFailure;
  readonly downstreamEffect: DiagnosticDownstreamEffectView;
  readonly matchedBreakpointIndex?: number;
  readonly matchedBreakpoint?: DiagnosticBreakpointView;
  readonly matchingBreakpointIndices: readonly number[];
}
export interface GiDiagnosticConnectorModel {
  readonly connectors: readonly GiDiagnosticConnector[];
  readonly unresolvedBreakpointConnectors: readonly GiUnresolvedBreakpointConnector[];
  readonly unresolvedDownstreamConnectors: readonly GiUnresolvedDownstreamConnector[];
}

const technicalPart = (value: string) => encodeURIComponent(value);

/**
 * Resolves only literal, case-sensitive references. It never traverses G_I,
 * reconstructs a route, or adds connectors to the structural render model.
 */
export function buildGiDiagnosticConnectorModel(
  giModel: GiGraphRenderModel,
  overlay: GiDiagnosticOverlayModel,
): GiDiagnosticConnectorModel {
  const nodeIds = new Set(giModel.nodes.map(node => node.canonicalId));
  const connectors: GiDiagnosticConnector[] = [];
  const unresolvedBreakpointConnectors: GiUnresolvedBreakpointConnector[] = [];
  const unresolvedDownstreamConnectors: GiUnresolvedDownstreamConnector[] = [];

  overlay.breakpoints.forEach((breakpoint, recordIndex) => {
    const source = nodeIds.has(breakpoint.breakpoint_step_id);
    const target = nodeIds.has(breakpoint.affected_transition_target_id);
    if (!source || !target) {
      unresolvedBreakpointConnectors.push({
        recordIndex,
        resolution: !source && !target ? 'BOTH_UNRESOLVED' : !source ? 'SOURCE_UNRESOLVED' : 'TARGET_UNRESOLVED',
        breakpoint: structuredClone(breakpoint),
      });
      return;
    }
    connectors.push({
      id: `diag:breakpoint:${recordIndex}:${technicalPart(breakpoint.breakpoint_id)}`,
      kind: 'BREAKPOINT_ASSOCIATION',
      source: breakpoint.breakpoint_step_id,
      target: breakpoint.affected_transition_target_id,
      resolution: breakpoint.breakpoint_step_id === breakpoint.affected_transition_target_id ? 'SELF_REFERENCE' : 'RESOLVED',
      recordIndex,
      breakpoint: structuredClone(breakpoint),
    });
  });

  overlay.downstreamEffects.forEach((downstreamEffect, recordIndex) => {
    const matchingBreakpointIndices = overlay.breakpoints.flatMap((breakpoint, index) => breakpoint.breakpoint_id === downstreamEffect.failure_ref ? [index] : []);
    if (matchingBreakpointIndices.length !== 1) {
      unresolvedDownstreamConnectors.push({
        recordIndex,
        resolution: matchingBreakpointIndices.length === 0 ? 'FAILURE_REF_UNRESOLVED' : 'FAILURE_REF_AMBIGUOUS',
        downstreamEffect: structuredClone(downstreamEffect),
        matchingBreakpointIndices,
      });
      return;
    }
    const matchedBreakpointIndex = matchingBreakpointIndices[0];
    const matchedBreakpoint = overlay.breakpoints[matchedBreakpointIndex];
    const source = nodeIds.has(matchedBreakpoint.breakpoint_step_id);
    const target = nodeIds.has(downstreamEffect.target_claim_id);
    if (!source || !target) {
      unresolvedDownstreamConnectors.push({
        recordIndex,
        resolution: !source && !target ? 'BOTH_ENDPOINTS_UNRESOLVED' : !source ? 'SOURCE_UNRESOLVED' : 'TARGET_UNRESOLVED',
        downstreamEffect: structuredClone(downstreamEffect),
        matchedBreakpointIndex,
        matchedBreakpoint: structuredClone(matchedBreakpoint),
        matchingBreakpointIndices,
      });
      return;
    }
    connectors.push({
      id: `diag:downstream:${recordIndex}:${technicalPart(downstreamEffect.failure_ref)}:${technicalPart(downstreamEffect.target_claim_id)}`,
      kind: 'DOWNSTREAM_REFERENCE',
      source: matchedBreakpoint.breakpoint_step_id,
      target: downstreamEffect.target_claim_id,
      resolution: matchedBreakpoint.breakpoint_step_id === downstreamEffect.target_claim_id ? 'SELF_REFERENCE' : 'RESOLVED',
      recordIndex,
      matchedBreakpointIndex,
      matchedBreakpoint: structuredClone(matchedBreakpoint),
      downstreamEffect: structuredClone(downstreamEffect),
    });
  });

  return { connectors, unresolvedBreakpointConnectors, unresolvedDownstreamConnectors };
}
