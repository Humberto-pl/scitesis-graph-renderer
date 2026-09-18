import { describe, expect, it } from 'vitest';
import fixture from './fixtures/gi-full-valid.json';
import { asGiAuxiliaryArtifact, loadFullGiArtifact } from './giLoader';

describe('full G_I application loader', () => {
  it('delegates to the executable contract and preserves the complete artifact without mutation', () => {
    const input = structuredClone(fixture) as typeof fixture & { producer_extension?: unknown };
    input.producer_extension = { nested: ['preserved'] };
    const before = structuredClone(input);

    const result = loadFullGiArtifact(input);

    expect(result.ok).toBe(true);
    expect(input).toEqual(before);
    if (!result.ok) return;
    expect(result.artifact).toEqual(before);
    expect(result.artifact).not.toBe(input);
    expect(result.artifact.relations).toEqual(input.relations);
    expect(result.artifact.inference_steps).toEqual(input.inference_steps);
    expect(result.artifact.premise_groups).toEqual(input.premise_groups);
    expect(result.artifact.producer_extension).toEqual({ nested: ['preserved'] });
  });

  it('propagates the stable structured contract error', () => {
    const invalid = structuredClone(fixture);
    invalid.relations[0].source_id = 'missing';

    const direct = loadFullGiArtifact(invalid);

    expect(direct).toMatchObject({
      ok: false,
      error: {
        code: 'INVALID_GI_GRAPH',
        message: 'El artifact no cumple el contrato estructural G_I.',
      },
    });
    if (!direct.ok) expect(direct.error.details).toContain('relations[0].source_id references missing entity "missing".');
  });

  it('adapts by identity instead of creating a reduced or duplicated representation', () => {
    const result = loadFullGiArtifact(fixture);
    if (!result.ok) throw new Error(result.error.details.join('\n'));
    const auxiliary = asGiAuxiliaryArtifact(result.artifact);
    expect(auxiliary).toBe(result.artifact);
    expect(auxiliary.entities).toBe(result.artifact.entities);
  });
});
