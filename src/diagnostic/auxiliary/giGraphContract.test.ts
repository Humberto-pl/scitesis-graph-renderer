import { describe, expect, it } from 'vitest';
import outputFixture from '../fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { buildDiagnosticGraphViewModel } from '../diagnosticGraphViewModel';
import { loadDiagnosticOutput } from '../diagnosticOutputLoader';
import fixture from './fixtures/gi-full-valid.json';
import { classifyGi, createAuxiliaryContext, notLoaded, resolveAuxiliaryReference } from './context';
import { loadGiGraphContract } from './giGraphContract';

const valid = () => structuredClone(fixture);
const load = (value: unknown) => {
  const result = loadGiGraphContract(value);
  if (!result.ok) throw new Error(result.error.details.join('\n'));
  return result.artifact;
};
const rejectDetails = (value: unknown) => {
  const result = loadGiGraphContract(value);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.error.details;
};

describe('full G_I graph contract', () => {
  it('accepts a complete structural graph with entities, relations, inference steps, and premise groups', () => {
    const result = loadGiGraphContract(valid());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.artifact.relations).toHaveLength(3);
  });

  it.each([
    ['source_id', (graph: ReturnType<typeof valid>) => { graph.relations[0].source_id = 'missing'; }, 'source_id references missing entity'],
    ['target_id', (graph: ReturnType<typeof valid>) => { graph.relations[0].target_id = 'missing'; }, 'target_id references missing entity'],
    ['entity duplicate', (graph: ReturnType<typeof valid>) => { graph.entities.push(structuredClone(graph.entities[0])); }, 'id duplicates "E1"'],
    ['relation duplicate', (graph: ReturnType<typeof valid>) => { graph.relations.push(structuredClone(graph.relations[0])); }, 'id duplicates "R1"'],
    ['inference premise', (graph: ReturnType<typeof valid>) => { graph.inference_steps[0].premise_ids = ['missing']; }, 'premise_ids references missing entity'],
    ['inference conclusion', (graph: ReturnType<typeof valid>) => { graph.inference_steps[0].conclusion_id = 'missing'; }, 'conclusion_id references missing entity'],
    ['premise group member', (graph: ReturnType<typeof valid>) => { graph.premise_groups[0].member_ids = ['missing']; }, 'member_ids references missing entity'],
    ['premise group target', (graph: ReturnType<typeof valid>) => { graph.premise_groups[0].target_inference_step_id = 'missing'; }, 'target_inference_step_id references missing inference step'],
  ])('rejects an invalid %s reference or identity', (_name, mutate, message) => {
    const graph = valid();
    mutate(graph);
    expect(rejectDetails(graph).some(detail => detail.includes(message))).toBe(true);
  });

  it('rejects duplicate inference-step and premise-group IDs', () => {
    const graph = valid();
    graph.inference_steps.push(structuredClone(graph.inference_steps[0]));
    graph.premise_groups.push(structuredClone(graph.premise_groups[0]));
    const details = rejectDetails(graph);
    expect(details.some(detail => detail.includes('inference_steps') && detail.includes('duplicates'))).toBe(true);
    expect(details.some(detail => detail.includes('premise_groups') && detail.includes('duplicates'))).toBe(true);
  });

  it('accepts the required root only, without optional metadata or materialized inference structures', () => {
    expect(loadGiGraphContract({ graph_ref: 'g', graph_version: '1', entities: [], relations: [] }).ok).toBe(true);
  });

  it('accepts materialized inference structures without optional origin, version, or iam_source', () => {
    const graph = valid();
    for (const item of [...graph.inference_steps, ...graph.premise_groups]) {
      const record = item as unknown as Record<string, unknown>;
      delete record.origin;
      delete record.version;
      delete record.iam_source;
    }
    expect(loadGiGraphContract(graph).ok).toBe(true);
  });

  it('rejects a present non-string origin while accepting its absence', () => {
    const withoutOrigin = valid();
    for (const item of [...withoutOrigin.inference_steps, ...withoutOrigin.premise_groups]) {
      delete (item as unknown as Record<string, unknown>).origin;
    }
    expect(loadGiGraphContract(withoutOrigin).ok).toBe(true);

    const invalidOrigin = structuredClone(withoutOrigin) as unknown as Record<string, unknown>;
    (invalidOrigin.inference_steps as Array<Record<string, unknown>>)[0].origin = 1;
    expect(rejectDetails(invalidOrigin).some(detail => detail.includes('origin must be a string when present'))).toBe(true);
  });

  it('rejects malformed records without throwing', () => {
    const graph = valid() as unknown as Record<string, unknown>;
    graph.inference_steps = [{ id: 'I2', canonical_type: 'inference', premise_ids: 'E1' }];
    expect(() => loadGiGraphContract(graph)).not.toThrow();
    expect(loadGiGraphContract(graph).ok).toBe(false);
  });

  it('preserves compatible extensions and does not mutate input', () => {
    const graph = valid() as typeof fixture & { producer_extension?: unknown };
    graph.producer_extension = { nested: ['value'] };
    const before = structuredClone(graph);
    const artifact = load(graph);
    expect(graph).toEqual(before);
    expect(artifact).toEqual(before);
    expect(artifact).not.toBe(graph);
  });

  it('remains compatible with exact, case-sensitive auxiliary ID resolution', () => {
    const metadata = buildDiagnosticGraphViewModel(loadDiagnosticOutput(outputFixture)).metadata.run_metadata;
    const graph = valid();
    graph.graph_ref = metadata.graph_ref;
    graph.graph_version = metadata.graph_version;
    const context = createAuxiliaryContext(classifyGi(load(graph), metadata), notLoaded());
    expect(resolveAuxiliaryReference('E1', context)).toMatchObject({ status: 'RESOLVED', entity: { id: 'E1' } });
    expect(resolveAuxiliaryReference('e1', context)).toEqual({ status: 'UNRESOLVED', ref: 'e1' });
  });
});
