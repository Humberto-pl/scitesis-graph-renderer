import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import minimalFixture from '../diagnostic/fixtures/diagnostic-output-v0.1.2-minimal-valid.json';
import richFixture from '../diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { adaptDiagnosticGraphForRender } from '../diagnostic/diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from '../diagnostic/diagnosticGraphViewModel';
import { loadDiagnosticOutput } from '../diagnostic/diagnosticOutputLoader';
import { DiagnosticGraphRenderer } from './DiagnosticGraphRenderer';

const richRenderModel = () => adaptDiagnosticGraphForRender(buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture))));

describe('DiagnosticGraphRenderer', () => {
  it('renders canonical claim and inference fields without collapsing UNKNOWN and REVIEW_REQUIRED', () => {
    const model = adaptDiagnosticGraphForRender(buildDiagnosticGraphViewModel(loadDiagnosticOutput(minimalFixture)));
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getByText('CLAIM')).toBeInTheDocument();
    expect(screen.getByText('INFERENCE STEP')).toBeInTheDocument();
    expect(screen.getByText('ID: claim-minimal')).toBeInTheDocument();
    expect(screen.getByText('ID: step-minimal')).toBeInTheDocument();
    expect(screen.getByText('Def_e: UNKNOWN')).toBeInTheDocument();
    expect(screen.getByText('Active_e: UNKNOWN')).toBeInTheDocument();
    expect(screen.getAllByText('Status: REVIEW_REQUIRED')).toHaveLength(2);
  });

  it('states that visible H_e is materialized rather than reconstructed', () => {
    const model = adaptDiagnosticGraphForRender(buildDiagnosticGraphViewModel(loadDiagnosticOutput(minimalFixture)));
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getByText(/solo transitions ACTIVE/)).toHaveTextContent('el renderer no reconstruye rutas');
  });

  it('selects an edge and shows every canonical transition field literally', () => {
    const model = adaptDiagnosticGraphForRender(buildDiagnosticGraphViewModel(loadDiagnosticOutput(richFixture)));
    const before = structuredClone(model);
    render(<DiagnosticGraphRenderer model={model} />);
    fireEvent.click(screen.getByRole('button', { name: /STEP_TO_TARGET de transition:input-1/ }));
    const inspector = screen.getByRole('complementary');
    expect(within(inspector).getByRole('heading', { name: 'TRANSITION' })).toBeInTheDocument();
    for (const value of ['input-1', 'step-rich', 'claim-supported', 'ACTIVE', 'Materialized by the diagnostic engine.', '["route-alternative"]', '["provenance-1"]']) {
      expect(within(inspector).getByText(value)).toBeInTheDocument();
    }
    expect(within(inspector).getAllByText('TRUE')).toHaveLength(2);
    expect(within(inspector).getByText('Required for step')).toBeInTheDocument();
    expect(within(inspector).getByText('Required for target')).toBeInTheDocument();
    expect(model).toEqual(before);
  });

  it('makes both segments of one transition select the same canonical information', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
    viewModel.transitions[0].source_claim_or_input_id = 'claim-affected';
    const model = adaptDiagnosticGraphForRender(viewModel);
    render(<DiagnosticGraphRenderer model={model} />);
    const edges = screen.getAllByRole('button', { name: /de transition:claim-affected/ });
    expect(edges).toHaveLength(2);
    fireEvent.click(edges[0]);
    expect(screen.getByRole('complementary')).toHaveTextContent('claim-affected');
    fireEvent.click(edges[1]);
    expect(screen.getByRole('complementary')).toHaveTextContent('claim-affected');
    expect(model.edges[0].transitionKey).toBe(model.edges[1].transitionKey);
  });

  it('reports a non-claim source while keeping its inference-to-target segment inspectable', () => {
    const model = adaptDiagnosticGraphForRender(buildDiagnosticGraphViewModel(loadDiagnosticOutput(richFixture)));
    render(<DiagnosticGraphRenderer model={model} />);
    expect(model.nodes.some(node => node.canonicalId === 'input-1')).toBe(false);
    expect(screen.getByRole('status')).toHaveTextContent('SOURCE: input-1');
    expect(model.edges[0]).toMatchObject({ source: 'inference:step-rich', target: 'claim:claim-supported' });
    fireEvent.click(screen.getByRole('button', { name: /STEP_TO_TARGET de transition:input-1/ }));
    expect(screen.getByRole('complementary')).toHaveTextContent('input-1');
  });

  it('exposes multiple materialized transitions independently without assigning route semantics', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
    viewModel.transitions.push({ ...structuredClone(viewModel.transitions[0]), inference_step_id: 'step-minimal' });
    viewModel.inferenceSteps.push({ ...structuredClone(viewModel.inferenceSteps[0]), inference_step_id: 'step-minimal' });
    const model = adaptDiagnosticGraphForRender(viewModel);
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getAllByRole('button', { name: /de transition:/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'STEP_TO_TARGET de transition:input-1:step-minimal:claim-supported:1' }));
    expect(screen.getByRole('complementary')).toHaveTextContent('step-minimal');
  });

  it('selects a breakpoint and displays its literal fields and ordered explanation trace', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
    viewModel.breakpoints[0].explanation_trace = [{ sequence: 7, trace_kind: 'LOST_ROUTE', subject_ref: 'step-rich', rule_ref: 'rule-7', message: 'Materialized breakpoint trace.' }];
    const model = adaptDiagnosticGraphForRender(viewModel);
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getByText('Breakpoints: 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar breakpoint breakpoint-1' }));
    const inspector = screen.getByRole('complementary');
    expect(within(inspector).getByRole('heading', { name: 'BREAKPOINT' })).toBeInTheDocument();
    for (const value of ['breakpoint-1', 'scope-rich', 'route-blocked', 'BLOCKING_DIAGNOSTIC_CONDITION', 'TRUE', 'RESOLVED', 'Materialized breakpoint trace.', 'LOST_ROUTE', 'rule-7']) expect(within(inspector).getByText(value)).toBeInTheDocument();
    expect(within(inspector).getByText('Route/path ref')).toBeInTheDocument();
    expect(within(inspector).getByText('First break on route')).toBeInTheDocument();
  });

  it('selects every downstream record, preserving state, status, arrays, nullable reason, and explicit navigation', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
    viewModel.downstreamEffects[0].affected_state = 'UNKNOWN';
    viewModel.downstreamEffects[0].adjudication_status = 'REVIEW_REQUIRED';
    viewModel.downstreamEffects[0].explanation_trace = [{ sequence: 1, trace_kind: 'OTHER', subject_ref: null, rule_ref: null, message: 'Materialized downstream trace.' }];
    viewModel.downstreamEffects.push({ ...structuredClone(viewModel.downstreamEffects[0]), failure_ref: 'other', affected_state: 'NOT_AFFECTED', propagation_reason: null });
    const model = adaptDiagnosticGraphForRender(viewModel);
    const before = structuredClone(model);
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getByText('Downstream: 2')).toBeInTheDocument();
    const selectors = screen.getAllByRole('button', { name: /Inspeccionar downstream effect/ });
    expect(selectors).toHaveLength(2);
    fireEvent.click(selectors[0]);
    let inspector = screen.getByRole('complementary');
    expect(within(inspector).getByRole('heading', { name: 'DOWNSTREAM EFFECT' })).toBeInTheDocument();
    for (const value of ['breakpoint-1', 'claim-affected', 'UNKNOWN', 'REVIEW_REQUIRED', '["route-blocked"]', '[]', '["step-rich"]', '["route-alternative"]', 'Canonical propagation result.', 'Materialized downstream trace.']) expect(within(inspector).getByText(value)).toBeInTheDocument();
    fireEvent.click(within(inspector).getByRole('button', { name: 'Ver breakpoint breakpoint-1' }));
    expect(screen.getByRole('heading', { name: 'BREAKPOINT' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Inspeccionar downstream effect/ })[1]);
    inspector = screen.getByRole('complementary');
    expect(within(inspector).getByText('NOT_AFFECTED')).toBeInTheDocument();
    expect(within(inspector).getAllByText('null').length).toBeGreaterThan(0);
    expect(within(inspector).queryByRole('button', { name: /Ver breakpoint/ })).not.toBeInTheDocument();
    expect(model).toEqual(before);
  });

  it('does not render breakpoint or downstream selectors when materialized arrays are empty', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
    viewModel.breakpoints = [];
    viewModel.downstreamEffects = [];
    const model = adaptDiagnosticGraphForRender(viewModel);
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.queryByRole('button', { name: /Inspeccionar breakpoint/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Inspeccionar downstream/ })).not.toBeInTheDocument();
  });

  it('keeps an empty REVIEW_REQUIRED frontier inspectable and displays literal cardinality and members', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(minimalFixture)));
    const model = adaptDiagnosticGraphForRender(viewModel);
    render(<DiagnosticGraphRenderer model={model} />);
    const control = screen.getByRole('button', { name: 'Inspeccionar defendability frontier' });
    expect(control).toHaveTextContent('Frontier: 0 miembros');
    expect(screen.queryByText('Frontier member')).not.toBeInTheDocument();
    fireEvent.click(control);
    const inspector = screen.getByRole('complementary');
    expect(within(inspector).getByRole('heading', { name: 'DEFENDABILITY FRONTIER' })).toBeInTheDocument();
    expect(within(inspector).getAllByText('[]').length).toBeGreaterThan(0);
    expect(within(inspector).getByText('0')).toBeInTheDocument();
    expect(within(inspector).getByText('REVIEW_REQUIRED')).toBeInTheDocument();
  });

  it('shows every materialized frontier member neutrally and inspects every canonical field and trace', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
    viewModel.frontier.member_claim_ids = ['claim-affected', 'claim-supported'];
    viewModel.frontier.frontier_cardinality = 2;
    viewModel.frontier.explanation_trace = [{ sequence: 4, trace_kind: 'FRONTIER_DECISION', subject_ref: 'claim-affected', rule_ref: 'frontier-rule', message: 'Materialized frontier trace.' }];
    viewModel.compatibilityMaximums[0].claim_id = 'claim-other';
    const model = adaptDiagnosticGraphForRender(viewModel);
    const before = structuredClone(model);
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getAllByText('Frontier member')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar defendability frontier' }));
    const inspector = screen.getByRole('complementary');
    for (const value of ['scope-rich', 'evaluation-minimal', '["claim-affected","claim-supported"]', '2', 'RESOLVED', '["adj-1"]', 'Materialized frontier trace.', 'FRONTIER_DECISION', 'frontier-rule']) expect(within(inspector).getByText(value)).toBeInTheDocument();
    expect(model).toEqual(before);
  });

  it('reports a non-visible frontier member while preserving the materialized cardinality', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
    viewModel.frontier.member_claim_ids = ['claim-missing'];
    viewModel.frontier.frontier_cardinality = 99;
    const model = adaptDiagnosticGraphForRender(viewModel);
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getByRole('button', { name: 'Inspeccionar defendability frontier' })).toHaveTextContent('99 miembros');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar defendability frontier' }));
    const inspector = screen.getByRole('complementary');
    expect(within(inspector).getAllByText('["claim-missing"]')).toHaveLength(2);
    expect(within(inspector).getByText('99')).toBeInTheDocument();
    expect(model.nodes.some(node => node.canonicalId === 'claim-missing')).toBe(false);
  });

});

