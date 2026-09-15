import { useCallback, useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { CanonicalSimulatorGraphViewModel, GraphEdge, GraphNode, GraphViewModel, NodeKind, SimulatorGraphEdge, SimulatorGraphNode, SimulatorLiteratureUse, SimulatorOntologyGap, SimulatorProjectionGap, SimulatorReferenceBinding } from '../graph/types';
import { NODE_KINDS } from '../graph/types';
import { edgeDisplayLabel, nodeDisplayText, nodeKindDisplayLabel, stateDisplayLabel, withCanonicalCode } from '../graph/displayLabels';
import { existingHighlightPath, initialLayoutState, layoutStateFromPositions, moveNode, resetLayout } from '../graph/interaction';
import { createCanonicalDisplayEdges, createDisplayEdges } from '../graph/flowPresentation';
import { inferentialRolesByEntity, inferenceStepView, type InferenceStepView, type InferentialRole } from '../graph/inferentialPresentation';
import { canonicalEntityDisplayName, canonicalRelationDisplayName } from '../canonical/canonicalRegistry';
import { artifactValue, provenanceValue } from '../graph/epistemicPresentation';
import { computeCanonicalVisibility, deriveAvailableCanonicalFilters, isCanonicalFilterActive, resetCanonicalFilters, type AvailableCanonicalFilters, type CanonicalFilterDimension, type CanonicalVisibility, type CanonicalVisibilityFilterState } from '../graph/canonicalVisibility';
import { computeCanonicalFocusVisibility, isCanonicalFocusActive, resetCanonicalFocus, type CanonicalFocusDepth, type CanonicalFocusDirection, type CanonicalFocusState } from '../graph/canonicalFocus';
import { CANONICAL_LAYOUT_DEFAULT_DIRECTION, computeCanonicalLayout, type CanonicalLayoutDirection } from '../graph/canonicalLayout';

const ignoreTransientNodeChanges = () => undefined;

type LegacyGraphViewModel = GraphViewModel<GraphNode, GraphEdge>;
type RendererModel = LegacyGraphViewModel | CanonicalSimulatorGraphViewModel;
type SelectedItem = GraphNode | GraphEdge | SimulatorGraphNode | SimulatorGraphEdge;
type InspectorSection = 'graph' | 'literature' | 'references' | 'gaps' | 'validation';

const isCanonicalModel = (model: RendererModel): model is CanonicalSimulatorGraphViewModel =>
  model.metadata.adapterVersion === 'canonical-simulator-0.1';

export function GraphRenderer({ model }: { model: RendererModel }) {
  const canonical = isCanonicalModel(model);
  const [selected, setSelected] = useState<SelectedItem>();
  const [kinds, setKinds] = useState<Set<NodeKind>>(new Set(NODE_KINDS));
  const [problematic, setProblematic] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showCodes, setShowCodes] = useState(false);
  const [detailCollapsed, setDetailCollapsed] = useState(false);
  const [inspectorSection, setInspectorSection] = useState<InspectorSection>('graph');
  const [layout, setLayout] = useState(() => initialLayoutState(model));
  const [canonicalFilters, setCanonicalFilters] = useState<CanonicalVisibilityFilterState>(resetCanonicalFilters);
  const [canonicalFocus, setCanonicalFocus] = useState<CanonicalFocusState>(resetCanonicalFocus);
  const [layoutDirection, setLayoutDirection] = useState<CanonicalLayoutDirection>(CANONICAL_LAYOUT_DEFAULT_DIRECTION);
  useEffect(() => { setLayout(initialLayoutState(model)); setSelected(undefined); setCollapsed(new Set()); setInspectorSection('graph'); setCanonicalFilters(resetCanonicalFilters()); setCanonicalFocus(resetCanonicalFocus()); }, [model]);

  const eligibleCanonicalVisibility = useMemo(() => isCanonicalModel(model)
    ? computeCanonicalVisibility(model, canonicalFilters)
    : undefined, [model, canonicalFilters]);
  const canonicalVisibility = useMemo(() => isCanonicalModel(model)
    ? computeCanonicalFocusVisibility(model, eligibleCanonicalVisibility!, canonicalFocus)
    : undefined, [model, eligibleCanonicalVisibility, canonicalFocus]);
  const availableCanonicalFilters = useMemo(() => isCanonicalModel(model)
    ? deriveAvailableCanonicalFilters(model)
    : undefined, [model]);
  const semanticPositions = useMemo(() => isCanonicalModel(model) && canonicalVisibility
    ? computeCanonicalLayout(model, canonicalVisibility, { direction: layoutDirection })
    : undefined, [model, canonicalVisibility, layoutDirection]);
  useEffect(() => {
    if (semanticPositions) setLayout(layoutStateFromPositions(semanticPositions));
  }, [semanticPositions]);

  const visible = useMemo(() => {
    if (isCanonicalModel(model)) return model.nodes.filter(node => canonicalVisibility!.visibleNodeIds.has(node.id));
    const hiddenSubclaims = new Set(model.nodes.filter(n => n.parentClaimId && collapsed.has(`subclaims:${n.parentClaimId}`)).map(n => n.id));
    return model.nodes
      .filter(n => kinds.has(n.kind) && (!problematic || !['CLAIM', 'SUBCLAIM'].includes(n.kind) || (n.state && n.state !== 'DEFENDIBLE')))
      .filter(n => !hiddenSubclaims.has(n.id))
      .filter(n => !(n.kind === 'EVIDENCE' && model.edges.some(e => e.source === n.id && (hiddenSubclaims.has(e.target) || collapsed.has(`evidence:${e.target}`)))));
  }, [model, kinds, problematic, collapsed, canonicalVisibility]);
  const ids = useMemo(() => new Set(visible.map(n => n.id)), [visible]);
  const legendKinds = useMemo(
    () => isCanonicalModel(model) ? [] : NODE_KINDS.filter(kind => model.nodes.some(node => node.kind === kind)),
    [model],
  );
  const selectedNode = !canonical && selected && 'canonicalId' in selected && ['CLAIM', 'SUBCLAIM'].includes(selected.kind) ? selected : undefined;
  const selectedInference = useMemo(() => canonical && selected && isCanonicalNode(selected) && selected.canonical_type === 'ENT-039'
    ? inferenceStepView(model, selected.id) : undefined, [canonical, model, selected]);
  const canonicalRoles = useMemo<ReadonlyMap<string, ReadonlySet<InferentialRole>>>(
    () => canonical ? inferentialRolesByEntity(model) : new Map(),
    [canonical, model],
  );
  const visibleCanonicalRoles = useMemo(() => {
    if (!canonical) return [];
    const roles = new Set<InferentialRole>();
    visible.forEach(node => canonicalRoles.get(node.id)?.forEach(role => roles.add(role)));
    const roleOrder: InferentialRole[] = ['PREMISE', 'WARRANT', 'BACKING', 'ASSUMPTION', 'CONCLUSION'];
    return roleOrder.filter(role => roles.has(role));
  }, [canonical, canonicalRoles, visible]);
  const hasVisibleInferenceStep = canonical && visible.some(node => isCanonicalNode(node) && node.canonical_type === 'ENT-039');
  const focusRoot = canonical && isCanonicalFocusActive(canonicalFocus)
    ? model.nodes.find(node => node.id === canonicalFocus.rootNodeId)
    : undefined;
  const highlight = useMemo(() => {
    if (selectedNode) return existingHighlightPath(model, selectedNode.id);
    if (!selectedInference) return undefined;
    return {
      nodeIds: new Set([selectedInference.step.id, ...selectedInference.rolesByEntityId.keys()]),
      edgeIds: new Set(selectedInference.relations.map(relation => relation.id)),
    };
  }, [model, selectedNode, selectedInference]);
  const toggleCollapse = useCallback((capability: 'subclaims' | 'evidence', id: string) => setCollapsed(old => { const next = new Set(old); const key = `${capability}:${id}`; if (next.has(key)) { next.delete(key); } else { next.add(key); } return next; }), []);
  const nodes: Node[] = useMemo(() => visible.map(n => ({
    id: n.id, position: layout[n.id] ?? n.position,
    data: { label: isCanonicalNode(n)
      ? <div className="node-content"><b>{withCanonicalCode(canonicalEntityDisplayName(n.canonical_type, n.canonical_name), n.canonical_type, showCodes)}</b><span>{n.label}</span>{canonicalRoles.get(n.id) && <div className="inferential-roles" aria-label={`Roles de ${n.id}`}>{[...canonicalRoles.get(n.id)!].map(role => <em key={role}>{role}</em>)}</div>}</div>
      : <div className="node-content"><b>{withCanonicalCode(nodeKindDisplayLabel(n.kind), n.kind, showCodes)}</b><span>{nodeDisplayText(n, showCodes)}</span>{n.state && <em>{withCanonicalCode(stateDisplayLabel(n.state), n.state, showCodes)}</em>}{n.isMaximumDefendable && <strong className="maximum-badge">★ Máximo defendible</strong>}<div className="node-actions">{n.collapseCapabilities.map(capability => <button key={capability} aria-label={`Alternar ${capability} de ${n.id}`} onClick={event => { event.stopPropagation(); toggleCollapse(capability, n.id); }}>{capability === 'subclaims' ? 'Subclaims −/+' : 'Evidencia −/+'}</button>)}</div></div> },
    className: isCanonicalNode(n) ? `graph-node canonical-node ${n.canonical_type === 'ENT-039' ? 'inference-step-node' : ''} ${highlight && !highlight.nodeIds.has(n.id) ? 'dimmed' : ''}` : `graph-node kind-${n.kind.toLowerCase()} state-${n.state?.toLowerCase() ?? 'none'} ${n.isMaximumDefendable ? 'maximum-defendable' : ''} ${highlight && !highlight.nodeIds.has(n.id) ? 'dimmed' : ''}`,
  })), [visible, layout, showCodes, highlight, toggleCollapse, canonicalRoles]);
  const edges = useMemo(() => isCanonicalModel(model)
    ? createCanonicalDisplayEdges(model.edges, ids, canonicalVisibility!.visibleEdgeIds, showCodes, highlight?.edgeIds)
    : createDisplayEdges(model.edges, ids, showCodes, highlight?.edgeIds), [model, ids, canonicalVisibility, showCodes, highlight]);
  useEffect(() => {
    if (!canonicalVisibility || !selected) return;
    const remainsVisible = isCanonicalNode(selected)
      ? canonicalVisibility.visibleNodeIds.has(selected.id)
      : isCanonicalEdge(selected) ? canonicalVisibility.visibleEdgeIds.has(selected.id) : true;
    if (!remainsVisible) setSelected(undefined);
  }, [canonicalVisibility, selected]);
  useEffect(() => {
    if (isCanonicalFocusActive(canonicalFocus) && eligibleCanonicalVisibility
      && !eligibleCanonicalVisibility.visibleNodeIds.has(canonicalFocus.rootNodeId)) {
      setCanonicalFocus(resetCanonicalFocus());
    }
  }, [canonicalFocus, eligibleCanonicalVisibility]);
  const toggleKind = (kind: NodeKind) => setKinds(old => { const next = new Set(old); if (next.has(kind)) { next.delete(kind); } else { next.add(kind); } return next; });
  const clearSelection = () => setSelected(undefined);
  const activateFocus = (rootNodeId: string) => setCanonicalFocus(current => isCanonicalFocusActive(current)
    ? { ...current, rootNodeId }
    : { mode: 'neighborhood', rootNodeId, depth: 1, direction: 'both' });
  const resetCanonicalPresentation = () => {
    setCanonicalFilters(resetCanonicalFilters());
    setCanonicalFocus(resetCanonicalFocus());
  };
  const reorganizeLayout = () => setLayout(isCanonicalModel(model) && semanticPositions
    ? layoutStateFromPositions(semanticPositions)
    : resetLayout(model));
  const selectedChildren = !canonical && selected && 'canonicalId' in selected ? model.nodes.filter(node => node.parentClaimId === selected.id) : [];

  return <main className="shell">
    {canonical && availableCanonicalFilters && eligibleCanonicalVisibility && canonicalVisibility && <><CanonicalFilterPanel model={model} filters={canonicalFilters} available={availableCanonicalFilters} eligibleVisibility={eligibleCanonicalVisibility} visibility={canonicalVisibility} focusActive={isCanonicalFocusActive(canonicalFocus)} onChange={setCanonicalFilters} onReset={resetCanonicalPresentation} />
      <CanonicalFocusPanel focus={canonicalFocus} root={focusRoot} onChange={setCanonicalFocus} onExit={() => setCanonicalFocus(resetCanonicalFocus())} /></>}
    <div className={`workspace ${detailCollapsed ? 'detail-collapsed' : ''}`}><div className="canvas" data-testid="graph-canvas"><section className="graph-toolbar" aria-label="Controles del grafo" onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}>{!canonical && <>{NODE_KINDS.map(kind => <label key={kind}><input type="checkbox" checked={kinds.has(kind)} onChange={() => toggleKind(kind)} />{kind}</label>)}<label><input type="checkbox" checked={problematic} onChange={e => setProblematic(e.target.checked)} />Solo claims problemáticos</label></>}<label><input type="checkbox" checked={showCodes} onChange={e => setShowCodes(e.target.checked)} />Mostrar códigos canónicos</label>{canonical && <fieldset className="layout-direction"><legend>Layout</legend>{(['LR', 'TB'] as const).map(direction => <label key={direction}><input type="radio" name="canonical-layout-direction" value={direction} checked={layoutDirection === direction} onChange={() => setLayoutDirection(direction)} />{direction}</label>)}</fieldset>}<button onClick={reorganizeLayout}>{canonical ? 'REORGANIZE GRAPH' : 'Restablecer layout'}</button><button onClick={clearSelection} disabled={!selected}>Limpiar selección</button><button aria-expanded={!detailCollapsed} aria-controls="detail-panel" onClick={() => setDetailCollapsed(value => !value)}>{detailCollapsed ? 'Mostrar detalle' : 'Ocultar detalle'}</button></section><ReactFlow nodes={nodes} edges={edges} nodesConnectable={false} onConnect={undefined} onNodesChange={ignoreTransientNodeChanges} onNodeDragStop={(_, node) => setLayout(old => moveNode(old, node.id, node.position))} fitView onPaneClick={clearSelection} onNodeClick={(_, node) => setSelected(model.nodes.find(item => item.id === node.id))} onEdgeClick={(_, edge) => setSelected(model.edges.find(item => item.id === edge.id))}><Background /><Controls /><MiniMap /></ReactFlow><details className="legend" aria-label="Leyenda"><summary>Legend</summary><div className="legend-content">{canonical ? <>{hasVisibleInferenceStep && <div className="legend-group"><b>Node semantics</b><span className="legend-item"><span className="legend-swatch inference-step" aria-hidden="true" />Inference step</span></div>}{visibleCanonicalRoles.length > 0 && <div className="legend-group"><b>Argumentative roles</b>{visibleCanonicalRoles.map(role => <span key={role} className="legend-item"><span className="legend-role-swatch" aria-hidden="true">Aa</span>{role}</span>)}</div>}{!hasVisibleInferenceStep && visibleCanonicalRoles.length === 0 && <span className="legend-empty">No special conventions in the visible graph.</span>}</> : <><div className="legend-group"><b>Tipos</b>{legendKinds.map(kind => <span key={kind} className="legend-item"><span className="legend-swatch" aria-hidden="true" />{nodeKindDisplayLabel(kind)}</span>)}</div><div className="legend-group"><b>Estado / énfasis</b><span className="legend-item"><span className="legend-swatch status-ok" aria-hidden="true" />Defendible</span><span className="legend-item"><span className="legend-swatch status-problem" aria-hidden="true" />Problemático/restringido</span><span className="legend-item maximum">★ Máximo defendible</span></div></>}</div></details></div>
      {!detailCollapsed && <aside id="detail-panel" aria-label="Detalle">{canonical && <InspectorNavigation selected={inspectorSection} onSelect={setInspectorSection} />}{!canonical || inspectorSection === 'graph' ? <><h2>Detalle</h2>{selected ? (isCanonicalNode(selected) ? <><button className="focus-selected" onClick={() => activateFocus(selected.id)}>Focus on this node</button><CanonicalNodeDetail node={selected} inference={selectedInference} /></> : isCanonicalEdge(selected) ? <CanonicalEdgeDetail edge={selected} /> : 'canonicalId' in selected ? <NodeDetail node={selected} children={selectedChildren} /> : <EdgeDetail edge={selected} />) : <p>Selecciona un nodo o una arista.</p>}</> : <AuxiliaryInspector model={model} section={inspectorSection} />}</aside>}</div></main>;
}

