import type { GraphEdge, GraphNode, GraphOptions } from './types';

const rank: Record<GraphNode['kind'], number> = { EVIDENCE:0,METHOD:0,INSTRUMENT:0,SAMPLE:0,TEST:0,RULE:1,REPAIR:1,SUBCLAIM:2,CLAIM:3,AGGREGATION:4,STATE:5 };
export function layoutGraph(nodes: Omit<GraphNode,'position'>[], _edges: GraphEdge[], options: GraphOptions = {}): GraphNode[] {
  const groups = new Map<number, typeof nodes>();
  [...nodes].sort((a,b)=>a.id.localeCompare(b.id)).forEach(node => groups.set(rank[node.kind], [...(groups.get(rank[node.kind]) ?? []), node]));
  const direction = options.direction ?? 'LR';
  return [...groups.entries()].sort(([a],[b])=>a-b).flatMap(([column, group]) => group.map((node,row) => ({ ...node, position: direction === 'LR' ? { x: column*340, y: row*190 } : { x: row*340, y: column*190 } })));
}
