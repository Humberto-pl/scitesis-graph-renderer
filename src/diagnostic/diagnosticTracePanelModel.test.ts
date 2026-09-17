import { describe, expect, it } from 'vitest';
import richFixture from './fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { adaptDiagnosticGraphForRender } from './diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from './diagnosticGraphViewModel';
import { loadDiagnosticOutput } from './diagnosticOutputLoader';
import { buildDiagnosticTracePanelModels } from './diagnosticTracePanelModel';

const viewModel = () => buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(richFixture)));
const source = (models: ReturnType<typeof buildDiagnosticTracePanelModels>, id: string) => models.find(model => model.sourceId === id)!;

describe('buildDiagnosticTracePanelModels', () => {
  it('preserves literal breakpoint, downstream, and frontier traces including non-normalized order and nulls', () => {
    const model = viewModel();
    const trace = [
      { sequence: 5, trace_kind: 'OTHER' as const, subject_ref: null, rule_ref: null, message: 'five' },
      { sequence: 2, trace_kind: 'LOST_ROUTE' as const, subject_ref: 'subject-2', rule_ref: 'rule-2', message: 'two' },
      { sequence: 9, trace_kind: 'FRONTIER_DECISION' as const, subject_ref: 'subject-9', rule_ref: null, message: 'nine' },
    ];
    model.breakpoints[0].explanation_trace = structuredClone(trace);
    model.downstreamEffects[0].explanation_trace = structuredClone(trace);
    model.frontier.explanation_trace = structuredClone(trace);
    const models = buildDiagnosticTracePanelModels(model);
    for (const id of ['breakpoint:breakpoint-1', 'downstream:breakpoint-1:claim-affected:0', 'defendability-frontier']) {
      expect(source(models, id).explanationTrace).toEqual(trace);
      expect(source(models, id).explanationTrace.map(item => item.sequence)).toEqual([5, 2, 9]);
    }
  });

  it('keeps transition provenance and alternatives literal and run refs in separate groups', () => {
    const models = buildDiagnosticTracePanelModels(viewModel());
    expect(source(models, 'transition:input-1:step-rich:claim-supported:0')).toMatchObject({
      provenanceRefs: ['provenance-1'], alternativeRouteRefs: ['route-alternative'],
    });
    expect(source(models, 'run-metadata')).toMatchObject({
      adjudicationRefs: ['adj-1'], diagnosticConditionRefs: ['condition-1'], defeaterRefs: ['defeater-1'], explanationTrace: [],
    });
  });

  it('uses only each entity trace and leaves absent canonical traces empty', () => {
    const models = buildDiagnosticTracePanelModels(viewModel());
    expect(source(models, 'claim:claim-affected').explanationTrace).toEqual([]);
    expect(source(models, 'transition:input-1:step-rich:claim-supported:0').explanationTrace).toEqual([]);
    expect(source(models, 'review:review-1').explanationTrace).toEqual([]);
    expect(source(models, 'inference:step-rich').explanationTrace.map(item => item.message)).toEqual(['Canonical active-state trace.']);
  });

  it('is deterministic, does not mutate the ViewModel, and creates no graph nodes or edges for unresolved refs', () => {
    const model = viewModel();
    model.transitions[0].provenance_refs = ['prov-x'];
    model.metadata.run_metadata.active_defeater_refs = ['def-x'];
    model.metadata.run_metadata.active_diagnostic_condition_refs = ['cond-x'];
    const before = structuredClone(model);
    const first = buildDiagnosticTracePanelModels(model);
    const second = buildDiagnosticTracePanelModels(model);
    expect(first).toEqual(second);
    expect(model).toEqual(before);
    const render = adaptDiagnosticGraphForRender(model);
    expect(render.nodes.some(node => ['prov-x', 'def-x', 'cond-x'].includes(node.canonicalId))).toBe(false);
    expect(render.edges).toHaveLength(1);
  });
});