type CanonicalFilterKey = keyof CanonicalVisibilityFilterState;

function CanonicalFilterPanel({ model, filters, available, eligibleVisibility, visibility, focusActive, onChange, onReset }: {
  model: CanonicalSimulatorGraphViewModel;
  filters: CanonicalVisibilityFilterState;
  available: AvailableCanonicalFilters;
  visibility: CanonicalVisibility;
  eligibleVisibility: CanonicalVisibility;
  focusActive: boolean;
  onChange: (filters: CanonicalVisibilityFilterState) => void;
  onReset: () => void;
}) {
  const updateDimension = (key: CanonicalFilterKey, dimension: CanonicalFilterDimension) => onChange({ ...filters, [key]: dimension });
  const groups: Array<{ key: CanonicalFilterKey; label: string; values: readonly string[]; display?: (value: string) => string }> = [
    { key: 'entityTypes', label: 'Entity types', values: available.entityTypes, display: value => `${value} · ${canonicalEntityDisplayName(value)}` },
    { key: 'relationTypes', label: 'Relation types', values: available.relationTypes, display: value => `${value} · ${canonicalRelationDisplayName(value)}` },
    { key: 'epistemicPlanes', label: 'Epistemic plane', values: available.epistemicPlanes },
    { key: 'reviewStates', label: 'Review state', values: available.reviewStates },
    { key: 'explicitnessValues', label: 'Explicitness', values: available.explicitnessValues },
  ];
  return <details className="canonical-filters">
    <summary>Filters</summary>
    <div className="visibility-summary" aria-live="polite">Nodes: {visibility.visibleNodeIds.size} visible / {eligibleVisibility.visibleNodeIds.size} eligible / {model.nodes.length} total · Relations: {visibility.visibleEdgeIds.size} visible / {eligibleVisibility.visibleEdgeIds.size} eligible / {model.edges.length} total</div>
    <p>Sin selección, una dimensión no restringe el grafo. “Limpiar filtro” desactiva solo esa dimensión.</p>
    <button className="reset-filters" onClick={onReset} disabled={!isCanonicalFilterActive(filters) && !focusActive}>SHOW ALL / RESET FILTERS</button>
    <div className="filter-groups">{groups.map(group => <CanonicalFilterGroup key={group.key} label={group.label} values={group.values} display={group.display} dimension={filters[group.key]} onChange={dimension => updateDimension(group.key, dimension)} />)}</div>
  </details>;
}

