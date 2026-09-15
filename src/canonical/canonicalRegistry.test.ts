import { describe, expect, it } from 'vitest';
import qualisArtifactJson from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from '../graph/canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from '../graph/types';
import {
  canonicalEntitiesByType,
  canonicalEntityDisplayName,
  canonicalEntityRegistry,
  canonicalRelationDisplayName,
  canonicalRelationRegistry,
  canonicalRelationsByType,
} from './canonicalRegistry';

const expectedIds = (prefix: 'ENT' | 'REL', count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`);
const artifact = qualisArtifactJson as ConfirmedSimulatedGraphArtifact;

describe('canonical semantic registry', () => {
  it('contains exactly the complete ENT-001–ENT-039 canon with names', () => {
    const ids = canonicalEntityRegistry.map(entry => entry.canonicalType);
    expect(ids).toEqual(expectedIds('ENT', 39));
    expect(new Set(ids)).toHaveLength(39);
    expect(canonicalEntityRegistry).toHaveLength(39);
    expect(canonicalEntityRegistry.every(entry => entry.canonicalName.trim().length > 0)).toBe(true);
    expect(canonicalEntityRegistry.every(entry => entry.id === entry.canonicalType)).toBe(true);
  });

  it('contains exactly the complete REL-001–REL-074 canon with names', () => {
    const ids = canonicalRelationRegistry.map(entry => entry.canonicalType);
    expect(ids).toEqual(expectedIds('REL', 74));
    expect(new Set(ids)).toHaveLength(74);
    expect(canonicalRelationRegistry).toHaveLength(74);
    expect(canonicalRelationRegistry.every(entry => entry.canonicalName.trim().length > 0)).toBe(true);
    expect(canonicalRelationRegistry.every(entry => entry.id === entry.canonicalType)).toBe(true);
  });

  it('agrees with SPEC v0.3 names across early, middle, and final IDs', () => {
    expect(canonicalEntitiesByType['ENT-001']?.canonicalName).toBe('INVESTIGACIÓN');
    expect(canonicalEntitiesByType['ENT-018']?.canonicalName).toBe('CONCEPTUAL_ENTITY / ENTIDAD CONCEPTUAL O FENOMÉNICA');
    expect(canonicalEntitiesByType['ENT-029']?.canonicalName).toBe('VALORACIÓN DE GRAVEDAD');
    expect(canonicalEntitiesByType['ENT-038']?.canonicalName).toBe('MEASUREMENT_SPECIFICATION / ESPECIFICACIÓN DE MEDICIÓN');
    expect(canonicalRelationsByType['REL-001']?.canonicalName).toBe('CONTIENE');
    expect(canonicalRelationsByType['REL-033']?.canonicalName).toBe('CLASIFICA');
    expect(canonicalRelationsByType['REL-050']?.canonicalName).toBe('DESCOMPONE_EN');
    expect(canonicalRelationsByType['REL-066']?.canonicalName).toBe('CONTEXTUALIZA');
    expect(canonicalRelationsByType['REL-074']?.canonicalName).toBe('UNDERMINES');
  });

  it('marks only the normative historical tombstones with lifecycle', () => {
    expect(canonicalEntitiesByType['ENT-006']?.lifecycle).toBe('HISTORICAL_TOMBSTONE');
    expect(canonicalEntitiesByType['ENT-007']?.lifecycle).toBe('HISTORICAL_TOMBSTONE');
    expect(canonicalRelationsByType['REL-026']?.lifecycle).toBe('HISTORICAL_TOMBSTONE');
    expect(canonicalEntityRegistry.filter(entry => entry.lifecycle)).toHaveLength(2);
    expect(canonicalRelationRegistry.filter(entry => entry.lifecycle)).toHaveLength(1);
  });

  it('preserves critical distinctions and excludes invented canonical types', () => {
    expect(canonicalEntitiesByType['ENT-011']?.canonicalName).toBe('INFERENCIA / CLAIM');
    expect(canonicalEntitiesByType['ENT-039']?.canonicalName).toBe('INFERENCE_STEP / PASO INFERENCIAL');
    expect(canonicalEntitiesByType['ENT-011']?.canonicalName).not.toBe(canonicalEntitiesByType['ENT-039']?.canonicalName);
    expect(['REL-019', 'REL-055', 'REL-068'].map(id => canonicalRelationsByType[id as keyof typeof canonicalRelationsByType]?.canonicalName))
      .toEqual(['SUSTENTA', 'JUSTIFICA_TEORICAMENTE', 'WARRANTS']);
    expect(['REL-072', 'REL-073', 'REL-074'].map(id => canonicalRelationsByType[id as keyof typeof canonicalRelationsByType]?.canonicalName))
      .toEqual(['REBUTS', 'UNDERCUTS', 'UNDERMINES']);
    expect(canonicalEntityRegistry.some(entry => ['PREMISE', 'WARRANT', 'BACKING'].includes(entry.canonicalName))).toBe(false);
    expect(canonicalRelationRegistry.some(entry => entry.canonicalName === 'SUPPORTS')).toBe(false);
  });

  it('covers every canonical type instantiated by QUALIS', () => {
    expect(artifact.entities.every(entity => canonicalEntitiesByType[entity.canonical_type as keyof typeof canonicalEntitiesByType])).toBe(true);
    expect(artifact.relations.every(relation => canonicalRelationsByType[relation.canonical_type as keyof typeof canonicalRelationsByType])).toBe(true);
  });

  it('is immutable and exposes no mutation API', () => {
    expect(Object.isFrozen(canonicalEntityRegistry)).toBe(true);
    expect(Object.isFrozen(canonicalRelationRegistry)).toBe(true);
    expect(Object.isFrozen(canonicalEntitiesByType)).toBe(true);
    expect(Object.isFrozen(canonicalRelationsByType)).toBe(true);
    expect(Object.isFrozen(canonicalEntitiesByType['ENT-004']?.subtypes)).toBe(true);
    expect(Reflect.set(canonicalEntitiesByType['ENT-001']!, 'canonicalName', 'CHANGED')).toBe(false);
    expect(canonicalEntitiesByType['ENT-001']?.canonicalName).toBe('INVESTIGACIÓN');
  });

  it('uses instance names first and deterministic registry/type fallbacks', () => {
    expect(canonicalEntityDisplayName('ENT-011', 'Nombre literal de instancia')).toBe('Nombre literal de instancia');
    expect(canonicalRelationDisplayName('REL-019', 'Nombre literal de instancia')).toBe('Nombre literal de instancia');
    expect(canonicalEntityDisplayName('ENT-039')).toBe('INFERENCE_STEP / PASO INFERENCIAL');
    expect(canonicalRelationDisplayName('REL-074')).toBe('UNDERMINES');
    expect(canonicalEntityDisplayName('ENT-999')).toBe('ENT-999');
    expect(canonicalEntityDisplayName('ENT-039')).toBe(canonicalEntityDisplayName('ENT-039'));
  });

  it('does not transform the artifact when consulted alongside the adapter', () => {
    const before = structuredClone(artifact);
    const model = buildCanonicalSimulatorGraphViewModel(artifact);
    model.nodes.forEach(node => canonicalEntityDisplayName(node.canonical_type, node.canonical_name));
    model.edges.forEach(edge => canonicalRelationDisplayName(edge.canonical_type, edge.canonical_name));

    expect(artifact).toEqual(before);
    expect(model.nodes.map(node => ({ id: node.id, canonical_type: node.canonical_type, canonical_name: node.canonical_name })))
      .toEqual(artifact.entities.map(entity => ({ id: entity.id, canonical_type: entity.canonical_type, canonical_name: entity.canonical_name })));
    expect(model.edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, source_id: edge.source_id, target_id: edge.target_id, canonical_type: edge.canonical_type, canonical_name: edge.canonical_name })))
      .toEqual(artifact.relations.map(relation => ({ id: relation.id, source: relation.source_id, target: relation.target_id, source_id: relation.source_id, target_id: relation.target_id, canonical_type: relation.canonical_type, canonical_name: relation.canonical_name })));
  });
});
