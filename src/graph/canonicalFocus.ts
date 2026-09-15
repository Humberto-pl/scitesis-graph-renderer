import type { CanonicalVisibility } from './canonicalVisibility';
import type { CanonicalSimulatorGraphViewModel } from './types';

export type CanonicalFocusDepth = 1 | 2 | 3;
export type CanonicalFocusDirection = 'both' | 'incoming' | 'outgoing';
export type CanonicalFocusState =
  | { readonly mode: 'off' }
  | {
      readonly mode: 'neighborhood';
      readonly rootNodeId: string;
      readonly depth: CanonicalFocusDepth;
      readonly direction: CanonicalFocusDirection;
    };

export const resetCanonicalFocus = (): CanonicalFocusState => ({ mode: 'off' });

export const isCanonicalFocusActive = (
  focus: CanonicalFocusState,
): focus is Extract<CanonicalFocusState, { mode: 'neighborhood' }> => focus.mode === 'neighborhood';

/**
 * Applies a bounded, topological neighborhood as a second visibility layer. Invalid or
 * ineligible roots safely behave as focus-off; callers may also use that condition to reset UI
 * state. The model, eligible visibility, and focus state are read only and are never mutated.
 */
export function computeCanonicalFocusVisibility(
  model: CanonicalSimulatorGraphViewModel,
  eligibleVisibility: CanonicalVisibility,
  focus: CanonicalFocusState,
): CanonicalVisibility {
  if (!isCanonicalFocusActive(focus)) return eligibleVisibility;

  const modelNodeIds = new Set(model.nodes.map(node => node.id));
  if (!modelNodeIds.has(focus.rootNodeId) || !eligibleVisibility.visibleNodeIds.has(focus.rootNodeId)) {
    return eligibleVisibility;
  }

  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const edge of model.edges) {
    if (!eligibleVisibility.visibleEdgeIds.has(edge.id)
      || !eligibleVisibility.visibleNodeIds.has(edge.source)
      || !eligibleVisibility.visibleNodeIds.has(edge.target)) continue;
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
    incoming.set(edge.target, [...(incoming.get(edge.target) ?? []), edge.source]);
  }

  const visibleNodeIds = new Set<string>([focus.rootNodeId]);
  let frontier = [focus.rootNodeId];
  for (let distance = 1; distance <= focus.depth && frontier.length; distance += 1) {
    const next: string[] = [];
    for (const nodeId of frontier) {
      const neighbors = focus.direction === 'outgoing' ? outgoing.get(nodeId) ?? []
        : focus.direction === 'incoming' ? incoming.get(nodeId) ?? []
          : [...(outgoing.get(nodeId) ?? []), ...(incoming.get(nodeId) ?? [])];
      for (const neighborId of neighbors) {
        if (!visibleNodeIds.has(neighborId)) {
          visibleNodeIds.add(neighborId);
          next.push(neighborId);
        }
      }
    }
    frontier = next;
  }

  const visibleEdgeIds = new Set(model.edges.filter(edge =>
    eligibleVisibility.visibleEdgeIds.has(edge.id)
    && visibleNodeIds.has(edge.source)
    && visibleNodeIds.has(edge.target),
  ).map(edge => edge.id));

  return { visibleNodeIds, visibleEdgeIds };
}