function CanonicalFocusPanel({ focus, root, onChange, onExit }: {
  focus: CanonicalFocusState;
  root?: SimulatorGraphNode;
  onChange: (focus: CanonicalFocusState) => void;
  onExit: () => void;
}) {
  if (!isCanonicalFocusActive(focus) || !root) return null;
  return <section className="canonical-focus" aria-label="Focus controls">
    <strong>FOCUS ACTIVE</strong>
    <span>Root: {root.label} ({root.id})</span>
    <label>Depth: <select aria-label="Focus depth" value={focus.depth} onChange={event => onChange({ ...focus, depth: Number(event.target.value) as CanonicalFocusDepth })}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label>
    <label>Direction: <select aria-label="Focus direction" value={focus.direction} onChange={event => onChange({ ...focus, direction: event.target.value as CanonicalFocusDirection })}><option value="both">Both</option><option value="incoming">Incoming</option><option value="outgoing">Outgoing</option></select></label>
    <button onClick={onExit}>EXIT FOCUS / SHOW ELIGIBLE GRAPH</button>
  </section>;
}

function CanonicalFilterGroup({ label, values, display = value => value, dimension, onChange }: {
  label: string;
  values: readonly string[];
  display?: (value: string) => string;
  dimension: CanonicalFilterDimension;
  onChange: (dimension: CanonicalFilterDimension) => void;
}) {
  const toggle = (value: string) => {
    const selected = dimension.mode === 'selected' ? new Set(dimension.values) : new Set<string>();
    if (selected.has(value)) selected.delete(value); else selected.add(value);
    onChange({ mode: 'selected', values: selected });
  };
  return <fieldset><legend>{label}</legend><div className="filter-actions"><button onClick={() => onChange({ mode: 'selected', values: new Set(values) })}>Seleccionar todos</button><button onClick={() => onChange({ mode: 'all' })}>Limpiar filtro</button></div>{values.map(value => <label key={value}><input aria-label={`${label}: ${value}`} type="checkbox" checked={dimension.mode === 'selected' && dimension.values.has(value)} onChange={() => toggle(value)} />{display(value)}</label>)}</fieldset>;
}

