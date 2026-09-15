import { describe, expect, it } from 'vitest';
import qualisArtifactJson from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from '../graph/canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from '../graph/types';
import {
  CANONICAL_ENTITY_IDS,
  CANONICAL_ENTITY_REGISTRY,
  CANONICAL_RELATION_IDS,
  CANONICAL_RELATION_REGISTRY,
  canonicalEntitySemantics,
  canonicalRelationSemantics,
} from './canonicalRegistry';

const artifact = qualisArtifactJson as ConfirmedSimulatedGraphArtifact;
const sequentialIds = (prefix: 'ENT' | 'REL', count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`);

describe('canonical ontology and relation registry', () => {
  it('contains every canonical entity ID exactly once', () => {
    const ids = CANONICAL_ENTITY_REGISTRY.map(entry => entry.id);

    expect(CANONICAL_ENTITY_REGISTRY).toHaveLength(39);
    expect(ids).toEqual(sequentialIds('ENT', 39));
    expect(new Set(ids)).toHaveLength(39);
    expect(CANONICAL_ENTITY_IDS).toEqual(ids);
  });

  it('contains every canonical relation ID exactly once', () => {
    const ids = CANONICAL_RELATION_REGISTRY.map(entry => entry.id);

    expect(CANONICAL_RELATION_REGISTRY).toHaveLength(74);
    expect(ids).toEqual(sequentialIds('REL', 74));
    expect(new Set(ids)).toHaveLength(74);
    expect(CANONICAL_RELATION_IDS).toEqual(ids);
  });

  it('marks only the historical tombstones requested by the canon', () => {
    expect(canonicalEntitySemantics('ENT-006')?.status).toBe('tombstone');
    expect(canonicalEntitySemantics('ENT-007')?.status).toBe('tombstone');
    expect(canonicalRelationSemantics('REL-026')?.status).toBe('tombstone');
  });

  it('keeps critical entity concepts and inferential roles distinct', () => {
    expect(canonicalEntitySemantics('ENT-011')).not.toEqual(canonicalEntitySemantics('ENT-039'));
    expect(canonicalEntitySemantics('ENT-011')?.canonicalName).toBe('CLAIM');
    expect(canonicalEntitySemantics('ENT-039')?.canonicalName).toBe('INFERENCE_STEP');
    expect(CANONICAL_ENTITY_REGISTRY.map(entry => entry.canonicalName)).not.toContain('PREMISE');
    expect(CANONICAL_ENTITY_REGISTRY.map(entry => entry.canonicalName)).not.toContain('WARRANT');
    expect(CANONICAL_ENTITY_REGISTRY.map(entry => entry.canonicalName)).not.toContain('BACKING');
    expect(CANONICAL_ENTITY_REGISTRY.map(entry => entry.canonicalName)).not.toContain('ASSUMPTION');
    expect(CANONICAL_ENTITY_REGISTRY.map(entry => entry.canonicalName)).not.toContain('CASCARILLA');
  });

  it('keeps critical relation meanings distinct without generic SUPPORTS', () => {
    expect(new Set(['REL-019', 'REL-055', 'REL-068'].map(id => canonicalRelationSemantics(id)?.canonicalName)))
      .toEqual(new Set(['SUSTENTA', 'JUSTIFICA_TEORICAMENTE', 'WARRANTS']));
    expect(['REL-072', 'REL-073', 'REL-074'].map(id => canonicalRelationSemantics(id)?.canonicalName))
      .toEqual(['REBUTS', 'UNDERCUTS', 'UNDERMINES']);
    expect(CANONICAL_RELATION_REGISTRY.map(entry => entry.canonicalName)).not.toContain('SUPPORTS');
  });

  it('covers all canonical types instantiated by QUALIS', () => {
    artifact.entities.forEach(entity => expect(canonicalEntitySemantics(entity.canonical_type)).toBeDefined());
    artifact.relations.forEach(relation => expect(canonicalRelationSemantics(relation.canonical_type)).toBeDefined());
  });

  it('is frozen, deterministic, and returns stable entry references', () => {
    expect(Object.isFrozen(CANONICAL_ENTITY_REGISTRY)).toBe(true);
    expect(Object.isFrozen(CANONICAL_RELATION_REGISTRY)).toBe(true);
    expect(Object.isFrozen(canonicalEntitySemantics('ENT-039'))).toBe(true);
    expect(Object.isFrozen(canonicalRelationSemantics('REL-068'))).toBe(true);
    expect(canonicalEntitySemantics('ENT-039')).toBe(canonicalEntitySemantics('ENT-039'));
    expect(canonicalRelationSemantics('REL-068')).toBe(canonicalRelationSemantics('REL-068'));
  });

  it('enriches presentation without mutating or replacing artifact authority', () => {
    const before = structuredClone(artifact);
    const model = buildCanonicalSimulatorGraphViewModel(artifact);

    expect(artifact).toEqual(before);
    expect(model.nodes).toHaveLength(artifact.entities.length);
    expect(model.edges).toHaveLength(artifact.relations.length);
    expect(model.nodes.map(({ id, canonical_type, canonical_name }) => ({ id, canonical_type, canonical_name })))
      .toEqual(artifact.entities.map(({ id, canonical_type, canonical_name }) => ({ id, canonical_type, canonical_name })));
    expect(model.edges.map(({ id, source, target, source_id, target_id, canonical_type, canonical_name }) =>
      ({ id, source, target, source_id, target_id, canonical_type, canonical_name })))
      .toEqual(artifact.relations.map(({ id, source_id, target_id, canonical_type, canonical_name }) =>
        ({ id, source: source_id, target: target_id, source_id, target_id, canonical_type, canonical_name })));
    expect(model.nodes.every(node => node.canonicalSemantics === canonicalEntitySemantics(node.canonical_type))).toBe(true);
    expect(model.edges.every(edge => edge.canonicalSemantics === canonicalRelationSemantics(edge.canonical_type))).toBe(true);
  });
});
