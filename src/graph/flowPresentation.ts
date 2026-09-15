import { MarkerType, type Edge } from '@xyflow/react';
import { edgeDisplayLabel, withCanonicalCode } from './displayLabels';
import type { GraphEdge, SimulatorGraphEdge } from './types';
import { canonicalRelationDisplayName } from '../canonical/canonicalRegistry';

type DisplayableEdge = Pick<GraphEdge, 'id' | 'source' | 'target'>;

function toDisplayEdges(
  edges: DisplayableEdge[],
  visibleIds: ReadonlySet<string>,
  labelFor: (edge: DisplayableEdge) => string,
  highlightedEdgeIds?: ReadonlySet<string>,
): Edge[] {
  return edges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: labelFor(edge),
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    className: highlightedEdgeIds && !highlightedEdgeIds.has(edge.id) ? 'dimmed' : highlightedEdgeIds ? 'highlighted' : '',
  }));
}

/** Maps canonical edges to visual edges without changing identity or topology. */
export function createDisplayEdges(
  edges: GraphEdge[],
  visibleIds: ReadonlySet<string>,
  showCodes: boolean,
  highlightedEdgeIds?: ReadonlySet<string>,
): Edge[] {
  return toDisplayEdges(edges, visibleIds, edge => {
    const legacyEdge = edge as GraphEdge;
    return withCanonicalCode(edgeDisplayLabel(legacyEdge.kind), legacyEdge.kind, showCodes);
  }, highlightedEdgeIds);
}

/** Creates React Flow edges while retaining the canonical relation vocabulary and topology. */
export function createCanonicalDisplayEdges(
  edges: SimulatorGraphEdge[],
  visibleIds: ReadonlySet<string>,
  visibleEdgeIds: ReadonlySet<string>,
  showCodes: boolean,
  highlightedEdgeIds?: ReadonlySet<string>,
): Edge[] {
  return toDisplayEdges(edges.filter(edge => visibleEdgeIds.has(edge.id)), visibleIds, edge => {
    const canonicalEdge = edge as SimulatorGraphEdge;
    return withCanonicalCode(
      canonicalRelationDisplayName(canonicalEdge.canonical_type, canonicalEdge.canonical_name),
      canonicalEdge.canonical_type,
      showCodes,
    );
  }, highlightedEdgeIds);
}
