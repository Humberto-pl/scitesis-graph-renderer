import { describe, expect, it } from 'vitest';
import giFixture from './auxiliary/fixtures/gi-full-valid.json';
import { loadGiGraphContract } from './auxiliary/giGraphContract';
import diagnosticFixture from './fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { buildDiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import { buildGiDiagnosticOverlay, type GiDiagnosticOverlayModel } from './giDiagnosticOverlayModel';
import { buildGiDiagnosticConnectorModel } from './giDiagnosticConnectorModel';
import { loadDiagnosticOutput } from './diagnosticOutputLoader';
import { adaptGiGraphForRender } from '../graph/giGraphRenderAdapter';
import { buildGiGraphViewModel } from '../graph/giGraphViewModel';

function inputs() {
  const loaded = loadGiGraphContract(structuredClone(giFixture));
  if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
  const gi = adaptGiGraphForRender(buildGiGraphViewModel(loaded.artifact));
  const diagnostic = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(diagnosticFixture)));
  diagnostic.metadata.run_metadata.graph_ref = gi.graphRef;
  diagnostic.metadata.run_metadata.graph_version = gi.graphVersion;
  diagnostic.breakpoints[0].breakpoint_id = 'BP';
  diagnostic.breakpoints[0].breakpoint_step_id = 'I1';
  diagnostic.breakpoints[0].affected_transition_target_id = 'C1';
  diagnostic.downstreamEffects[0].failure_ref = 'BP';
  diagnostic.downstreamEffects[0].target_claim_id = 'C1';
  const result = buildGiDiagnosticOverlay(gi, diagnostic);
  if (result.status !== 'COMPATIBLE') throw new Error(result.status);
  return { gi, overlay: result.overlay };
}
const changed = (overlay: GiDiagnosticOverlayModel, values: Partial<GiDiagnosticOverlayModel>) => ({ ...overlay, ...values });

describe('GiDiagnosticConnectorModel', () => {
  it('builds independent exact breakpoint and downstream references without changing G_I', () => {
    const { gi, overlay } = inputs();
    const before = structuredClone(gi);
    const overlayBefore = structuredClone({ ...overlay, annotationsByNodeId: [...overlay.annotationsByNodeId] });
    const result = buildGiDiagnosticConnectorModel(gi, overlay);
    expect(result.connectors.map(value => [value.kind, value.source, value.target])).toEqual([
      ['BREAKPOINT_ASSOCIATION', 'I1', 'C1'], ['DOWNSTREAM_REFERENCE', 'I1', 'C1'],
    ]);
    expect(result.connectors.map(value => value.id)).toEqual(['diag:breakpoint:0:BP', 'diag:downstream:0:BP:C1']);
    expect(gi).toEqual(before);
    expect({ ...overlay, annotationsByNodeId: [...overlay.annotationsByNodeId] }).toEqual(overlayBefore);
    expect(buildGiDiagnosticConnectorModel(gi, overlay)).toEqual(result);
  });

  it.each([
    ['missing', 'C1', 'SOURCE_UNRESOLVED'],
    ['I1', 'missing', 'TARGET_UNRESOLVED'],
    ['missing', 'also-missing', 'BOTH_UNRESOLVED'],
    ['i1', 'C1', 'SOURCE_UNRESOLVED'],
  ])('reports breakpoint endpoint failures exactly for %s → %s', (source, target, resolution) => {
    const { gi, overlay } = inputs();
    const breakpoints = [{ ...overlay.breakpoints[0], breakpoint_step_id: source, affected_transition_target_id: target }];
    const result = buildGiDiagnosticConnectorModel(gi, changed(overlay, { breakpoints, downstreamEffects: [] }));
    expect(result.connectors).toHaveLength(0);
    expect(result.unresolvedBreakpointConnectors[0].resolution).toBe(resolution);
  });

  it('keeps duplicate breakpoint records independent and refuses their ambiguous failure_ref', () => {
    const { gi, overlay } = inputs();
    const breakpoints = [overlay.breakpoints[0], structuredClone(overlay.breakpoints[0])];
    const result = buildGiDiagnosticConnectorModel(gi, changed(overlay, { breakpoints }));
    expect(result.connectors.filter(value => value.kind === 'BREAKPOINT_ASSOCIATION')).toHaveLength(2);
    expect(result.unresolvedDownstreamConnectors[0]).toMatchObject({ resolution: 'FAILURE_REF_AMBIGUOUS', matchingBreakpointIndices: [0, 1] });
  });

  it('reports downstream reference and endpoint failures without guessing a source', () => {
    const { gi, overlay } = inputs();
    const missingRef = buildGiDiagnosticConnectorModel(gi, changed(overlay, { downstreamEffects: [{ ...overlay.downstreamEffects[0], failure_ref: 'bp' }] }));
    expect(missingRef.unresolvedDownstreamConnectors[0].resolution).toBe('FAILURE_REF_UNRESOLVED');
    const missingSource = buildGiDiagnosticConnectorModel(gi, changed(overlay, { breakpoints: [{ ...overlay.breakpoints[0], breakpoint_step_id: 'missing' }] }));
    expect(missingSource.unresolvedDownstreamConnectors[0].resolution).toBe('SOURCE_UNRESOLVED');
    const missingTarget = buildGiDiagnosticConnectorModel(gi, changed(overlay, { downstreamEffects: [{ ...overlay.downstreamEffects[0], target_claim_id: 'missing' }] }));
    expect(missingTarget.unresolvedDownstreamConnectors[0].resolution).toBe('TARGET_UNRESOLVED');
  });

  it('uses breakpoint_step_id rather than affected target and retains self references', () => {
    const { gi, overlay } = inputs();
    const breakpoints = [{ ...overlay.breakpoints[0], breakpoint_step_id: 'I1', affected_transition_target_id: 'I1' }];
    const downstreamEffects = [{ ...overlay.downstreamEffects[0], target_claim_id: 'I1' }];
    const result = buildGiDiagnosticConnectorModel(gi, changed(overlay, { breakpoints, downstreamEffects }));
    expect(result.connectors).toHaveLength(2);
    expect(result.connectors.every(value => value.source === 'I1' && value.target === 'I1' && value.resolution === 'SELF_REFERENCE')).toBe(true);
  });

  it('does not derive connectors from frontier, H_e, or compatibility maximums', () => {
    const { gi, overlay } = inputs();
    const empty = changed(overlay, { breakpoints: [], downstreamEffects: [] });
    expect(buildGiDiagnosticConnectorModel(gi, empty)).toEqual({ connectors: [], unresolvedBreakpointConnectors: [], unresolvedDownstreamConnectors: [] });
  });
});
