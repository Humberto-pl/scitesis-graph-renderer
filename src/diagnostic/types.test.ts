import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, expectTypeOf, it } from 'vitest';
import schema from '../../docs/canonical-diagnostic/scitesis_diagnostic_output_v0.1.2.schema.json';
import schemaSource from '../../docs/canonical-diagnostic/scitesis_diagnostic_output_v0.1.2.schema.json?raw';
import minimalValidOutput from './fixtures/diagnostic-output-v0.1.2-minimal-valid.json';
import {
  ACTIVE_STATE_VALUES,
  AFFECTED_STATE_VALUES,
  DIAGNOSTIC_GRAPH_ORIGIN_VALUES,
  DIAGNOSTIC_OUTPUT_SCHEMA_VERSION,
  FAILURE_MODE_VALUES,
  MAXIMUM_KIND_VALUES,
  RESOLUTION_STATUS_VALUES,
  SIMULATOR_OR_ENGINE_VALUES,
  SUMMARY_STATUS_VALUES,
  TRACE_KIND_VALUES,
  TRI_STATE_VALUES,
  type DiagnosticOutput,
  type ResolutionStatus,
  type TriState,
} from './types';

const rootKeys = [
  'schema_version',
  'run_metadata',
  'scope',
  'inference_step_states',
  'claim_defendibility',
  'viable_dependency_view',
  'breakpoints',
  'downstream_effects',
  'defendability_frontier',
  'compatibility_maximums',
  'review_required_items',
  'explanation_summary',
] as const satisfies readonly (keyof DiagnosticOutput)[];

const rejectedLegacyRootKeys = ['artifact_type', 'contract_version', 'H_e', 'routes', 'trace'] as const;
const expectedSchemaSha256 = 'f70ce8734f6599a40e7cc0f37108503b3bba2ab06e9dcd2a7130c09aa996e80a';

function compileCanonicalSchema() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  return ajv.compile(schema);
}

const enumRows: ReadonlyArray<{ definition: string; values: readonly unknown[]; property?: string }> = [
  { definition: 'triState', values: TRI_STATE_VALUES },
  { definition: 'resolutionStatus', values: RESOLUTION_STATUS_VALUES },
  { definition: 'traceItem', values: TRACE_KIND_VALUES, property: 'trace_kind' },
  { definition: 'runMetadata', values: DIAGNOSTIC_GRAPH_ORIGIN_VALUES, property: 'diagnostic_graph_origin' },
  { definition: 'runMetadata', values: SIMULATOR_OR_ENGINE_VALUES, property: 'simulator_or_engine' },
  { definition: 'inferenceStepState', values: ACTIVE_STATE_VALUES, property: 'active_state' },
  { definition: 'failureMode', values: FAILURE_MODE_VALUES },
  { definition: 'downstreamEffect', values: AFFECTED_STATE_VALUES, property: 'affected_state' },
  { definition: 'compatibilityMaximum', values: MAXIMUM_KIND_VALUES, property: 'maximum_kind' },
  { definition: 'explanationSummary', values: SUMMARY_STATUS_VALUES, property: 'summary_status' },
];

describe('Diagnostic Output v0.1.2 contract types', () => {
  it('protects the canonical schema byte-for-byte with its frozen SHA-256', async () => {
    const schemaBytes = new TextEncoder().encode(schemaSource);
    const digest = await crypto.subtle.digest('SHA-256', schemaBytes);
    const sha256 = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');

    expect(sha256).toBe(expectedSchemaSha256);
  });

  it('compiles as Draft 2020-12 in AJV without mutating the schema', () => {
    const schemaBeforeCompilation = JSON.stringify(schema);

    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(() => compileCanonicalSchema()).not.toThrow();
    expect(JSON.stringify(schema)).toBe(schemaBeforeCompilation);
  });

  it('accepts the minimal canonical fixture', () => {
    const validate = compileCanonicalSchema();
    const valid = validate(minimalValidOutput);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it('has exact parity with the canonical root properties', () => {
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(rootKeys);
    expect(Object.keys(schema.properties)).toEqual(rootKeys);
    expectTypeOf<keyof DiagnosticOutput>().toEqualTypeOf<(typeof rootKeys)[number]>();
  });

  it.each(rejectedLegacyRootKeys)('does not expose legacy %s as a canonical root property', property => {
    expect(schema.properties).not.toHaveProperty(property);
  });

  it.each(enumRows)('keeps $definition closed values synchronized with the schema', ({ definition, values, property }) => {
    const definitions = schema.$defs as Record<string, { enum?: unknown[]; properties?: Record<string, { enum?: unknown[] }> }>;
    const definitionSchema = definitions[definition];
    const valueSchema = property ? definitionSchema.properties?.[property] : definitionSchema;
    expect(valueSchema).toBeDefined();
    if (!valueSchema) throw new Error(`Missing schema definition: ${definition}`);
    expect('enum' in valueSchema ? valueSchema.enum : []).toEqual(values);
  });

  it('keeps schema identity and the ACTIVE transition constant', () => {
    expect(schema.$id).toBe('scitesis://diagnostic-output/0.1.2');
    expect(schema.properties.schema_version.const).toBe(DIAGNOSTIC_OUTPUT_SCHEMA_VERSION);
    expect(schema.$defs.viableTransition.properties.transition_state.const).toBe('ACTIVE');
  });

  it('keeps Def_e and resolution as separate type axes', () => {
    expectTypeOf<TriState>().toEqualTypeOf<'TRUE' | 'FALSE' | 'UNKNOWN'>();
    expectTypeOf<ResolutionStatus>().toEqualTypeOf<'RESOLVED' | 'REVIEW_REQUIRED'>();
    expect(TRI_STATE_VALUES).not.toContain('REVIEW_REQUIRED');
    expect(RESOLUTION_STATUS_VALUES).not.toContain('UNKNOWN');
  });

  it('represents UNKNOWN claim defendibility as requiring review', () => {
    expect(minimalValidOutput.claim_defendibility[0]).toMatchObject({
      def_e_value: 'UNKNOWN',
      adjudication_status: 'REVIEW_REQUIRED',
    });
  });

  it('represents UNKNOWN inference-step activity as requiring review', () => {
    expect(minimalValidOutput.inference_step_states[0]).toMatchObject({
      active_state: 'UNKNOWN',
      activity_adjudication_status: 'REVIEW_REQUIRED',
    });
  });

  it('permits a review-required empty defendability frontier', () => {
    expect(minimalValidOutput.defendability_frontier).toMatchObject({
      member_claim_ids: [],
      frontier_cardinality: 0,
      frontier_status: 'REVIEW_REQUIRED',
    });
  });

  it('permits an empty viable dependency view', () => {
    expect(minimalValidOutput.viable_dependency_view.transitions).toEqual([]);
  });
});
