import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import fixture from '../diagnostic/auxiliary/fixtures/gi-full-valid.json';
import { loadGiGraphContract } from '../diagnostic/auxiliary/giGraphContract';
import diagnosticFixture from '../diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { buildDiagnosticGraphViewModel } from '../diagnostic/diagnosticGraphViewModel';
import { loadDiagnosticOutput } from '../diagnostic/diagnosticOutputLoader';
import { buildGiDiagnosticOverlay } from '../diagnostic/giDiagnosticOverlayModel';
import { adaptGiGraphForRender } from '../graph/giGraphRenderAdapter';
import { buildGiGraphViewModel } from '../graph/giGraphViewModel';
import { GiStructuralGraphRenderer } from './GiStructuralGraphRenderer';

function model() {
  const loaded = loadGiGraphContract(structuredClone(fixture));
  if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
  return adaptGiGraphForRender(buildGiGraphViewModel(loaded.artifact));
}

function modelWithOverlay() {
  const value = model();
  const diagnostic = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(diagnosticFixture)));
  diagnostic.metadata.run_metadata.graph_ref = value.graphRef;
  diagnostic.metadata.run_metadata.graph_version = value.graphVersion;
  diagnostic.claims[0].claim_id = 'C1';
  diagnostic.claims[0].adjudication_status = 'REVIEW_REQUIRED';
  diagnostic.inferenceSteps[0].inference_step_id = 'I1';
  diagnostic.reviewRequiredItems[0].subject_ref = 'C1';
  diagnostic.transitions[0].target_claim_id = 'C1';
  const result = buildGiDiagnosticOverlay(value, diagnostic);
  if (result.status !== 'COMPATIBLE') throw new Error('expected compatible overlay');
  return { value, overlay: result.overlay, diagnostic };
}

