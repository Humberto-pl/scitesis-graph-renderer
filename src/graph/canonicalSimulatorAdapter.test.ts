import { describe, expect, it } from 'vitest';
import qualisArtifactJson from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from './types';

const artifact = qualisArtifactJson as ConfirmedSimulatedGraphArtifact;

describe('Canonical Simulator Graph Adapter', () => {
  it('preserves entity and relation identity one-to-one', () => {
    const model = buildCanonicalSimulatorGraphViewModel(artifact);

    expect(model.nodes).toHaveLength(artifact.entities.length);
    expect(new Set(model.nodes.map(node => node.id))).toEqual(new Set(artifact.entities.map(entity => entity.id)));
    expect(model.edges).toHaveLength(artifact.relations.length);
    expect(new Set(model.edges.map(edge => edge.id))).toEqual(new Set(artifact.relations.map(relation => relation.id)));
    expect(model.metadata.inferenceSteps).toEqual(artifact.inference_steps);
    expect(model.metadata.premiseGroups).toEqual(artifact.premise_groups);
  });

  it('preserves canonical types, names, endpoints, and relation metadata', () => {
    const model = buildCanonicalSimulatorGraphViewModel(artifact);

    artifact.entities.forEach(entity => {
      const node = model.nodes.find(candidate => candidate.id === entity.id);
      expect(node).toMatchObject({ canonical_type: entity.canonical_type, canonical_name: entity.canonical_name });
    });
    artifact.relations.forEach(relation => {
      const edge = model.edges.find(candidate => candidate.id === relation.id);
      expect(edge).toMatchObject({
        canonical_type: relation.canonical_type,
        canonical_name: relation.canonical_name,
        source_id: relation.source_id,
        target_id: relation.target_id,
        source: relation.source_id,
        target: relation.target_id,
        attributes: relation.attributes,
        explicitness: relation.explicitness,
        confidence: relation.confidence,
        review_state: relation.review_state,
        projection_status: relation.projection_status,
        provenance: relation.provenance,
      });
    });
  });

  it.each(['OBJ-001', 'C-001', 'IS-001'])('preserves epistemological metadata for %s', id => {
    const entity = artifact.entities.find(candidate => candidate.id === id)!;
    const node = buildCanonicalSimulatorGraphViewModel(artifact).nodes.find(candidate => candidate.id === id);

    expect(node).toMatchObject({
      review_state: entity.review_state,
      explicitness: entity.explicitness,
      confidence: entity.confidence,
      functional_relevance: entity.functional_relevance,
      projection_status: entity.projection_status,
      epistemic_plane: entity.epistemic_plane,
      provenance: entity.provenance,
      origin: entity.origin,
      version: entity.version,
      iam_source: entity.iam_source,
    });
  });

  it('materializes ENT-039 only from entities and never maps it to a legacy kind', () => {
    const inputInferenceSteps = artifact.entities.filter(entity => entity.canonical_type === 'ENT-039');
    const outputInferenceSteps = buildCanonicalSimulatorGraphViewModel(artifact).nodes.filter(
      node => node.canonical_type === 'ENT-039',
    );

    expect(outputInferenceSteps.map(node => node.id)).toEqual(inputInferenceSteps.map(entity => entity.id));
    expect(outputInferenceSteps).toHaveLength(artifact.inference_steps.length);
    expect(outputInferenceSteps.every(node => !('kind' in node))).toBe(true);
  });

  it('does not invent SUPPORTS or any additional edge', () => {
    const model = buildCanonicalSimulatorGraphViewModel(artifact);

    expect(model.edges.some(edge => edge.canonical_type === 'SUPPORTS' || edge.canonical_name === 'SUPPORTS')).toBe(false);
    expect(model.edges.map(edge => edge.id)).toEqual(artifact.relations.map(relation => relation.id));
  });

  it('is deterministic and does not mutate the canonical artifact', () => {
    const snapshot = structuredClone(artifact);

    expect(buildCanonicalSimulatorGraphViewModel(artifact)).toEqual(buildCanonicalSimulatorGraphViewModel(artifact));
    expect(artifact).toEqual(snapshot);
  });

  it('positions LR on the x axis and TB on the y axis', () => {
    const leftToRight = buildCanonicalSimulatorGraphViewModel(artifact, { direction: 'LR' });
    const topToBottom = buildCanonicalSimulatorGraphViewModel(artifact, { direction: 'TB' });

    expect(new Set(leftToRight.nodes.map(node => node.position.x)).size).toBeGreaterThan(1);
    expect(new Set(leftToRight.nodes.map(node => node.position.y))).toEqual(new Set([0]));
    expect(new Set(topToBottom.nodes.map(node => node.position.y)).size).toBeGreaterThan(1);
    expect(new Set(topToBottom.nodes.map(node => node.position.x))).toEqual(new Set([0]));
  });

  it('fails explicitly rather than silently discarding a relation with a missing endpoint', () => {
    const invalidArtifact = structuredClone(artifact);
    invalidArtifact.relations[0].source_id = 'MISSING-ENTITY';

    expect(() => buildCanonicalSimulatorGraphViewModel(invalidArtifact)).toThrow(
      `Canonical relation ${invalidArtifact.relations[0].id} references a missing endpoint`,
    );
  });
});
