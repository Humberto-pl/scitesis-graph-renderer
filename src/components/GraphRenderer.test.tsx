import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fixtures } from '../fixtures/cases';
import qualisArtifactJson from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildDiagnosticGraphViewModel } from '../graph/adapter';
import { buildCanonicalSimulatorGraphViewModel } from '../graph/canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from '../graph/types';
import { CanonicalEdgeDetail, GraphRenderer } from './GraphRenderer';

const qualisArtifact = qualisArtifactJson as ConfirmedSimulatedGraphArtifact;
describe('GraphRenderer',()=>{
  it.each(['C34','C30','C36','ADV-WI01-15'])('renders %s without errors',id=>{render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures[id].candidate,fixtures[id].diagnosis)}/>);expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();expect(screen.getByTitle('Fit View')).toBeInTheDocument()});
  it('selects and filters nodes',()=>{render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis)}/>);fireEvent.click(screen.getByText('Entre 30% y 40% de la PEA de Madre de Dios se dedica directamente a la minería.'));expect(screen.getByText('C34-C09-A')).toBeInTheDocument();fireEvent.click(screen.getByLabelText('EVIDENCE'));expect(screen.getByLabelText('EVIDENCE')).not.toBeChecked();fireEvent.click(screen.getByLabelText('Solo claims problemáticos'));expect(screen.getByLabelText('Solo claims problemáticos')).toBeChecked()});
  it('collapses and restores direct evidence on an indivisible C30 claim without mutating the model',()=>{const model=buildDiagnosticGraphViewModel(fixtures.C30.candidate,fixtures.C30.diagnosis);const snapshot=structuredClone(model);render(<GraphRenderer model={model}/>);expect(screen.getByText('Modelo SEM estimado')).toBeInTheDocument();fireEvent.click(screen.getByLabelText('Alternar evidence de C30-C01'));expect(screen.queryByText('Modelo SEM estimado')).not.toBeInTheDocument();fireEvent.click(screen.getByLabelText('Alternar evidence de C30-C01'));expect(screen.getByText('Modelo SEM estimado')).toBeInTheDocument();expect(model).toEqual(snapshot)});
  it('collapses C34 subclaims and evidence independently without mutating the model',()=>{const model=buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis);const snapshot=structuredClone(model);render(<GraphRenderer model={model}/>);fireEvent.click(screen.getByLabelText('Alternar evidence de C34-C09-A'));expect(screen.queryByText('Soporte documental explícito para la proporción de dedicación directa')).not.toBeInTheDocument();expect(screen.getByText('Una proporción aún mayor de la PEA depende indirectamente de la minería.')).toBeInTheDocument();fireEvent.click(screen.getByLabelText('Alternar evidence de C34-C09-A'));expect(screen.getByText('Soporte documental explícito para la proporción de dedicación directa')).toBeInTheDocument();fireEvent.click(screen.getByLabelText('Alternar subclaims de C34-C09'));expect(screen.queryByText('Una proporción aún mayor de la PEA depende indirectamente de la minería.')).not.toBeInTheDocument();fireEvent.click(screen.getByLabelText('Alternar subclaims de C34-C09'));expect(screen.getByText('Una proporción aún mayor de la PEA depende indirectamente de la minería.')).toBeInTheDocument();expect(model).toEqual(snapshot)});
  it('toggles canonical display codes and clears a highlighted claim path',()=>{render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures.C36.candidate,fixtures.C36.diagnosis)}/>);expect(screen.getAllByText('Defendible').length).toBeGreaterThan(0);fireEvent.click(screen.getByLabelText('Mostrar códigos canónicos'));expect(screen.getAllByText(/Defendible · DEFENDIBLE/).length).toBeGreaterThan(0);fireEvent.click(screen.getByText('Asociación observada en el outcome medido'));expect(document.querySelectorAll('.dimmed').length).toBeGreaterThan(0);fireEvent.click(screen.getByText('Limpiar selección'));expect(document.querySelectorAll('.dimmed')).toHaveLength(0)});
  it('marks maximum defendable structurally and tolerates absent optional fields without console errors',()=>{const error=vi.spyOn(console,'error');render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis)}/>);expect(screen.getAllByText(/Máximo defendible/).length).toBeGreaterThan(0);expect(document.querySelector('.maximum-defendable')).toBeInTheDocument();fireEvent.click(screen.getByText('Una proporción aún mayor de la PEA depende indirectamente de la minería.'));expect(screen.getByText('No')).toBeInTheDocument();expect(error).not.toHaveBeenCalled();error.mockRestore()});
  it('renders a known STATE with friendly text and adds its canonical code only when requested',()=>{render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis)}/>);expect(screen.getAllByText('No se sostiene tal como está formulado').length).toBeGreaterThan(0);expect(screen.queryByText('NO_SOSTENIDO_EN_SU_FORMULACION_ACTUAL')).not.toBeInTheDocument();fireEvent.click(screen.getByLabelText('Mostrar códigos canónicos'));expect(screen.getAllByText('No se sostiene tal como está formulado · NO_SOSTENIDO_EN_SU_FORMULACION_ACTUAL').length).toBeGreaterThan(0)});
  it('renders unknown STATE text without crashing or mutating the model',()=>{const model=buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis);const state=model.nodes.find(node=>node.kind==='STATE')!;state.label='ESTADO_FUTURO';state.text='ESTADO_FUTURO';const before=structuredClone(model);render(<GraphRenderer model={model}/>);expect(screen.getByText('ESTADO_FUTURO')).toBeInTheDocument();expect(model).toEqual(before)});
  it('renders target arrow markers on canonical edges',()=>{const model=buildDiagnosticGraphViewModel(fixtures.C30.candidate,fixtures.C30.diagnosis);render(<GraphRenderer model={model}/>);expect(document.querySelector('.react-flow__arrowhead')).toBeInTheDocument()});

  it('collapses and restores the detail panel without losing selection or mutating the model',()=>{const model=buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis);const before=structuredClone(model);render(<GraphRenderer model={model}/>);fireEvent.click(screen.getByText('Entre 30% y 40% de la PEA de Madre de Dios se dedica directamente a la minería.'));expect(screen.getByText('C34-C09-A')).toBeInTheDocument();fireEvent.click(screen.getByText('Ocultar detalle'));expect(screen.queryByLabelText('Detalle')).not.toBeInTheDocument();expect(screen.getByText('Mostrar detalle')).toHaveAttribute('aria-expanded','false');fireEvent.click(screen.getByText('Mostrar detalle'));expect(screen.getByLabelText('Detalle')).toBeInTheDocument();expect(screen.getByText('C34-C09-A')).toBeInTheDocument();expect(model).toEqual(before)});
});

