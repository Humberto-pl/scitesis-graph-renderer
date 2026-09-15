import { describe, expect, it } from 'vitest';
import { artifactValue, provenanceValue } from './epistemicPresentation';

describe('epistemic metadata presentation', () => {
  it('preserves distinct literal values and only omits undefined', () => {
    expect(artifactValue('EXPLICIT')).toBe('EXPLICIT');
    expect(artifactValue('IMPLICIT_RECONSTRUCTED')).toBe('IMPLICIT_RECONSTRUCTED');
    expect(artifactValue('SYSTEM_INFERRED')).toBe('SYSTEM_INFERRED');
    expect(artifactValue(0.92001)).toBe('0.92001');
    expect(artifactValue(null)).toBe('null');
    expect(artifactValue(undefined)).toBeUndefined();
  });

  it('serializes all provenance information deterministically without mutation', () => {
    const provenance = [{ source_span: { page: 12 }, source_ref: 'SOURCE-1', attribution: { year: 2001 }, extension: ['x'] }];
    const snapshot = structuredClone(provenance);

    expect(provenanceValue(provenance)).toBe(provenanceValue(structuredClone(provenance)));
    expect(provenanceValue(provenance)).toContain('"source_ref": "SOURCE-1"');
    expect(provenanceValue(provenance)).toContain('"extension"');
    expect(provenance).toEqual(snapshot);
  });
});
