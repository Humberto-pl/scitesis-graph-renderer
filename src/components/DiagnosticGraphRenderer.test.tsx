import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import minimalFixture from '../diagnostic/fixtures/diagnostic-output-v0.1.2-minimal-valid.json';
import richFixture from '../diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { adaptDiagnosticGraphForRender } from '../diagnostic/diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from '../diagnostic/diagnosticGraphViewModel';
import { loadDiagnosticOutput } from '../diagnostic/diagnosticOutputLoader';
import { DiagnosticGraphRenderer } from './DiagnosticGraphRenderer';

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
});