describe('GraphRenderer canonical simulator integration', () => {
  it('renders the real QUALIS graph with canonical entities and no legacy diagnostic controls', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);

    render(<GraphRenderer model={model} />);

    expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
    expect(screen.getByText('Investigación doctoral QUALIS')).toBeInTheDocument();
    expect(screen.getByText('Inferencia hacia C-001')).toBeInTheDocument();
    expect(screen.getByText(/ENT-001 · INVESTIGAÇÃO/)).toBeInTheDocument();
    expect(screen.getByText(/ENT-018 · CONCEPTUAL_ENTITY/)).toBeInTheDocument();
    expect(screen.getByText(/ENT-039 · INFERENCE_STEP/)).toBeInTheDocument();
    expect(screen.queryByLabelText('CLAIM')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('SUBCLAIM')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('EVIDENCE')).not.toBeInTheDocument();
    expect(screen.queryByText('Solo claims problemáticos')).not.toBeInTheDocument();
    expect(screen.queryByText('RULE')).not.toBeInTheDocument();
  });

  it('inspects canonical nodes and keeps ENT-039 unchanged', () => {
    render(<GraphRenderer model={buildCanonicalSimulatorGraphViewModel(qualisArtifact)} />);

    fireEvent.click(screen.getByText('Inferencia hacia C-001'));

    expect(screen.getByText('IS-001')).toBeInTheDocument();
    expect(screen.getByText('ENT-039', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('INFERENCE_STEP', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByLabelText('Estructura inferencial')).toBeInTheDocument();
    expect(screen.getByText('PG-001 · grupo de premisas')).toBeInTheDocument();
    expect(screen.getByText('Miembros: EV-001, EV-002, EV-003')).toBeInTheDocument();
    expect(screen.getByText(/RELATION-001 · REL-067 \/ PREMISE_IN/)).toBeInTheDocument();
    expect(document.querySelectorAll('.dimmed').length).toBeGreaterThan(0);
    expect(screen.queryByText('RULE')).not.toBeInTheDocument();
    expect(screen.getAllByText('IMPLICIT_RECONSTRUCTED', { selector: 'dd' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('PROBABLE', { selector: 'dd' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/"source_ref": "file_000000001044820e92b9958c291c2776"/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI', { selector: 'dd' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('v0.3-run-1', { selector: 'dd' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('RICH_SIMULATED_IAM', { selector: 'dd' }).length).toBeGreaterThan(0);
  });

  it('shows inferential roles as badges on existing canonical nodes', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const { container } = render(<GraphRenderer model={model} />);

    expect(screen.getByLabelText('Roles de EV-001')).toHaveTextContent('PREMISE');
    expect(screen.getByLabelText('Roles de TA-001')).toHaveTextContent('WARRANT');
    expect(screen.getByLabelText('Roles de A-001')).toHaveTextContent('ASSUMPTION');
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    expect(container.querySelectorAll('.inference-step-node')).toHaveLength(7);
  });

  it('inspects a canonical relation with its unchanged identity and endpoints', () => {
    const edge = buildCanonicalSimulatorGraphViewModel(qualisArtifact).edges.find(item => item.id === 'RELATION-001')!;
    render(<CanonicalEdgeDetail edge={edge} />);

    expect(screen.getByText('RELATION-001')).toBeInTheDocument();
    expect(screen.getByText('REL-067')).toBeInTheDocument();
    expect(screen.getByText('PREMISE_IN')).toBeInTheDocument();
    expect(screen.getByText('EV-001')).toBeInTheDocument();
    expect(screen.getByText('IS-001')).toBeInTheDocument();
    expect(screen.getByText('IMPLICIT_RECONSTRUCTED')).toBeInTheDocument();
    expect(screen.getByText('0.92')).toBeInTheDocument();
    expect(screen.getByText('PROBABLE')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('v0.3-run-1')).toBeInTheDocument();
    expect(screen.getByText('RICH_SIMULATED_IAM')).toBeInTheDocument();
    expect(screen.getByText(/"derivation": "Relación inferencial reconstruida"/)).toBeInTheDocument();
  });

  it('shows instance metadata literally, keeps ontology identity separate, and omits absent technical metadata', () => {
    const artifact = structuredClone(qualisArtifact);
    const entity = artifact.entities[0];
    entity.epistemic_plane = 'DIAGNOSTIC_SOURCE';
    entity.explicitness = 'SYSTEM_INFERRED';
    entity.confidence = 'literal-confidence';
    entity.review_state = 'ABSTAIN';
    entity.origin = 'HUMAN';
    entity.version = { instance: 7 };
    delete entity.iam_source;
    const snapshot = structuredClone(artifact);
    const model = buildCanonicalSimulatorGraphViewModel(artifact);
    const topology = { nodes: model.nodes.map(node => node.id), edges: model.edges.map(edge => [edge.source, edge.target]) };

    render(<GraphRenderer model={model} />);
    fireEvent.click(screen.getByText('Investigación doctoral QUALIS'));

    expect(screen.getByText('ENT-001', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('INVESTIGAÇÃO', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('DIAGNOSTIC_SOURCE')).toBeInTheDocument();
    expect(screen.getByText('SYSTEM_INFERRED')).toBeInTheDocument();
    expect(screen.getByText('literal-confidence')).toBeInTheDocument();
    expect(screen.getByText('ABSTAIN')).toBeInTheDocument();
    expect(screen.getByText('HUMAN')).toBeInTheDocument();
    expect(screen.getByText(/"instance": 7/)).toBeInTheDocument();
    expect(screen.queryByText('UNKNOWN')).not.toBeInTheDocument();
    expect(screen.queryByText('IAM source', { selector: 'dt' })).not.toBeInTheDocument();
    expect({ nodes: model.nodes.map(node => node.id), edges: model.edges.map(edge => [edge.source, edge.target]) }).toEqual(topology);
    expect(artifact).toEqual(snapshot);
  });

  it('is deterministic and does not mutate the canonical view model', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const snapshot = structuredClone(model);
    const first = render(<GraphRenderer model={model} />);
    const firstNodeIds = [...first.container.querySelectorAll('.react-flow__node')].map(node => node.getAttribute('data-id'));
    first.unmount();
    const second = render(<GraphRenderer model={model} />);
    const secondNodeIds = [...second.container.querySelectorAll('.react-flow__node')].map(node => node.getAttribute('data-id'));

    expect(secondNodeIds).toEqual(firstNodeIds);
    expect(firstNodeIds).toHaveLength(model.nodes.length);
    expect(model).toEqual(snapshot);
  });
});
