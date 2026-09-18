import { Fragment, useMemo, useState } from 'react';
import { Background, Controls, MarkerType, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import type { GiGraphEntity, GiGraphRelation, GiInferenceStep, GiPremiseGroup } from '../diagnostic/auxiliary/giGraphContract';
import type { GiGraphRenderModel } from '../graph/giGraphRenderAdapter';

type Selection = { kind: 'node' | 'edge'; id: string };
type Direction = 'both' | 'incoming' | 'outgoing';

const display = (value: unknown) => typeof value === 'string' ? value : JSON.stringify(value);
const fields = (record: Record<string, unknown>, names: readonly string[]) => names.flatMap(name => record[name] === undefined || record[name] === null ? [] : [{ name, value: record[name] }]);
const entityFields = ['id', 'canonical_type', 'canonical_name', 'subtype', 'label', 'text', 'attributes', 'discourse_role', 'argumentative_role', 'epistemic_plane', 'explicitness', 'confidence', 'review_state', 'functional_relevance', 'projection_status', 'origin', 'version', 'iam_source', 'provenance'] as const;
const relationFields = ['id', 'canonical_type', 'canonical_name', 'source_id', 'target_id', 'attributes', 'explicitness', 'confidence', 'review_state', 'projection_status', 'origin', 'version', 'iam_source', 'provenance'] as const;

function RecordFields({ record, names }: { record: Record<string, unknown>; names: readonly string[] }) {
  return <dl>{fields(record, names).map(field => <Fragment key={field.name}><dt>{field.name}</dt><dd>{display(field.value)}</dd></Fragment>)}</dl>;
}

const participates = (step: GiInferenceStep, id: string) => step.conclusion_id === id || ['premise_ids', 'warrant_assertion_ids', 'backing_ids', 'assumption_ids'].some(key => (step[key] as string[]).includes(id));

function InferenceMetadata({ steps, groups }: { steps: readonly GiInferenceStep[]; groups: readonly GiPremiseGroup[] }) {
  return <>{steps.map(step => <section className="gi-metadata-record" key={step.id}><h3>Inference step · {step.id}</h3><RecordFields record={step} names={['premise_ids', 'warrant_assertion_ids', 'backing_ids', 'assumption_ids', 'conclusion_id', 'premise_group_ids', 'review_state', 'provenance']} />{groups.filter(group => step.premise_group_ids.includes(group.id)).map(group => <section key={group.id} className="premise-group"><b>Premise group · {group.id}</b><RecordFields record={group} names={['mode', 'member_ids', 'target_inference_step_id', 'review_state', 'provenance', 'origin', 'version', 'iam_source']} /></section>)}</section>)}</>;
}

function Inspector({ entity, relation, model }: { entity?: GiGraphEntity; relation?: GiGraphRelation; model: GiGraphRenderModel }) {
  const steps = entity ? model.metadata.inferenceSteps.filter(step => participates(step, entity.id)) : [];
  const groups = entity ? model.metadata.premiseGroups.filter(group => group.member_ids.includes(entity.id) || steps.some(step => step.premise_group_ids.includes(group.id))) : [];
  return <aside className="gi-inspector" aria-label="Inspector estructural G_I"><h2>{entity ? 'ENTIDAD G_I' : 'RELACIÓN G_I'}</h2>{entity && <RecordFields record={entity} names={entityFields} />}{relation && <RecordFields record={relation} names={relationFields} />}{entity && <InferenceMetadata steps={steps} groups={groups} />}</aside>;
}

export function GiStructuralGraphRenderer({ model, mismatch = false }: { model: GiGraphRenderModel; mismatch?: boolean }) {
  const [selection, setSelection] = useState<Selection>();
  const [focus, setFocus] = useState(false);
  const [direction, setDirection] = useState<Direction>('both');
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [showCodes, setShowCodes] = useState(false);
  const entityTypes = useMemo(() => [...new Set(model.nodes.map(node => node.canonicalType))], [model]);
  const relationTypes = useMemo(() => [...new Set(model.edges.map(edge => edge.canonicalType))], [model]);
  const [hiddenEntityTypes, setHiddenEntityTypes] = useState<Set<string>>(new Set());
  const [hiddenRelationTypes, setHiddenRelationTypes] = useState<Set<string>>(new Set());
  const focusedIds = useMemo(() => {
    if (!focus || selection?.kind !== 'node') return undefined;
    const ids = new Set([selection.id]);
    model.edges.forEach(edge => {
      if ((direction === 'both' || direction === 'outgoing') && edge.source === selection.id) ids.add(edge.target);
      if ((direction === 'both' || direction === 'incoming') && edge.target === selection.id) ids.add(edge.source);
    });
    return ids;
  }, [focus, selection, model.edges, direction]);
  const visibleNodes = model.nodes.filter(node => !hiddenEntityTypes.has(node.canonicalType) && (!focusedIds || focusedIds.has(node.id)));
  const visibleIds = new Set(visibleNodes.map(node => node.id));
  const visibleEdges = model.edges.filter(edge => !hiddenRelationTypes.has(edge.canonicalType) && visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const nodes: Node[] = visibleNodes.map(node => ({ id: node.id, position: layoutDirection === 'LR' ? node.position : { x: node.position.y * 2, y: node.position.x / 2 }, data: { label: <div className="gi-node-content"><strong>{showCodes ? `${node.canonicalType} · ` : ''}{node.entity.canonical_name ?? node.canonicalType}</strong><span>{node.label}</span></div> }, className: 'gi-structural-node' }));
  const edges: Edge[] = visibleEdges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, label: showCodes ? `${edge.canonicalType} · ${edge.relation.canonical_name ?? ''}` : edge.relation.canonical_name ?? edge.canonicalType, markerEnd: { type: MarkerType.ArrowClosed }, className: 'gi-structural-edge' }));
  const selectedNode = selection?.kind === 'node' ? model.nodes.find(node => node.id === selection.id)?.entity : undefined;
  const selectedEdge = selection?.kind === 'edge' ? model.edges.find(edge => edge.id === selection.id)?.relation : undefined;
  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => setter(old => { const next = new Set(old); if (next.has(value)) next.delete(value); else next.add(value); return next; });
  return <main className="gi-shell">
    <p className="gi-note"><strong>Mapa estructural G_I:</strong> entities y relations materializadas, sin overlay diagnóstico.{mismatch && <span className="gi-mismatch"> G_I no coincide con el Diagnostic Output activo; se muestra independientemente.</span>}</p>
    <details className="gi-filters"><summary>Filtros estructurales</summary><div><fieldset><legend>Entity canonical_type</legend>{entityTypes.map(value => <label key={value}><input type="checkbox" checked={!hiddenEntityTypes.has(value)} onChange={() => toggle(setHiddenEntityTypes, value)} />{value}</label>)}</fieldset><fieldset><legend>Relation canonical_type</legend>{relationTypes.map(value => <label key={value}><input type="checkbox" checked={!hiddenRelationTypes.has(value)} onChange={() => toggle(setHiddenRelationTypes, value)} />{value}</label>)}</fieldset></div></details>
    <div className="gi-toolbar"><label><input type="checkbox" checked={showCodes} onChange={event => setShowCodes(event.target.checked)} />Mostrar códigos</label><label>Layout <select value={layoutDirection} onChange={event => setLayoutDirection(event.target.value as 'LR' | 'TB')}><option value="LR">LR</option><option value="TB">TB</option></select></label><button type="button" disabled={selection?.kind !== 'node'} onClick={() => setFocus(value => !value)}>{focus ? 'Quitar focus' : 'Enfocar nodo seleccionado'}</button><label>Dirección focus <select value={direction} onChange={event => setDirection(event.target.value as Direction)}><option value="both">both</option><option value="incoming">incoming</option><option value="outgoing">outgoing</option></select></label><span role="status">Visibles: {visibleNodes.length}/{model.nodes.length} nodos · {visibleEdges.length}/{model.edges.length} relaciones</span></div>
    <nav className="gi-entity-list" aria-label="Estructura G_I materializada">{model.nodes.map(node => <button type="button" key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })} aria-label={`Inspeccionar entidad ${node.canonicalId}`}>Entidad: {node.canonicalId}</button>)}{model.edges.map(edge => <button type="button" key={edge.id} onClick={() => setSelection({ kind: 'edge', id: edge.id })} aria-label={`Inspeccionar relación ${edge.canonicalId}`}>Relación: {edge.canonicalId}</button>)}</nav>
    <div className="gi-content"><div className="gi-canvas" data-testid="gi-structural-graph-canvas"><ReactFlow nodes={nodes} edges={edges} onNodeClick={(_event, node) => setSelection({ kind: 'node', id: node.id })} onEdgeClick={(_event, edge) => setSelection({ kind: 'edge', id: edge.id })} nodesConnectable={false} nodesDraggable={false} fitView><Background /><Controls /><MiniMap /></ReactFlow></div>{(selectedNode || selectedEdge) && <Inspector entity={selectedNode} relation={selectedEdge} model={model} />}</div>
  </main>;
}
