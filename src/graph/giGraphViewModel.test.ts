import { describe, expect, expectTypeOf, it } from 'vitest';
import fixture from '../diagnostic/auxiliary/fixtures/gi-full-valid.json';
import { loadGiGraphContract, type GiGraphContract } from '../diagnostic/auxiliary/giGraphContract';
import { isFullGiArtifact, loadGiSlotArtifact } from '../diagnostic/auxiliary/giLoader';
import minimalFixture from '../diagnostic/fixtures/pilot-r01/gi-pilot-r01-minimal.json';
import { buildGiGraphViewModel } from './giGraphViewModel';

function load(value: unknown): GiGraphContract {
  const result = loadGiGraphContract(value);
  if (!result.ok) throw new Error(result.error.details.join('\n'));
  return result.artifact;
}

describe('G_I graph view model', () => {
  it('projects the full contract fixture 1:1, in source order, with exact relation aliases', () => {
    const artifact = load(fixture);
    const viewModel = buildGiGraphViewModel(artifact);

    expect(viewModel).toMatchObject({ graphId: artifact.graph_ref, graphRef: artifact.graph_ref, graphVersion: artifact.graph_version });
    expect(viewModel.nodes).toHaveLength(artifact.entities.length);
    expect(viewModel.edges).toHaveLength(artifact.relations.length);
    expect(viewModel.nodes.map(node => node.id)).toEqual(artifact.entities.map(entity => entity.id));
    expect(viewModel.edges.map(edge => edge.id)).toEqual(artifact.relations.map(relation => relation.id));
    viewModel.edges.forEach((edge, index) => {
      expect(edge).toMatchObject({
        id: artifact.relations[index].id,
        canonical_type: artifact.relations[index].canonical_type,
        source_id: artifact.relations[index].source_id,
        target_id: artifact.relations[index].target_id,
        source: artifact.relations[index].source_id,
        target: artifact.relations[index].target_id,
      });
    });
  });

  it('preserves present optional fields and compatible extensions without inventing absent fields', () => {
    const input = structuredClone(fixture) as unknown as GiGraphContract;
    Object.assign(input.entities[0], { canonical_name: 'Premise', subtype: null, label: 'P', attributes: { rank: 1 }, confidence: 0.9, producer_extension: { value: true } });
    Object.assign(input.relations[0], { canonical_name: 'Supports', attributes: { weight: 1 }, confidence: 0.8, producer_extension: ['kept'] });
    const viewModel = buildGiGraphViewModel(load(input));

    expect(viewModel.nodes[0]).toMatchObject(input.entities[0]);
    expect(viewModel.edges[0]).toMatchObject(input.relations[0]);
    expect(viewModel.nodes[1]).not.toHaveProperty('label');
    expect(viewModel.edges[1]).not.toHaveProperty('canonical_name');
    expect(viewModel.metadata.validation).toBeUndefined();
    expect(viewModel.metadata.artifactMetadata).toBeUndefined();
  });

  it('preserves structural metadata and normalizes only absent collections to empty arrays', () => {
    const input = structuredClone(fixture) as unknown as GiGraphContract;
    input.reference_bindings = [{ ref: 'E1' }];
    input.ontology_gaps = [{ id: 'OG1' }];
    input.projection_gaps = [{ id: 'PGAP1' }];
    input.validation = { valid: true };
    input.metadata = { producer: 'test' };
    const artifact = load(input);
    const metadata = buildGiGraphViewModel(artifact).metadata;

    expect(metadata.premiseGroups).toEqual(artifact.premise_groups);
    expect(metadata.inferenceSteps).toEqual(artifact.inference_steps);
    expect(metadata.referenceBindings).toEqual(input.reference_bindings);
    expect(metadata.ontologyGaps).toEqual(input.ontology_gaps);
    expect(metadata.projectionGaps).toEqual(input.projection_gaps);
    expect(metadata.validation).toEqual(input.validation);
    expect(metadata.artifactMetadata).toEqual(input.metadata);
    expect(metadata.extensions).toEqual({ extension_example: { preserved: true } });
    expect(buildGiGraphViewModel(load({ graph_ref: 'g', graph_version: '1', entities: [], relations: [] })).metadata)
      .toMatchObject({ premiseGroups: [], inferenceSteps: [], referenceBindings: [], ontologyGaps: [], projectionGaps: [] });
  });

  it('does not mutate input and is deterministic', () => {
    const artifact = load(fixture);
    const before = structuredClone(artifact);
    const first = buildGiGraphViewModel(artifact);
    const second = buildGiGraphViewModel(artifact);
    expect(artifact).toEqual(before);
    expect(first).toEqual(second);
    expect(first.nodes[0]).not.toBe(artifact.entities[0]);
    expect(first.metadata.inferenceSteps[0]).not.toBe(artifact.inference_steps?.[0]);
  });

  it('keeps inference steps and premise groups as metadata without creating structure', () => {
    const artifact = load(fixture);
    const viewModel = buildGiGraphViewModel(artifact);
    expect(viewModel.metadata.inferenceSteps[0].id).toBe('I1');
    expect(viewModel.metadata.premiseGroups[0].id).toBe('PG1');
    expect(viewModel.nodes).toHaveLength(artifact.entities.length);
    expect(viewModel.edges).toHaveLength(artifact.relations.length);

    const withoutHomonymousEntity = structuredClone(artifact);
    withoutHomonymousEntity.entities = withoutHomonymousEntity.entities.filter(entity => entity.id !== 'I1');
    withoutHomonymousEntity.relations = [];
    const projected = buildGiGraphViewModel(withoutHomonymousEntity);
    expect(projected.metadata.inferenceSteps.some(step => step.id === 'I1')).toBe(true);
    expect(projected.nodes.some(node => node.id === 'I1')).toBe(false);
    expect(projected.edges).toEqual([]);
  });

  it('contains no diagnostic or layout fields', () => {
    const serialized = JSON.stringify(buildGiGraphViewModel(load(fixture)));
    for (const forbidden of ['Def_e', 'Active_e', 'breakpoint', 'downstream', 'frontier', 'DiagnosticState', 'maximumDefendableClaim', 'gravity', 'reparability', 'position']) {
      expect(serialized).not.toContain(`"${forbidden}"`);
    }
  });

  it('accepts exactly GiGraphContract while the minimal profile remains ineligible', () => {
    expectTypeOf(buildGiGraphViewModel).parameter(0).toEqualTypeOf<GiGraphContract>();
    const loaded = loadGiSlotArtifact(minimalFixture);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(isFullGiArtifact(loaded.artifact)).toBe(false);
    expect(loaded.artifact.profile).toBe('MINIMAL_AUXILIARY_GI');
    expect(loaded.artifact.artifact).not.toHaveProperty('relations');
  });
});
