import { describe, expect, it } from 'vitest';
import gdFixture from './fixtures/pilot-r01/gd-pilot-r01-minimal.json';
import giFixture from './fixtures/pilot-r01/gi-pilot-r01-minimal.json';
import pilotFixture from './fixtures/pilot-r01/diagnostic-output-v0.1.2-pilot-r01.json';
import { classifyGd, classifyGi, createAuxiliaryContext, notLoaded, resolveAuxiliaryReference } from './auxiliary/context';
import { loadGdArtifact } from './auxiliary/gdLoader';
import { loadGiArtifact } from './auxiliary/giLoader';
import { adaptDiagnosticGraphForRender } from './diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import { loadDiagnosticOutput } from './diagnosticOutputLoader';

const pipeline = (input: unknown) => {
  const output = loadDiagnosticOutput(input);
  const viewModel = buildDiagnosticGraphViewModel(output);
  return { output, viewModel, renderModel: adaptDiagnosticGraphForRender(viewModel) };
};

const unwrapGi = (input: unknown) => {
  const result = loadGiArtifact(input);
  if (!result.ok) throw new Error(result.error.message);
  return result.artifact;
};
const unwrapGd = (input: unknown) => {
  const result = loadGdArtifact(input);
  if (!result.ok) throw new Error(result.error.message);
  return result.artifact;
};

