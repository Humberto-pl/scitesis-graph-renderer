import { describe, expect, it } from 'vitest';
import minimalFixture from './fixtures/diagnostic-output-v0.1.2-minimal-valid.json';
import richFixture from './fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { adaptDiagnosticGraphForRender } from './diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import { loadDiagnosticOutput } from './diagnosticOutputLoader';

const minimalModel = () => buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(minimalFixture)));
const richModel = () => buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));

describe('adaptDiagnosticGraphForRender', () => {
  it('creates one deterministic node per claim and inference step and preserves canonical states', () => {
    const renderModel = adaptDiagnosticGraphForRender(minimalModel());
    expect(renderModel.nodes).toHaveLength(2);
    expect(renderModel.nodes[0]).toMatchObject({ id: 'claim:claim-minimal', kind: 'CLAIM', canonicalId: 'claim-minimal', claim: { claim_id: 'claim-minimal', def_e_value: 'UNKNOWN', adjudication_status: 'REVIEW_REQUIRED' } });
    expect(renderModel.nodes[1]).toMatchObject({ id: 'inference:step-minimal', kind: 'INFERENCE_STEP', canonicalId: 'step-minimal', inferenceStep: { inference_step_id: 'step-minimal', active_state: 'UNKNOWN', activity_adjudication_status: 'REVIEW_REQUIRED' } });
  });

  it('creates no edges when canonical transitions are empty', () => {
    expect(adaptDiagnosticGraphForRender(minimalModel()).edges).toEqual([]);
  });

  it('renders only valid transition segments and reports a non-claim source without inventing a node', () => {
    const renderModel = adaptDiagnosticGraphForRender(richModel());
    expect(renderModel.nodes.some(node => node.canonicalId === 'input-1')).toBe(false);
    expect(renderModel.edges).toHaveLength(1);
    expect(renderModel.edges[0]).toMatchObject({
      id: 'transition:input-1:step-rich:claim-supported:0:step-target',
      transitionKey: 'transition:input-1:step-rich:claim-supported:0',
      source: 'inference:step-rich', target: 'claim:claim-supported',
      segment: 'STEP_TO_TARGET', transition: { transition_state: 'ACTIVE' },
    });
    expect(renderModel.unavailableSourceReferences).toEqual([expect.objectContaining({ sourceClaimOrInputId: 'input-1', transitionState: 'ACTIVE' })]);
    expect(renderModel.unavailableTransitionReferences).toEqual([{
      role: 'SOURCE', canonicalId: 'input-1', transitionKey: 'transition:input-1:step-rich:claim-supported:0',
    }]);
  });

  it('creates claim-to-step and step-to-claim edges only from an explicit transition', () => {
    const model = richModel();
    model.transitions[0].source_claim_or_input_id = 'claim-affected';
    const renderModel = adaptDiagnosticGraphForRender(model);
    expect(renderModel.edges.map(edge => [edge.source, edge.target])).toEqual([
      ['claim:claim-affected', 'inference:step-rich'],
      ['inference:step-rich', 'claim:claim-supported'],
    ]);
    expect(renderModel.edges.every(edge => edge.transition === model.transitions[0])).toBe(false);
    expect(renderModel.edges.map(edge => edge.transitionKey)).toEqual([
      'transition:claim-affected:step-rich:claim-supported:0',
      'transition:claim-affected:step-rich:claim-supported:0',
    ]);
    expect(renderModel.edges.map(edge => edge.segment)).toEqual(['SOURCE_TO_STEP', 'STEP_TO_TARGET']);
  });

  it('preserves all canonical transition metadata explicitly and in an independent copy', () => {
    const edge = adaptDiagnosticGraphForRender(richModel()).edges[0];
    expect(edge).toMatchObject({
      source_claim_or_input_id: 'input-1', inference_step_id: 'step-rich', target_claim_id: 'claim-supported',
      transition_state: 'ACTIVE', required_for_step: 'TRUE', required_for_target: 'TRUE',
      alternative_route_refs: ['route-alternative'], why_active: 'Materialized by the diagnostic engine.',
      provenance_refs: ['provenance-1'],
    });
    expect(edge.alternative_route_refs).not.toBe(edge.transition.alternative_route_refs);
    expect(edge.provenance_refs).not.toBe(edge.transition.provenance_refs);
  });

  it('reports an absent target and omits only the step-to-target segment without inventing a claim', () => {
    const model = richModel();
    model.transitions[0].source_claim_or_input_id = 'claim-affected';
    model.transitions[0].target_claim_id = 'claim-missing';
    const rendered = adaptDiagnosticGraphForRender(model);
    expect(rendered.nodes.some(node => node.canonicalId === 'claim-missing')).toBe(false);
    expect(rendered.edges.map(edge => edge.segment)).toEqual(['SOURCE_TO_STEP']);
    expect(rendered.unavailableTransitionReferences).toEqual([expect.objectContaining({ role: 'TARGET', canonicalId: 'claim-missing' })]);
  });

  it('reports an absent inference and creates no edge or invented inference node', () => {
    const model = richModel();
    model.transitions[0].source_claim_or_input_id = 'claim-affected';
    model.transitions[0].inference_step_id = 'step-missing';
    const rendered = adaptDiagnosticGraphForRender(model);
    expect(rendered.nodes.some(node => node.canonicalId === 'step-missing')).toBe(false);
    expect(rendered.edges).toEqual([]);
    expect(rendered.unavailableTransitionReferences).toEqual([expect.objectContaining({ role: 'INFERENCE', canonicalId: 'step-missing' })]);
  });

  it('creates each segment only when both endpoint references are visible', () => {
    const model = richModel();
    model.transitions[0].source_claim_or_input_id = 'claim-affected';
    const complete = adaptDiagnosticGraphForRender(model);
    expect(complete.edges.map(edge => edge.segment)).toEqual(['SOURCE_TO_STEP', 'STEP_TO_TARGET']);
    model.transitions[0].source_claim_or_input_id = 'source-missing';
    expect(adaptDiagnosticGraphForRender(model).edges.map(edge => edge.segment)).toEqual(['STEP_TO_TARGET']);
    model.transitions[0].source_claim_or_input_id = 'claim-affected';
    model.transitions[0].target_claim_id = 'target-missing';
    expect(adaptDiagnosticGraphForRender(model).edges.map(edge => edge.segment)).toEqual(['SOURCE_TO_STEP']);
  });

  it('does not derive edges from breakpoints, downstream, frontier, or compatibility data', () => {
    const model = richModel();
    model.transitions = [];
    expect(adaptDiagnosticGraphForRender(model).edges).toEqual([]);
  });

  it('is deterministic and does not mutate the ViewModel', () => {
    const model = richModel();
    const before = structuredClone(model);
    expect(adaptDiagnosticGraphForRender(model)).toEqual(adaptDiagnosticGraphForRender(model));
    expect(model).toEqual(before);
  });

  it('maps breakpoints and downstream effects 1:1 without inferring either collection', () => {
    const model = richModel();
    const rendered = adaptDiagnosticGraphForRender(model);
    expect(rendered.breakpoints).toHaveLength(model.breakpoints.length);
    expect(rendered.downstreamEffects).toHaveLength(model.downstreamEffects.length);

    model.breakpoints = [];
    model.downstreamEffects = [];
    model.claims[1].def_e_value = 'FALSE';
    model.inferenceSteps[0].active_state = 'INACTIVE';
    model.transitions = [];
    const empty = adaptDiagnosticGraphForRender(model);
    expect(empty.breakpoints).toEqual([]);
    expect(empty.downstreamEffects).toEqual([]);
  });

  it('preserves every breakpoint field and explicit trace order in an independent copy', () => {
    const model = richModel();
    model.breakpoints[0].explanation_trace = [
      { sequence: 2, trace_kind: 'OTHER', subject_ref: null, rule_ref: null, message: 'second array item' },
      { sequence: 1, trace_kind: 'ORIGIN', subject_ref: 'origin', rule_ref: 'rule', message: 'first sequence value' },
    ];
    const item = adaptDiagnosticGraphForRender(model).breakpoints[0];
    expect(item).toMatchObject({ id: 'breakpoint:breakpoint-1', canonicalId: 'breakpoint-1', inferenceNodeId: 'inference:step-rich', targetClaimNodeId: 'claim:claim-affected' });
    expect(item.breakpoint).toEqual(model.breakpoints[0]);
    expect(item.breakpoint).not.toBe(model.breakpoints[0]);
    expect(item.breakpoint.explanation_trace).not.toBe(model.breakpoints[0].explanation_trace);
    expect(item.breakpoint.explanation_trace.map(trace => trace.message)).toEqual(['second array item', 'first sequence value']);
  });

  it('preserves downstream states and fields literally, including UNKNOWN and NOT_AFFECTED', () => {
    const model = richModel();
    model.downstreamEffects[0].affected_state = 'UNKNOWN';
    model.downstreamEffects[0].adjudication_status = 'REVIEW_REQUIRED';
    model.downstreamEffects.push({ ...structuredClone(model.downstreamEffects[0]), failure_ref: 'other', affected_state: 'NOT_AFFECTED', propagation_reason: null });
    const rendered = adaptDiagnosticGraphForRender(model);
    expect(rendered.downstreamEffects).toHaveLength(2);
    expect(rendered.downstreamEffects.map(item => item.id)).toEqual([
      'downstream:breakpoint-1:claim-affected:0',
      'downstream:other:claim-affected:1',
    ]);
    expect(rendered.downstreamEffects[0].downstreamEffect).toEqual(model.downstreamEffects[0]);
    expect(rendered.downstreamEffects[0].downstreamEffect).toMatchObject({ affected_state: 'UNKNOWN', adjudication_status: 'REVIEW_REQUIRED', lost_viable_derivation_ids: ['route-blocked'], remaining_viable_derivation_ids: [], required_dependency_refs: ['step-rich'], alternative_route_refs: ['route-alternative'], propagation_reason: 'Canonical propagation result.' });
    expect(rendered.downstreamEffects[1].downstreamEffect).toMatchObject({ affected_state: 'NOT_AFFECTED', propagation_reason: null });
    expect(rendered.nodes.find(node => node.kind === 'CLAIM' && node.canonicalId === 'claim-affected')).toMatchObject({ downstreamEffectIds: rendered.downstreamEffects.map(item => item.id) });
  });

  it('retains multiple breakpoints on one step and relates records only by explicit id equality', () => {
    const model = richModel();
    model.breakpoints.push({ ...structuredClone(model.breakpoints[0]), breakpoint_id: 'breakpoint-2' });
    model.downstreamEffects.push({ ...structuredClone(model.downstreamEffects[0]), failure_ref: 'other' });
    const rendered = adaptDiagnosticGraphForRender(model);
    expect(rendered.breakpoints).toHaveLength(2);
    expect(rendered.nodes.find(node => node.kind === 'INFERENCE_STEP')).toMatchObject({ breakpointIds: ['breakpoint:breakpoint-1', 'breakpoint:breakpoint-2'] });
    expect(rendered.breakpoints[0].downstreamEffectIds).toEqual(['downstream:breakpoint-1:claim-affected:0']);
    expect(rendered.breakpoints[1].downstreamEffectIds).toEqual([]);
    expect(rendered.downstreamEffects.map(item => item.relatedBreakpointId)).toEqual(['breakpoint:breakpoint-1', null]);
  });

  it('reports unresolved visual references without inventing nodes', () => {
    const model = richModel();
    model.breakpoints[0].breakpoint_step_id = 'missing-step';
    model.breakpoints[0].affected_transition_target_id = 'missing-breakpoint-target';
    model.downstreamEffects[0].target_claim_id = 'missing-downstream-target';
    model.downstreamEffects[0].failure_ref = 'another-kind-of-failure';
    const rendered = adaptDiagnosticGraphForRender(model);
    expect(rendered.nodes.some(node => node.canonicalId.startsWith('missing-'))).toBe(false);
    expect(rendered.unavailableDiagnosticReferences.map(reference => [reference.role, reference.canonicalId])).toEqual([
      ['BREAKPOINT_STEP', 'missing-step'],
      ['BREAKPOINT_TARGET', 'missing-breakpoint-target'],
      ['DOWNSTREAM_TARGET', 'missing-downstream-target'],
      ['FAILURE_REF', 'another-kind-of-failure'],
    ]);
  });

  it('gives multiple materialized transitions stable, distinct keys without grouping them semantically', () => {
    const model = richModel();
    model.transitions.push(structuredClone(model.transitions[0]));
    const first = adaptDiagnosticGraphForRender(model);
    const second = adaptDiagnosticGraphForRender(model);
    expect(first).toEqual(second);
    expect(first.edges.map(edge => edge.transitionKey)).toEqual([
      'transition:input-1:step-rich:claim-supported:0',
      'transition:input-1:step-rich:claim-supported:1',
    ]);
  });
});
