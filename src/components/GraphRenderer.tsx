import { useCallback, useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { CanonicalSimulatorGraphViewModel, GraphEdge, GraphNode, GraphViewModel, NodeKind, SimulatorGraphEdge, SimulatorGraphNode } from '../graph/types';
import { NODE_KINDS } from '../graph/types';
import { edgeDisplayLabel, nodeDisplayText, nodeKindDisplayLabel, stateDisplayLabel, withCanonicalCode } from '../graph/displayLabels';
import { existingHighlightPath, initialLayoutState, moveNode, resetLayout } from '../graph/interaction';
import { createCanonicalDisplayEdges, createDisplayEdges } from '../graph/flowPresentation';
import { inferentialRolesByEntity, inferenceStepView, type InferenceStepView, type InferentialRole } from '../graph/inferentialPresentation';
import { canonicalEntityDisplayName } from '../canonical/canonicalRegistry';
import { artifactValue, provenanceValue } from '../graph/epistemicPresentation';

const ignoreTransientNodeChanges = () => undefined;

type LegacyGraphViewModel = GraphViewModel<GraphNode, GraphEdge>;
type RendererModel = LegacyGraphViewModel | CanonicalSimulatorGraphViewModel;
type SelectedItem = GraphNode | GraphEdge | SimulatorGraphNode | SimulatorGraphEdge;

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
  const [layout, setLayout] = useState(() => initialLayoutState(model));
  useEffect(() => { setLayout(initialLayoutState(model)); setSelected(undefined); setCollapsed(new Set()); }, [model]);

  const visible = useMemo(() => {
    if (isCanonicalModel(model)) return model.nodes;
    const hiddenSubclaims = new Set(model.nodes.filter(n => n.parentClaimId && collapsed.has(`subclaims:${n.parentClaimId}`)).map(n => n.id));
    return model.nodes
      .filter(n => kinds.has(n.kind) && (!problematic || !['CLAIM', 'SUBCLAIM'].includes(n.kind) || (n.state && n.state !== 'DEFENDIBLE')))
      .filter(n => !hiddenSubclaims.has(n.id))
      .filter(n => !(n.kind === 'EVIDENCE' && model.edges.some(e => e.source === n.id && (hiddenSubclaims.has(e.target) || collapsed.has(`evidence:${e.target}`)))));
  }, [model, kinds, problematic, collapsed]);
  const ids = useMemo(() => new Set(visible.map(n => n.id)), [visible]);
  const legendKinds = useMemo(
    () => isCanonicalModel(model) ? [] : NODE_KINDS.filter(kind => model.nodes.some(node => node.kind === kind)),
    [model],
  );
  const canonicalLegend = useMemo(() => isCanonicalModel(model)
    ? [...new Map(model.nodes.map(node => [node.canonical_type, node.canonical_name])).entries()].sort(([a], [b]) => a.localeCompare(b))
    : [], [model]);
  const selectedNode = !canonical && selected && 'canonicalId' in selected && ['CLAIM', 'SUBCLAIM'].includes(selected.kind) ? selected : undefined;
  const selectedInference = useMemo(() => canonical && selected && isCanonicalNode(selected) && selected.canonical_type === 'ENT-039'
    ? inferenceStepView(model, selected.id) : undefined, [canonical, model, selected]);
  const canonicalRoles = useMemo(() => canonical ? inferentialRolesByEntity(model) : new Map(), [canonical, model]);
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
    ? createCanonicalDisplayEdges(model.edges, ids, showCodes, highlight?.edgeIds)
    : createDisplayEdges(model.edges, ids, showCodes, highlight?.edgeIds), [model, ids, showCodes, highlight]);
  const toggleKind = (kind: NodeKind) => setKinds(old => { const next = new Set(old); if (next.has(kind)) { next.delete(kind); } else { next.add(kind); } return next; });
  const clearSelection = () => setSelected(undefined);
  const selectedChildren = !canonical && selected && 'canonicalId' in selected ? model.nodes.filter(node => node.parentClaimId === selected.id) : [];

  return <main className="shell"><header><h1>SciTesis · Graph Renderer <small>v0.1.1</small></h1><p>{model.sourceCaseId} · {canonical ? 'inspección de grafo canónico' : 'inspección diagnóstica'}</p></header>
    <section className="toolbar" aria-label="Filtros">{!canonical && <>{NODE_KINDS.map(kind => <label key={kind}><input type="checkbox" checked={kinds.has(kind)} onChange={() => toggleKind(kind)} />{kind}</label>)}<label><input type="checkbox" checked={problematic} onChange={e => setProblematic(e.target.checked)} />Solo claims problemáticos</label></>}<label><input type="checkbox" checked={showCodes} onChange={e => setShowCodes(e.target.checked)} />Mostrar códigos canónicos</label><button onClick={() => setLayout(resetLayout(model))}>Restablecer layout</button><button onClick={clearSelection} disabled={!selected}>Limpiar selección</button><button aria-expanded={!detailCollapsed} aria-controls="detail-panel" onClick={() => setDetailCollapsed(value => !value)}>{detailCollapsed ? 'Mostrar detalle' : 'Ocultar detalle'}</button></section>
    <div className={`workspace ${detailCollapsed ? 'detail-collapsed' : ''}`}><div className="canvas" data-testid="graph-canvas"><ReactFlow nodes={nodes} edges={edges} nodesConnectable={false} onConnect={undefined} onNodesChange={ignoreTransientNodeChanges} onNodeDragStop={(_, node) => setLayout(old => moveNode(old, node.id, node.position))} fitView onPaneClick={clearSelection} onNodeClick={(_, node) => setSelected(model.nodes.find(item => item.id === node.id))} onEdgeClick={(_, edge) => setSelected(model.edges.find(item => item.id === edge.id))}><Background /><Controls /><MiniMap /></ReactFlow><div className="legend" aria-label="Leyenda"><div className="legend-group"><b>Tipos</b>{canonical ? canonicalLegend.map(([type, name]) => <span key={type} className="legend-item"><span className="legend-swatch" aria-hidden="true" />{type} · {name}</span>) : legendKinds.map(kind => <span key={kind} className="legend-item"><span className="legend-swatch" aria-hidden="true" />{nodeKindDisplayLabel(kind)}</span>)}</div>{!canonical && <div className="legend-group"><b>Estado / énfasis</b><span className="legend-item"><span className="legend-swatch status-ok" aria-hidden="true" />Defendible</span><span className="legend-item"><span className="legend-swatch status-problem" aria-hidden="true" />Problemático/restringido</span><span className="legend-item maximum">★ Máximo defendible</span></div>}</div></div>
      {!detailCollapsed && <aside id="detail-panel" aria-label="Detalle"><h2>Detalle</h2>{selected ? (isCanonicalNode(selected) ? <CanonicalNodeDetail node={selected} inference={selectedInference} /> : isCanonicalEdge(selected) ? <CanonicalEdgeDetail edge={selected} /> : 'canonicalId' in selected ? <NodeDetail node={selected} children={selectedChildren} /> : <EdgeDetail edge={selected} />) : <p>Selecciona un nodo o una arista.</p>}</aside>}</div></main>;
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
