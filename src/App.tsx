import { useState } from 'react';
import { GraphRenderer } from './components/GraphRenderer';
import { fixtures } from './fixtures/cases';
import { buildDiagnosticGraphViewModel } from './graph/adapter';
export default function App(){const [caseId,setCaseId]=useState('C34');const f=fixtures[caseId];return <><nav aria-label="Casos">{Object.keys(fixtures).map(id=><button className={id===caseId?'active':''} onClick={()=>setCaseId(id)} key={id}>{id}</button>)}</nav><GraphRenderer model={buildDiagnosticGraphViewModel(f.candidate,f.diagnosis)}/></>}
