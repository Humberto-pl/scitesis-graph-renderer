import { describe, expect, it } from 'vitest';
import { computeCanonicalFocusVisibility, resetCanonicalFocus, type CanonicalFocusState } from './canonicalFocus';
import type { CanonicalVisibility } from './canonicalVisibility';
import type { CanonicalSimulatorGraphViewModel } from './types';

const model = {
  nodes: ['A', 'B', 'C', 'D', 'X'].map(id => ({ id })),
  edges: [
    { id: 'AB', source: 'A', target: 'B' },
    { id: 'BC', source: 'B', target: 'C' },
    { id: 'CD', source: 'C', target: 'D' },
    { id: 'CA', source: 'C', target: 'A' },
    { id: 'XB', source: 'X', target: 'B' },
  ],
} as unknown as CanonicalSimulatorGraphViewModel;

const eligible = (nodes = ['A', 'B', 'C', 'D', 'X'], edges = ['AB', 'BC', 'CD', 'CA', 'XB']): CanonicalVisibility => ({
  visibleNodeIds: new Set(nodes), visibleEdgeIds: new Set(edges),
});
const focus = (depth: 1 | 2 | 3, direction: 'both' | 'incoming' | 'outgoing' = 'outgoing', rootNodeId = 'A'): CanonicalFocusState =>
  ({ mode: 'neighborhood', rootNodeId, depth, direction });
const ids = (values: ReadonlySet<string>) => [...values].sort();

describe('computeCanonicalFocusVisibility', () => {
  it('returns the exact eligible visibility object while focus is off', () => {
    const visibility = eligible();
    expect(computeCanonicalFocusVisibility(model, visibility, resetCanonicalFocus())).toBe(visibility);
  });

  it.each([
    [1, ['A', 'B'], ['AB']],
    [2, ['A', 'B', 'C'], ['AB', 'BC', 'CA']],
    [3, ['A', 'B', 'C', 'D'], ['AB', 'BC', 'CA', 'CD']],
  ] as const)('uses bounded outgoing BFS depth %s', (depth, nodes, edges) => {
    const result = computeCanonicalFocusVisibility(model, eligible(), focus(depth));
    expect(ids(result.visibleNodeIds)).toEqual(nodes);
    expect(ids(result.visibleEdgeIds)).toEqual(edges);
  });

  it('applies incoming, outgoing, and both at every hop', () => {
    expect(ids(computeCanonicalFocusVisibility(model, eligible(), focus(1, 'incoming')).visibleNodeIds)).toEqual(['A', 'C']);
    expect(ids(computeCanonicalFocusVisibility(model, eligible(), focus(1, 'outgoing')).visibleNodeIds)).toEqual(['A', 'B']);
    expect(ids(computeCanonicalFocusVisibility(model, eligible(), focus(1, 'both')).visibleNodeIds)).toEqual(['A', 'B', 'C']);
    expect(ids(computeCanonicalFocusVisibility(model, eligible(), focus(2, 'incoming')).visibleNodeIds)).toEqual(['A', 'B', 'C']);
  });

  it('never traverses filtered nodes or edges and retains an isolated eligible root', () => {
    const filtered = eligible(['A', 'B', 'D'], ['AB', 'CD']);
    const result = computeCanonicalFocusVisibility(model, filtered, focus(3, 'both'));
    expect(ids(result.visibleNodeIds)).toEqual(['A', 'B']);
    expect(ids(result.visibleEdgeIds)).toEqual(['AB']);
    const isolated = computeCanonicalFocusVisibility(model, eligible(['D'], []), focus(1, 'both', 'D'));
    expect(ids(isolated.visibleNodeIds)).toEqual(['D']);
    expect(ids(isolated.visibleEdgeIds)).toEqual([]);
  });

  it('handles cycles once, deterministically, without duplicates', () => {
    const first = computeCanonicalFocusVisibility(model, eligible(), focus(3, 'both'));
    const second = computeCanonicalFocusVisibility(model, eligible(), focus(3, 'both'));
    expect(ids(first.visibleNodeIds)).toEqual(ids(second.visibleNodeIds));
    expect(first.visibleNodeIds.size).toBe(ids(first.visibleNodeIds).length);
  });

  it('safely returns eligible visibility for missing or ineligible roots', () => {
    const visibility = eligible(['B'], []);
    expect(computeCanonicalFocusVisibility(model, visibility, focus(1, 'both'))).toBe(visibility);
    expect(computeCanonicalFocusVisibility(model, visibility, focus(1, 'both', 'MISSING'))).toBe(visibility);
  });

  it('does not mutate the model, eligible visibility, or focus state', () => {
    const visibility = eligible();
    const state = focus(3, 'both');
    const nodeIds = [...visibility.visibleNodeIds];
    const edgeIds = [...visibility.visibleEdgeIds];
    const topology = model.edges.map(edge => [edge.id, edge.source, edge.target]);
    computeCanonicalFocusVisibility(model, visibility, state);
    expect([...visibility.visibleNodeIds]).toEqual(nodeIds);
    expect([...visibility.visibleEdgeIds]).toEqual(edgeIds);
    expect(model.edges.map(edge => [edge.id, edge.source, edge.target])).toEqual(topology);
    expect(state).toEqual(focus(3, 'both'));
  });
});
