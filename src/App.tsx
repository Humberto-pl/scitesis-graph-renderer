import { useMemo, useState } from 'react';
import { ArtifactFileLoader, type ImportError } from './components/ArtifactFileLoader';
import { AuxiliaryArtifactLoader } from './components/AuxiliaryArtifactLoader';
import { DiagnosticGraphRenderer } from './components/DiagnosticGraphRenderer';
import { GraphRenderer } from './components/GraphRenderer';
import { classifyGd, classifyGi, createAuxiliaryContext, notLoaded } from './diagnostic/auxiliary/context';
import { loadGdArtifact } from './diagnostic/auxiliary/gdLoader';
import { loadGiArtifact } from './diagnostic/auxiliary/giLoader';
import type { AuxiliaryArtifactState, GdArtifact, GiArtifact } from './diagnostic/auxiliary/types';
import { adaptDiagnosticGraphForRender } from './diagnostic/diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from './diagnostic/diagnosticGraphViewModel';
import { loadDiagnosticOutput } from './diagnostic/diagnosticOutputLoader';
import diagnosticFixture from './diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import qualis from './fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './graph/canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from './graph/types';

const demo = qualis as ConfirmedSimulatedGraphArtifact;
const diagnosticViewModel = buildDiagnosticGraphViewModel(loadDiagnosticOutput(diagnosticFixture));
const diagnosticModel = adaptDiagnosticGraphForRender(diagnosticViewModel);

function ArtifactStatus<T extends GiArtifact | GdArtifact>({ label, state, remove }: { label: string; state: AuxiliaryArtifactState<T>; remove: () => void }) {
  if (state.status === 'NOT_LOADED') return <span>{label}: NOT_LOADED</span>;
  if (state.status === 'LOAD_ERROR') return <span>{label}: LOAD_ERROR</span>;
  const artifact = state.artifact;
  const ref = 'graph_ref' in artifact ? artifact.graph_ref : artifact.diagnostic_graph_ref;
  const version = 'graph_version' in artifact ? artifact.graph_version : artifact.diagnostic_graph_version;
  return <span>{label}: <strong>{state.status}</strong> · {state.fileName} · {ref} · {version} <button type="button" onClick={remove}>Quitar {label}</button></span>;
}

export default function App() {
  const [view, setView] = useState<'legacy' | 'diagnostic'>('legacy');
  const [artifact, setArtifact] = useState(demo), [fileName, setFileName] = useState('QUALIS · ejemplo incluido'), [error, setError] = useState<ImportError>();
  const [gi, setGi] = useState<AuxiliaryArtifactState<GiArtifact>>(notLoaded);
  const [gd, setGd] = useState<AuxiliaryArtifactState<GdArtifact>>(notLoaded);
  const model = useMemo(() => buildCanonicalSimulatorGraphViewModel(artifact), [artifact]);
  const auxiliaryContext = useMemo(() => createAuxiliaryContext(gi, gd), [gi, gd]);
  const loaded = (next: ConfirmedSimulatedGraphArtifact, name: string) => { try { buildCanonicalSimulatorGraphViewModel(next); setArtifact(next); setFileName(name); setError(undefined); } catch (reason) { setError({ code: 'ADAPTER_REJECTED_ARTIFACT', message: 'El adapter rechazó el artifact.', details: [reason instanceof Error ? reason.message : String(reason)] }); } };
  const loadGi = (value: unknown, name: string) => { const result = loadGiArtifact(value); setGi(result.ok ? classifyGi(result.artifact, diagnosticViewModel.metadata.run_metadata, name) : { status: 'LOAD_ERROR', error: result.error, previous: gi.status === 'LOADED_COMPATIBLE' || gi.status === 'LOADED_MISMATCH' ? gi : undefined }); };
  const loadGd = (value: unknown, name: string) => { const result = loadGdArtifact(value); setGd(result.ok ? classifyGd(result.artifact, diagnosticViewModel.metadata.run_metadata, name) : { status: 'LOAD_ERROR', error: result.error, previous: gd.status === 'LOADED_COMPATIBLE' || gd.status === 'LOADED_MISMATCH' ? gd : undefined }); };
  return <><header className="workspace-header"><div className="renderer-identity"><h1>SciTesis · Graph Renderer</h1><small>v0.1.1</small></div><div className="view-switcher" aria-label="Vista"><button className={view === 'legacy' ? 'active' : ''} onClick={() => setView('legacy')}>Legacy</button><button className={view === 'diagnostic' ? 'active' : ''} onClick={() => setView('diagnostic')}>Diagnostic Output</button></div>{view === 'legacy' && <><div className="artifact-identity" aria-label="Artifact actual"><strong>{fileName}</strong><details><summary>Detalles</summary><dl><dt>case_id</dt><dd>{artifact.case_id}</dd><dt>execution_id</dt><dd>{artifact.execution_id}</dd><dt>contract_version</dt><dd>{artifact.contract_version}</dd></dl></details></div><ArtifactFileLoader onLoad={loaded} onError={setError} error={error} /></>}</header>{view === 'diagnostic' && <section className="auxiliary-toolbar" aria-label="Artifacts auxiliares"><div><AuxiliaryArtifactLoader kind="GI" onJson={loadGi} error={gi.status === 'LOAD_ERROR' ? gi.error : undefined} /><ArtifactStatus label="G_I" state={gi} remove={() => setGi(notLoaded())} /></div><div><AuxiliaryArtifactLoader kind="GD" onJson={loadGd} error={gd.status === 'LOAD_ERROR' ? gd.error : undefined} /><ArtifactStatus label="G_D" state={gd} remove={() => setGd(notLoaded())} /></div><small>Contexto auxiliar local; no modifica Diagnostic Output. G_D origin: {diagnosticViewModel.metadata.run_metadata.diagnostic_graph_origin}</small></section>}{view === 'legacy' ? <GraphRenderer model={model} /> : <DiagnosticGraphRenderer model={diagnosticModel} auxiliaryContext={auxiliaryContext} />}</>;
}
