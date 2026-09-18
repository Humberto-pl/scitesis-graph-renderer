import { Fragment, useEffect, useMemo, useState } from 'react';
import { Background, Controls, MarkerType, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import type { GiGraphEntity, GiGraphRelation, GiInferenceStep, GiPremiseGroup } from '../diagnostic/auxiliary/giGraphContract';
import type { GiDiagnosticOverlayModel, GiNodeDiagnosticAnnotation } from '../diagnostic/giDiagnosticOverlayModel';
import type { GiDiagnosticConnector, GiDiagnosticConnectorModel } from '../diagnostic/giDiagnosticConnectorModel';
import { layoutGiRenderModel, type GiGraphRenderModel } from '../graph/giGraphRenderAdapter';

export type Selection = { kind: 'node' | 'edge' | 'diagnostic-connector'; id: string };
type Direction = 'both' | 'incoming' | 'outgoing';
export type GiStructuralFlowEdgeData = { readonly edgeKind: 'STRUCTURAL'; readonly canonicalEdgeId: string };
export type GiDiagnosticFlowEdgeData = { readonly edgeKind: 'DIAGNOSTIC_CONNECTOR'; readonly connectorId: string };
export type GiFlowEdgeData = GiStructuralFlowEdgeData | GiDiagnosticFlowEdgeData;
type GiFlowEdge = Edge<GiFlowEdgeData>;

const structuralFlowEdgeId = (canonicalId: string) => `rf:structural:${encodeURIComponent(canonicalId)}`;
const diagnosticFlowEdgeId = (connectorId: string) => `rf:diagnostic:${encodeURIComponent(connectorId)}`;
const selectionFromFlowEdgeData = (data: GiFlowEdgeData): Selection => data.edgeKind === 'STRUCTURAL'
  ? { kind: 'edge', id: data.canonicalEdgeId }
  : { kind: 'diagnostic-connector', id: data.connectorId };

const display = (value: unknown) => typeof value === 'string' ? value : JSON.stringify(value);
const fields = (record: object, names: readonly string[], includeNull: boolean) => {
  const values = record as Record<string, unknown>;
  return names.flatMap(name => values[name] === undefined || (!includeNull && values[name] === null) ? [] : [{ name, value: values[name] }]);
};
const entityFields = ['id', 'canonical_type', 'canonical_name', 'subtype', 'label', 'text', 'attributes', 'discourse_role', 'argumentative_role', 'epistemic_plane', 'explicitness', 'confidence', 'review_state', 'functional_relevance', 'projection_status', 'origin', 'version', 'iam_source', 'provenance'] as const;
const relationFields = ['id', 'canonical_type', 'canonical_name', 'source_id', 'target_id', 'attributes', 'explicitness', 'confidence', 'review_state', 'projection_status', 'origin', 'version', 'iam_source', 'provenance'] as const;

function RecordFields({ record, names, includeNull = false }: { record: object; names: readonly string[]; includeNull?: boolean }) {
  return <dl>{fields(record, names, includeNull).map(field => <Fragment key={field.name}><dt>{field.name}</dt><dd>{display(field.value)}</dd></Fragment>)}</dl>;
}

const participates = (step: GiInferenceStep, id: string) => step.conclusion_id === id || ['premise_ids', 'warrant_assertion_ids', 'backing_ids', 'assumption_ids'].some(key => (step[key] as string[]).includes(id));

function InferenceMetadata({ steps, groups }: { steps: readonly GiInferenceStep[]; groups: readonly GiPremiseGroup[] }) {
  const shownGroupIds = new Set(steps.flatMap(step => step.premise_group_ids));
  const relatedGroups = groups.filter(group => !shownGroupIds.has(group.id));
  const group = (value: GiPremiseGroup) => <section key={value.id} className="premise-group"><b>Premise group · {value.id}</b><RecordFields record={value} names={['id', 'mode', 'member_ids', 'target_inference_step_id', 'review_state', 'provenance', 'origin', 'version', 'iam_source']} /></section>;
  return <>{steps.map(step => <section className="gi-metadata-record" key={step.id}><h3>Inference step · {step.id}</h3><RecordFields record={step} names={['premise_ids', 'warrant_assertion_ids', 'backing_ids', 'assumption_ids', 'conclusion_id', 'premise_group_ids', 'review_state', 'provenance']} />{groups.filter(value => step.premise_group_ids.includes(value.id)).map(group)}</section>)}{relatedGroups.length > 0 && <section className="gi-metadata-record"><h3>Premise groups relacionados</h3>{relatedGroups.map(group)}</section>}</>;
}

const claimDiagnosticFields = ['claim_id', 'def_e_value', 'defendibility_state', 'adjudication_status', 'viable_derivation_ids', 'blocked_derivation_ids', 'blocking_condition_ids', 'active_defeater_ids', 'maximum_defensible_reformulation', 'rule_version', 'explanation_trace'] as const;
const inferenceDiagnosticFields = ['inference_step_id', 'active_state', 'activity_adjudication_status', 'required_inputs_satisfied', 'applicable', 'defeated', 'blocking_reasons', 'supporting_diagnostic_evidence_ids', 'rule_version', 'explanation_trace'] as const;
const reviewFields = ['item_id', 'subject_ref', 'review_reason', 'blocking_question', 'possible_impact', 'recommended_adjudication_target'] as const;
const transitionFields = ['source_claim_or_input_id', 'inference_step_id', 'target_claim_id', 'transition_state', 'required_for_step', 'required_for_target', 'alternative_route_refs', 'why_active', 'provenance_refs'] as const;
const breakpointFields = ['breakpoint_id', 'scope_id', 'route_or_path_ref', 'origin_of_failure_ref', 'breakpoint_step_id', 'affected_transition_target_id', 'failure_mode', 'active_defeater_or_blocking_condition_ref', 'first_break_on_route', 'adjudication_status', 'explanation_trace'] as const;
const downstreamFields = ['failure_ref', 'target_claim_id', 'affected_state', 'adjudication_status', 'lost_viable_derivation_ids', 'remaining_viable_derivation_ids', 'required_dependency_refs', 'alternative_route_refs', 'propagation_reason', 'explanation_trace'] as const;

function DiagnosticInspector({ annotation, overlay }: { annotation: GiNodeDiagnosticAnnotation; overlay: GiDiagnosticOverlayModel }) {
  return <section className="gi-diagnostic-inspector" aria-label="Diagnóstico exacto del nodo"><h2>DIAGNÓSTICO</h2>
    {annotation.claim && <section><h3>Claim · {annotation.claim.claim_id}</h3><RecordFields record={annotation.claim} names={claimDiagnosticFields} includeNull /></section>}
    {annotation.inferenceStep && <section><h3>Inference step · {annotation.inferenceStep.inference_step_id}</h3><RecordFields record={annotation.inferenceStep} names={inferenceDiagnosticFields} includeNull /></section>}
    {annotation.reviewItems.map(item => <section key={item.item_id}><h3>Review item · {item.item_id}</h3><RecordFields record={item} names={reviewFields} includeNull /></section>)}
    {annotation.viableTransitions.map((transition, index) => <section key={`${transition.source_claim_or_input_id}:${transition.inference_step_id}:${transition.target_claim_id}:${index}`}><h3>H_e transition (registro literal)</h3><RecordFields record={transition} names={transitionFields} includeNull /></section>)}
    {annotation.breakpointOrigins.map((item, index) => <section key={`origin:${index}`}><h3>Breakpoint origin · {item.breakpoint_id}</h3><RecordFields record={item} names={breakpointFields} includeNull /></section>)}
    {annotation.breakpointTargets.map((item, index) => <section key={`target:${index}`}><h3>Breakpoint target · {item.breakpoint_id}</h3><RecordFields record={item} names={breakpointFields} includeNull /></section>)}
    {annotation.downstreamEffects.map((item, index) => { const matches = overlay.breakpoints.filter(value => value.breakpoint_id === item.failure_ref); return <section key={`downstream:${index}`}><h3>Downstream effect · {item.affected_state}</h3><RecordFields record={item} names={downstreamFields} includeNull />{matches.length === 1 && <p>Resuelve exactamente a breakpoint: {item.failure_ref}</p>}</section>; })}
    {annotation.isFrontierMember && <p><strong>Miembro materializado de defendability frontier</strong></p>}
  </section>;
}

function Inspector({ entity, relation, model, annotation, overlay }: { entity?: GiGraphEntity; relation?: GiGraphRelation; model: GiGraphRenderModel; annotation?: GiNodeDiagnosticAnnotation; overlay?: GiDiagnosticOverlayModel }) {
  const steps = entity ? model.metadata.inferenceSteps.filter(step => participates(step, entity.id)) : [];
  const groups = entity ? model.metadata.premiseGroups.filter(group => group.member_ids.includes(entity.id) || steps.some(step => step.premise_group_ids.includes(group.id))) : [];
  return <aside className="gi-inspector" aria-label="Inspector estructural G_I"><h2>{entity ? 'ENTIDAD G_I' : 'RELACIÓN G_I'}</h2>{entity && <RecordFields record={entity} names={entityFields} />}{relation && <RecordFields record={relation} names={relationFields} />}{entity && <InferenceMetadata steps={steps} groups={groups} />}{entity && annotation && <DiagnosticInspector annotation={annotation} overlay={overlay!} />}</aside>;
}

function DiagnosticConnectorInspector({ connector }: { connector: GiDiagnosticConnector }) {
  return <aside className="gi-inspector gi-connector-inspector" aria-label="Inspector de conector diagnóstico"><h2>CONECTOR DIAGNÓSTICO</h2>
    <dl><dt>kind</dt><dd>{connector.kind}</dd><dt>renderer-only connector id</dt><dd>{connector.id}</dd><dt>source node ID</dt><dd>{connector.source}</dd><dt>target node ID</dt><dd>{connector.target}</dd><dt>resolution</dt><dd>{connector.resolution}</dd><dt>record index</dt><dd>{connector.recordIndex}</dd>{connector.kind === 'DOWNSTREAM_REFERENCE' && <><dt>matched breakpoint index</dt><dd>{connector.matchedBreakpointIndex}</dd><dt>matched breakpoint_id</dt><dd>{connector.matchedBreakpoint.breakpoint_id}</dd></>}</dl>
    {connector.kind === 'BREAKPOINT_ASSOCIATION' ? <section><h3>Breakpoint completo</h3><RecordFields record={connector.breakpoint} names={breakpointFields} includeNull /><p>Conector visual de referencia diagnóstica; no es una relation G_I.</p></section> : <><section><h3>DownstreamEffect completo</h3><RecordFields record={connector.downstreamEffect} names={downstreamFields} includeNull /></section><section><h3>Breakpoint usado únicamente para resolver el source</h3><RecordFields record={connector.matchedBreakpoint} names={breakpointFields} includeNull /></section><p>La conexión visual procede de referencias exactas materializadas; no representa una ruta G_I reconstruida.</p></>}
  </aside>;
}

export function GiStructuralGraphRenderer({ model, overlay, connectorModel, mismatch = false }: { model: GiGraphRenderModel; overlay?: GiDiagnosticOverlayModel; connectorModel?: GiDiagnosticConnectorModel; mismatch?: boolean }) {
  const [selection, setSelection] = useState<Selection>();
  const [focus, setFocus] = useState(false);
  const [focusAnchorId, setFocusAnchorId] = useState<string>();
  const [direction, setDirection] = useState<Direction>('both');
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [showCodes, setShowCodes] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(Boolean(overlay));
  const [showDiagnosticConnectors, setShowDiagnosticConnectors] = useState(true);
  useEffect(() => setShowDiagnostic(Boolean(overlay)), [overlay]);
  const entityTypes = useMemo(() => [...new Set(model.nodes.map(node => node.canonicalType))], [model]);
  const relationTypes = useMemo(() => [...new Set(model.edges.map(edge => edge.canonicalType))], [model]);
  const [hiddenEntityTypes, setHiddenEntityTypes] = useState<Set<string>>(new Set());
  const [hiddenRelationTypes, setHiddenRelationTypes] = useState<Set<string>>(new Set());
  const laidOutModel = useMemo(() => layoutGiRenderModel(model, layoutDirection), [model, layoutDirection]);
  const focusedIds = useMemo(() => {
    const anchorId = selection?.kind === 'node' ? selection.id : focusAnchorId;
    if (!focus || !anchorId) return undefined;
    const ids = new Set([anchorId]);
    laidOutModel.edges.forEach(edge => {
      if ((direction === 'both' || direction === 'outgoing') && edge.source === anchorId) ids.add(edge.target);
      if ((direction === 'both' || direction === 'incoming') && edge.target === anchorId) ids.add(edge.source);
    });
    return ids;
  }, [focus, focusAnchorId, selection, laidOutModel.edges, direction]);
  const visibleNodes = laidOutModel.nodes.filter(node => !hiddenEntityTypes.has(node.canonicalType) && (!focusedIds || focusedIds.has(node.id)));
  const visibleIds = new Set(visibleNodes.map(node => node.id));
  const visibleEdges = laidOutModel.edges.filter(edge => !hiddenRelationTypes.has(edge.canonicalType) && visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const activeOverlay = showDiagnostic ? overlay : undefined;
  const nodes: Node[] = visibleNodes.map(node => {
    const annotation = activeOverlay?.annotationsByNodeId.get(node.canonicalId);
    const reviewRequired = annotation?.claim?.adjudication_status === 'REVIEW_REQUIRED' || annotation?.inferenceStep?.activity_adjudication_status === 'REVIEW_REQUIRED' || Boolean(annotation?.reviewItems.length);
    const stateClasses = [annotation?.claim && `gi-diagnostic-def-${annotation.claim.def_e_value.toLowerCase()}`, annotation?.inferenceStep && `gi-diagnostic-${annotation.inferenceStep.active_state === 'UNKNOWN' ? 'active-unknown' : annotation.inferenceStep.active_state.toLowerCase()}`, reviewRequired && 'gi-diagnostic-review-required', Boolean(annotation?.breakpointOrigins.length) && 'gi-diagnostic-breakpoint', annotation?.isFrontierMember && 'gi-diagnostic-frontier-member'].filter(Boolean).join(' ');
    return { id: node.id, position: node.position, data: { label: <div className="gi-node-content"><strong>{showCodes ? `${node.canonicalType} · ` : ''}{node.entity.canonical_name ?? node.canonicalType}</strong><span>{node.label}</span>{annotation?.claim && <span className={`gi-diagnostic-badge gi-diagnostic-def-${annotation.claim.def_e_value.toLowerCase()}`}>Def_e: {annotation.claim.def_e_value}</span>}{annotation?.inferenceStep && <span className={`gi-diagnostic-badge gi-diagnostic-${annotation.inferenceStep.active_state === 'UNKNOWN' ? 'active-unknown' : annotation.inferenceStep.active_state.toLowerCase()}`}>Active_e: {annotation.inferenceStep.active_state}</span>}{reviewRequired && <span className="gi-diagnostic-badge gi-diagnostic-review-required">REVIEW_REQUIRED</span>}{Boolean(annotation?.breakpointOrigins.length) && <span className="gi-diagnostic-badge gi-diagnostic-breakpoint">BREAKPOINT{annotation!.breakpointOrigins.length > 1 ? ` × ${annotation!.breakpointOrigins.length}` : ''}</span>}{annotation?.downstreamEffects.map((effect, index) => <span key={index} className={`gi-diagnostic-badge gi-diagnostic-downstream-${effect.affected_state.toLowerCase().replace('_', '-')}`}>Downstream: {effect.affected_state}</span>)}{annotation?.isFrontierMember && <span className="gi-diagnostic-badge gi-diagnostic-frontier-member">FRONTIER</span>}</div> }, className: `gi-structural-node ${stateClasses}` };
  });
  const structuralEdges: GiFlowEdge[] = visibleEdges.map(edge => ({ id: structuralFlowEdgeId(edge.id), source: edge.source, target: edge.target, data: { edgeKind: 'STRUCTURAL', canonicalEdgeId: edge.id }, label: showCodes ? `${edge.canonicalType} · ${edge.relation.canonical_name ?? ''}` : edge.relation.canonical_name ?? edge.canonicalType, markerEnd: { type: MarkerType.ArrowClosed }, className: 'gi-structural-edge' }));
  const visibleConnectors = activeOverlay && showDiagnosticConnectors ? (connectorModel?.connectors.filter(connector => visibleIds.has(connector.source) && visibleIds.has(connector.target)) ?? []) : [];
  const diagnosticEdges: GiFlowEdge[] = visibleConnectors.map(connector => ({ id: diagnosticFlowEdgeId(connector.id), source: connector.source, target: connector.target, data: { edgeKind: 'DIAGNOSTIC_CONNECTOR', connectorId: connector.id }, label: connector.kind === 'BREAKPOINT_ASSOCIATION' ? `Breakpoint · ${connector.breakpoint.breakpoint_id}` : `Downstream · ${connector.downstreamEffect.affected_state}`, markerEnd: { type: MarkerType.ArrowClosed }, className: `gi-diagnostic-connector gi-diagnostic-connector-label ${connector.kind === 'BREAKPOINT_ASSOCIATION' ? 'gi-diagnostic-connector-breakpoint' : 'gi-diagnostic-connector-downstream'}` }));
  const edges = [...structuralEdges, ...diagnosticEdges];
  const selectedNode = selection?.kind === 'node' ? model.nodes.find(node => node.id === selection.id)?.entity : undefined;
  const selectedEdge = selection?.kind === 'edge' ? model.edges.find(edge => edge.id === selection.id)?.relation : undefined;
  const selectedConnector = selection?.kind === 'diagnostic-connector' ? visibleConnectors.find(connector => connector.id === selection.id) : undefined;
  const selectedAnnotation = selectedNode && activeOverlay?.annotationsByNodeId.get(selectedNode.id);
  const projectedClaims = overlay ? [...overlay.annotationsByNodeId.values()].filter(value => value.claim).length : 0;
  const projectedSteps = overlay ? [...overlay.annotationsByNodeId.values()].filter(value => value.inferenceStep).length : 0;
  const projectedBreakpointSteps = overlay ? [...overlay.annotationsByNodeId.values()].reduce((count, value) => count + value.breakpointOrigins.length, 0) : 0;
  const projectedDownstream = overlay ? [...overlay.annotationsByNodeId.values()].reduce((count, value) => count + value.downstreamEffects.length, 0) : 0;
  const projectedFrontierMembers = overlay ? [...overlay.annotationsByNodeId.values()].filter(value => value.isFrontierMember).length : 0;
  const unmatchedCount = overlay ? overlay.unmatchedClaimIds.length + overlay.unmatchedInferenceStepIds.length + overlay.unmatchedReviewItemIds.length + overlay.unmatchedBreakpointStepIds.length + overlay.unmatchedBreakpointTargetIds.length + overlay.unmatchedDownstreamEffects.length + overlay.unmatchedFrontierMemberIds.length : 0;
  const breakpointResolved = connectorModel?.connectors.filter(value => value.kind === 'BREAKPOINT_ASSOCIATION').length ?? 0;
  const downstreamResolved = connectorModel?.connectors.filter(value => value.kind === 'DOWNSTREAM_REFERENCE').length ?? 0;
  const downstreamFailures = (resolution: string) => connectorModel?.unresolvedDownstreamConnectors.filter(value => value.resolution === resolution).length ?? 0;
  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => setter(old => { const next = new Set(old); if (next.has(value)) next.delete(value); else next.add(value); return next; });
  return <main className="gi-shell">
    <p className="gi-note"><strong>Mapa estructural G_I:</strong> entities y relations materializadas.{overlay ? ' Overlay diagnóstico exact-ID disponible.' : ' sin overlay diagnóstico.'}{mismatch && <span className="gi-mismatch"> G_I no coincide con el Diagnostic Output activo; se muestra independientemente.</span>}</p>
    <details className="gi-filters"><summary>Filtros estructurales</summary><div><fieldset><legend>Entity canonical_type</legend>{entityTypes.map(value => <label key={value}><input type="checkbox" checked={!hiddenEntityTypes.has(value)} onChange={() => toggle(setHiddenEntityTypes, value)} />{value}</label>)}</fieldset><fieldset><legend>Relation canonical_type</legend>{relationTypes.map(value => <label key={value}><input type="checkbox" checked={!hiddenRelationTypes.has(value)} onChange={() => toggle(setHiddenRelationTypes, value)} />{value}</label>)}</fieldset></div></details>
    {activeOverlay && <details className="gi-frontier-summary"><summary>Frontier: {activeOverlay.frontier.frontier_status} · cardinalidad materializada: {activeOverlay.frontier.frontier_cardinality}</summary><RecordFields record={activeOverlay.frontier} names={['member_claim_ids', 'frontier_cardinality', 'graph_version', 'diagnostic_rule_version', 'active_adjudication_refs', 'explanation_trace']} includeNull /></details>}
    <div className="gi-toolbar"><label><input type="checkbox" checked={showCodes} onChange={event => setShowCodes(event.target.checked)} />Mostrar códigos</label>{overlay && <label><input type="checkbox" checked={showDiagnostic} onChange={event => setShowDiagnostic(event.target.checked)} />Mostrar diagnóstico</label>}{overlay && connectorModel && <label><input type="checkbox" checked={showDiagnosticConnectors} disabled={!showDiagnostic} onChange={event => setShowDiagnosticConnectors(event.target.checked)} />Mostrar conectores diagnósticos</label>}<label>Layout <select value={layoutDirection} onChange={event => setLayoutDirection(event.target.value as 'LR' | 'TB')}><option value="LR">LR</option><option value="TB">TB</option></select></label><button type="button" disabled={selection?.kind !== 'node'} onClick={() => { if (!focus && selection?.kind === 'node') setFocusAnchorId(selection.id); setFocus(value => !value); }}>{focus ? 'Quitar focus' : 'Enfocar nodo seleccionado'}</button><label>Dirección focus <select value={direction} onChange={event => setDirection(event.target.value as Direction)}><option value="both">both</option><option value="incoming">incoming</option><option value="outgoing">outgoing</option></select></label><span role="status">Visibles: {visibleNodes.length}/{model.nodes.length} nodos · {visibleEdges.length}/{model.edges.length} relaciones · {visibleConnectors.length} conectores diagnósticos visibles</span>{overlay && <details className="gi-overlay-coverage"><summary>Diagnóstico proyectado: {projectedClaims} claims · {projectedSteps} inference steps · {unmatchedCount} sin correspondencia estructural</summary><div>Breakpoint steps proyectados: {projectedBreakpointSteps}<br />Downstream effects proyectados: {projectedDownstream}<br />Frontier members proyectados: {projectedFrontierMembers}<br />Claims: {display(overlay.unmatchedClaimIds)}<br />Inference steps: {display(overlay.unmatchedInferenceStepIds)}<br />Review items: {display(overlay.unmatchedReviewItemIds)}<br />Breakpoint steps: {display(overlay.unmatchedBreakpointStepIds)}<br />Breakpoint targets: {display(overlay.unmatchedBreakpointTargetIds)}<br />Downstream effects: {display(overlay.unmatchedDownstreamEffects)}<br />Frontier members: {display(overlay.unmatchedFrontierMemberIds)}{connectorModel && <><hr /><strong>Resolución de conectores</strong><br />Breakpoint renderizables: {breakpointResolved}<br />Breakpoint unresolved: {connectorModel.unresolvedBreakpointConnectors.length}<br />Downstream renderizables: {downstreamResolved}<br />failure_ref unresolved: {downstreamFailures('FAILURE_REF_UNRESOLVED')}<br />failure_ref ambiguous: {downstreamFailures('FAILURE_REF_AMBIGUOUS')}<br />Downstream source unresolved: {downstreamFailures('SOURCE_UNRESOLVED') + downstreamFailures('BOTH_ENDPOINTS_UNRESOLVED')}<br />Downstream target unresolved: {downstreamFailures('TARGET_UNRESOLVED') + downstreamFailures('BOTH_ENDPOINTS_UNRESOLVED')}</>}</div></details>}</div>
    {activeOverlay && connectorModel && <p className="gi-connector-legend">Conectores diagnósticos = referencias materializadas, no relaciones G_I</p>}
    <nav className="gi-entity-list" aria-label="Estructura G_I materializada">{model.nodes.map(node => <button type="button" key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })} aria-label={`Inspeccionar entidad ${node.canonicalId}`}>Entidad: {node.canonicalId}</button>)}{model.edges.map(edge => <button type="button" data-flow-edge-id={structuralFlowEdgeId(edge.id)} data-edge-kind="STRUCTURAL" key={edge.id} onClick={() => setSelection({ kind: 'edge', id: edge.id })} aria-label={`Inspeccionar relación ${edge.canonicalId}`}>Relación: {edge.canonicalId}</button>)}{visibleConnectors.map(connector => <button type="button" data-flow-edge-id={diagnosticFlowEdgeId(connector.id)} data-edge-kind="DIAGNOSTIC_CONNECTOR" className={connector.kind === 'BREAKPOINT_ASSOCIATION' ? 'gi-diagnostic-connector-breakpoint' : 'gi-diagnostic-connector-downstream'} key={connector.id} onClick={() => setSelection({ kind: 'diagnostic-connector', id: connector.id })} aria-label={`Inspeccionar conector diagnóstico ${connector.id}`}>{connector.kind === 'BREAKPOINT_ASSOCIATION' ? `Breakpoint · ${connector.breakpoint.breakpoint_id}` : `Downstream · ${connector.downstreamEffect.affected_state}`}</button>)}</nav>
    <div className="gi-content"><div className="gi-canvas" data-testid="gi-structural-graph-canvas"><ReactFlow nodes={nodes} edges={edges} onNodeClick={(_event, node) => setSelection({ kind: 'node', id: node.id })} onEdgeClick={(_event, edge) => { const data = edge.data as GiFlowEdgeData | undefined; if (data) setSelection(selectionFromFlowEdgeData(data)); }} nodesConnectable={false} nodesDraggable={false} fitView><Background /><Controls /><MiniMap /></ReactFlow></div>{selectedConnector ? <DiagnosticConnectorInspector connector={selectedConnector} /> : (selectedNode || selectedEdge) && <Inspector entity={selectedNode} relation={selectedEdge} model={model} annotation={selectedAnnotation} overlay={activeOverlay} />}</div>
  </main>;
}
