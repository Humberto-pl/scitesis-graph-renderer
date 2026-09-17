import { useState } from 'react';
import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from '@xyflow/react';
import type {
  DiagnosticBreakpointRenderItem,
  DiagnosticDownstreamEffectRenderItem,
  DiagnosticGraphRenderModel,
  DiagnosticFrontierRenderItem,
  DiagnosticRenderEdge,
  DiagnosticRenderNode,
} from '../diagnostic/diagnosticGraphRenderAdapter';
import type { TraceItem } from '../diagnostic/types';

function nodeLabel(node: DiagnosticRenderNode) {
  if (node.kind === 'CLAIM') {
    return <div className="diagnostic-node-content"><strong>CLAIM</strong><span>ID: {node.claim.claim_id}</span><span>Def_e: {node.claim.def_e_value}</span><span>Status: {node.claim.adjudication_status}</span>{node.isFrontierMember && <span className="diagnostic-record-badge frontier-member-badge">Frontier member</span>}{node.downstreamEffectIds.length > 0 && <span className="diagnostic-record-badge">Downstream: {node.downstreamEffectIds.length}</span>}</div>;
  }
  return <div className="diagnostic-node-content"><strong>INFERENCE STEP</strong><span>ID: {node.inferenceStep.inference_step_id}</span><span>Active_e: {node.inferenceStep.active_state}</span><span>Status: {node.inferenceStep.activity_adjudication_status}</span>{node.breakpointIds.length > 0 && <span className="diagnostic-record-badge">Breakpoints: {node.breakpointIds.length}</span>}</div>;
}

const arrayValue = (values: string[]) => JSON.stringify(values);
const nullableValue = (value: string | null) => value === null ? 'null' : value;

function ExplanationTrace({ trace }: { trace: TraceItem[] }) {
  return <div className="explanation-trace"><h3>Explanation trace</h3>{trace.length === 0 ? <span>[]</span> : <ol>{trace.map((item, index) => <li key={`${item.sequence}:${index}`}><dl><dt>Sequence</dt><dd>{item.sequence}</dd><dt>Trace kind</dt><dd>{item.trace_kind}</dd><dt>Subject ref</dt><dd>{nullableValue(item.subject_ref)}</dd><dt>Rule ref</dt><dd>{nullableValue(item.rule_ref)}</dd><dt>Message</dt><dd>{item.message}</dd></dl></li>)}</ol>}</div>;
}

function TransitionInspector({ edge }: { edge: DiagnosticRenderEdge }) {
  return <aside className="diagnostic-inspector transition-inspector" aria-labelledby="transition-inspector-title"><h2 id="transition-inspector-title">TRANSITION</h2><dl><dt>Source</dt><dd>{edge.source_claim_or_input_id}</dd><dt>Inference</dt><dd>{edge.inference_step_id}</dd><dt>Target</dt><dd>{edge.target_claim_id}</dd><dt>State</dt><dd>{edge.transition_state}</dd><dt>Required for step</dt><dd>{edge.required_for_step}</dd><dt>Required for target</dt><dd>{edge.required_for_target}</dd><dt>Alternative route refs</dt><dd>{arrayValue(edge.alternative_route_refs)}</dd><dt>Why active</dt><dd>{edge.why_active}</dd><dt>Provenance refs</dt><dd>{arrayValue(edge.provenance_refs)}</dd></dl></aside>;
}

function BreakpointInspector({ item, downstream, selectDownstream }: { item: DiagnosticBreakpointRenderItem; downstream: DiagnosticDownstreamEffectRenderItem[]; selectDownstream: (id: string) => void }) {
  const value = item.breakpoint;
  return <aside className="diagnostic-inspector" aria-labelledby="breakpoint-inspector-title"><h2 id="breakpoint-inspector-title">BREAKPOINT</h2><dl><dt>Breakpoint ID</dt><dd>{value.breakpoint_id}</dd><dt>Scope</dt><dd>{value.scope_id}</dd><dt>Route/path ref</dt><dd>{value.route_or_path_ref}</dd><dt>Origin of failure ref</dt><dd>{nullableValue(value.origin_of_failure_ref)}</dd><dt>Breakpoint step ID</dt><dd>{value.breakpoint_step_id}</dd><dt>Affected transition target ID</dt><dd>{value.affected_transition_target_id}</dd><dt>Failure mode</dt><dd>{nullableValue(value.failure_mode)}</dd><dt>Active defeater/blocking condition ref</dt><dd>{nullableValue(value.active_defeater_or_blocking_condition_ref)}</dd><dt>First break on route</dt><dd>{value.first_break_on_route}</dd><dt>Adjudication status</dt><dd>{value.adjudication_status}</dd></dl><ExplanationTrace trace={value.explanation_trace} />{downstream.length > 0 && <section><h3>Downstream effects referenciando este breakpoint</h3>{downstream.map(effect => <button type="button" key={effect.id} onClick={() => selectDownstream(effect.id)}>{effect.downstreamEffect.target_claim_id}</button>)}</section>}</aside>;
}

