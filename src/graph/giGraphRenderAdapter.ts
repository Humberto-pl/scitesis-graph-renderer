import type { GiGraphEdge, GiGraphNode, GiGraphViewModel } from './giGraphViewModel';

export type GiLayoutDirection = 'LR' | 'TB';

export interface GiRenderNode {
  readonly id: string;
  readonly canonicalId: string;
  readonly canonicalType: string;
  readonly label: string;
  readonly position: Readonly<{ x: number; y: number }>;
  readonly entity: GiGraphNode;
}

export interface GiRenderEdge {
  readonly id: string;
  readonly canonicalId: string;
  readonly canonicalType: string;
  readonly source: string;
  readonly target: string;
  readonly relation: GiGraphEdge;
}

export interface GiGraphRenderModel {
  readonly graphId: string;
  readonly graphRef: string;
  readonly graphVersion: string;
  readonly nodes: readonly GiRenderNode[];
  readonly edges: readonly GiRenderEdge[];
  readonly metadata: GiGraphViewModel['metadata'];
}

export interface GiGraphRenderOptions { readonly direction?: GiLayoutDirection }

interface LayoutNode { readonly id: string }
interface LayoutEdge { readonly source: string; readonly target: string }

/** Deterministic, topology-preserving layout over the materialized relations. */
function positions(nodes: readonly LayoutNode[], edges: readonly LayoutEdge[], direction: GiLayoutDirection): Map<string, { x: number; y: number }> {
  const ids = new Set(nodes.map(node => node.id));
  const rank = new Map(nodes.map(node => [node.id, 0]));
  // A bounded relaxation gives DAGs useful ranks and remains deterministic for cycles.
  for (let pass = 0; pass < nodes.length; pass += 1) {
    let changed = false;
    for (const edge of edges) {
      if (!ids.has(edge.source) || !ids.has(edge.target)) continue;
      const candidate = Math.min((rank.get(edge.source) ?? 0) + 1, nodes.length - 1);
      if (candidate > (rank.get(edge.target) ?? 0)) { rank.set(edge.target, candidate); changed = true; }
    }
    if (!changed) break;
  }
  const row = new Map<number, number>();
  return new Map(nodes.map(node => {
    const level = rank.get(node.id) ?? 0;
    const index = row.get(level) ?? 0;
    row.set(level, index + 1);
    return [node.id, direction === 'LR' ? { x: level * 330, y: index * 150 } : { x: index * 300, y: level * 170 }];
  }));
}

/**
 * Adds only ReactFlow identities, endpoints, labels and coordinates. The
 * structural objects and metadata remain available verbatim for inspection.
 */
export function adaptGiGraphForRender(viewModel: GiGraphViewModel, options: GiGraphRenderOptions = {}): GiGraphRenderModel {
  const renderEdges = viewModel.edges.map(relation => ({
    id: relation.id,
    canonicalId: relation.id,
    canonicalType: relation.canonical_type,
    source: relation.source_id,
    target: relation.target_id,
    relation,
  }));
  const layout = positions(viewModel.nodes, renderEdges, options.direction ?? 'LR');
  return {
    graphId: viewModel.graphId,
    graphRef: viewModel.graphRef,
    graphVersion: viewModel.graphVersion,
    nodes: viewModel.nodes.map(entity => ({
      id: entity.id,
      canonicalId: entity.id,
      canonicalType: entity.canonical_type,
      label: entity.label ?? entity.text ?? entity.canonical_name ?? entity.id,
      position: layout.get(entity.id)!,
      entity,
    })),
    edges: renderEdges,
    metadata: viewModel.metadata,
  };
}

/** Returns the same render projection with only deterministic positions replaced. */
export function layoutGiRenderModel(model: GiGraphRenderModel, direction: GiLayoutDirection): GiGraphRenderModel {
  const layout = positions(model.nodes, model.edges, direction);
  return {
    ...model,
    nodes: model.nodes.map(node => ({ ...node, position: layout.get(node.id)! })),
  };
}
