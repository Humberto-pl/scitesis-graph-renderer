import { describe, expect, it } from 'vitest';
import minimalFixture from './fixtures/diagnostic-output-v0.1.2-minimal-valid.json';
import richFixture from './fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { buildDiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import { loadDiagnosticOutput } from './diagnosticOutputLoader';

const minimalOutput = loadDiagnosticOutput(minimalFixture);
const richOutput = loadDiagnosticOutput(richFixture);

describe('buildDiagnosticGraphViewModel', () => {
  it('projects every canonical collection 1:1 from a loader-validated rich fixture', () => {
    const model = buildDiagnosticGraphViewModel(richOutput);

    expect(model.claims).toHaveLength(richOutput.claim_defendibility.length);
    expect(model.inferenceSteps).toHaveLength(richOutput.inference_step_states.length);
    expect(model.transitions).toHaveLength(richOutput.viable_dependency_view.transitions.length);
    expect(model.breakpoints).toHaveLength(richOutput.breakpoints.length);
    expect(model.downstreamEffects).toHaveLength(richOutput.downstream_effects.length);
    expect(model.compatibilityMaximums).toHaveLength(richOutput.compatibility_maximums.length);
    expect(model.reviewRequiredItems).toHaveLength(richOutput.review_required_items.length);

    expect(model.claims).toEqual(richOutput.claim_defendibility);
    expect(model.inferenceSteps).toEqual(richOutput.inference_step_states);
    expect(model.transitions).toEqual(richOutput.viable_dependency_view.transitions);
    expect(model.breakpoints).toEqual(richOutput.breakpoints);
    expect(model.downstreamEffects).toEqual(richOutput.downstream_effects);
    expect(model.frontier).toEqual(richOutput.defendability_frontier);
    expect(model.compatibilityMaximums).toEqual(richOutput.compatibility_maximums);
    expect(model.reviewRequiredItems).toEqual(richOutput.review_required_items);
  });

  it('preserves canonical metadata and viable-view identity without embedding transitions twice', () => {
    const model = buildDiagnosticGraphViewModel(richOutput);

    expect(model.metadata).toEqual({
      schema_version: richOutput.schema_version,
      run_metadata: richOutput.run_metadata,
      scope: richOutput.scope,
      viable_dependency_view: {
        view_id: richOutput.viable_dependency_view.view_id,
        scope_id: richOutput.viable_dependency_view.scope_id,
        evaluation_state_id: richOutput.viable_dependency_view.evaluation_state_id,
        view_status: richOutput.viable_dependency_view.view_status,
        derivation_rule_version: richOutput.viable_dependency_view.derivation_rule_version,
      },
      explanation_summary: richOutput.explanation_summary,
    });
  });

  it('does not mutate or retain mutable nested data from its input', () => {
    const input = loadDiagnosticOutput(structuredClone(richFixture));
    const before = structuredClone(input);
    const model = buildDiagnosticGraphViewModel(input);

    expect(input).toEqual(before);
    model.claims[0].viable_derivation_ids.push('view-only');
    model.metadata.scope.target_claim_ids.push('view-only');
    model.transitions[0].provenance_refs.push('view-only');
    expect(input).toEqual(before);
  });

  it('is deterministic for the same validated input', () => {
    expect(buildDiagnosticGraphViewModel(richOutput)).toEqual(
      buildDiagnosticGraphViewModel(richOutput),
    );
  });

  it('preserves UNKNOWN and REVIEW_REQUIRED as distinct authoritative states', () => {
    const model = buildDiagnosticGraphViewModel(minimalOutput);

    expect(model.claims[0]).toMatchObject({
      def_e_value: 'UNKNOWN',
      adjudication_status: 'REVIEW_REQUIRED',
    });
    expect(model.inferenceSteps[0]).toMatchObject({
      active_state: 'UNKNOWN',
      activity_adjudication_status: 'REVIEW_REQUIRED',
    });
  });

  it('preserves an empty review-required frontier and empty materialized transitions', () => {
    const model = buildDiagnosticGraphViewModel(minimalOutput);

    expect(model.frontier).toMatchObject({
      member_claim_ids: [],
      frontier_cardinality: 0,
      frontier_status: 'REVIEW_REQUIRED',
    });
    expect(model.transitions).toEqual([]);
  });
});
