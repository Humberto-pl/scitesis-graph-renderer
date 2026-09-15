import { describe, expect, it } from 'vitest';
import qualisJson from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from './types';
import { computeCanonicalVisibility, deriveAvailableCanonicalFilters, isCanonicalFilterActive, resetCanonicalFilters, type CanonicalVisibilityFilterState } from './canonicalVisibility';

const model = buildCanonicalSimulatorGraphViewModel(qualisJson as ConfirmedSimulatedGraphArtifact);
const selected = (...values: string[]) => ({ mode: 'selected' as const, values: new Set(values) });
const filters = (changes: Partial<CanonicalVisibilityFilterState> = {}): CanonicalVisibilityFilterState => ({ ...resetCanonicalFilters(), ...changes });

const expectTopologyUnchanged = (before: typeof model) => {
  expect(model.nodes.length).toBe(before.nodes.length);
  expect(model.edges.length).toBe(before.edges.length);
  expect(model.nodes.map(({ id, canonical_type, canonical_name }) => ({ id, canonical_type, canonical_name })))
    .toEqual(before.nodes.map(({ id, canonical_type, canonical_name }) => ({ id, canonical_type, canonical_name })));
  expect(model.edges.map(({ id, source, target, canonical_type, canonical_name }) => ({ id, source, target, canonical_type, canonical_name })))
    .toEqual(before.edges.map(({ id, source, target, canonical_type, canonical_name }) => ({ id, source, target, canonical_type, canonical_name })));
  expect(model).toEqual(before);
};