describe('GiStructuralGraphRenderer', () => {
  it('exposes every materialized node and edge without metadata topology', () => {
    const value = model();
    render(<GiStructuralGraphRenderer model={value} />);
    expect(screen.getAllByRole('button', { name: /Inspeccionar entidad/ })).toHaveLength(value.nodes.length);
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(value.edges.length);
    expect(screen.getByRole('status')).toHaveTextContent('4/4 nodos · 3/3 relaciones');
  });

  it('inspects literal entity, inference step, and premise group fields without adding topology', () => {
    const value = model();
    render(<GiStructuralGraphRenderer model={value} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad E1' }));
    const inspector = screen.getByRole('complementary', { name: 'Inspector estructural G_I' });
    expect(within(inspector).getByText('Premise one')).toBeInTheDocument();
    expect(within(inspector).getByText('Inference step · I1')).toBeInTheDocument();
    expect(within(inspector).getByText('Premise group · PG1')).toBeInTheDocument();
    expect(within(inspector).getAllByText('Premise group · PG1')).toHaveLength(1);
    expect(value.nodes).toHaveLength(4);
    expect(value.edges).toHaveLength(3);
  });

  it('shows a materialized member premise group not referenced by the selected entity inference steps', () => {
    const variant = structuredClone(fixture);
    variant.inference_steps[0].premise_group_ids = [];
    const loaded = loadGiGraphContract(variant);
    if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
    const value = adaptGiGraphForRender(buildGiGraphViewModel(loaded.artifact));
    render(<GiStructuralGraphRenderer model={value} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad E1' }));
    const inspector = screen.getByRole('complementary');
    const related = within(inspector).getByRole('heading', { name: 'Premise groups relacionados' }).closest('section')!;
    for (const literal of ['Premise group · PG1', 'id', 'PG1', 'mode', 'linked', 'member_ids', '["E1","E2"]', 'target_inference_step_id', 'I1', 'review_state', 'reviewed', 'provenance', '[]', 'origin', 'test', 'version', '1']) expect(related).toHaveTextContent(literal);
    expect(value.nodes).toHaveLength(variant.entities.length);
    expect(value.edges).toHaveLength(variant.relations.length);
  });

  it('delegates LR and TB positions to relayout without changing visible topology', () => {
    const value = model();
    const { container } = render(<GiStructuralGraphRenderer model={value} />);
    const node = () => container.querySelector<HTMLElement>('.react-flow__node[data-id="C1"]');
    const lrTransform = node()?.style.transform;
    fireEvent.change(screen.getByRole('combobox', { name: 'Layout' }), { target: { value: 'TB' } });
    expect(node()?.style.transform).not.toBe(lrTransform);
    expect(screen.getByRole('status')).toHaveTextContent('4/4 nodos · 3/3 relaciones');
    expect(screen.getAllByRole('button', { name: /Inspeccionar entidad/ })).toHaveLength(value.nodes.length);
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(value.edges.length);
  });

  it('inspects an edge and applies visual filters and depth-one focus without mutating the model', () => {
    const value = model();
    const before = structuredClone(value);
    render(<GiStructuralGraphRenderer model={value} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar relación R1' }));
    expect(screen.getByRole('complementary')).toHaveTextContent('E1');
    expect(screen.getByRole('complementary')).toHaveTextContent('I1');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad E1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enfocar nodo seleccionado' }));
    expect(screen.getByRole('status')).toHaveTextContent('2/4 nodos · 1/3 relaciones');
    fireEvent.click(screen.getByText('Filtros estructurales'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'premise' }));
    expect(screen.getByRole('status')).toHaveTextContent('1/4 nodos · 0/3 relaciones');
    expect(value).toEqual(before);
  });

  it('states mismatch and absence of a diagnostic overlay explicitly', () => {
    render(<GiStructuralGraphRenderer model={model()} mismatch />);
    expect(screen.getByText(/sin overlay diagnóstico/)).toBeInTheDocument();
    expect(screen.getByText(/no coincide con el Diagnostic Output activo/)).toBeInTheDocument();
  });

  it('shows literal claim/inference/review badges and exact diagnostic inspection', () => {
    const { value, overlay, diagnostic } = modelWithOverlay();
    render(<GiStructuralGraphRenderer model={value} overlay={overlay} />);
    expect(screen.getByText(`Def_e: ${diagnostic.claims[0].def_e_value}`)).toBeInTheDocument();
    expect(screen.getByText(`Active_e: ${diagnostic.inferenceSteps[0].active_state}`)).toBeInTheDocument();
    expect(screen.getAllByText('REVIEW_REQUIRED').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad C1' }));
    const inspector = screen.getByRole('complementary', { name: 'Inspector estructural G_I' });
    expect(within(inspector).getByText('ENTIDAD G_I')).toBeInTheDocument();
    expect(within(inspector).getByText('DIAGNÓSTICO')).toBeInTheDocument();
    expect(within(inspector).getByText(`Review item · ${diagnostic.reviewRequiredItems[0].item_id}`)).toBeInTheDocument();
    expect(within(inspector).getByText('H_e transition (registro literal)')).toBeInTheDocument();
    const reformulation = within(inspector).getByText('maximum_defensible_reformulation');
    expect(reformulation.nextElementSibling).toHaveTextContent('null');
  });

  it('omits structural null fields with the overlay off and on', () => {
    const loaded = loadGiGraphContract({
      ...structuredClone(fixture),
      entities: structuredClone(fixture.entities).map(entity => entity.id === 'C1' ? { ...entity, subtype: null, discourse_role: null } : entity),
    });
    if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
    const value = adaptGiGraphForRender(buildGiGraphViewModel(loaded.artifact));
    const { overlay } = modelWithOverlay();
    render(<GiStructuralGraphRenderer model={value} overlay={overlay} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad C1' }));
    expect(within(screen.getByRole('complementary')).queryByText('subtype')).not.toBeInTheDocument();
    expect(within(screen.getByRole('complementary')).queryByText('discourse_role')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' }));
    expect(within(screen.getByRole('complementary')).queryByText('subtype')).not.toBeInTheDocument();
    expect(within(screen.getByRole('complementary')).queryByText('discourse_role')).not.toBeInTheDocument();
  });

  it('turns annotations off without changing structural nodes, edges, focus, or layout', () => {
    const { value, overlay, diagnostic } = modelWithOverlay();
    const { container } = render(<GiStructuralGraphRenderer model={value} overlay={overlay} />);
    const position = container.querySelector<HTMLElement>('.react-flow__node[data-id="C1"]')?.style.transform;
    expect(screen.getByText(`Def_e: ${diagnostic.claims[0].def_e_value}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' }));
    expect(screen.queryByText(`Def_e: ${diagnostic.claims[0].def_e_value}`)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Inspeccionar entidad/ })).toHaveLength(value.nodes.length);
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(value.edges.length);
    expect(screen.getByRole('status')).toHaveTextContent('4/4 nodos · 3/3 relaciones');
    expect(container.querySelector<HTMLElement>('.react-flow__node[data-id="C1"]')?.style.transform).toBe(position);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad E1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enfocar nodo seleccionado' }));
    expect(screen.getByRole('status')).toHaveTextContent('2/4 nodos · 1/3 relaciones');
  });
});
