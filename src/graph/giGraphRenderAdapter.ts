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

/** Deterministic, topology-preserving layout over the materialized relations. */
function positions(viewModel: GiGraphViewModel, direction: GiLayoutDirection): Map<string, { x: number; y: number }> {
  const ids = new Set(viewModel.nodes.map(node => node.id));
  const rank = new Map(viewModel.nodes.map(node => [node.id, 0]));
  // A bounded relaxation gives DAGs useful ranks and remains deterministic for cycles.
  for (let pass = 0; pass < viewModel.nodes.length; pass += 1) {
    let changed = false;
    for (const edge of viewModel.edges) {
      if (!ids.has(edge.source_id) || !ids.has(edge.target_id)) continue;
      const candidate = Math.min((rank.get(edge.source_id) ?? 0) + 1, viewModel.nodes.length - 1);
      if (candidate > (rank.get(edge.target_id) ?? 0)) { rank.set(edge.target_id, candidate); changed = true; }
    }
    if (!changed) break;
  }
  const row = new Map<number, number>();
  return new Map(viewModel.nodes.map(node => {
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
  const layout = positions(viewModel, options.direction ?? 'LR');
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
    edges: viewModel.edges.map(relation => ({
      id: relation.id,
      canonicalId: relation.id,
      canonicalType: relation.canonical_type,
      source: relation.source_id,
      target: relation.target_id,
      relation,
    })),
    metadata: viewModel.metadata,
  };
}
