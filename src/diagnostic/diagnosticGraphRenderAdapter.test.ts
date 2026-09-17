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
