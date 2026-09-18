import { useEffect, useMemo, useState } from 'react';
import { AuxiliaryArtifactLoader, type AuxiliaryImportError } from './components/AuxiliaryArtifactLoader';
import { DiagnosticGraphRenderer } from './components/DiagnosticGraphRenderer';
import { GraphRenderer } from './components/GraphRenderer';
import { GiStructuralGraphRenderer } from './components/GiStructuralGraphRenderer';
import { PrimaryArtifactLoader, type PrimaryArtifactKind, type PrimaryImportError } from './components/PrimaryArtifactLoader';
import { classifyGd, classifyGi, createAuxiliaryContext, notLoaded } from './diagnostic/auxiliary/context';
import { loadGdArtifact } from './diagnostic/auxiliary/gdLoader';
import { giArtifactForAuxiliary, loadGiSlotArtifact, type LoadedGiArtifact } from './diagnostic/auxiliary/giLoader';
import type { AuxiliaryArtifactState, GdArtifact, GiArtifact } from './diagnostic/auxiliary/types';
import { adaptDiagnosticGraphForRender } from './diagnostic/diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from './diagnostic/diagnosticGraphViewModel';
import { DiagnosticOutputValidationError, loadDiagnosticOutput } from './diagnostic/diagnosticOutputLoader';
import diagnosticFixture from './diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import type { DiagnosticOutput } from './diagnostic/types';
import qualis from './fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './graph/canonicalSimulatorAdapter';
import { adaptGiGraphForRender } from './graph/giGraphRenderAdapter';
import { buildGiGraphViewModel } from './graph/giGraphViewModel';
import type { ConfirmedSimulatedGraphArtifact } from './graph/types';
import { loadCanonicalArtifact } from './import/canonicalArtifactLoader';

type PrimaryMode = 'legacy' | 'diagnostic';
type DiagnosticSubview = 'diagnosis' | 'gi-structure';
type MainSlot<T> = { artifact: T; fileName: string; source: 'DEMO' | 'FILE'; error?: PrimaryImportError };
type AuxiliarySlot<T> = { artifact?: T; fileName?: string; error?: AuxiliaryImportError };

const legacyDemo = qualis as ConfirmedSimulatedGraphArtifact;
const diagnosticDemo = loadDiagnosticOutput(diagnosticFixture);

function ArtifactStatus<T extends GiArtifact | GdArtifact>({ label, state, error, remove }: { label: string; state: AuxiliaryArtifactState<T>; error?: AuxiliaryImportError; remove: () => void }) {
  if (state.status === 'NOT_LOADED') return <span>{label}: NOT_LOADED {error && <em>· último intento: {error.code}</em>}</span>;
  if (state.status === 'LOAD_ERROR') return <span>{label}: LOAD_ERROR</span>;
  const artifact = state.artifact;
  const ref = 'graph_ref' in artifact ? artifact.graph_ref : artifact.diagnostic_graph_ref;
  const version = 'graph_version' in artifact ? artifact.graph_version : artifact.diagnostic_graph_version;
  return <span>{label}: <strong>{state.status}</strong> · {state.fileName} · {ref} · {version} {error && <em>· carga nueva fallida: {error.code}</em>} <button type="button" onClick={remove}>Quitar {label}</button></span>;
}

const diagnosticError = (reason: unknown): PrimaryImportError => reason instanceof DiagnosticOutputValidationError
  ? { code: reason.code, message: 'Diagnostic Output: schema validation failed (v0.1.2).', details: reason.issues.slice(0, 15).map(issue => `${issue.instancePath || '/'}: ${issue.message}`) }
  : { code: 'DIAGNOSTIC_PIPELINE_REJECTED_ARTIFACT', message: 'Diagnostic Output: el pipeline rechazó el artifact.', details: [reason instanceof Error ? reason.message : String(reason)] };

