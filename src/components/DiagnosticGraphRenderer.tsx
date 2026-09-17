import { useState } from 'react';
import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from '@xyflow/react';
import type {
  DiagnosticGraphRenderModel,
  DiagnosticRenderEdge,
  DiagnosticRenderNode,
} from '../diagnostic/diagnosticGraphRenderAdapter';

function nodeLabel(node: DiagnosticRenderNode) {
  if (node.kind === 'CLAIM') {
    return <div className="diagnostic-node-content"><strong>CLAIM</strong><span>ID: {node.claim.claim_id}</span><span>Def_e: {node.claim.def_e_value}</span><span>Status: {node.claim.adjudication_status}</span></div>;
  }
  return <div className="diagnostic-node-content"><strong>INFERENCE STEP</strong><span>ID: {node.inferenceStep.inference_step_id}</span><span>Active_e: {node.inferenceStep.active_state}</span><span>Status: {node.inferenceStep.activity_adjudication_status}</span></div>;
}

const arrayValue = (values: string[]) => JSON.stringify(values);

function TransitionInspector({ edge }: { edge: DiagnosticRenderEdge }) {
  return <aside className="transition-inspector" aria-labelledby="transition-inspector-title">
    <h2 id="transition-inspector-title">TRANSITION</h2>
    <dl>
      <dt>Source</dt><dd>{edge.source_claim_or_input_id}</dd>
      <dt>Inference</dt><dd>{edge.inference_step_id}</dd>
      <dt>Target</dt><dd>{edge.target_claim_id}</dd>
      <dt>State</dt><dd>{edge.transition_state}</dd>
      <dt>Required for step</dt><dd>{edge.required_for_step}</dd>
      <dt>Required for target</dt><dd>{edge.required_for_target}</dd>
      <dt>Alternative route refs</dt><dd>{arrayValue(edge.alternative_route_refs)}</dd>
      <dt>Why active</dt><dd>{edge.why_active}</dd>
      <dt>Provenance refs</dt><dd>{arrayValue(edge.provenance_refs)}</dd>
    </dl>
  </aside>;
}

export function DiagnosticGraphRenderer({ model }: { model: DiagnosticGraphRenderModel }) {
  const [selectedTransitionKey, setSelectedTransitionKey] = useState<string>();
  const selectedEdge = model.edges.find(edge => edge.transitionKey === selectedTransitionKey);
  const nodes: Node[] = model.nodes.map(node => ({
    id: node.id,
    position: node.position,
    data: { label: nodeLabel(node) },
    className: `diagnostic-node diagnostic-${node.kind.toLowerCase()}`,
  }));
  const edges: Edge[] = model.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.segment === 'SOURCE_TO_STEP' ? 'source → inference' : 'inference → target',
    markerEnd: { type: MarkerType.ArrowClosed },
    className: `diagnostic-edge diagnostic-edge-${edge.segment.toLowerCase()}${selectedTransitionKey === edge.transitionKey ? ' selected-transition' : ''}`,
    data: { transitionKey: edge.transitionKey, segment: edge.segment },
  }));
  return <main className="diagnostic-shell">
    <p className="diagnostic-note"><strong>H_e materializado:</strong> solo transitions ACTIVE provistas por Diagnostic Output; el renderer no reconstruye rutas.</p>
    {model.unavailableTransitionReferences.length > 0 && <section className="diagnostic-missing-references" role="status" aria-label="Referencias de transition no visualizadas">
      <strong>Referencias no visualizadas</strong>
      <ul>{model.unavailableTransitionReferences.map((reference, index) => <li key={`${reference.transitionKey}:${reference.role}:${index}`}>{reference.role}: {reference.canonicalId}</li>)}</ul>
      <span>No se crearon nodos sustitutos.</span>
    </section>}
    {model.edges.length > 0 && <nav className="diagnostic-transition-list" aria-label="Segmentos de transitions materializadas">
      <span>Inspeccionar segmento:</span>
      {model.edges.map(edge => <button type="button" key={edge.id} data-testid={`transition-edge-${edge.id}`} onClick={() => setSelectedTransitionKey(edge.transitionKey)} aria-label={`${edge.segment} de ${edge.transitionKey}`}>{edge.segment}: {edge.transitionKey}</button>)}
    </nav>}
    <div className="diagnostic-content">
      <div className="diagnostic-canvas" data-testid="diagnostic-graph-canvas">
        <ReactFlow nodes={nodes} edges={edges} onEdgeClick={(_event, edge) => setSelectedTransitionKey(String(edge.data?.transitionKey))} nodesConnectable={false} nodesDraggable={false} fitView>
          <Background /><Controls />
        </ReactFlow>
      </div>
      {selectedEdge && <TransitionInspector edge={selectedEdge} />}
    </div>
  </main>;
}
