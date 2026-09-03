import { describe, expect, it } from 'vitest';
import { fixtures } from '../fixtures/cases';
import { buildDiagnosticGraphViewModel } from './adapter';
import { edgeDisplayLabel, stateDisplayLabel, withCanonicalCode } from './displayLabels';
import { edgeTopology, existingHighlightPath, initialLayoutState, moveNode, resetLayout } from './interaction';

describe('visual interaction invariants', () => {
  it('moves and resets UI positions without mutating Candidate, Diagnosis, IDs, or topology', () => {
    const { candidate, diagnosis } = fixtures.C34;
    const candidateBefore = structuredClone(candidate);
    const diagnosisBefore = structuredClone(diagnosis);
    const model = buildDiagnosticGraphViewModel(candidate, diagnosis);
    const idsBefore = model.nodes.map(node => node.canonicalId);
    const topologyBefore = edgeTopology(model.edges);
    const initial = initialLayoutState(model);
    const moved = moveNode(initial, model.nodes[0].id, { x: 999, y: 777 });

    expect(moved[model.nodes[0].id]).toEqual({ x: 999, y: 777 });
    expect(initial[model.nodes[0].id]).toEqual(model.nodes[0].position);
    expect(resetLayout(model)).toEqual(initial);
    expect(candidate).toEqual(candidateBefore);
    expect(diagnosis).toEqual(diagnosisBefore);
    expect(model.nodes.map(node => node.canonicalId)).toEqual(idsBefore);
    expect(edgeTopology(model.edges)).toEqual(topologyBefore);
  });

  it('uses only existing relations for highlight', () => {
    const model = buildDiagnosticGraphViewModel(fixtures.C34.candidate, fixtures.C34.diagnosis);
    const path = existingHighlightPath(model, 'C34-C09-A');
    expect([...path.edgeIds].every(id => model.edges.some(edge => edge.id === id))).toBe(true);
    expect([...path.nodeIds].every(id => model.nodes.some(node => node.id === id))).toBe(true);
  });

  it('display labels preserve canonical codes', () => {
    const state = 'NO_SOSTENIDO_EN_SU_FORMULACION_ACTUAL' as const;
    expect(stateDisplayLabel(state)).toBe('No se sostiene tal como está formulado');
    expect(withCanonicalCode(stateDisplayLabel(state), state, true)).toContain(state);
    expect(edgeDisplayLabel('SUPPORTS')).toBe('respalda');
    expect(state).toBe('NO_SOSTENIDO_EN_SU_FORMULACION_ACTUAL');
  });
});