function InspectorNavigation({ selected, onSelect }: { selected: InspectorSection; onSelect: (section: InspectorSection) => void }) {
  const sections: Array<[InspectorSection, string]> = [['graph', 'Graph'], ['literature', 'Literature'], ['references', 'References'], ['gaps', 'Gaps'], ['validation', 'Validation']];
  return <nav className="inspector-tabs" aria-label="Inspección del artifact">{sections.map(([section, label]) => <button key={section} className={selected === section ? 'active' : ''} aria-pressed={selected === section} onClick={() => onSelect(section)}>{label}</button>)}</nav>;
}

function AuxiliaryInspector({ model, section }: { model: CanonicalSimulatorGraphViewModel; section: Exclude<InspectorSection, 'graph'> }) {
  if (section === 'literature') return <AuxiliaryList title="Literature use" empty="No literature_use records reported.">{model.metadata.literatureUse.map(item => <LiteratureDetail key={item.literature_use_id} item={item} />)}</AuxiliaryList>;
  if (section === 'references') return <AuxiliaryList title="Reference bindings" empty="No reference_bindings reported.">{model.metadata.referenceBindings.map(item => <ReferenceBindingDetail key={item.binding_id} item={item} />)}</AuxiliaryList>;
  if (section === 'gaps') return <><AuxiliaryList title="Ontology gaps" empty="No ontology_gaps reported.">{model.metadata.ontologyGaps.map(item => <OntologyGapDetail key={item.gap_id} item={item} />)}</AuxiliaryList><AuxiliaryList title="Projection gaps" empty="No projection_gaps reported.">{model.metadata.projectionGaps.map(item => <ProjectionGapDetail key={item.projection_gap_id} item={item} />)}</AuxiliaryList></>;
  const validation = model.metadata.validation;
  return <section className="auxiliary-section" aria-label="Validation"><h2>Validation</h2><dl><ArtifactItem title="Status" value={validation.status} /><ArtifactItem title="Gate status" value={validation.gate_status} structured /><ArtifactItem title="Conceptual blockers" value={validation.conceptual_blockers} structured /><ArtifactItem title="Open review items" value={validation.open_review_items} structured /><ArtifactItem title="Ontology gaps open" value={validation.ontology_gaps_open} structured /><ArtifactItem title="Projection gaps" value={validation.projection_gaps} structured /><ArtifactItem title="Checks" value={validation.checks} structured /></dl></section>;
}

