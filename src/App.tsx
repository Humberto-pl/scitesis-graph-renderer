import { useMemo,useState } from 'react';
import { ArtifactFileLoader,type ImportError } from './components/ArtifactFileLoader';
import { GraphRenderer } from './components/GraphRenderer';
import qualis from './fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { buildCanonicalSimulatorGraphViewModel } from './graph/canonicalSimulatorAdapter';
import type { ConfirmedSimulatedGraphArtifact } from './graph/types';
const demo=qualis as ConfirmedSimulatedGraphArtifact;
export default function App(){const[artifact,setArtifact]=useState(demo),[fileName,setFileName]=useState('QUALIS (ejemplo incluido)'),[error,setError]=useState<ImportError>();const model=useMemo(()=>buildCanonicalSimulatorGraphViewModel(artifact),[artifact]);const loaded=(next:ConfirmedSimulatedGraphArtifact,name:string)=>{try{buildCanonicalSimulatorGraphViewModel(next);setArtifact(next);setFileName(name);setError(undefined)}catch(reason){setError({code:'ADAPTER_REJECTED_ARTIFACT',message:'El adapter rechazó el artifact.',details:[reason instanceof Error?reason.message:String(reason)]})}};return <><ArtifactFileLoader onLoad={loaded} onError={setError} error={error}/><section className="artifact-identity" aria-label="Artifact actual"><strong>Artifact cargado: {fileName}</strong><span>case_id: {artifact.case_id}</span><span>execution_id: {artifact.execution_id}</span><span>contract_version: {artifact.contract_version}</span></section><GraphRenderer model={model}/></>}
