import { describe, expect, expectTypeOf, it } from 'vitest';
import schema from '../../docs/canonical-diagnostic/scitesis_diagnostic_output_v0.1.2.schema.json';
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
  it('has exact parity with the canonical root properties', () => {
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(rootKeys);
    expect(Object.keys(schema.properties)).toEqual(rootKeys);
    expectTypeOf<keyof DiagnosticOutput>().toEqualTypeOf<(typeof rootKeys)[number]>();
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
});