function AuxiliaryList({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return <section className="auxiliary-section" aria-label={title}><h2>{title}</h2>{children.length ? children : <p>{empty}</p>}</section>;
}

function LiteratureDetail({ item }: { item: SimulatorLiteratureUse }) {
  return <article className="auxiliary-record"><h3>{item.literature_use_id}</h3><dl><ArtifactItem title="Citation" value={item.citation} /><ArtifactItem title="Source unit IDs" value={item.source_unit_ids} structured /><ArtifactItem title="Used for" value={item.used_for} structured /><ArtifactItem title="Target entity IDs" value={item.target_entity_ids} structured /><ArtifactItem title="Necessity" value={item.necessity} /><ArtifactItem title="Sufficiency" value={item.sufficiency} /><ArtifactItem title="Authority" value={item.authority} /><ArtifactItem title="Currency" value={item.currency} structured /><ArtifactItem title="Disciplinary relevance" value={item.disciplinary_relevance} /><ArtifactItem title="Epistemic diversity or coverage" value={item.epistemic_diversity_or_coverage} /><ArtifactItem title="Review state" value={item.review_state} /><ArtifactItem title="Origin" value={item.origin} /><ArtifactItem title="Version" value={item.version} /><ArtifactItem title="IAM source" value={item.iam_source} /><ArtifactItem title="Provenance" value={item.provenance} structured /></dl></article>;
}

function ReferenceBindingDetail({ item }: { item: SimulatorReferenceBinding }) {
  return <article className="auxiliary-record"><h3>{item.binding_id}</h3><dl><ArtifactItem title="Source object ID" value={item.source_object_id} /><ArtifactItem title="Reference text" value={item.reference_text} /><ArtifactItem title="Resolved target ID" value={item.resolved_target_id} /><ArtifactItem title="Status" value={item.status} /><ArtifactItem title="Candidate target IDs" value={item.candidate_target_ids} structured /><ArtifactItem title="Origin" value={item.origin} /><ArtifactItem title="Version" value={item.version} /><ArtifactItem title="IAM source" value={item.iam_source} /><ArtifactItem title="Provenance" value={item.provenance} structured /></dl></article>;
}

function OntologyGapDetail({ item }: { item: SimulatorOntologyGap }) {
  return <article className="auxiliary-record"><h3>{item.gap_id}</h3><dl><ArtifactItem title="Gap type" value={item.gap_type} /><ArtifactItem title="Description" value={item.description} /><ArtifactItem title="Source refs" value={item.source_refs} structured /><ArtifactItem title="Affected object IDs" value={item.affected_object_ids} structured /><ArtifactItem title="Blocking" value={item.blocking} /><ArtifactItem title="Review state" value={item.review_state} /></dl></article>;
}

function ProjectionGapDetail({ item }: { item: SimulatorProjectionGap }) {
  return <article className="auxiliary-record"><h3>{item.projection_gap_id}</h3><dl><ArtifactItem title="Object or relation ID" value={item.object_or_relation_id} /><ArtifactItem title="Target contract" value={item.target_contract} /><ArtifactItem title="Status" value={item.status} /><ArtifactItem title="Reason" value={item.reason} /></dl></article>;
}

function Item({ title, children }: { title: string; children?: React.ReactNode }) { if (children === undefined || children === null || children === '') return null; return <><dt>{title}</dt><dd>{children}</dd></>; }
function ArtifactItem({ title, value, structured = false }: { title: string; value: unknown; structured?: boolean }) {
  const rendered = structured ? provenanceValue(value) : artifactValue(value);
  return <Item title={title}>{rendered === undefined ? undefined : structured ? <pre>{rendered}</pre> : rendered}</Item>;
}
const isCanonicalNode = (item: SelectedItem): item is SimulatorGraphNode => 'canonical_type' in item && 'position' in item;
const isCanonicalEdge = (item: SelectedItem): item is SimulatorGraphEdge => 'canonical_type' in item && 'source_id' in item;
function CanonicalNodeDetail({ node, inference }: { node: SimulatorGraphNode; inference?: InferenceStepView }) {
  return <><dl><Item title="ID">{node.id}</Item><Item title="Canonical type">{node.canonical_type}</Item><Item title="Canonical name">{node.canonical_name}</Item><Item title="Subtype">{node.subtype}</Item><Item title="Label">{node.label}</Item><Item title="Text">{node.text}</Item><ArtifactItem title="Attributes" value={node.attributes} structured /><ArtifactItem title="Epistemic plane" value={node.epistemic_plane} /><ArtifactItem title="Explicitness" value={node.explicitness} /><ArtifactItem title="Confidence" value={node.confidence} /><ArtifactItem title="Review state" value={node.review_state} /><ArtifactItem title="Functional relevance" value={node.functional_relevance} /><ArtifactItem title="Projection status" value={node.projection_status} /><ArtifactItem title="Origin" value={node.origin} /><ArtifactItem title="Version" value={node.version} /><ArtifactItem title="IAM source" value={node.iam_source} /><ArtifactItem title="Provenance" value={node.provenance} structured /></dl>{inference && <InferentialDetail inference={inference} />}</>;
}

function InferentialDetail({ inference }: { inference: InferenceStepView }) {
  const idsForRole = (role: InferentialRole) => [...inference.rolesByEntityId].filter(([, roles]) => roles.has(role)).map(([id]) => id);
  return <section className="inferential-detail" aria-label="Estructura inferencial"><h3>Estructura inferencial</h3><dl><Item title="Premisas">{idsForRole('PREMISE').join(', ')}</Item><Item title="Warrants">{idsForRole('WARRANT').join(', ')}</Item><Item title="Backing">{idsForRole('BACKING').join(', ')}</Item><Item title="Assumptions">{idsForRole('ASSUMPTION').join(', ')}</Item><Item title="Conclusión">{inference.step.conclusion_id}</Item><Item title="Relaciones REL">{inference.relations.map(relation => `${relation.id} · ${relation.canonical_type} / ${relation.canonical_name} (${relation.source_id} → ${relation.target_id})`).join('; ')}</Item><ArtifactItem title="Explicitness (inference step)" value={inference.step.explicitness} /><ArtifactItem title="Review state (inference step)" value={inference.step.review_state} /><ArtifactItem title="Origin (inference step)" value={inference.step.origin} /><ArtifactItem title="Version (inference step)" value={inference.step.version} /><ArtifactItem title="IAM source (inference step)" value={inference.step.iam_source} /><ArtifactItem title="Provenance (inference step)" value={inference.step.provenance} structured /></dl>{inference.premiseGroups.map(group => <div className="premise-group" data-testid="premise-group" key={group.id}><b>{group.id} · grupo de premisas</b><span>Modo: {group.mode}</span><span>Miembros: {group.member_ids.join(', ')}</span><span>Inference step: {group.target_inference_step_id}</span><dl><ArtifactItem title="Review state (premise group)" value={group.review_state} /><ArtifactItem title="Origin (premise group)" value={group.origin} /><ArtifactItem title="Version (premise group)" value={group.version} /><ArtifactItem title="IAM source (premise group)" value={group.iam_source} /><ArtifactItem title="Provenance (premise group)" value={group.provenance} structured /></dl></div>)}</section>;
}
export function CanonicalEdgeDetail({ edge }: { edge: SimulatorGraphEdge }) {
  return <dl><Item title="ID">{edge.id}</Item><Item title="Canonical type">{edge.canonical_type}</Item><Item title="Canonical name">{edge.canonical_name}</Item><Item title="Source ID">{edge.source_id}</Item><Item title="Target ID">{edge.target_id}</Item><ArtifactItem title="Attributes" value={edge.attributes} structured /><ArtifactItem title="Explicitness" value={edge.explicitness} /><ArtifactItem title="Confidence" value={edge.confidence} /><ArtifactItem title="Review state" value={edge.review_state} /><ArtifactItem title="Projection status" value={edge.projection_status} /><ArtifactItem title="Origin" value={edge.origin} /><ArtifactItem title="Version" value={edge.version} /><ArtifactItem title="IAM source" value={edge.iam_source} /><ArtifactItem title="Provenance" value={edge.provenance} structured /></dl>;
}
function NodeDetail({ node, children }: { node: GraphNode; children: GraphNode[] }) {
  return <dl><Item title="Etiqueta amigable">{nodeKindDisplayLabel(node.kind)}</Item><Item title="Código canónico">{node.kind === 'STATE' ? node.text ?? node.label : node.state ?? node.kind}</Item><Item title="ID canónico">{node.canonicalId}</Item><Item title="Tipo / kind">{node.kind}</Item><Item title="Texto completo">{node.text}</Item>{node.state && <Item title="Estado de defendibilidad">{stateDisplayLabel(node.state)} ({node.state})</Item>}<Item title="Reglas disparadas">{node.rules.length ? node.rules.join(', ') : undefined}</Item><Item title="Support path">{node.supportPath.length ? node.supportPath.join(' → ') : undefined}</Item><Item title="Source refs">{node.sourceRefs.length ? node.sourceRefs.join(', ') : undefined}</Item><Item title="Maximum defendable claim">{node.maximumDefendableClaim}</Item><Item title="Es máximo defendible">{node.isMaximumDefendable ? 'Sí' : 'No'}</Item><Item title="Gravedad / severity">{node.gravity}</Item><Item title="Reparabilidad / repair">{node.reparability}</Item><Item title="Parent claim">{node.parentClaimId}</Item><Item title="Subclaims">{children.length ? children.map(child => child.canonicalId).join(', ') : undefined}</Item></dl>;
}
function EdgeDetail({ edge }: { edge: GraphEdge }) { return <dl><Item title="Etiqueta amigable">{edgeDisplayLabel(edge.kind)}</Item><Item title="Código canónico">{edge.kind}</Item><Item title="ID canónico">{edge.id}</Item><Item title="Source">{edge.source}</Item><Item title="Target">{edge.target}</Item><Item title="Tipo de relación">{edge.kind}</Item></dl>; }