describe('DiagnosticGraphRenderer trace panel', () => {
  it('selects claims and inference steps accessibly and preserves empty versus literal traces', () => {
    render(<DiagnosticGraphRenderer model={richRenderModel()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar claim claim-affected' }));
    expect(screen.getByRole('heading', { name: 'TRACE / REFERENCES' })).toBeInTheDocument();
    expect(screen.getByText('claim:claim-affected', { selector: 'code' })).toBeInTheDocument();
    expect(screen.getByText('[]', { selector: '.explanation-trace span' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar inference step step-rich' }));
    expect(screen.getByText('Canonical active-state trace.')).toBeInTheDocument();
  });

  it('shows transition and run reference groups literally without resolving labels', () => {
    render(<DiagnosticGraphRenderer model={richRenderModel()} />);
    fireEvent.click(screen.getByRole('button', { name: /STEP_TO_TARGET de transition:/ }));
    expect(screen.getByRole('region', { name: 'Provenance refs' })).toHaveTextContent('["provenance-1"]');
    expect(screen.getByRole('region', { name: 'Alternative route refs' })).toHaveTextContent('["route-alternative"]');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar trazabilidad del run' }));
    expect(screen.getByRole('region', { name: 'Adjudication refs' })).toHaveTextContent('["adj-1"]');
    expect(screen.getByRole('region', { name: 'Diagnostic condition refs' })).toHaveTextContent('["condition-1"]');
    expect(screen.getByRole('region', { name: 'Defeater refs' })).toHaveTextContent('["defeater-1"]');
    expect(screen.getAllByText('Referencias literales; no resueltas en esta vista.').length).toBeGreaterThan(0);
  });

  it('selects breakpoint, downstream, frontier, and review sources independently', () => {
    render(<DiagnosticGraphRenderer model={richRenderModel()} />);
    const cases = [
      ['Inspeccionar breakpoint breakpoint-1', 'breakpoint:breakpoint-1'],
      ['Inspeccionar downstream effect downstream:breakpoint-1:claim-affected:0', 'downstream:breakpoint-1:claim-affected:0'],
      ['Inspeccionar defendability frontier', 'defendability-frontier'],
      ['Inspeccionar review required item review:review-1', 'review:review-1'],
    ];
    for (const [button, id] of cases) {
      fireEvent.click(screen.getByRole('button', { name: button }));
      expect(screen.getByText(id, { selector: 'code' })).toBeInTheDocument();
    }
    expect(screen.getByText('Canonical unresolved question.')).toBeInTheDocument();
  });

  it('renders null trace references literally and keeps the supplied array order', () => {
    const model = richRenderModel();
    const claim = model.traceSources.find(source => source.sourceId === 'claim:claim-supported')!;
    claim.explanationTrace = [
      { sequence: 5, trace_kind: 'OTHER', subject_ref: null, rule_ref: null, message: 'first supplied' },
      { sequence: 2, trace_kind: 'ORIGIN', subject_ref: 'literal', rule_ref: null, message: 'second supplied' },
    ];
    render(<DiagnosticGraphRenderer model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar claim claim-supported' }));
    const list = screen.getByText('first supplied').closest('ol')!;
    expect(within(list).getAllByText(/^(5|2)$/).map(element => element.textContent)).toEqual(['5', '2']);
    expect(within(list).getAllByText('null')).toHaveLength(3);
  });
});
