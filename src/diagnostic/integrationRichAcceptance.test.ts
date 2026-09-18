import { describe, expect, it } from 'vitest';
import giJson from './fixtures/integration-rich/gi-full-integration-rich.json';
import diagnosticJson from './fixtures/integration-rich/diagnostic-output-v0.1.2-integration-rich.json';
import { loadGiGraphContract } from './auxiliary/giGraphContract';
import { loadDiagnosticOutput } from './diagnosticOutputLoader';
import { buildDiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import { buildGiDiagnosticOverlay } from './giDiagnosticOverlayModel';
import { buildGiDiagnosticConnectorModel } from './giDiagnosticConnectorModel';
import { buildGiGraphViewModel } from '../graph/giGraphViewModel';
import { adaptGiGraphForRender } from '../graph/giGraphRenderAdapter';

function pipeline() {
  const loadedGi = loadGiGraphContract(structuredClone(giJson));
  if (!loadedGi.ok) throw new Error(loadedGi.error.details.join('\n'));
  const giView = buildGiGraphViewModel(loadedGi.artifact);
  const render = adaptGiGraphForRender(giView);
  const output = loadDiagnosticOutput(structuredClone(diagnosticJson));
  const diagnostic = buildDiagnosticGraphViewModel(output);
  const result = buildGiDiagnosticOverlay(render, diagnostic);
  if (result.status !== 'COMPATIBLE') throw new Error(`Expected compatible overlay, got ${result.status}`);
  const connectors = buildGiDiagnosticConnectorModel(render, result.overlay);
  return { loadedGi, giView, render, output, diagnostic, overlay: result.overlay, connectors };
}

describe('integration-rich acceptance pipeline', () => {
  it('loads both canonical contracts and preserves every expected projection count', () => {
    const value = pipeline();
    expect(value.loadedGi.ok).toBe(true);
    expect(value.output.schema_version).toBe('0.1.2');
    expect(value.render.graphRef).toBe(value.diagnostic.metadata.run_metadata.graph_ref);
    expect(value.render.graphVersion).toBe(value.diagnostic.metadata.run_metadata.graph_version);
    expect(value.render.nodes).toHaveLength(30);
    expect(value.render.edges).toHaveLength(36);
    expect(value.giView.metadata.inferenceSteps).toHaveLength(8);
    expect(value.giView.metadata.premiseGroups).toHaveLength(4);
    expect([...value.overlay.annotationsByNodeId.values()].filter(x => x.claim)).toHaveLength(6);
    expect([...value.overlay.annotationsByNodeId.values()].filter(x => x.inferenceStep)).toHaveLength(7);
    expect(value.overlay.unmatchedClaimIds).toEqual(['C-MISSING']);
    expect(value.overlay.unmatchedInferenceStepIds).toEqual(['I-MISSING']);
    expect(value.overlay.unmatchedReviewItemIds).toEqual(['REV4']);
    expect([...value.overlay.annotationsByNodeId.values()].reduce((n, x) => n + x.breakpointOrigins.length, 0)).toBe(3);
    expect([...value.overlay.annotationsByNodeId.values()].reduce((n, x) => n + x.breakpointTargets.length, 0)).toBe(4);
    expect(value.overlay.unmatchedBreakpointStepIds).toEqual(['STEP-MISSING', 'STEP-MISSING']);
    expect(value.overlay.unmatchedBreakpointTargetIds).toEqual(['TARGET-MISSING']);
    expect([...value.overlay.annotationsByNodeId.values()].reduce((n, x) => n + x.downstreamEffects.length, 0)).toBe(4);
    expect(value.overlay.unmatchedDownstreamEffects.map(x => x.target_claim_id)).toEqual(['CLAIM-MISSING']);
    expect([...value.overlay.annotationsByNodeId.values()].filter(x => x.isFrontierMember)).toHaveLength(2);
    expect(value.overlay.unmatchedFrontierMemberIds).toEqual(['C-MISSING']);
    expect(value.connectors.connectors.filter(x => x.kind === 'BREAKPOINT_ASSOCIATION')).toHaveLength(2);
    expect(value.connectors.connectors.filter(x => x.kind === 'DOWNSTREAM_REFERENCE')).toHaveLength(2);
    expect(value.connectors.unresolvedBreakpointConnectors.map(x => x.resolution)).toEqual(['TARGET_UNRESOLVED', 'SOURCE_UNRESOLVED', 'SOURCE_UNRESOLVED']);
    expect(value.connectors.unresolvedDownstreamConnectors.map(x => x.resolution)).toEqual(['FAILURE_REF_UNRESOLVED', 'TARGET_UNRESOLVED', 'SOURCE_UNRESOLVED']);
  });

  it('is deterministic, synchronous, topology-neutral, and does not mutate any stage', () => {
    const giBefore = structuredClone(giJson);
    const diagnosticBefore = structuredClone(diagnosticJson);
    const first = pipeline();
    const giViewBefore = structuredClone(first.giView);
    const renderBefore = structuredClone(first.render);
    const diagnosticVmBefore = structuredClone(first.diagnostic);
    const overlayBefore = structuredClone(first.overlay);
    expect(pipeline()).toEqual(first);
    expect(giJson).toEqual(giBefore);
    expect(diagnosticJson).toEqual(diagnosticBefore);
    expect(first.giView).toEqual(giViewBefore);
    expect(first.render).toEqual(renderBefore);
    expect(first.diagnostic).toEqual(diagnosticVmBefore);
    expect(first.overlay).toEqual(overlayBefore);
    expect(first.render.edges.map(edge => edge.canonicalId)).toEqual(giJson.relations.map(edge => edge.id));
    expect(first.connectors.connectors).toHaveLength(4);
    expect(first.diagnostic.transitions).toHaveLength(4);
  });

  it('preserves an explicitly empty REVIEW_REQUIRED frontier without recalculating it', () => {
    const variant = structuredClone(diagnosticJson);
    variant.defendability_frontier.member_claim_ids = [];
    variant.defendability_frontier.frontier_cardinality = 0;
    variant.defendability_frontier.frontier_status = 'REVIEW_REQUIRED';
    const value = pipeline();
    const diagnostic = buildDiagnosticGraphViewModel(loadDiagnosticOutput(variant));
    const result = buildGiDiagnosticOverlay(value.render, diagnostic);
    expect(result.status).toBe('COMPATIBLE');
    if (result.status === 'COMPATIBLE') expect(result.overlay.frontier).toMatchObject({ member_claim_ids: [], frontier_cardinality: 0, frontier_status: 'REVIEW_REQUIRED' });
  });
});
