import type { CanonicalVisibility } from './canonicalVisibility';
import type { CanonicalSimulatorGraphViewModel, GraphNode, SimulatorGraphNode } from './types';

export type CanonicalLayoutDirection = 'LR' | 'TB';

export interface CanonicalLayoutOptions {
  readonly direction?: CanonicalLayoutDirection;
}

export const CANONICAL_LAYOUT_DEFAULT_DIRECTION: CanonicalLayoutDirection = 'LR';
export const NODE_X_GAP = 360;
export const NODE_Y_GAP = 150;
export const COMPONENT_GAP = 300;
export const BAND_GAP = 90;

type Position = GraphNode['position'];
type Component = { ids: string[]; minimumId: string };

const compareText = (left: string, right: string) => left.localeCompare(right);
const planeKey = (node: SimulatorGraphNode) => node.epistemic_plane ?? '';

/** UI-only label for a missing artifact value; it is not an epistemic-plane value. */
export const epistemicPlaneBandLabel = (plane: string | null): string => plane ?? 'Unspecified';

/**
 * Computes presentation positions for an already-resolved visible canonical graph. It never
 * creates semantic objects or relations and never writes to the ViewModel or visibility sets.
 */
export function computeCanonicalLayout(
  model: CanonicalSimulatorGraphViewModel,
  visibility: CanonicalVisibility,
  options: CanonicalLayoutOptions = {},
): ReadonlyMap<string, Position> {
  const direction = options.direction ?? CANONICAL_LAYOUT_DEFAULT_DIRECTION;
  const visibleIds = new Set(model.nodes.filter(node => visibility.visibleNodeIds.has(node.id)).map(node => node.id));
  if (!visibleIds.size) return new Map();

  const nodesById = new Map(model.nodes.filter(node => visibleIds.has(node.id)).map(node => [node.id, node]));
  const edges = model.edges.filter(edge => visibility.visibleEdgeIds.has(edge.id)
    && visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const neighbors = new Map([...visibleIds].map(id => [id, new Set<string>()]));
  for (const edge of edges) {
    neighbors.get(edge.source)!.add(edge.target);
    neighbors.get(edge.target)!.add(edge.source);
  }

  const unseen = new Set(visibleIds);
  const components: Component[] = [];
  while (unseen.size) {
    const seed = [...unseen].sort(compareText)[0];
    const queue = [seed];
    unseen.delete(seed);
    const ids: string[] = [];
    while (queue.length) {
      const id = queue.shift()!;
      ids.push(id);
      for (const neighbor of [...neighbors.get(id)!].sort(compareText)) {
        if (unseen.delete(neighbor)) queue.push(neighbor);
      }
    }
    ids.sort(compareText);
    components.push({ ids, minimumId: ids[0] });
  }
  components.sort((a, b) => b.ids.length - a.ids.length || compareText(a.minimumId, b.minimumId));

  const positions = new Map<string, Position>();
  let componentOffset = 0;
  for (const component of components) {
    const componentSet = new Set(component.ids);
    const componentEdges = edges.filter(edge => componentSet.has(edge.source) && componentSet.has(edge.target));
    const layers = directedLayers(component.ids, componentEdges);
    const degrees = new Map(component.ids.map(id => [id, neighbors.get(id)!.size]));
    const planes = [...new Set(component.ids.map(id => planeKey(nodesById.get(id)!)))].sort((a, b) => {
      if (a === '') return 1;
      if (b === '') return -1;
      return compareText(a, b);
    });
    const planeOffsets = new Map<string, number>();
    let minorCursor = 0;
    for (const plane of planes) {
      planeOffsets.set(plane, minorCursor);
      const count = component.ids.filter(id => planeKey(nodesById.get(id)!) === plane).length;
      minorCursor += Math.max(1, count) * NODE_Y_GAP + BAND_GAP;
    }
    const usedInPlane = new Map<string, number>();
    const ordered = [...component.ids].sort((a, b) => {
      const layerDifference = layers.get(a)! - layers.get(b)!;
      if (layerDifference) return layerDifference;
      const planeDifference = planes.indexOf(planeKey(nodesById.get(a)!)) - planes.indexOf(planeKey(nodesById.get(b)!));
      if (planeDifference) return planeDifference;
      const degreeDifference = degrees.get(b)! - degrees.get(a)!;
      if (degreeDifference) return degreeDifference;
      const typeDifference = compareText(nodesById.get(a)!.canonical_type, nodesById.get(b)!.canonical_type);
      return typeDifference || compareText(a, b);
    });
    for (const id of ordered) {
      const plane = planeKey(nodesById.get(id)!);
      const index = usedInPlane.get(plane) ?? 0;
      usedInPlane.set(plane, index + 1);
      const major = layers.get(id)! * NODE_X_GAP;
      const minor = componentOffset + planeOffsets.get(plane)! + index * NODE_Y_GAP;
      positions.set(id, direction === 'LR' ? { x: major, y: minor } : { x: minor, y: major });
    }
    componentOffset += minorCursor + COMPONENT_GAP;
  }
  return positions;
}

/** Kahn-style layering; deterministic cycle breaking is local and never changes actual edges. */
function directedLayers(ids: readonly string[], edges: readonly { source: string; target: string }[]): Map<string, number> {
  const incoming = new Map(ids.map(id => [id, 0]));
  const outgoing = new Map(ids.map(id => [id, [] as string[]]));
  for (const edge of edges) {
    if (edge.source === edge.target) continue;
    incoming.set(edge.target, incoming.get(edge.target)! + 1);
    outgoing.get(edge.source)!.push(edge.target);
  }
  outgoing.forEach(targets => targets.sort(compareText));
  const remaining = new Set(ids);
  const layers = new Map<string, number>();
  while (remaining.size) {
    let ready = [...remaining].filter(id => incoming.get(id) === 0).sort(compareText);
    if (!ready.length) ready = [[...remaining].sort(compareText)[0]];
    for (const id of ready) {
      remaining.delete(id);
      const layer = layers.get(id) ?? 0;
      layers.set(id, layer);
      for (const target of outgoing.get(id)!) {
        if (!remaining.has(target)) continue;
        layers.set(target, Math.max(layers.get(target) ?? 0, layer + 1));
        incoming.set(target, incoming.get(target)! - 1);
      }
    }
  }
  return layers;
}
