import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from '@xyflow/react';
import type { DiagnosticGraphRenderModel, DiagnosticRenderNode } from '../diagnostic/diagnosticGraphRenderAdapter';

function nodeLabel(node: DiagnosticRenderNode) {
  if (node.kind === 'CLAIM') {
    return <div className="diagnostic-node-content"><strong>CLAIM</strong><span>ID: {node.claim.claim_id}</span><span>Def_e: {node.claim.def_e_value}</span><span>Status: {node.claim.adjudication_status}</span></div>;
  }
  return <div className="diagnostic-node-content"><strong>INFERENCE STEP</strong><span>ID: {node.inferenceStep.inference_step_id}</span><span>Active_e: {node.inferenceStep.active_state}</span><span>Status: {node.inferenceStep.activity_adjudication_status}</span></div>;
}

export function DiagnosticGraphRenderer({ model }: { model: DiagnosticGraphRenderModel }) {
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
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { transitionState: edge.transition.transition_state },
  }));

  return <main className="diagnostic-shell">
    <p className="diagnostic-note">Vista mínima: las conexiones visibles proceden exclusivamente de transitions canónicas.</p>
    {model.unavailableSourceReferences.length > 0 && <p className="diagnostic-note" role="status">
      Sources sin nodo claim visible: {model.unavailableSourceReferences.map(reference => reference.sourceClaimOrInputId).join(', ')}. No se crearon nodos sustitutos.
    </p>}
    <div className="diagnostic-canvas" data-testid="diagnostic-graph-canvas">
      <ReactFlow nodes={nodes} edges={edges} nodesConnectable={false} nodesDraggable={false} fitView>
        <Background /><Controls />
      </ReactFlow>
    </div>
  </main>;
}
