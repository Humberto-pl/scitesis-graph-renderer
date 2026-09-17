import { describe, expect, it } from 'vitest';
import outputFixture from '../fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import { adaptDiagnosticGraphForRender } from '../diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from '../diagnosticGraphViewModel';
import { loadDiagnosticOutput } from '../diagnosticOutputLoader';
import gdFixture from './fixtures/gd-minimal-compatible.json';
import gdMismatch from './fixtures/gd-mismatch.json';
import giFixture from './fixtures/gi-minimal-compatible.json';
import giMismatch from './fixtures/gi-mismatch.json';
import { buildAuxiliaryEntityIndex, classifyGd, classifyGi, createAuxiliaryContext, notLoaded, resolveAuxiliaryReference } from './context';
import { loadGdArtifact } from './gdLoader';
import { loadGiArtifact } from './giLoader';

const metadata = buildDiagnosticGraphViewModel(loadDiagnosticOutput(outputFixture)).metadata.run_metadata;
const loadGi = (value: unknown) => { const result = loadGiArtifact(value); if (!result.ok) throw new Error('fixture'); return result.artifact; };
const loadGd = (value: unknown) => { const result = loadGdArtifact(value); if (!result.ok) throw new Error('fixture'); return result.artifact; };

describe('auxiliary artifact boundaries', () => {
  it('loads the documented minimum without coercion, defaults, or input mutation', () => {
    const gi = structuredClone(giFixture), gd = structuredClone(gdFixture), beforeGi = structuredClone(gi), beforeGd = structuredClone(gd);
    expect(loadGiArtifact(gi).ok).toBe(true); expect(loadGdArtifact(gd).ok).toBe(true);
    expect(gi).toEqual(beforeGi); expect(gd).toEqual(beforeGd);
    expect(loadGiArtifact({ ...gi, graph_version: 1 }).ok).toBe(false);
    expect(loadGdArtifact({ ...gd, entities: [{ id: 1 }] }).ok).toBe(false);
  });

  it('is optional and resolves only exact, case-sensitive IDs', () => {
    const empty = createAuxiliaryContext(notLoaded(), notLoaded());
    expect(resolveAuxiliaryReference('claim-1', empty)).toEqual({ status: 'UNRESOLVED', ref: 'claim-1' });
    const context = createAuxiliaryContext(classifyGi(loadGi(giFixture), metadata), notLoaded());
    expect(resolveAuxiliaryReference('claim-1', context)).toMatchObject({ status: 'RESOLVED', artifact: 'GI', entity: { id: 'claim-1' } });
    for (const ref of ['claim-','claim-1x','Claim-1','COND-001','route-1']) expect(resolveAuxiliaryReference(ref, context).status).toBe('UNRESOLVED');
  });

  it('supports GI alone, GD alone, both, ambiguity, and deterministic indexing', () => {
    const gi = classifyGi(loadGi(giFixture), metadata), gd = classifyGd(loadGd(gdFixture), metadata);
    expect(resolveAuxiliaryReference('provenance-1', createAuxiliaryContext(gi, notLoaded()))).toMatchObject({ status: 'RESOLVED', artifact: 'GI' });
    expect(resolveAuxiliaryReference('condition-1', createAuxiliaryContext(notLoaded(), gd))).toMatchObject({ status: 'RESOLVED', artifact: 'GD' });
    const both = createAuxiliaryContext(gi, gd);
    expect(resolveAuxiliaryReference('defeater-1', both)).toMatchObject({ status: 'RESOLVED', artifact: 'GD' });
    const gdCollision = classifyGd(loadGd({ ...gdFixture, entities: [...gdFixture.entities, { id: 'provenance-1' }] }), metadata);
    expect(resolveAuxiliaryReference('provenance-1', createAuxiliaryContext(gi, gdCollision)).status).toBe('AMBIGUOUS');
    expect(buildAuxiliaryEntityIndex(gi, gd)).toEqual(buildAuxiliaryEntityIndex(gi, gd));
  });

  it('blocks resolution from mismatched artifacts while reporting an exact matching ID', () => {
    const context = createAuxiliaryContext(classifyGi(loadGi(giMismatch), metadata), classifyGd(loadGd(gdMismatch), metadata));
    expect(context.gi.status).toBe('LOADED_MISMATCH'); expect(context.gd.status).toBe('LOADED_MISMATCH');
    expect(resolveAuxiliaryReference('provenance-1', context)).toEqual({ status: 'AUXILIARY_MISMATCH', ref: 'provenance-1', artifacts: ['GI'] });
    expect(resolveAuxiliaryReference('condition-1', context)).toEqual({ status: 'AUXILIARY_MISMATCH', ref: 'condition-1', artifacts: ['GD'] });
  });

  it('cannot change diagnostic nodes, H_e, breakpoints, downstream, or frontier', () => {
    const viewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(structuredClone(outputFixture)));
    const beforeView = structuredClone(viewModel), without = adaptDiagnosticGraphForRender(viewModel);
    createAuxiliaryContext(classifyGi(loadGi(giFixture), metadata), classifyGd(loadGd(gdFixture), metadata));
    const withAuxiliary = adaptDiagnosticGraphForRender(viewModel);
    expect(withAuxiliary).toEqual(without);
    expect(viewModel).toEqual(beforeView);
    expect(withAuxiliary.nodes.some(node => node.canonicalId === 'claim-extra')).toBe(false);
    expect(withAuxiliary.edges).toEqual(without.edges); expect(withAuxiliary.breakpoints).toEqual(without.breakpoints);
    expect(withAuxiliary.downstreamEffects).toEqual(without.downstreamEffects); expect(withAuxiliary.frontier).toEqual(without.frontier);
  });
});