describe('PILOT-R01 canonical pipeline acceptance', () => {
  it('loads v0.1.2 metadata through the real fail-closed loader', () => {
    const { output } = pipeline(pilotFixture);
    expect(output.schema_version).toBe('0.1.2');
    expect(output.run_metadata).toMatchObject({
      run_id: 'PILOT-R01-RUN-001',
      graph_ref: 'scitesis://pilot/PILOT-R01-RUN-001/GI-PROVISIONAL',
      graph_version: 'SIMULATED-PROVISIONAL-R01-RUN-001-GI-v1',
      diagnostic_graph_ref: 'scitesis://pilot/PILOT-R01-RUN-001/GD-PROVISIONAL',
      diagnostic_graph_version: 'SIMULATED-PROVISIONAL-R01-RUN-001-GD-v1',
      evaluation_state_id: 'PILOT-R01-RUN-001-E1-PROVISIONAL',
      diagnostic_rule_version: 'SCITESIS-INTEGRATED-DIAGNOSTIC-SIMULATOR-v0.4.2',
    });
    expect(output.scope.scope_payload).toMatchObject({ human_review: 'NOT_YET_PERFORMED' });
  });

  it('preserves exact mixed claim and inference states and stable record counts', () => {
    const { viewModel } = pipeline(pilotFixture);
    expect(viewModel.claims.map(({ claim_id, def_e_value, adjudication_status }) => [claim_id, def_e_value, adjudication_status])).toEqual([
      ['C1', 'TRUE', 'RESOLVED'], ['C2', 'UNKNOWN', 'REVIEW_REQUIRED'], ['C3', 'UNKNOWN', 'REVIEW_REQUIRED'],
      ['C4', 'FALSE', 'RESOLVED'], ['C5', 'FALSE', 'RESOLVED'], ['C6', 'UNKNOWN', 'REVIEW_REQUIRED'],
    ]);
    expect(viewModel.inferenceSteps.map(({ inference_step_id, active_state, activity_adjudication_status }) => [inference_step_id, active_state, activity_adjudication_status])).toEqual([
      ['I1', 'ACTIVE', 'RESOLVED'], ['I2', 'UNKNOWN', 'REVIEW_REQUIRED'], ['I3', 'UNKNOWN', 'REVIEW_REQUIRED'],
      ['I4', 'INACTIVE', 'RESOLVED'], ['I5', 'INACTIVE', 'RESOLVED'], ['I6', 'UNKNOWN', 'REVIEW_REQUIRED'],
    ]);
    expect({ claims: viewModel.claims.length, steps: viewModel.inferenceSteps.length, transitions: viewModel.transitions.length, breakpoints: viewModel.breakpoints.length, downstream: viewModel.downstreamEffects.length, reviews: viewModel.reviewRequiredItems.length }).toEqual({ claims: 6, steps: 6, transitions: 1, breakpoints: 2, downstream: 2, reviews: 5 });
  });

  it('renders only the one materialized H_e transition and never reconstructs unknown or inactive routes', () => {
    const { viewModel, renderModel } = pipeline(pilotFixture);
    expect(viewModel.transitions).toHaveLength(1);
    expect(viewModel.transitions[0]).toMatchObject({ inference_step_id: 'I1', target_claim_id: 'C1', transition_state: 'ACTIVE' });
    expect(renderModel.edges).toHaveLength(1);
    expect(renderModel.edges[0]).toMatchObject({ segment: 'STEP_TO_TARGET', inference_step_id: 'I1', target_claim_id: 'C1' });
    expect(renderModel.edges.some(edge => ['I2', 'I3', 'I4', 'I5', 'I6'].includes(edge.inference_step_id))).toBe(false);
  });

  it('projects exact breakpoints and downstream records 1:1', () => {
    const { viewModel, renderModel } = pipeline(pilotFixture);
    expect(viewModel.breakpoints.map(item => item.breakpoint_id)).toEqual(['BP-R01-AGE', 'BP-R01-SOCIO']);
    expect(renderModel.breakpoints.map(item => item.canonicalId)).toEqual(['BP-R01-AGE', 'BP-R01-SOCIO']);
    expect(renderModel.downstreamEffects).toHaveLength(viewModel.downstreamEffects.length);
    expect(renderModel.downstreamEffects.map(item => item.downstreamEffect)).toEqual(viewModel.downstreamEffects);
  });

  it('keeps an empty REVIEW_REQUIRED frontier and does not promote the TRUE claim', () => {
    const { viewModel, renderModel } = pipeline(pilotFixture);
    expect(viewModel.frontier).toMatchObject({ member_claim_ids: [], frontier_cardinality: 0, frontier_status: 'REVIEW_REQUIRED' });
    expect(renderModel.frontier.frontier).toMatchObject({ member_claim_ids: [], frontier_cardinality: 0, frontier_status: 'REVIEW_REQUIRED' });
    expect(renderModel.nodes.every(node => node.kind !== 'CLAIM' || !node.isFrontierMember)).toBe(true);
    const c1 = renderModel.nodes.find(node => node.kind === 'CLAIM' && node.canonicalId === 'C1');
    expect(c1).toMatchObject({ claim: { def_e_value: 'TRUE' }, isFrontierMember: false });
    expect(viewModel.compatibilityMaximums).toEqual([]);
  });

  it('keeps review records and trace fields literal, including null refs', () => {
    const { viewModel } = pipeline(pilotFixture);
    expect(viewModel.reviewRequiredItems.map(item => item.review_reason)).toEqual([
      'Empathy scoring requires human review.',
      'Group relationship management scoring requires human review.',
      'Sample/population scope requires human review.',
      'Psychometric sufficiency requires human review.',
      'Parametric assumptions and multiplicity require human review.',
    ]);
    expect(viewModel.inferenceSteps[0].explanation_trace[0]).toEqual({
      sequence: 1,
      trace_kind: 'INFERENCE_STEP',
      subject_ref: 'I1',
      rule_ref: null,
      message: 'Materialized provisional activity state for I1.',
    });
    expect(viewModel.frontier.explanation_trace[0].subject_ref).toBeNull();
  });

  it('is deterministic and does not mutate the serialized fixture', () => {
    const input = structuredClone(pilotFixture);
    const before = structuredClone(input);
    const first = pipeline(input);
    const second = pipeline(input);
    expect(first.viewModel).toEqual(second.viewModel);
    expect(first.renderModel).toEqual(second.renderModel);
    expect(input).toEqual(before);
  });

  it('uses compatible optional auxiliaries only to resolve literal refs', () => {
    const { viewModel, renderModel } = pipeline(pilotFixture);
    const gi = classifyGi(unwrapGi(giFixture), viewModel.metadata.run_metadata);
    const gd = classifyGd(unwrapGd(gdFixture), viewModel.metadata.run_metadata);
    expect(gi.status).toBe('LOADED_COMPATIBLE');
    expect(gd.status).toBe('LOADED_COMPATIBLE');
    const context = createAuxiliaryContext(gi, gd);
    expect(resolveAuxiliaryReference('GI-R01-PROV-C1', context)).toMatchObject({ status: 'RESOLVED', artifact: 'GI' });
    expect(resolveAuxiliaryReference('GD-R01-AGE-CONDITION', context)).toMatchObject({ status: 'RESOLVED', artifact: 'GD' });
    expect(adaptDiagnosticGraphForRender(viewModel)).toEqual(renderModel);
  });

  it('reports auxiliary mismatch without changing the diagnostic render model', () => {
    const { viewModel, renderModel } = pipeline(pilotFixture);
    const mismatched = unwrapGi({ ...giFixture, graph_version: 'MISMATCH' });
    const gi = classifyGi(mismatched, viewModel.metadata.run_metadata);
    expect(gi.status).toBe('LOADED_MISMATCH');
    const context = createAuxiliaryContext(gi, notLoaded());
    expect(resolveAuxiliaryReference('GI-R01-PROV-C1', context)).toEqual({ status: 'AUXILIARY_MISMATCH', ref: 'GI-R01-PROV-C1', artifacts: ['GI'] });
    expect(adaptDiagnosticGraphForRender(viewModel)).toEqual(renderModel);
  });
});
