import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node, type NodeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphEdge, GraphNode, GraphViewModel, NodeKind } from '../graph/types';
import { NODE_KINDS } from '../graph/types';
import { edgeDisplayLabel, nodeKindDisplayLabel, stateDisplayLabel, withCanonicalCode } from '../graph/displayLabels';
import { existingHighlightPath, initialLayoutState, moveNode, resetLayout } from '../graph/interaction';

const legendKinds: NodeKind[] = ['CLAIM', 'SUBCLAIM', 'EVIDENCE', 'STATE', 'REPAIR'];

export function GraphRenderer({ model }: { model: GraphViewModel }) {
  const [selected, setSelected] = useState<GraphNode | GraphEdge>();
  const [kinds, setKinds] = useState<Set<NodeKind>>(new Set(NODE_KINDS));
  const [problematic, setProblematic] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showCodes, setShowCodes] = useState(false);
  const [layout, setLayout] = useState(() => initialLayoutState(model));
  useEffect(() => { setLayout(initialLayoutState(model)); setSelected(undefined); }, [model]);

  const visible = useMemo(() => {
    const hiddenSubclaims = new Set(model.nodes.filter(n => n.parentClaimId && collapsed.has(`subclaims:${n.parentClaimId}`)).map(n => n.id));
    return model.nodes
      .filter(n => kinds.has(n.kind) && (!problematic || !['CLAIM', 'SUBCLAIM'].includes(n.kind) || (n.state && n.state !== 'DEFENDIBLE')))
      .filter(n => !hiddenSubclaims.has(n.id))
      .filter(n => !(n.kind === 'EVIDENCE' && model.edges.some(e => e.source === n.id && (hiddenSubclaims.has(e.target) || collapsed.has(`evidence:${e.target}`)))));
  }, [model, kinds, problematic, collapsed]);
  const ids = new Set(visible.map(n => n.id));
  const selectedNode = selected && 'canonicalId' in selected && ['CLAIM', 'SUBCLAIM'].includes(selected.kind) ? selected : undefined;
  const highlight = selectedNode ? existingHighlightPath(model, selectedNode.id) : undefined;
  const toggleCollapse = (capability: 'subclaims' | 'evidence', id: string) => setCollapsed(old => { const next = new Set(old); const key = `${capability}:${id}`; if (next.has(key)) { next.delete(key); } else { next.add(key); } return next; });
  const nodes: Node[] = visible.map(n => ({
    id: n.id, position: layout[n.id] ?? n.position,
    data: { label: <div className="node-content"><b>{withCanonicalCode(nodeKindDisplayLabel(n.kind), n.kind, showCodes)}</b><span>{n.label}</span>{n.state && <em>{withCanonicalCode(stateDisplayLabel(n.state), n.state, showCodes)}</em>}{n.isMaximumDefendable && <strong className="maximum-badge">★ Máximo defendible</strong>}<div className="node-actions">{n.collapseCapabilities.map(capability => <button key={capability} aria-label={`Alternar ${capability} de ${n.id}`} onClick={event => { event.stopPropagation(); toggleCollapse(capability, n.id); }}>{capability === 'subclaims' ? 'Subclaims −/+' : 'Evidencia −/+'}</button>)}</div></div> },
    className: `graph-node kind-${n.kind.toLowerCase()} state-${n.state?.toLowerCase() ?? 'none'} ${n.isMaximumDefendable ? 'maximum-defendable' : ''} ${highlight && !highlight.nodeIds.has(n.id) ? 'dimmed' : ''}`,
  }));
  const edges: Edge[] = model.edges.filter(e => ids.has(e.source) && ids.has(e.target)).map(e => ({
    id: e.id, source: e.source, target: e.target, label: withCanonicalCode(edgeDisplayLabel(e.kind), e.kind, showCodes), type: 'smoothstep',
    className: highlight && !highlight.edgeIds.has(e.id) ? 'dimmed' : highlight ? 'highlighted' : '',
  }));
  const toggleKind = (kind: NodeKind) => setKinds(old => { const next = new Set(old); if (next.has(kind)) { next.delete(kind); } else { next.add(kind); } return next; });
  const onNodesChange = (changes: NodeChange[]) => changes.forEach(change => {
    if (change.type === 'position' && change.position) setLayout(old => moveNode(old, change.id, change.position!));
  });
  const clearSelection = () => setSelected(undefined);
  const selectedChildren = selected && 'canonicalId' in selected ? model.nodes.filter(node => node.parentClaimId === selected.id) : [];

  return <main className="shell"><header><h1>SciTesis · Graph Renderer <small>v0.1.1</small></h1><p>{model.sourceCaseId} · inspección diagnóstica</p></header>
    <section className="toolbar" aria-label="Filtros">{NODE_KINDS.map(kind => <label key={kind}><input type="checkbox" checked={kinds.has(kind)} onChange={() => toggleKind(kind)} />{kind}</label>)}<label><input type="checkbox" checked={problematic} onChange={e => setProblematic(e.target.checked)} />Solo claims problemáticos</label><label><input type="checkbox" checked={showCodes} onChange={e => setShowCodes(e.target.checked)} />Mostrar códigos canónicos</label><button onClick={() => setLayout(resetLayout(model))}>Restablecer layout</button><button onClick={clearSelection} disabled={!selected}>Limpiar selección</button></section>
    <div className="workspace"><div className="canvas" data-testid="graph-canvas"><ReactFlow nodes={nodes} edges={edges} nodesConnectable={false} onConnect={undefined} onNodesChange={onNodesChange} fitView onPaneClick={clearSelection} onNodeClick={(_, node) => setSelected(model.nodes.find(item => item.id === node.id))} onEdgeClick={(_, edge) => setSelected(model.edges.find(item => item.id === edge.id))}><Background /><Controls /><MiniMap /></ReactFlow><div className="legend" aria-label="Leyenda"><b>Leyenda</b>{legendKinds.map(kind => <span key={kind} className={`legend-item kind-${kind.toLowerCase()}`}>■ {nodeKindDisplayLabel(kind)}</span>)}<span className="legend-item maximum">★ Máximo defendible</span><span className="legend-item problem">! Problemático/restringido</span></div></div>
      <aside aria-label="Detalle"><h2>Detalle</h2>{selected ? ('canonicalId' in selected ? <NodeDetail node={selected} children={selectedChildren} /> : <EdgeDetail edge={selected} />) : <p>Selecciona un nodo o una arista.</p>}</aside></div></main>;
}

