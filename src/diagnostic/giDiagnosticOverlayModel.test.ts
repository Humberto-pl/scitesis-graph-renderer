import { describe, expect, it } from 'vitest';
import giFixture from './auxiliary/fixtures/gi-full-valid.json';
import { loadGiGraphContract } from './auxiliary/giGraphContract';
import diagnosticFixture from './fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { buildDiagnosticGraphViewModel, type DiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import { loadDiagnosticOutput } from './diagnosticOutputLoader';
import { buildGiDiagnosticOverlay } from './giDiagnosticOverlayModel';
import { adaptGiGraphForRender } from '../graph/giGraphRenderAdapter';
import { buildGiGraphViewModel } from '../graph/giGraphViewModel';

function models() {
  const loaded = loadGiGraphContract(structuredClone(giFixture));
  if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
  const gi = adaptGiGraphForRender(buildGiGraphViewModel(loaded.artifact));
  const diagnostic = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(diagnosticFixture)));
  diagnostic.metadata.run_metadata.graph_ref = gi.graphRef;
  diagnostic.metadata.run_metadata.graph_version = gi.graphVersion;
  diagnostic.claims[0].claim_id = 'C1';
  diagnostic.inferenceSteps[0].inference_step_id = 'I1';
  diagnostic.reviewRequiredItems[0].subject_ref = 'C1';
  diagnostic.transitions[0].source_claim_or_input_id = 'C1';
  diagnostic.transitions[0].inference_step_id = 'I1';
  return { gi, diagnostic };
}

const compatible = (diagnostic?: DiagnosticGraphViewModel) => {
  const values = models();
  const result = buildGiDiagnosticOverlay(values.gi, diagnostic ?? values.diagnostic);
  if (result.status !== 'COMPATIBLE') throw new Error('expected compatible overlay');
  return { ...values, diagnostic: diagnostic ?? values.diagnostic, overlay: result.overlay };
};

describe('buildGiDiagnosticOverlay', () => {
  it('requires exact graph_ref and graph_version and fails closed', () => {
    const { gi, diagnostic } = models();
    expect(buildGiDiagnosticOverlay(gi, diagnostic).status).toBe('COMPATIBLE');
    diagnostic.metadata.run_metadata.graph_ref = 'GRAPH-TEST';
    const refMismatch = buildGiDiagnosticOverlay(gi, diagnostic);
    expect(refMismatch).toEqual({ status: 'MISMATCH', expectedGraphRef: 'GRAPH-TEST', expectedGraphVersion: '1.0', actualGraphRef: 'graph-test', actualGraphVersion: '1.0' });
    expect('overlay' in refMismatch).toBe(false);
    diagnostic.metadata.run_metadata.graph_ref = gi.graphRef;
    diagnostic.metadata.run_metadata.graph_version = '1.0.0';
    const versionMismatch = buildGiDiagnosticOverlay(gi, diagnostic);
    expect(versionMismatch.status).toBe('MISMATCH');
    expect('overlay' in versionMismatch).toBe(false);
  });

  it('maps claims, inference steps, reviews, and H_e only by exact IDs', () => {
    const { overlay } = compatible();
    expect(overlay.annotationsByNodeId.get('C1')?.claim?.claim_id).toBe('C1');
    expect(overlay.annotationsByNodeId.get('I1')?.inferenceStep?.inference_step_id).toBe('I1');
    expect(overlay.annotationsByNodeId.get('C1')?.reviewItems[0].subject_ref).toBe('C1');
    expect(overlay.annotationsByNodeId.get('C1')?.viableTransitions).toHaveLength(1);
    expect(overlay.annotationsByNodeId.get('I1')?.viableTransitions).toHaveLength(1);
  });

  it('is case-sensitive and records unmatched diagnostics without creating nodes', () => {
    const { diagnostic } = models();
    diagnostic.claims[0].claim_id = 'c1';
    diagnostic.inferenceSteps[0].inference_step_id = 'missing-step';
    diagnostic.reviewRequiredItems[0].subject_ref = 'missing-review-subject';
    const { gi, overlay } = compatible(diagnostic);
    expect(overlay.unmatchedClaimIds).toContain('c1');
    expect(overlay.unmatchedInferenceStepIds).toContain('missing-step');
    expect(overlay.unmatchedReviewItemIds).toContain(diagnostic.reviewRequiredItems[0].item_id);
    expect(overlay.annotationsByNodeId.get('C1')?.claim).toBeUndefined();
    expect(gi.nodes).toHaveLength(4);
    expect(gi.edges).toHaveLength(3);
  });

  it('does not annotate a node merely because no diagnostic record exists', () => {
    const { overlay } = compatible();
    expect(overlay.annotationsByNodeId.has('E2')).toBe(false);
  });

  it('retains claim and inference annotations independently on the same node', () => {
    const { diagnostic } = models();
    diagnostic.inferenceSteps[0].inference_step_id = 'C1';
    const { overlay } = compatible(diagnostic);
    expect(overlay.annotationsByNodeId.get('C1')?.claim).toBeDefined();
    expect(overlay.annotationsByNodeId.get('C1')?.inferenceStep).toBeDefined();
  });

  it('is deterministic and leaves both inputs and topology unchanged', () => {
    const { gi, diagnostic } = models();
    const giBefore = structuredClone(gi);
    const diagnosticBefore = structuredClone(diagnostic);
    const first = buildGiDiagnosticOverlay(gi, diagnostic);
    const second = buildGiDiagnosticOverlay(gi, diagnostic);
    expect(first).toEqual(second);
    expect(gi).toEqual(giBefore);
    expect(diagnostic).toEqual(diagnosticBefore);
    expect(gi.nodes).toEqual(giBefore.nodes);
    expect(gi.edges).toEqual(giBefore.edges);
  });
});
