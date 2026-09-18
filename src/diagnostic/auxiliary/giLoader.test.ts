import { describe, expect, it } from 'vitest';
import pilotGi from '../fixtures/pilot-r01/gi-pilot-r01-minimal.json';
import fixture from './fixtures/gi-full-valid.json';
import { asGiAuxiliaryArtifact, giArtifactForAuxiliary, isFullGiArtifact, loadFullGiArtifact, loadGiSlotArtifact } from './giLoader';

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

  it('tags and preserves a complete G_I for future structural use', () => {
    const input = structuredClone(fixture);
    const result = loadGiSlotArtifact(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.artifact.profile).toBe('FULL_GI');
    expect(isFullGiArtifact(result.artifact)).toBe(true);
    if (!isFullGiArtifact(result.artifact)) return;
    expect(result.artifact.artifact.relations).toEqual(input.relations);
    expect(result.artifact.artifact.inference_steps).toEqual(input.inference_steps);
    expect(result.artifact.artifact.premise_groups).toEqual(input.premise_groups);
    expect(input).toEqual(fixture);
  });

  it('loads the unmodified PILOT fixture as auxiliary-only without inventing relations', () => {
    const input = structuredClone(pilotGi);
    const result = loadGiSlotArtifact(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.artifact.profile).toBe('MINIMAL_AUXILIARY_GI');
    expect(isFullGiArtifact(result.artifact)).toBe(false);
    expect('relations' in result.artifact.artifact).toBe(false);
    expect(giArtifactForAuxiliary(result.artifact).entities[0].id).toBe('GI-R01-PROV-C1');
    expect(input).toEqual(pilotGi);
  });

  it('reports both profile failures in one structured G_I error', () => {
    const result = loadGiSlotArtifact({});
    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_GI_ARTIFACT' } });
    if (!result.ok) {
      expect(result.error.details.some(detail => detail.startsWith('FULL_GI:'))).toBe(true);
      expect(result.error.details.some(detail => detail.startsWith('MINIMAL_AUXILIARY_GI:'))).toBe(true);
    }
  });
});