function Item({ title, children }: { title: string; children?: React.ReactNode }) { if (children === undefined || children === null || children === '') return null; return <><dt>{title}</dt><dd>{children}</dd></>; }
function NodeDetail({ node, children }: { node: GraphNode; children: GraphNode[] }) {
  return <dl><Item title="Etiqueta amigable">{nodeKindDisplayLabel(node.kind)}</Item><Item title="Código canónico">{node.state ?? node.kind}</Item><Item title="ID canónico">{node.canonicalId}</Item><Item title="Tipo / kind">{node.kind}</Item><Item title="Texto completo">{node.text}</Item>{node.state && <Item title="Estado de defendibilidad">{stateDisplayLabel(node.state)} ({node.state})</Item>}<Item title="Reglas disparadas">{node.rules.length ? node.rules.join(', ') : undefined}</Item><Item title="Support path">{node.supportPath.length ? node.supportPath.join(' → ') : undefined}</Item><Item title="Source refs">{node.sourceRefs.length ? node.sourceRefs.join(', ') : undefined}</Item><Item title="Maximum defendable claim">{node.maximumDefendableClaim}</Item><Item title="Es máximo defendible">{node.isMaximumDefendable ? 'Sí' : 'No'}</Item><Item title="Gravedad / severity">{node.gravity}</Item><Item title="Reparabilidad / repair">{node.reparability}</Item><Item title="Parent claim">{node.parentClaimId}</Item><Item title="Subclaims">{children.length ? children.map(child => child.canonicalId).join(', ') : undefined}</Item></dl>;
}
function EdgeDetail({ edge }: { edge: GraphEdge }) { return <dl><Item title="Etiqueta amigable">{edgeDisplayLabel(edge.kind)}</Item><Item title="Código canónico">{edge.kind}</Item><Item title="ID canónico">{edge.id}</Item><Item title="Source">{edge.source}</Item><Item title="Target">{edge.target}</Item><Item title="Tipo de relación">{edge.kind}</Item></dl>; }