describe('canonical visibility engine', () => {
  it('shows the complete current ViewModel when no dimension is restricted', () => {
    const visibility = computeCanonicalVisibility(model, resetCanonicalFilters());
    expect([...visibility.visibleNodeIds]).toEqual(model.nodes.map(node => node.id));
    expect([...visibility.visibleEdgeIds]).toEqual(model.edges.map(edge => edge.id));
    expect(isCanonicalFilterActive(resetCanonicalFilters())).toBe(false);
  });

  it('derives available values from the graph and excludes null without inventing a category', () => {
    const available = deriveAvailableCanonicalFilters(model);
    expect(available.entityTypes).toContain('ENT-011');
    expect(available.relationTypes).toContain('REL-067');
    expect(available.epistemicPlanes).toEqual(['EXTERNAL', 'STUDY']);
    expect(available.entityTypes.length).toBeLessThan(39);
    expect(available.relationTypes.length).toBeLessThan(74);
  });

  it('filters entity types without mutating any model identity, topology, metadata, or artifact-owned value', () => {
    const before = structuredClone(model);
    const visibility = computeCanonicalVisibility(model, filters({ entityTypes: selected('ENT-011') }));
    expect(visibility.visibleNodeIds.size).toBeGreaterThan(0);
    expect([...visibility.visibleNodeIds].every(id => model.nodes.find(node => node.id === id)?.canonical_type === 'ENT-011')).toBe(true);
    expectTopologyUnchanged(before);
  });

  it('filters relation types without removing nodes', () => {
    const visibility = computeCanonicalVisibility(model, filters({ relationTypes: selected('REL-067') }));
    expect(visibility.visibleNodeIds.size).toBe(model.nodes.length);
    expect(visibility.visibleEdgeIds.size).toBeGreaterThan(0);
    expect([...visibility.visibleEdgeIds].every(id => model.edges.find(edge => edge.id === id)?.canonical_type === 'REL-067')).toBe(true);
  });

  it('applies epistemic plane only to nodes and hides edges only through their endpoints', () => {
    const visibility = computeCanonicalVisibility(model, filters({ epistemicPlanes: selected('EXTERNAL') }));
    expect([...visibility.visibleNodeIds].every(id => model.nodes.find(node => node.id === id)?.epistemic_plane === 'EXTERNAL')).toBe(true);
    const expectedEdges = model.edges.filter(edge => visibility.visibleNodeIds.has(edge.source) && visibility.visibleNodeIds.has(edge.target));
    expect([...visibility.visibleEdgeIds]).toEqual(expectedEdges.map(edge => edge.id));
  });

  it('uses OR within review state and explicitness dimensions', () => {
    const review = computeCanonicalVisibility(model, filters({ reviewStates: selected('CONFIRMED', 'PROBABLE') }));
    const explicitness = computeCanonicalVisibility(model, filters({ explicitnessValues: selected('EXPLICIT', 'IMPLICIT_RECONSTRUCTED') }));
    expect(review.visibleNodeIds.size).toBe(model.nodes.length);
    expect(review.visibleEdgeIds.size).toBe(model.edges.length);
    expect(explicitness.visibleNodeIds.size).toBe(model.nodes.length);
    expect(explicitness.visibleEdgeIds.size).toBe(model.edges.length);
  });

  it('uses AND between dimensions and applies review/explicitness literally to nodes and edges', () => {
    const state = filters({ entityTypes: selected('ENT-011', 'ENT-023'), epistemicPlanes: selected('STUDY'), reviewStates: selected('CONFIRMED'), explicitnessValues: selected('EXPLICIT') });
    const visibility = computeCanonicalVisibility(model, state);
    for (const id of visibility.visibleNodeIds) {
      const node = model.nodes.find(candidate => candidate.id === id)!;
      expect(['ENT-011', 'ENT-023']).toContain(node.canonical_type);
      expect(node).toMatchObject({ epistemic_plane: 'STUDY', review_state: 'CONFIRMED', explicitness: 'EXPLICIT' });
    }
    for (const id of visibility.visibleEdgeIds) {
      const edge = model.edges.find(candidate => candidate.id === id)!;
      expect(edge).toMatchObject({ review_state: 'CONFIRMED', explicitness: 'EXPLICIT' });
    }
  });

  it('requires both visible endpoints and a matching REL filter, without letting edges hide nodes', () => {
    const relation = model.edges.find(edge => edge.canonical_type === 'REL-067')!;
    const endpointTypes = model.nodes.filter(node => node.id === relation.source || node.id === relation.target).map(node => node.canonical_type);
    const matching = computeCanonicalVisibility(model, filters({ entityTypes: selected(...endpointTypes), relationTypes: selected('REL-067') }));
    expect(matching.visibleEdgeIds.has(relation.id)).toBe(true);
    const sourceHidden = computeCanonicalVisibility(model, filters({ entityTypes: selected(model.nodes.find(node => node.id === relation.target)!.canonical_type), relationTypes: selected('REL-067') }));
    if (!sourceHidden.visibleNodeIds.has(relation.source)) expect(sourceHidden.visibleEdgeIds.has(relation.id)).toBe(false);
    const relHidden = computeCanonicalVisibility(model, filters({ relationTypes: selected('REL-003') }));
    expect(relHidden.visibleNodeIds.size).toBe(model.nodes.length);
    expect(relHidden.visibleEdgeIds.has(relation.id)).toBe(false);
  });

  it('distinguishes an unrestricted dimension from an explicitly empty selection and reset restores all IDs', () => {
    const none = computeCanonicalVisibility(model, filters({ entityTypes: selected() }));
    expect(none.visibleNodeIds.size).toBe(0);
    expect(none.visibleEdgeIds.size).toBe(0);
    const reset = computeCanonicalVisibility(model, resetCanonicalFilters());
    expect([...reset.visibleNodeIds]).toEqual(model.nodes.map(node => node.id));
    expect([...reset.visibleEdgeIds]).toEqual(model.edges.map(edge => edge.id));
  });

  it('is deterministic and does not mutate the full model', () => {
    const before = structuredClone(model);
    const state = filters({ reviewStates: selected('CONFIRMED'), relationTypes: selected('REL-067', 'REL-068') });
    const first = computeCanonicalVisibility(model, state);
    const second = computeCanonicalVisibility(model, state);
    expect([...second.visibleNodeIds]).toEqual([...first.visibleNodeIds]);
    expect([...second.visibleEdgeIds]).toEqual([...first.visibleEdgeIds]);
    expectTopologyUnchanged(before);
  });
});
