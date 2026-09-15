import { describe, expect, it } from 'vitest';
import qualisArtifactJson from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './canonicalSimulatorAdapter';
import { computeCanonicalLayout, epistemicPlaneBandLabel, NODE_X_GAP } from './canonicalLayout';
import type { CanonicalVisibility } from './canonicalVisibility';
import type { CanonicalSimulatorGraphViewModel, ConfirmedSimulatedGraphArtifact, SimulatorGraphEdge } from './types';

const model = buildCanonicalSimulatorGraphViewModel(qualisArtifactJson as ConfirmedSimulatedGraphArtifact);
const visibility = (nodeIds: string[], edgeIds = model.edges.filter(edge => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)).map(edge => edge.id)): CanonicalVisibility => ({
  visibleNodeIds: new Set(nodeIds),
  visibleEdgeIds: new Set(edgeIds),
});
const fullVisibility = visibility(model.nodes.map(node => node.id), model.edges.map(edge => edge.id));
const entries = (positions: ReadonlyMap<string, { x: number; y: number }>) => [...positions.entries()];

describe('computeCanonicalLayout', () => {
  it('is deterministic, finite, collision-free for full QUALIS, and includes only visible nodes', () => {
    const first = computeCanonicalLayout(model, fullVisibility);
    const second = computeCanonicalLayout(model, fullVisibility);
    expect(entries(second)).toEqual(entries(first));
    expect(first.size).toBe(model.nodes.length);
    expect([...first.values()].every(position => Number.isFinite(position.x) && Number.isFinite(position.y))).toBe(true);
    expect(new Set([...first.values()].map(position => `${position.x}:${position.y}`))).toHaveLength(first.size);

    const subset = visibility(model.nodes.slice(0, 4).map(node => node.id));
    expect([...computeCanonicalLayout(model, subset).keys()].sort()).toEqual([...subset.visibleNodeIds].sort());
  });

  it('does not mutate the model, visibility, metadata, identity, or topology', () => {
    const modelSnapshot = structuredClone(model);
    const nodesBefore = model.nodes.map(({ id, canonical_type, position, ...metadata }) => ({ id, canonical_type, position, metadata }));
    const edgesBefore = model.edges.map(({ id, source, target, ...metadata }) => ({ id, source, target, metadata }));
    const nodeIdsBefore = [...fullVisibility.visibleNodeIds];
    const edgeIdsBefore = [...fullVisibility.visibleEdgeIds];
    computeCanonicalLayout(model, fullVisibility);
    expect(model).toEqual(modelSnapshot);
    expect(model.nodes.map(({ id, canonical_type, position, ...metadata }) => ({ id, canonical_type, position, metadata }))).toEqual(nodesBefore);
    expect(model.edges.map(({ id, source, target, ...metadata }) => ({ id, source, target, metadata }))).toEqual(edgesBefore);
    expect([...fullVisibility.visibleNodeIds]).toEqual(nodeIdsBefore);
    expect([...fullVisibility.visibleEdgeIds]).toEqual(edgeIdsBefore);
  });

  it('separates and stably orders disconnected components by size then minimum ID', () => {
    const ids = ['EV-001', 'IS-001', 'C-001', 'A-001'];
    const relatedEdges = model.edges.filter(edge => ['EV-001', 'IS-001', 'C-001'].includes(edge.source) && ['EV-001', 'IS-001', 'C-001'].includes(edge.target));
    const result = computeCanonicalLayout(model, visibility(ids, relatedEdges.map(edge => edge.id)));
    expect(result.get('A-001')!.y).toBeGreaterThan(Math.max(result.get('EV-001')!.y, result.get('IS-001')!.y, result.get('C-001')!.y));
    expect(entries(computeCanonicalLayout(model, visibility(ids, relatedEdges.map(edge => edge.id))))).toEqual(entries(result));
  });

  it('completes cyclic input without reversing or removing relations', () => {
    const ids = model.nodes.slice(0, 3).map(node => node.id);
    const template = model.edges[0];
    const cycleEdges = ids.map((source, index) => ({ ...template, id: `cycle-${index}`, source, target: ids[(index + 1) % ids.length], source_id: source, target_id: ids[(index + 1) % ids.length] })) as SimulatorGraphEdge[];
    const cyclicModel = { ...model, edges: cycleEdges } as CanonicalSimulatorGraphViewModel;
    const before = structuredClone(cycleEdges);
    expect(computeCanonicalLayout(cyclicModel, visibility(ids, cycleEdges.map(edge => edge.id))).size).toBe(3);
    expect(cycleEdges).toEqual(before);
  });

  it('uses literal epistemic planes as separated bands and labels null only as UI absence', () => {
    const external = model.nodes.find(node => node.epistemic_plane === 'EXTERNAL')!;
    const study = model.nodes.find(node => node.epistemic_plane === 'STUDY')!;
    const nullNode = { ...model.nodes.find(node => node.id !== external.id && node.id !== study.id)!, id: 'NULL-PLANE', epistemic_plane: null };
    const bandModel = { ...model, nodes: [external, study, nullNode], edges: [] } as CanonicalSimulatorGraphViewModel;
    const result = computeCanonicalLayout(bandModel, { visibleNodeIds: new Set([external.id, study.id, nullNode.id]), visibleEdgeIds: new Set() });
    expect(new Set([...result.values()].map(position => position.y))).toHaveLength(3);
    expect(epistemicPlaneBandLabel(null)).toBe('Unspecified');
    expect(nullNode.epistemic_plane).toBeNull();
  });

  it('keeps ENT-039 as a positioned node and uses only existing topology', () => {
    const step = model.nodes.find(node => node.canonical_type === 'ENT-039')!;
    const result = computeCanonicalLayout(model, fullVisibility);
    expect(result.has(step.id)).toBe(true);
    expect(model.nodes.find(node => node.id === step.id)?.canonical_type).toBe('ENT-039');
    expect(result.size).toBe(model.nodes.length);
  });

  it('handles empty, singleton, and LR/TB orientations', () => {
    expect(computeCanonicalLayout(model, visibility([])).size).toBe(0);
    const singleton = computeCanonicalLayout(model, visibility([model.nodes[0].id]));
    expect(singleton.get(model.nodes[0].id)).toEqual({ x: 0, y: 0 });
    const edge = model.edges.find(candidate => candidate.source !== candidate.target)!;
    const pairVisibility = visibility([edge.source, edge.target], [edge.id]);
    const lr = computeCanonicalLayout(model, pairVisibility, { direction: 'LR' });
    const tb = computeCanonicalLayout(model, pairVisibility, { direction: 'TB' });
    expect(Math.abs(lr.get(edge.target)!.x - lr.get(edge.source)!.x)).toBeGreaterThanOrEqual(NODE_X_GAP);
    expect(Math.abs(tb.get(edge.target)!.y - tb.get(edge.source)!.y)).toBeGreaterThanOrEqual(NODE_X_GAP);
    expect(tb.get(edge.source)).toEqual({ x: lr.get(edge.source)!.y, y: lr.get(edge.source)!.x });
  });
});
