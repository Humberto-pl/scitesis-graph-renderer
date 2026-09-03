import type { GraphEdge, GraphNode, GraphViewModel } from './types';

export type LayoutState = Record<string, GraphNode['position']>;

export const initialLayoutState = (model: GraphViewModel): LayoutState => Object.fromEntries(
  model.nodes.map(node => [node.id, { ...node.position }]),
);

export const moveNode = (layout: LayoutState, id: string, position: GraphNode['position']): LayoutState =>
  layout[id] ? { ...layout, [id]: { ...position } } : layout;

export const resetLayout = (model: GraphViewModel): LayoutState => initialLayoutState(model);

export interface HighlightPath { nodeIds: Set<string>; edgeIds: Set<string> }

/** Returns only the connected trajectory encoded by existing edges; it never synthesizes a relation. */
export function existingHighlightPath(model: GraphViewModel, selectedId: string): HighlightPath {
  const nodeIds = new Set([selectedId]);
  const edgeIds = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    model.edges.forEach(edge => {
      if (nodeIds.has(edge.source) || nodeIds.has(edge.target)) {
        edgeIds.add(edge.id);
        if (!nodeIds.has(edge.source)) { nodeIds.add(edge.source); changed = true; }
        if (!nodeIds.has(edge.target)) { nodeIds.add(edge.target); changed = true; }
      }
    });
  }
  return { nodeIds, edgeIds };
}

export const edgeTopology = (edges: GraphEdge[]) => edges.map(({ id, source, target, kind }) => ({ id, source, target, kind }));
