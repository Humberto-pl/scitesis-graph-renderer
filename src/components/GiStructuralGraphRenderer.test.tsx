import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import fixture from '../diagnostic/auxiliary/fixtures/gi-full-valid.json';
import { loadGiGraphContract } from '../diagnostic/auxiliary/giGraphContract';
import diagnosticFixture from '../diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { buildDiagnosticGraphViewModel } from '../diagnostic/diagnosticGraphViewModel';
import { loadDiagnosticOutput } from '../diagnostic/diagnosticOutputLoader';
import { buildGiDiagnosticOverlay } from '../diagnostic/giDiagnosticOverlayModel';
import { buildGiDiagnosticConnectorModel } from '../diagnostic/giDiagnosticConnectorModel';
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
  diagnostic.breakpoints[0].breakpoint_step_id = 'I1';
  diagnostic.breakpoints[0].affected_transition_target_id = 'C1';
  diagnostic.downstreamEffects[0].target_claim_id = 'C1';
  diagnostic.downstreamEffects[0].failure_ref = diagnostic.breakpoints[0].breakpoint_id;
  diagnostic.frontier.member_claim_ids = ['C1'];

  const result = buildGiDiagnosticOverlay(value, diagnostic);
  if (result.status !== 'COMPATIBLE') throw new Error('expected compatible overlay');
  return { value, overlay: result.overlay, connectorModel: buildGiDiagnosticConnectorModel(value, result.overlay), diagnostic };
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

  it('shows literal breakpoint, downstream, and frontier annotations and hides them with the overlay', () => {
    const { value, overlay } = modelWithOverlay();
    render(<GiStructuralGraphRenderer model={value} overlay={overlay} />);
    expect(screen.getByText('BREAKPOINT')).toBeInTheDocument();
    expect(screen.getByText('Downstream: AFFECTED')).toBeInTheDocument();
    expect(screen.getByText('FRONTIER')).toBeInTheDocument();
    expect(screen.getByText(/Frontier: RESOLVED · cardinalidad materializada: 1/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad C1' }));
    const inspector = screen.getByRole('complementary');
    expect(inspector).toHaveTextContent('Breakpoint target · breakpoint-1');
    expect(inspector).toHaveTextContent('Downstream effect · AFFECTED');
    expect(inspector).toHaveTextContent('Resuelve exactamente a breakpoint: breakpoint-1');
    expect(inspector).toHaveTextContent('Miembro materializado de defendability frontier');
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(value.edges.length);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' }));
    for (const text of ['BREAKPOINT', 'Downstream: AFFECTED', 'FRONTIER']) expect(screen.queryByText(text)).not.toBeInTheDocument();
    expect(screen.queryByText(/Frontier: RESOLVED/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(value.edges.length);
  });

  it('keeps an empty REVIEW_REQUIRED frontier visible with its materialized cardinality', () => {
    const values = modelWithOverlay();
    values.diagnostic.frontier.member_claim_ids = [];
    values.diagnostic.frontier.frontier_cardinality = 0;
    values.diagnostic.frontier.frontier_status = 'REVIEW_REQUIRED';
    const result = buildGiDiagnosticOverlay(values.value, values.diagnostic);
    if (result.status !== 'COMPATIBLE') throw new Error('expected compatible overlay');
    render(<GiStructuralGraphRenderer model={values.value} overlay={result.overlay} />);
    expect(screen.getByText(/Frontier: REVIEW_REQUIRED · cardinalidad materializada: 0/)).toBeInTheDocument();
    expect(screen.queryByText('FRONTIER')).not.toBeInTheDocument();
  });

  it('renders separately toggleable diagnostic connectors without changing structural counts, layout, or focus', () => {
    const { value, overlay, connectorModel } = modelWithOverlay();
    const { container } = render(<GiStructuralGraphRenderer model={value} overlay={overlay} connectorModel={connectorModel} />);
    const position = container.querySelector<HTMLElement>('.react-flow__node[data-id="C1"]')?.style.transform;
    expect(screen.getByText(`Breakpoint · ${overlay.breakpoints[0].breakpoint_id}`)).toBeInTheDocument();
    expect(screen.getByText(`Downstream · ${overlay.downstreamEffects[0].affected_state}`)).toBeInTheDocument();
    expect(container.querySelectorAll('.gi-diagnostic-connector-breakpoint')).toHaveLength(1);
    expect(container.querySelectorAll('.gi-diagnostic-connector-downstream')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('3/3 relaciones · 2 conectores diagnósticos visibles');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar conectores diagnósticos' }));
    expect(screen.queryByText(`Breakpoint · ${overlay.breakpoints[0].breakpoint_id}`)).not.toBeInTheDocument();
    expect(screen.getByText('BREAKPOINT')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('3/3 relaciones · 0 conectores diagnósticos visibles');
    expect(container.querySelector<HTMLElement>('.react-flow__node[data-id="C1"]')?.style.transform).toBe(position);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar conectores diagnósticos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad E1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enfocar nodo seleccionado' }));
    expect(screen.getByRole('status')).toHaveTextContent('2/4 nodos · 1/3 relaciones · 0 conectores diagnósticos visibles');
  });

  it('uses a connector-specific inspector rather than the G_I relation inspector', () => {
    const { value, overlay, connectorModel } = modelWithOverlay();
    render(<GiStructuralGraphRenderer model={value} overlay={overlay} connectorModel={connectorModel} />);
    fireEvent.click(screen.getByRole('button', { name: /Inspeccionar conector diagnóstico diag:breakpoint/ }));
    const inspector = screen.getByRole('complementary', { name: 'Inspector de conector diagnóstico' });
    expect(inspector).toHaveTextContent('CONECTOR DIAGNÓSTICO');
    expect(inspector).toHaveTextContent('Conector visual de referencia diagnóstica; no es una relation G_I.');
    expect(inspector).not.toHaveTextContent('RELACIÓN G_I');
  });

  it('keeps ReactFlow structural and diagnostic identities disjoint during an exact domain-ID collision', () => {
    const values = modelWithOverlay();
    const collisionId = values.connectorModel.connectors[0].id;
    const originalEdge = values.value.edges[0];
    const collisionModel = {
      ...values.value,
      edges: [{ ...originalEdge, id: collisionId, canonicalId: collisionId, relation: { ...originalEdge.relation, id: collisionId } }, ...values.value.edges.slice(1)],
    };
    const { container } = render(<GiStructuralGraphRenderer model={collisionModel} overlay={values.overlay} connectorModel={values.connectorModel} />);
    expect(collisionModel.edges[0].id).toBe(collisionId);
    expect(values.connectorModel.connectors[0].id).toBe(collisionId);
    const structuralFlowId = `rf:structural:${encodeURIComponent(collisionId)}`;
    const diagnosticFlowId = `rf:diagnostic:${encodeURIComponent(collisionId)}`;
    expect(structuralFlowId).not.toBe(diagnosticFlowId);
    expect(container.querySelector(`[data-flow-edge-id="${structuralFlowId}"][data-edge-kind="STRUCTURAL"]`)).toBeInTheDocument();
    expect(container.querySelector(`[data-flow-edge-id="${diagnosticFlowId}"][data-edge-kind="DIAGNOSTIC_CONNECTOR"]`)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('3/3 relaciones · 2 conectores diagnósticos visibles');
    fireEvent.click(screen.getByRole('button', { name: `Inspeccionar relación ${collisionId}` }));
    expect(screen.getByRole('complementary', { name: 'Inspector estructural G_I' })).toHaveTextContent('RELACIÓN G_I');
    expect(screen.queryByText('CONECTOR DIAGNÓSTICO')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `Inspeccionar conector diagnóstico ${collisionId}` }));
    expect(screen.getByRole('complementary', { name: 'Inspector de conector diagnóstico' })).toHaveTextContent('CONECTOR DIAGNÓSTICO');
  });

  it('treats a diag-prefixed canonical relation as structural', () => {
    const value = model();
    const originalEdge = value.edges[0];
    const canonicalId = 'diag:relation:17';
    const variant = { ...value, edges: [{ ...originalEdge, id: canonicalId, canonicalId, relation: { ...originalEdge.relation, id: canonicalId } }, ...value.edges.slice(1)] };
    render(<GiStructuralGraphRenderer model={variant} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspeccionar relación ${canonicalId}` }));
    expect(screen.getByRole('complementary', { name: 'Inspector estructural G_I' })).toHaveTextContent('RELACIÓN G_I');
    expect(screen.queryByText('CONECTOR DIAGNÓSTICO')).not.toBeInTheDocument();
  });

  it('shows a selected connector inspector only while the connector is visible through toggles and filters', () => {
    const { value, overlay, connectorModel } = modelWithOverlay();
    render(<GiStructuralGraphRenderer model={value} overlay={overlay} connectorModel={connectorModel} />);
    const selectConnector = () => fireEvent.click(screen.getByRole('button', { name: /Inspeccionar conector diagnóstico diag:breakpoint/ }));
    const inspector = () => screen.queryByRole('complementary', { name: 'Inspector de conector diagnóstico' });
    selectConnector();
    expect(inspector()).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar conectores diagnósticos' }));
    expect(inspector()).not.toBeInTheDocument();
    expect(screen.getByText('BREAKPOINT')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar conectores diagnósticos' }));
    expect(inspector()).toBeInTheDocument();
    fireEvent.click(screen.getByText('Filtros estructurales'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'inference_step_anchor' }));
    expect(inspector()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'inference_step_anchor' }));
    expect(inspector()).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'conclusion' }));
    expect(inspector()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'conclusion' }));
    expect(inspector()).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' }));
    expect(inspector()).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(value.edges.length);
  });

  it('hides a selected connector inspector when structural focus hides an endpoint and restores it with visibility', () => {
    const { value, overlay, connectorModel } = modelWithOverlay();
    render(<GiStructuralGraphRenderer model={value} overlay={overlay} connectorModel={connectorModel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad I1' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Dirección focus' }), { target: { value: 'outgoing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enfocar nodo seleccionado' }));
    fireEvent.click(screen.getByRole('button', { name: /Inspeccionar conector diagnóstico diag:breakpoint/ }));
    expect(screen.getByRole('complementary', { name: 'Inspector de conector diagnóstico' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Dirección focus' }), { target: { value: 'incoming' } });
    expect(screen.queryByRole('complementary', { name: 'Inspector de conector diagnóstico' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Dirección focus' }), { target: { value: 'outgoing' } });
    expect(screen.getByRole('complementary', { name: 'Inspector de conector diagnóstico' })).toBeInTheDocument();
  });

});

// Integration-rich acceptance intentionally uses the real loader chain rather than hand-built models.
describe('GiStructuralGraphRenderer integration-rich acceptance', () => {
  it('renders rich structural and diagnostic collections while toggles remain topology-neutral', async () => {
    const giJson = (await import('../diagnostic/fixtures/integration-rich/gi-full-integration-rich.json')).default;
    const diagnosticJson = (await import('../diagnostic/fixtures/integration-rich/diagnostic-output-v0.1.2-integration-rich.json')).default;
    const loaded = loadGiGraphContract(structuredClone(giJson));
    if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
    const value = adaptGiGraphForRender(buildGiGraphViewModel(loaded.artifact));
    const diagnostic = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(diagnosticJson)));
    const result = buildGiDiagnosticOverlay(value, diagnostic);
    if (result.status !== 'COMPATIBLE') throw new Error(result.status);
    const connectorModel = buildGiDiagnosticConnectorModel(value, result.overlay);
    const connectorBefore = structuredClone(connectorModel);
    const { container } = render(<GiStructuralGraphRenderer model={value} overlay={result.overlay} connectorModel={connectorModel} />);
    expect(screen.getAllByRole('button', { name: /Inspeccionar entidad/ })).toHaveLength(30);
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(36);
    expect(screen.getAllByRole('button', { name: /Inspeccionar conector diagnóstico/ })).toHaveLength(4);
    expect(screen.getByRole('status')).toHaveTextContent('30/30 nodos · 36/36 relaciones · 4 conectores diagnósticos visibles');
    for (const badge of ['Def_e: TRUE', 'Def_e: FALSE', 'Def_e: UNKNOWN', 'Active_e: ACTIVE', 'Active_e: INACTIVE', 'Active_e: UNKNOWN', 'BREAKPOINT', 'Downstream: AFFECTED', 'Downstream: NOT_AFFECTED', 'Downstream: UNKNOWN', 'FRONTIER', 'REVIEW_REQUIRED']) expect(screen.getAllByText(badge).length).toBeGreaterThan(0);
    const beforePosition = container.querySelector<HTMLElement>('.react-flow__node[data-id="C1"]')?.style.transform;
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar conectores diagnósticos' }));
    expect(screen.queryAllByRole('button', { name: /Inspeccionar conector diagnóstico/ })).toHaveLength(0);
    expect(screen.getAllByText('Def_e: TRUE').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' }));
    expect(screen.queryAllByText('Def_e: TRUE')).toHaveLength(0);
    expect(screen.getAllByRole('button', { name: /Inspeccionar entidad/ })).toHaveLength(30);
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(36);
    expect(container.querySelector<HTMLElement>('.react-flow__node[data-id="C1"]')?.style.transform).toBe(beforePosition);
    expect(connectorModel).toEqual(connectorBefore);
  });
});