function DownstreamInspector({ item, relatedBreakpoint, selectBreakpoint }: { item: DiagnosticDownstreamEffectRenderItem; relatedBreakpoint?: DiagnosticBreakpointRenderItem; selectBreakpoint: (id: string) => void }) {
  const value = item.downstreamEffect;
  return <aside className="diagnostic-inspector" aria-labelledby="downstream-inspector-title"><h2 id="downstream-inspector-title">DOWNSTREAM EFFECT</h2><dl><dt>Failure ref</dt><dd>{value.failure_ref}{relatedBreakpoint && <button type="button" onClick={() => selectBreakpoint(relatedBreakpoint.id)} aria-label={`Ver breakpoint ${relatedBreakpoint.canonicalId}`}>Ver breakpoint</button>}</dd><dt>Target claim ID</dt><dd>{value.target_claim_id}</dd><dt>Affected state</dt><dd>{value.affected_state}</dd><dt>Adjudication status</dt><dd>{value.adjudication_status}</dd><dt>Lost viable derivation IDs</dt><dd>{arrayValue(value.lost_viable_derivation_ids)}</dd><dt>Remaining viable derivation IDs</dt><dd>{arrayValue(value.remaining_viable_derivation_ids)}</dd><dt>Required dependency refs</dt><dd>{arrayValue(value.required_dependency_refs)}</dd><dt>Alternative route refs</dt><dd>{arrayValue(value.alternative_route_refs)}</dd><dt>Propagation reason</dt><dd>{nullableValue(value.propagation_reason)}</dd></dl><ExplanationTrace trace={value.explanation_trace} /></aside>;
}

function FrontierInspector({ item }: { item: DiagnosticFrontierRenderItem }) {
  const value = item.frontier;
  return <aside className="diagnostic-inspector frontier-inspector" aria-labelledby="frontier-inspector-title"><h2 id="frontier-inspector-title">DEFENDABILITY FRONTIER</h2><dl><dt>Scope ID</dt><dd>{value.scope_id}</dd><dt>Evaluation state ID</dt><dd>{value.evaluation_state_id}</dd><dt>Member claim IDs</dt><dd>{arrayValue(value.member_claim_ids)}</dd><dt>Frontier cardinality</dt><dd>{value.frontier_cardinality}</dd><dt>Graph version</dt><dd>{value.graph_version}</dd><dt>Diagnostic rule version</dt><dd>{value.diagnostic_rule_version}</dd><dt>Active adjudication refs</dt><dd>{arrayValue(value.active_adjudication_refs)}</dd><dt>Frontier status</dt><dd>{value.frontier_status}</dd><dt>Unavailable member claim IDs</dt><dd>{arrayValue(item.unavailableMemberClaimIds)}</dd></dl><ExplanationTrace trace={value.explanation_trace} /></aside>;
}

type Selection = { type: 'TRANSITION' | 'BREAKPOINT' | 'DOWNSTREAM' | 'FRONTIER'; id: string };

