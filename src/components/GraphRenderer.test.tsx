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
  it('keeps the compact filter section expandable and the workspace controls accessible', () => {
    render(<GraphRenderer model={buildCanonicalSimulatorGraphViewModel(qualisArtifact)} />);

    const filters = screen.getByText('Filters').closest('details');
    expect(filters).not.toHaveAttribute('open');
    fireEvent.click(screen.getByText('Filters'));
    expect(filters).toHaveAttribute('open');
    expect(screen.getByLabelText('LR')).toBeInTheDocument();
    expect(screen.getByLabelText('TB')).toBeInTheDocument();
    for (const tab of ['Graph', 'Literature', 'References', 'Gaps', 'Validation']) {
      expect(screen.getByRole('button', { name: tab })).toBeInTheDocument();
    }
  });

  it('applies finite semantic positions, supports LR/TB, and exposes explicit reorganization without mutation', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const snapshot = structuredClone(model);
    const { container } = render(<GraphRenderer model={model} />);
    const renderedNodes = [...container.querySelectorAll<HTMLElement>('.react-flow__node')];
    expect(renderedNodes).toHaveLength(model.nodes.length);
    expect(renderedNodes.every(node => /translate\([^,]+px, ?[^)]+px\)/.test(node.style.transform))).toBe(true);
    expect(screen.getByLabelText('LR')).toBeChecked();

    fireEvent.click(screen.getByLabelText('TB'));
    expect(screen.getByLabelText('TB')).toBeChecked();
    fireEvent.click(screen.getByText('REORGANIZE GRAPH'));
    expect([...container.querySelectorAll<HTMLElement>('.react-flow__node')].every(node => /translate\([^,]+px, ?[^)]+px\)/.test(node.style.transform))).toBe(true);
    expect(model).toEqual(snapshot);
  });

  it('starts with the full graph, exposes only instantiated semantic types, and resets accumulated filters', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const { container } = render(<GraphRenderer model={model} />);

    expect(screen.getByText(`Nodes: ${model.nodes.length} visible / ${model.nodes.length} eligible / ${model.nodes.length} total · Relations: ${model.edges.length} visible / ${model.edges.length} eligible / ${model.edges.length} total`)).toBeInTheDocument();
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    expect(screen.getByLabelText('Entity types: ENT-011')).toBeInTheDocument();
    expect(screen.getByLabelText('Relation types: REL-067')).toBeInTheDocument();
    expect(screen.queryByLabelText('Entity types: ENT-002')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Entity types: ENT-011'));
    const claimCount = model.nodes.filter(node => node.canonical_type === 'ENT-011').length;
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(claimCount);
    expect(screen.getByText(new RegExp(`Nodes: ${claimCount} visible / ${claimCount} eligible / ${model.nodes.length} total`))).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Review state: CONFIRMED'));
    expect(container.querySelectorAll('.react-flow__node').length).toBeLessThanOrEqual(claimCount);

    fireEvent.click(screen.getByText('SHOW ALL / RESET FILTERS'));
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    expect(screen.getByText(`Nodes: ${model.nodes.length} visible / ${model.nodes.length} eligible / ${model.nodes.length} total · Relations: ${model.edges.length} visible / ${model.edges.length} eligible / ${model.edges.length} total`)).toBeInTheDocument();
  });

  it('activates focus explicitly with depth one and both directions, then expands bounded depth', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const { container } = render(<GraphRenderer model={model} />);

    fireEvent.click(screen.getByText('Inferencia hacia C-001'));
    expect(screen.queryByText('FOCUS ACTIVE')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    fireEvent.click(screen.getByText('Focus on this node'));

    expect(screen.getByText('FOCUS ACTIVE')).toBeInTheDocument();
    expect(screen.getByText(/Root: Inferencia hacia C-001 \(IS-001\)/)).toBeInTheDocument();
    expect(screen.getByLabelText('Focus depth')).toHaveValue('1');
    expect(screen.getByLabelText('Focus direction')).toHaveValue('both');
    const depthOneCount = container.querySelectorAll('.react-flow__node').length;
    expect(depthOneCount).toBeLessThan(model.nodes.length);

    fireEvent.change(screen.getByLabelText('Focus depth'), { target: { value: '2' } });
    const depthTwoCount = container.querySelectorAll('.react-flow__node').length;
    expect(depthTwoCount).toBeGreaterThanOrEqual(depthOneCount);
    fireEvent.change(screen.getByLabelText('Focus depth'), { target: { value: '3' } });
    expect(container.querySelectorAll('.react-flow__node').length).toBeGreaterThanOrEqual(depthTwoCount);
    fireEvent.change(screen.getByLabelText('Focus direction'), { target: { value: 'incoming' } });
    expect(screen.getByLabelText('Focus direction')).toHaveValue('incoming');
    fireEvent.change(screen.getByLabelText('Focus direction'), { target: { value: 'outgoing' } });
    expect(screen.getByLabelText('Focus direction')).toHaveValue('outgoing');
  });

  it('exits focus without changing PR7A filters and global reset clears both layers', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const relationCount = model.edges.filter(edge => edge.canonical_type === 'REL-067').length;
    const { container } = render(<GraphRenderer model={model} />);

    fireEvent.click(screen.getByLabelText('Relation types: REL-067'));
    fireEvent.click(screen.getByText('Inferencia hacia C-001'));
    fireEvent.click(screen.getByText('Focus on this node'));
    fireEvent.click(screen.getByText('EXIT FOCUS / SHOW ELIGIBLE GRAPH'));
    expect(screen.queryByText('FOCUS ACTIVE')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Relation types: REL-067')).toBeChecked();
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    expect(screen.getByText(new RegExp(`Relations: ${relationCount} visible / ${relationCount} eligible`))).toBeInTheDocument();

    fireEvent.click(screen.getByText('Focus on this node'));
    fireEvent.click(screen.getByText('SHOW ALL / RESET FILTERS'));
    expect(screen.queryByText('FOCUS ACTIVE')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Relation types: REL-067')).not.toBeChecked();
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    expect(screen.getByText(new RegExp(`Relations: ${model.edges.length} visible / ${model.edges.length} eligible`))).toBeInTheDocument();
  });

  it('automatically exits focus and clears selection when PR7A makes its root ineligible', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    render(<GraphRenderer model={model} />);
    fireEvent.click(screen.getByText('Investigación doctoral QUALIS'));
    fireEvent.click(screen.getByText('Focus on this node'));
    expect(screen.getByText('FOCUS ACTIVE')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Entity types: ENT-011'));
    expect(screen.queryByText('FOCUS ACTIVE')).not.toBeInTheDocument();
    expect(screen.getByText('Selecciona un nodo o una arista.')).toBeInTheDocument();
    expect(screen.getByLabelText('Entity types: ENT-011')).toBeChecked();
  });

  it('changes focus root only through the explicit action and keeps inferential highlighting visibility-safe', () => {
    const { container } = render(<GraphRenderer model={buildCanonicalSimulatorGraphViewModel(qualisArtifact)} />);
    fireEvent.click(screen.getByText('Inferencia hacia C-001'));
    fireEvent.click(screen.getByText('Focus on this node'));
    const originalRoot = screen.getByText(/Root: Inferencia hacia C-001 \(IS-001\)/);
    const otherNode = container.querySelector('.react-flow__node:not([data-id="IS-001"])') as HTMLElement;
    fireEvent.click(otherNode);
    expect(originalRoot).toBeInTheDocument();
    fireEvent.click(screen.getByText('Focus on this node'));
    expect(screen.queryByText(/Root: Inferencia hacia C-001 \(IS-001\)/)).not.toBeInTheDocument();
    expect(container.querySelectorAll('.react-flow__node.dimmed').length).toBe(0);
  });

  it('filters relations without hiding nodes and clears a selected object when it becomes invisible', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const relationCount = model.edges.filter(edge => edge.canonical_type === 'REL-067').length;
    const { container } = render(<GraphRenderer model={model} />);

    fireEvent.click(screen.getByText('Investigación doctoral QUALIS'));
    expect(screen.getByText('INVESTIGAÇÃO', { selector: 'dd' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Relation types: REL-067'));
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    expect(screen.getByText(`Nodes: ${model.nodes.length} visible / ${model.nodes.length} eligible / ${model.nodes.length} total · Relations: ${relationCount} visible / ${relationCount} eligible / ${model.edges.length} total`)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Entity types: ENT-011'));
    expect(screen.getByText('Selecciona un nodo o una arista.')).toBeInTheDocument();
  });

  it('keeps inferential highlighting visibility-safe and auxiliary inspection artifact-complete', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const { container } = render(<GraphRenderer model={model} />);
    fireEvent.click(screen.getByText('Inferencia hacia C-001'));
    expect(screen.getByLabelText('Estructura inferencial')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Entity types: ENT-039'));
    expect(container.querySelectorAll('.inference-step-node')).toHaveLength(7);
    expect(screen.queryByLabelText('Roles de EV-001')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Literature'));
    expect(screen.getByText('LU-001')).toBeInTheDocument();
    expect(screen.getByText('FREIDSON (1998)')).toBeInTheDocument();
  });

  it('renders the real QUALIS graph with canonical entities and no legacy diagnostic controls', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);

    render(<GraphRenderer model={model} />);

    expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
    expect(screen.getByText('Investigación doctoral QUALIS')).toBeInTheDocument();
    expect(screen.getByText('Inferencia hacia C-001')).toBeInTheDocument();
    expect(screen.getByText(/ENT-001 · INVESTIGAÇÃO/)).toBeInTheDocument();
    expect(screen.getAllByText(/ENT-018 · CONCEPTUAL_ENTITY/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ENT-039 · INFERENCE_STEP/).length).toBeGreaterThan(0);
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
    expect(screen.getByText('DIAGNOSTIC_SOURCE', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('SYSTEM_INFERRED', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('literal-confidence')).toBeInTheDocument();
    expect(screen.getByText('ABSTAIN', { selector: 'dd' })).toBeInTheDocument();
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

  it('inspects QUALIS literature literally, including review, provenance, and technical trace fields', () => {
    const model = buildCanonicalSimulatorGraphViewModel(qualisArtifact);
    const snapshot = structuredClone(model);
    render(<GraphRenderer model={model} />);
    fireEvent.click(screen.getByText('Literature'));

    expect(screen.getByText('LU-001')).toBeInTheDocument();
    expect(screen.getByText('FREIDSON (1998)')).toBeInTheDocument();
    expect(screen.getAllByText('NECESSARY').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PARTIALLY_SUFFICIENT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('NOT_EXTERNALLY_VERIFIED').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CONFIRMED').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/"source_unit_id": "SU-P078"/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('v0.3-run-1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('RICH_SIMULATED_IAM').length).toBeGreaterThan(0);
    expect(model).toEqual(snapshot);
  });

  it('keeps every reference status and candidate list visible without resolving a target', () => {
    const input = structuredClone(qualisArtifact);
    const provenance = input.reference_bindings[0].provenance;
    input.reference_bindings = [
      input.reference_bindings[0],
      { binding_id: 'RB-A', source_object_id: 'C-001', reference_text: 'ambiguous ref', resolved_target_id: null, status: 'AMBIGUOUS', candidate_target_ids: ['CE-001', 'CE-002'], provenance },
      { binding_id: 'RB-U', source_object_id: 'C-001', reference_text: 'unresolved ref', resolved_target_id: null, status: 'UNRESOLVED', candidate_target_ids: ['CE-003'], provenance },
      { binding_id: 'RB-X', source_object_id: 'C-001', reference_text: 'abstained ref', resolved_target_id: null, status: 'ABSTAIN', candidate_target_ids: [], provenance },
    ];
    const snapshot = structuredClone(input);
    render(<GraphRenderer model={buildCanonicalSimulatorGraphViewModel(input)} />);
    fireEvent.click(screen.getByText('References'));

    for (const status of ['RESOLVED', 'AMBIGUOUS', 'UNRESOLVED', 'ABSTAIN']) expect(screen.getByText(status)).toBeInTheDocument();
    expect(screen.getByText(/"CE-001",\s+"CE-002"/)).toBeInTheDocument();
    expect(screen.getAllByText('null').length).toBeGreaterThanOrEqual(3);
    expect(input).toEqual(snapshot);
  });

  it('shows ontology and projection gaps without adding nodes, edges, or mappings', () => {
    const input = structuredClone(qualisArtifact);
    input.ontology_gaps = [
      { gap_id: 'OG-T', gap_type: 'ONTOLOGY_GAP', description: 'Blocking gap', source_refs: ['SU-1'], affected_object_ids: ['C-001'], blocking: true, review_state: 'UNRESOLVED' },
      { gap_id: 'OG-F', gap_type: 'ONTOLOGY_GAP', description: 'Non-blocking gap', source_refs: [], affected_object_ids: ['RELATION-001'], blocking: false, review_state: 'UNRESOLVED' },
    ];
    input.projection_gaps = [{ projection_gap_id: 'PGAP-1', object_or_relation_id: 'C-001', target_contract: 'IAM v0.1', status: 'UNSUPPORTED_MAPPING', reason: 'Reported incompatibility' }];
    const model = buildCanonicalSimulatorGraphViewModel(input);
    const topology = { nodes: model.nodes.map(item => item.id), edges: model.edges.map(item => [item.source, item.target]) };
    const { container } = render(<GraphRenderer model={model} />);
    fireEvent.click(screen.getByText('Gaps'));

    expect(screen.getByText('OG-T')).toBeInTheDocument();
    expect(screen.getByText('OG-F')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('false')).toBeInTheDocument();
    expect(screen.getByText(/"RELATION-001"/)).toBeInTheDocument();
    expect(screen.getByText('UNSUPPORTED_MAPPING')).toBeInTheDocument();
    expect(screen.getByText('IAM v0.1')).toBeInTheDocument();
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(model.nodes.length);
    expect({ nodes: model.nodes.map(item => item.id), edges: model.edges.map(item => [item.source, item.target]) }).toEqual(topology);
  });

  it.each(['PASS', 'FAIL', 'REVIEW_REQUIRED'] as const)('reports validation status %s literally without recalculation', status => {
    const input = structuredClone(qualisArtifact);
    input.validation.status = status;
    if (status !== 'PASS') input.validation.conceptual_blockers = ['artifact-owned blocker'];
    render(<GraphRenderer model={buildCanonicalSimulatorGraphViewModel(input)} />);
    fireEvent.click(screen.getByText('Validation'));

    expect(screen.getByText(status)).toBeInTheDocument();
    expect(screen.getByText(/"G1_CANON_COVERAGE_GATE": "PASS"/)).toBeInTheDocument();
    if (status !== 'PASS') expect(screen.getByText(/artifact-owned blocker/)).toBeInTheDocument();
  });

  it('shows explicit empty states and does not expose canonical auxiliary UI on legacy models', () => {
    const input = structuredClone(qualisArtifact);
    input.literature_use = [];
    input.reference_bindings = [];
    input.ontology_gaps = [];
    input.projection_gaps = [];
    const { unmount } = render(<GraphRenderer model={buildCanonicalSimulatorGraphViewModel(input)} />);
    fireEvent.click(screen.getByText('Literature'));
    expect(screen.getByText('No literature_use records reported.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('References'));
    expect(screen.getByText('No reference_bindings reported.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Gaps'));
    expect(screen.getByText('No ontology_gaps reported.')).toBeInTheDocument();
    expect(screen.getByText('No projection_gaps reported.')).toBeInTheDocument();
    unmount();

    render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures.C34.candidate, fixtures.C34.diagnosis)} />);
    expect(screen.queryByLabelText('Inspección del artifact')).not.toBeInTheDocument();
  });
});