export default function App() {
  const [mode, setMode] = useState<PrimaryMode>('legacy');
  const [legacy, setLegacy] = useState<MainSlot<ConfirmedSimulatedGraphArtifact>>({ artifact: legacyDemo, fileName: 'QUALIS · Demo incluida', source: 'DEMO' });
  const [diagnostic, setDiagnostic] = useState<MainSlot<DiagnosticOutput>>({ artifact: diagnosticDemo, fileName: 'Diagnostic Output · Demo incluida', source: 'DEMO' });
  const [giSlot, setGiSlot] = useState<AuxiliarySlot<LoadedGiArtifact>>({});
  const [gdSlot, setGdSlot] = useState<AuxiliarySlot<GdArtifact>>({});
  const [diagnosticSubview, setDiagnosticSubview] = useState<DiagnosticSubview>('diagnosis');

  const legacyModel = useMemo(() => buildCanonicalSimulatorGraphViewModel(legacy.artifact), [legacy.artifact]);
  const diagnosticViewModel = useMemo(() => buildDiagnosticGraphViewModel(diagnostic.artifact), [diagnostic.artifact]);
  const diagnosticModel = useMemo(() => adaptDiagnosticGraphForRender(diagnosticViewModel), [diagnosticViewModel]);
  const gi = useMemo(() => giSlot.artifact ? classifyGi(giArtifactForAuxiliary(giSlot.artifact), diagnosticViewModel.metadata.run_metadata, giSlot.fileName) : notLoaded<GiArtifact>(), [giSlot.artifact, giSlot.fileName, diagnosticViewModel]);
  const gd = useMemo(() => gdSlot.artifact ? classifyGd(gdSlot.artifact, diagnosticViewModel.metadata.run_metadata, gdSlot.fileName) : notLoaded<GdArtifact>(), [gdSlot.artifact, gdSlot.fileName, diagnosticViewModel]);
  const auxiliaryContext = useMemo(() => createAuxiliaryContext(gi, gd), [gi, gd]);
  const giRenderModel = useMemo(() => giSlot.artifact?.profile === 'FULL_GI'
    ? adaptGiGraphForRender(buildGiGraphViewModel(giSlot.artifact.artifact))
    : undefined, [giSlot.artifact]);
  useEffect(() => { if (!giRenderModel) setDiagnosticSubview('diagnosis'); }, [giRenderModel]);

  const loadLegacy = (value: unknown, fileName: string) => {
    const result = loadCanonicalArtifact(value);
    if (!result.ok) return setLegacy(current => ({ ...current, error: result.error }));
    try {
      buildCanonicalSimulatorGraphViewModel(result.artifact);
      setLegacy({ artifact: result.artifact, fileName, source: 'FILE' });
    } catch (reason) {
      setLegacy(current => ({ ...current, error: { code: 'ADAPTER_REJECTED_ARTIFACT', message: 'Legacy Confirmed Simulated Graph: el adapter rechazó el artifact.', details: [reason instanceof Error ? reason.message : String(reason)] } }));
    }
  };
  const loadDiagnostic = (value: unknown, fileName: string) => {
    try {
      const artifact = loadDiagnosticOutput(value);
      buildDiagnosticGraphViewModel(artifact);
      setDiagnostic({ artifact, fileName, source: 'FILE' });
    } catch (reason) { setDiagnostic(current => ({ ...current, error: diagnosticError(reason) })); }
  };
  const loadGi = (value: unknown, fileName: string) => { const result = loadGiSlotArtifact(value); setGiSlot(current => result.ok ? { artifact: result.artifact, fileName } : { ...current, error: result.error }); };
  const loadGd = (value: unknown, fileName: string) => { const result = loadGdArtifact(value); setGdSlot(current => result.ok ? { artifact: result.artifact, fileName } : { ...current, error: result.error }); };
  const kind: PrimaryArtifactKind = mode === 'legacy' ? 'LEGACY_CONFIRMED_SIMULATED_GRAPH' : 'DIAGNOSTIC_OUTPUT';
  const metadata = diagnosticViewModel.metadata.run_metadata;

  return <>
    <header className="workspace-header">
      <div className="renderer-identity"><h1>SciTesis · Graph Renderer</h1><small>v0.2.0</small></div>
      <div className="view-switcher" role="group" aria-label="Modo principal"><button className={mode === 'legacy' ? 'active' : ''} aria-pressed={mode === 'legacy'} onClick={() => setMode('legacy')}>Legacy</button><button className={mode === 'diagnostic' ? 'active' : ''} aria-pressed={mode === 'diagnostic'} onClick={() => setMode('diagnostic')}>Diagnostic Output</button></div>
      {mode === 'legacy' ? <>
        <div className="artifact-identity" aria-label="Artifact principal activo"><strong>PRIMARY: Legacy · {legacy.fileName}</strong><details><summary>Detalles</summary><dl><dt>Source</dt><dd>{legacy.source === 'DEMO' ? 'Demo incluida' : 'Archivo local'}</dd><dt>case_id</dt><dd>{legacy.artifact.case_id}</dd><dt>execution_id</dt><dd>{legacy.artifact.execution_id}</dd><dt>contract_version</dt><dd>{legacy.artifact.contract_version}</dd></dl></details></div>
        <PrimaryArtifactLoader kind={kind} onJson={loadLegacy} onParseError={error => setLegacy(current => ({ ...current, error }))} error={legacy.error} />
      </> : <>
        <div className="artifact-identity" aria-label="Artifact principal activo"><strong>PRIMARY: Diagnostic Output · {diagnostic.fileName}</strong><details><summary>Detalles</summary><dl><dt>Source</dt><dd>{diagnostic.source === 'DEMO' ? 'Demo incluida' : 'Archivo local'}</dd><dt>schema_version</dt><dd>{diagnostic.artifact.schema_version}</dd><dt>run_id</dt><dd>{metadata.run_id}</dd><dt>graph_ref</dt><dd>{metadata.graph_ref}</dd><dt>graph_version</dt><dd>{metadata.graph_version}</dd><dt>diagnostic_graph_ref</dt><dd>{metadata.diagnostic_graph_ref}</dd><dt>diagnostic_graph_version</dt><dd>{metadata.diagnostic_graph_version}</dd></dl></details></div>
        <PrimaryArtifactLoader kind={kind} onJson={loadDiagnostic} onParseError={error => setDiagnostic(current => ({ ...current, error }))} error={diagnostic.error} />
      </>}
    </header>
    {mode === 'diagnostic' && <section className="auxiliary-toolbar" aria-label="Artifacts auxiliares">
      <strong>AUXILIARY</strong>
      <div><AuxiliaryArtifactLoader kind="GI" onJson={loadGi} onParseError={error => setGiSlot(current => ({ ...current, error }))} error={giSlot.error} /><ArtifactStatus label="G_I" state={gi} error={giSlot.error} remove={() => setGiSlot({})} /></div>
      <div><AuxiliaryArtifactLoader kind="GD" onJson={loadGd} onParseError={error => setGdSlot(current => ({ ...current, error }))} error={gdSlot.error} /><ArtifactStatus label="G_D" state={gd} error={gdSlot.error} remove={() => setGdSlot({})} /></div>
      <small>Contexto auxiliar local; no modifica Diagnostic Output. G_D origin: {metadata.diagnostic_graph_origin}</small>
    </section>}
    {mode === 'diagnostic' && giRenderModel && <nav className="diagnostic-subviews" aria-label="Vista de Diagnostic Output"><button type="button" className={diagnosticSubview === 'diagnosis' ? 'active' : ''} aria-pressed={diagnosticSubview === 'diagnosis'} onClick={() => setDiagnosticSubview('diagnosis')}>Diagnóstico</button><button type="button" className={diagnosticSubview === 'gi-structure' ? 'active' : ''} aria-pressed={diagnosticSubview === 'gi-structure'} onClick={() => setDiagnosticSubview('gi-structure')}>Mapa estructural G_I</button></nav>}
    {mode === 'legacy' ? <GraphRenderer model={legacyModel} /> : diagnosticSubview === 'gi-structure' && giRenderModel
      ? <GiStructuralGraphRenderer model={giRenderModel} mismatch={gi.status === 'LOADED_MISMATCH'} />
      : <DiagnosticGraphRenderer model={diagnosticModel} auxiliaryContext={auxiliaryContext} />}
  </>;
}
