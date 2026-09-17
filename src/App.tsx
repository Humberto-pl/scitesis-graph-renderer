import { useMemo,useState } from 'react';
import { ArtifactFileLoader,type ImportError } from './components/ArtifactFileLoader';
import { DiagnosticGraphRenderer } from './components/DiagnosticGraphRenderer';
import { GraphRenderer } from './components/GraphRenderer';
import { adaptDiagnosticGraphForRender } from './diagnostic/diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from './diagnostic/diagnosticGraphViewModel';
import { loadDiagnosticOutput } from './diagnostic/diagnosticOutputLoader';
import diagnosticFixture from './diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import qualis from './fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './graph/canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from './graph/types';
const demo=qualis as ConfirmedSimulatedGraphArtifact;
const diagnosticModel = adaptDiagnosticGraphForRender(
  buildDiagnosticGraphViewModel(loadDiagnosticOutput(diagnosticFixture)),
);
export default function App(){const[view,setView]=useState<'legacy'|'diagnostic'>('legacy'),[artifact,setArtifact]=useState(demo),[fileName,setFileName]=useState('QUALIS · ejemplo incluido'),[error,setError]=useState<ImportError>();const model=useMemo(()=>buildCanonicalSimulatorGraphViewModel(artifact),[artifact]);const loaded=(next:ConfirmedSimulatedGraphArtifact,name:string)=>{try{buildCanonicalSimulatorGraphViewModel(next);setArtifact(next);setFileName(name);setError(undefined)}catch(reason){setError({code:'ADAPTER_REJECTED_ARTIFACT',message:'El adapter rechazó el artifact.',details:[reason instanceof Error?reason.message:String(reason)]})}};return <><header className="workspace-header"><div className="renderer-identity"><h1>SciTesis · Graph Renderer</h1><small>v0.1.1</small></div><div className="view-switcher" aria-label="Vista"><button className={view==='legacy'?'active':''} onClick={()=>setView('legacy')}>Legacy</button><button className={view==='diagnostic'?'active':''} onClick={()=>setView('diagnostic')}>Diagnostic Output</button></div>{view==='legacy'&&<><div className="artifact-identity" aria-label="Artifact actual"><strong>{fileName}</strong><details><summary>Detalles</summary><dl><dt>case_id</dt><dd>{artifact.case_id}</dd><dt>execution_id</dt><dd>{artifact.execution_id}</dd><dt>contract_version</dt><dd>{artifact.contract_version}</dd></dl></details></div><ArtifactFileLoader onLoad={loaded} onError={setError} error={error}/></>}</header>{view==='legacy'?<GraphRenderer model={model}/>:<DiagnosticGraphRenderer model={diagnosticModel}/>}</>}
