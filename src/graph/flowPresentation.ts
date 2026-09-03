import { MarkerType, type Edge } from '@xyflow/react';
import { edgeDisplayLabel, withCanonicalCode } from './displayLabels';
import type { GraphEdge } from './types';

/** Maps canonical edges to visual edges without changing identity or topology. */
export function createDisplayEdges(
  edges: GraphEdge[],
  visibleIds: ReadonlySet<string>,
  showCodes: boolean,
  highlightedEdgeIds?: ReadonlySet<string>,
): Edge[] {
  return edges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: withCanonicalCode(edgeDisplayLabel(edge.kind), edge.kind, showCodes),
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    className: highlightedEdgeIds && !highlightedEdgeIds.has(edge.id) ? 'dimmed' : highlightedEdgeIds ? 'highlighted' : '',
  }));
}
