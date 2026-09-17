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
