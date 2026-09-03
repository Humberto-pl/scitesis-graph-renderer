import { useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphEdge, GraphNode, GraphViewModel, NodeKind } from '../graph/types';
import { NODE_KINDS } from '../graph/types';

export function GraphRenderer({ model }: { model: GraphViewModel }) {
  const [selected, setSelected] = useState<GraphNode|GraphEdge>();
  const [kinds, setKinds] = useState<Set<NodeKind>>(new Set(NODE_KINDS));
  const [problematic, setProblematic] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const visible = useMemo(() => model.nodes.filter(n => kinds.has(n.kind) && (!problematic || (n.kind !== 'CLAIM' && n.kind !== 'SUBCLAIM') || (n.state && n.state !== 'DEFENDIBLE'))).filter(n => !n.parentClaimId || !collapsed.has(`sub:${n.parentClaimId}`)).filter(n => !(n.kind==='EVIDENCE' && model.edges.some(e=>e.source===n.id && collapsed.has(`ev:${e.target}`)))),[model,kinds,problematic,collapsed]);
  const ids = new Set(visible.map(n=>n.id));
  const nodes: Node[] = visible.map(n=>({id:n.id,position:n.position,data:{label:<div className="node-content"><b>{n.kind}</b><span>{n.label}</span>{n.state&&<em>{n.state}</em>}<button aria-label={`Alternar ${n.id}`} onClick={e=>{e.stopPropagation(); const prefix=n.kind==='CLAIM'?'sub':'ev'; setCollapsed(old=>{const next=new Set(old);const key=`${prefix}:${n.id}`;next.has(key)?next.delete(key):next.add(key);return next;});}}>−/+</button></div>},className:`graph-node kind-${n.kind.toLowerCase()} state-${n.state?.toLowerCase() ?? 'none'}`}));
  const edges: Edge[] = model.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)).map(e=>({id:e.id,source:e.source,target:e.target,label:e.label,type:'smoothstep'}));
  const toggleKind=(kind:NodeKind)=>setKinds(old=>{const next=new Set(old);next.has(kind)?next.delete(kind):next.add(kind);return next;});
  return <main className="shell"><header><h1>SciTesis · Graph Renderer <small>v0.1</small></h1><p>{model.sourceCaseId} · inspección diagnóstica</p></header><section className="toolbar" aria-label="Filtros">{NODE_KINDS.map(kind=><label key={kind}><input type="checkbox" checked={kinds.has(kind)} onChange={()=>toggleKind(kind)}/>{kind}</label>)}<label><input type="checkbox" checked={problematic} onChange={e=>setProblematic(e.target.checked)}/>Solo claims problemáticos</label></section><div className="workspace"><div className="canvas" data-testid="graph-canvas"><ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(_,n)=>setSelected(model.nodes.find(x=>x.id===n.id))} onEdgeClick={(_,e)=>setSelected(model.edges.find(x=>x.id===e.id))}><Background/><Controls/><MiniMap/></ReactFlow></div><aside aria-label="Detalle"><h2>Detalle</h2>{selected ? <dl><dt>ID canónico</dt><dd>{'canonicalId' in selected?selected.canonicalId:selected.id}</dd><dt>Tipo</dt><dd>{selected.kind}</dd>{'text' in selected&&<><dt>Texto completo</dt><dd>{selected.text??'—'}</dd><dt>Estado</dt><dd>{selected.state??'—'}</dd><dt>Reglas disparadas</dt><dd>{selected.rules.join(', ')||'—'}</dd><dt>Support path</dt><dd>{selected.supportPath.join(' → ')||'—'}</dd><dt>Source refs</dt><dd>{selected.sourceRefs.join(', ')||'—'}</dd><dt>Maximum defendable claim</dt><dd>{selected.maximumDefendableClaim??'—'}</dd><dt>Gravedad</dt><dd>{selected.gravity??'—'}</dd><dt>Reparabilidad</dt><dd>{selected.reparability??'—'}</dd></>}</dl>:<p>Selecciona un nodo o una arista.</p>}</aside></div></main>;
}