export function DiagnosticGraphRenderer({ model }: { model: DiagnosticGraphRenderModel }) {
  const [selection, setSelection] = useState<Selection>();
  const selectedEdge = selection?.type === 'TRANSITION' ? model.edges.find(edge => edge.transitionKey === selection.id) : undefined;
  const selectedBreakpoint = selection?.type === 'BREAKPOINT' ? model.breakpoints.find(item => item.id === selection.id) : undefined;
  const selectedDownstream = selection?.type === 'DOWNSTREAM' ? model.downstreamEffects.find(item => item.id === selection.id) : undefined;
  const selectedFrontier = selection?.type === 'FRONTIER' && selection.id === model.frontier.id ? model.frontier : undefined;
  const nodes: Node[] = model.nodes.map(node => ({ id: node.id, position: node.position, data: { label: nodeLabel(node) }, className: `diagnostic-node diagnostic-${node.kind.toLowerCase()}` }));
  const edges: Edge[] = model.edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, label: edge.segment === 'SOURCE_TO_STEP' ? 'source → inference' : 'inference → target', markerEnd: { type: MarkerType.ArrowClosed }, className: `diagnostic-edge diagnostic-edge-${edge.segment.toLowerCase()}${selectedEdge?.transitionKey === edge.transitionKey ? ' selected-transition' : ''}`, data: { transitionKey: edge.transitionKey, segment: edge.segment } }));
  const selectBreakpoint = (id: string) => setSelection({ type: 'BREAKPOINT', id });
  const selectDownstream = (id: string) => setSelection({ type: 'DOWNSTREAM', id });
  return <main className="diagnostic-shell">
    <p className="diagnostic-note"><strong>H_e materializado:</strong> solo transitions ACTIVE provistas por Diagnostic Output; el renderer no reconstruye rutas.</p>
    {(model.unavailableTransitionReferences.length > 0 || model.unavailableDiagnosticReferences.length > 0) && <section className="diagnostic-missing-references" role="status" aria-label="Referencias no visualizadas"><strong>Referencias no visualizadas</strong><ul>{model.unavailableTransitionReferences.map((reference, index) => <li key={`${reference.transitionKey}:${reference.role}:${index}`}>{reference.role}: {reference.canonicalId}</li>)}{model.unavailableDiagnosticReferences.map(reference => <li key={`${reference.ownerId}:${reference.role}`}>{reference.role}: {reference.canonicalId}</li>)}</ul><span>No se crearon nodos sustitutos.</span></section>}
    <nav className="diagnostic-entity-list" aria-label="Entidades diagnósticas materializadas">
      {model.edges.map(edge => <button type="button" key={edge.id} data-testid={`transition-edge-${edge.id}`} onClick={() => setSelection({ type: 'TRANSITION', id: edge.transitionKey })} aria-label={`${edge.segment} de ${edge.transitionKey}`}>{edge.segment}: {edge.transitionKey}</button>)}
      {model.breakpoints.map(item => <button type="button" key={item.id} onClick={() => selectBreakpoint(item.id)} aria-label={`Inspeccionar breakpoint ${item.canonicalId}`}>Breakpoint: {item.canonicalId}</button>)}
      {model.downstreamEffects.map(item => <button type="button" key={item.id} onClick={() => selectDownstream(item.id)} aria-label={`Inspeccionar downstream effect ${item.id}`}>Downstream: {item.downstreamEffect.target_claim_id}</button>)}
      <button type="button" onClick={() => setSelection({ type: 'FRONTIER', id: model.frontier.id })} aria-label="Inspeccionar defendability frontier">Frontier: {model.frontier.frontier.frontier_cardinality} miembros</button>
    </nav>
    <div className="diagnostic-content"><div className="diagnostic-canvas" data-testid="diagnostic-graph-canvas"><ReactFlow nodes={nodes} edges={edges} onEdgeClick={(_event, edge) => setSelection({ type: 'TRANSITION', id: String(edge.data?.transitionKey) })} nodesConnectable={false} nodesDraggable={false} fitView><Background /><Controls /></ReactFlow></div>
      {selectedEdge && <TransitionInspector edge={selectedEdge} />}
      {selectedBreakpoint && <BreakpointInspector item={selectedBreakpoint} downstream={model.downstreamEffects.filter(effect => selectedBreakpoint.downstreamEffectIds.includes(effect.id))} selectDownstream={selectDownstream} />}
      {selectedDownstream && <DownstreamInspector item={selectedDownstream} relatedBreakpoint={model.breakpoints.find(item => item.id === selectedDownstream.relatedBreakpointId)} selectBreakpoint={selectBreakpoint} />}
      {selectedFrontier && <FrontierInspector item={selectedFrontier} />}
    </div>
  </main>;
}
