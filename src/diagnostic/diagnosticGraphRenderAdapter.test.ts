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
      source: 'inference:step-rich', target: 'claim:claim-supported',
      segment: 'STEP_TO_TARGET', transition: { transition_state: 'ACTIVE' },
    });
    expect(renderModel.unavailableSourceReferences).toEqual([expect.objectContaining({ sourceClaimOrInputId: 'input-1', transitionState: 'ACTIVE' })]);
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
});
