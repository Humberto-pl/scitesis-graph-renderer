import { describe, expect, it } from 'vitest';
import minimalValidOutput from './fixtures/diagnostic-output-v0.1.2-minimal-valid.json';
import {
  DiagnosticOutputValidationError,
  loadDiagnosticOutput,
} from './diagnosticOutputLoader';
import type { DiagnosticOutput } from './types';

describe('loadDiagnosticOutput', () => {
  it('accepts the canonical minimal fixture and returns the original object', () => {
    const input: unknown = structuredClone(minimalValidOutput);

    const output: DiagnosticOutput = loadDiagnosticOutput(input);

    expect(output).toBe(input);
    expect(output).toEqual(minimalValidOutput);
  });

  it('rejects missing required properties with structured validation issues', () => {
    const input = structuredClone(minimalValidOutput) as Record<string, unknown>;
    delete input.scope;

    expect(() => loadDiagnosticOutput(input)).toThrow(DiagnosticOutputValidationError);

    try {
      loadDiagnosticOutput(input);
    } catch (error) {
      expect(error).toMatchObject({
        name: 'DiagnosticOutputValidationError',
        code: 'DIAGNOSTIC_OUTPUT_SCHEMA_VALIDATION_FAILED',
        schemaId: 'scitesis://diagnostic-output/0.1.2',
      });
      expect((error as DiagnosticOutputValidationError).issues).toContainEqual(
        expect.objectContaining({
          instancePath: '',
          keyword: 'required',
          params: { missingProperty: 'scope' },
        }),
      );
    }
  });

  it('rejects the wrong schema version', () => {
    const input = { ...minimalValidOutput, schema_version: '0.1.1' };

    expect(() => loadDiagnosticOutput(input)).toThrow(DiagnosticOutputValidationError);
  });

  it('rejects additional properties instead of removing them', () => {
    const input = { ...minimalValidOutput, unexpected: true };
    const before = structuredClone(input);

    expect(() => loadDiagnosticOutput(input)).toThrow(DiagnosticOutputValidationError);
    expect(input).toEqual(before);
    expect(input).toHaveProperty('unexpected', true);
  });

  it('rejects the legacy artifact_type root property with a complete structured issue', () => {
    const input = { ...minimalValidOutput, artifact_type: 'DIAGNOSTIC_OUTPUT' };

    try {
      loadDiagnosticOutput(input);
      throw new Error('Expected diagnostic output validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagnosticOutputValidationError);
      const validationError = error as DiagnosticOutputValidationError;
      const issue = validationError.issues.find(
        candidate => candidate.keyword === 'additionalProperties'
          && candidate.params.additionalProperty === 'artifact_type',
      );

      expect(issue).toEqual({
        instancePath: '',
        schemaPath: '#/additionalProperties',
        keyword: 'additionalProperties',
        message: 'must NOT have additional properties',
        params: { additionalProperty: 'artifact_type' },
      });
    }
  });

  it('rejects an invalid Def_e enum value without mutating it', () => {
    const input = structuredClone(minimalValidOutput) as unknown as {
      claim_defendibility: Array<{ def_e_value: string }>;
    };
    input.claim_defendibility[0].def_e_value = 'MAYBE';

    try {
      loadDiagnosticOutput(input);
      throw new Error('Expected diagnostic output validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagnosticOutputValidationError);
      expect((error as DiagnosticOutputValidationError).issues).toContainEqual(
        expect.objectContaining({
          instancePath: '/claim_defendibility/0/def_e_value',
          keyword: 'enum',
        }),
      );
    }

    expect(input.claim_defendibility[0].def_e_value).toBe('MAYBE');
  });

  it('rejects a resolution status used as a Def_e value', () => {
    const input = structuredClone(minimalValidOutput) as unknown as {
      claim_defendibility: Array<{ def_e_value: string }>;
    };
    input.claim_defendibility[0].def_e_value = 'REVIEW_REQUIRED';

    try {
      loadDiagnosticOutput(input);
      throw new Error('Expected diagnostic output validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagnosticOutputValidationError);
      expect((error as DiagnosticOutputValidationError).issues).toContainEqual(
        expect.objectContaining({
          instancePath: '/claim_defendibility/0/def_e_value',
          keyword: 'enum',
        }),
      );
    }
  });

  it('rejects a string frontier cardinality without coercing it', () => {
    const input = structuredClone(minimalValidOutput) as unknown as {
      defendability_frontier: { frontier_cardinality: string | number };
    };
    input.defendability_frontier.frontier_cardinality = '0';

    try {
      loadDiagnosticOutput(input);
      throw new Error('Expected diagnostic output validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagnosticOutputValidationError);
      expect((error as DiagnosticOutputValidationError).issues).toContainEqual(
        expect.objectContaining({
          instancePath: '/defendability_frontier/frontier_cardinality',
          keyword: 'type',
        }),
      );
    }

    expect(input.defendability_frontier.frontier_cardinality).toBe('0');
    expect(typeof input.defendability_frontier.frontier_cardinality).toBe('string');
  });

  it('rejects null for a required non-nullable string', () => {
    const input = structuredClone(minimalValidOutput) as unknown as {
      run_metadata: { run_id: string | null };
    };
    input.run_metadata.run_id = null;

    try {
      loadDiagnosticOutput(input);
      throw new Error('Expected diagnostic output validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagnosticOutputValidationError);
      expect((error as DiagnosticOutputValidationError).issues).toContainEqual(
        expect.objectContaining({
          instancePath: '/run_metadata/run_id',
          keyword: 'type',
        }),
      );
    }
  });

  it('rejects invalid nested values instead of coercing them', () => {
    const input = structuredClone(minimalValidOutput) as Record<string, unknown>;
    const runMetadata = input.run_metadata as Record<string, unknown>;
    runMetadata.run_id = 42;

    expect(() => loadDiagnosticOutput(input)).toThrow(DiagnosticOutputValidationError);
    expect(runMetadata.run_id).toBe(42);
  });

  it.each([null, undefined, 'json', 42, [], true])('rejects a non-contract root value: %j', input => {
    expect(() => loadDiagnosticOutput(input)).toThrow(DiagnosticOutputValidationError);
  });
});
