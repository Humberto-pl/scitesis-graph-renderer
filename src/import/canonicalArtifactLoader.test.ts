import { describe, expect, it } from 'vitest';
import outputSchema from '../../docs/canonical-simulator/SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_SCHEMA_v0.3.json';
import qualis from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import type { ConfirmedSimulatedGraphArtifact } from '../graph/types';
import { loadCanonicalArtifactFromText } from './canonicalArtifactLoader';

const text = JSON.stringify(qualis);

describe('loadCanonicalArtifactFromText', () => {
  it('uses the canonical Draft 2020-12 schema and accepts QUALIS without mutation', () => {
    expect(outputSchema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    const result = loadCanonicalArtifactFromText(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.artifact).toEqual(qualis);
      expect(result.artifact.artifact_type).toBe('CONFIRMED_SIMULATED_GRAPH');
    }
  });

  it('reports invalid JSON', () => {
    const result = loadCanonicalArtifactFromText('{');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_JSON');
  });

  it('rejects unsupported artifact types specifically', () => {
    const result = loadCanonicalArtifactFromText('{"artifact_type":"SIMULATION_TRACE"}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNSUPPORTED_ARTIFACT_TYPE');
  });

  it('rejects required/string schema violations', () => {
    const result = loadCanonicalArtifactFromText(JSON.stringify({ ...qualis, case_id: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('SCHEMA_VALIDATION_FAILED');
  });

  it('rejects a canonical const violation', () => {
    const result = loadCanonicalArtifactFromText(JSON.stringify({ ...qualis, contract_version: '9.9' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('SCHEMA_VALIDATION_FAILED');
  });

  it('rejects unknown top-level properties', () => {
    const result = loadCanonicalArtifactFromText(JSON.stringify({ ...qualis, unexpected: true }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('SCHEMA_VALIDATION_FAILED');
  });

  it('preserves a schema-legitimate null without coercion', () => {
    const value = structuredClone(qualis) as unknown as ConfirmedSimulatedGraphArtifact;
    value.entities[0].epistemic_plane = null;
    const result = loadCanonicalArtifactFromText(JSON.stringify(value));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.artifact.entities[0].epistemic_plane).toBeNull();
  });
});
