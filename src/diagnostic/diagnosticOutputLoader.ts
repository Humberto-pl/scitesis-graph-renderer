import Ajv2020, { type ErrorObject } from 'ajv/dist/2020';
import diagnosticOutputSchema from '../../docs/canonical-diagnostic/scitesis_diagnostic_output_v0.1.2.schema.json';
import type { DiagnosticOutput } from './types';

export const DIAGNOSTIC_OUTPUT_SCHEMA_ID = 'scitesis://diagnostic-output/0.1.2' as const;

export interface DiagnosticOutputValidationIssue {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  message: string;
  params: Readonly<Record<string, unknown>>;
}

/** Raised when an unknown value does not satisfy the canonical v0.1.2 schema. */
export class DiagnosticOutputValidationError extends Error {
  readonly code = 'DIAGNOSTIC_OUTPUT_SCHEMA_VALIDATION_FAILED' as const;
  readonly schemaId = DIAGNOSTIC_OUTPUT_SCHEMA_ID;

  constructor(readonly issues: readonly DiagnosticOutputValidationIssue[]) {
    super(`Diagnostic Output v0.1.2 validation failed with ${issues.length} issue(s).`);
    this.name = 'DiagnosticOutputValidationError';
  }
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  useDefaults: false,
  removeAdditional: false,
  coerceTypes: false,
});

const validateDiagnosticOutput = ajv.compile<DiagnosticOutput>(diagnosticOutputSchema);

function toValidationIssue(error: ErrorObject): DiagnosticOutputValidationIssue {
  return {
    instancePath: error.instancePath,
    schemaPath: error.schemaPath,
    keyword: error.keyword,
    message: error.message ?? error.keyword,
    params: { ...error.params },
  };
}

/**
 * Validates an unknown value against the canonical Diagnostic Output v0.1.2
 * schema and returns that same value, typed, when it is valid.
 *
 * This boundary deliberately performs no parsing, normalization, coercion,
 * defaulting, reference resolution, or other semantic processing.
 */
export function loadDiagnosticOutput(input: unknown): DiagnosticOutput {
  if (!validateDiagnosticOutput(input)) {
    throw new DiagnosticOutputValidationError(
      (validateDiagnosticOutput.errors ?? []).map(toValidationIssue),
    );
  }

  return input;
}
