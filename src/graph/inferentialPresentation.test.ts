import { describe, expect, it } from 'vitest';
import qualisArtifactJson from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './canonicalSimulatorAdapter';
import { inferentialRolesByEntity, inferenceStepView } from './inferentialPresentation';
import type { ConfirmedSimulatedGraphArtifact } from './types';

const artifact = qualisArtifactJson as ConfirmedSimulatedGraphArtifact;
const model = buildCanonicalSimulatorGraphViewModel(artifact);

describe('canonical inferential presentation', () => {
  it('keeps every inference step as its existing ENT-039 node without duplication', () => {
    const entitySteps = artifact.entities.filter(entity => entity.canonical_type === 'ENT-039');
    const visualSteps = model.nodes.filter(node => node.canonical_type === 'ENT-039');

    expect(entitySteps).toHaveLength(7);
    expect(artifact.inference_steps).toHaveLength(7);
    expect(visualSteps.map(node => node.id)).toEqual(entitySteps.map(entity => entity.id));
    expect(model.nodes).toHaveLength(artifact.entities.length);
  });

  it('presents the real PG-001 membership, roles, association, and exact canonical relations', () => {
    const view = inferenceStepView(model, 'IS-001')!;

    expect(view.premiseGroups).toHaveLength(1);
    expect(view.premiseGroups[0]).toMatchObject({
      id: 'PG-001',
      mode: 'CONVERGENT',
      member_ids: ['EV-001', 'EV-002', 'EV-003'],
      target_inference_step_id: 'IS-001',
    });
    expect([...view.rolesByEntityId.get('EV-001')!]).toEqual(['PREMISE']);
    expect([...view.rolesByEntityId.get('TA-001')!]).toEqual(['WARRANT']);
    expect([...view.rolesByEntityId.get('C-001')!]).toEqual(['CONCLUSION']);
    expect(view.relations.map(relation => relation.id)).toEqual([
      'RELATION-001', 'RELATION-002', 'RELATION-003', 'RELATION-004',
      'RELATION-005', 'RELATION-006', 'RELATION-007',
    ]);
  });

  it('uses only explicit role arrays, including the real IS-002 assumption and no fabricated backing', () => {
    const view = inferenceStepView(model, 'IS-002')!;

    expect([...view.rolesByEntityId.get('A-001')!]).toEqual(['ASSUMPTION']);
    expect([...view.rolesByEntityId.values()].some(roles => roles.has('BACKING'))).toBe(false);
    expect(view.relations.map(relation => relation.id)).toEqual([
      'RELATION-020', 'RELATION-021', 'RELATION-022', 'RELATION-023',
      'RELATION-024', 'RELATION-025', 'RELATION-120',
    ]);
  });

  it('preserves every displayed relation endpoint and invents neither edges nor SUPPORTS', () => {
    artifact.inference_steps.forEach(step => {
      inferenceStepView(model, step.id)!.relations.forEach(edge => {
        const relation = artifact.relations.find(candidate => candidate.id === edge.id)!;
        expect(edge.source).toBe(relation.source_id);
        expect(edge.target).toBe(relation.target_id);
      });
    });
    expect(model.edges).toHaveLength(artifact.relations.length);
    expect(model.edges.some(edge => edge.canonical_type === 'SUPPORTS' || edge.canonical_name === 'SUPPORTS')).toBe(false);
  });

  it('exposes roles as presentation metadata rather than canonical entity types', () => {
    const roles = inferentialRolesByEntity(model);
    const roleNames = new Set([...roles.values()].flatMap(value => [...value]));

    expect(roleNames).toEqual(new Set(['PREMISE', 'WARRANT', 'ASSUMPTION', 'CONCLUSION']));
    expect(model.nodes.some(node => ['PREMISE', 'WARRANT', 'BACKING'].includes(node.canonical_type))).toBe(false);
  });
});
