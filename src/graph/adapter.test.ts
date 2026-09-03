import { describe, expect, it } from 'vitest';
import { fixtures } from '../fixtures/cases';
import { buildDiagnosticGraphViewModel } from './adapter';
import { DIAGNOSTIC_STATES, EDGE_KINDS, NODE_KINDS, type CandidateArtifact } from './types';
describe('Graph Adapter',()=>{
  it('is deterministic and does not mutate inputs',()=>{const f=fixtures.C34;const snapshot=JSON.stringify(f);expect(buildDiagnosticGraphViewModel(f.candidate,f.diagnosis)).toEqual(buildDiagnosticGraphViewModel(f.candidate,f.diagnosis));expect(JSON.stringify(f)).toBe(snapshot)});
  it('maps every node kind, edge kind, and state',()=>{const candidate:CandidateArtifact={caseId:'all',claims:NODE_KINDS.map((kind,i)=>({id:`n${i}`,kind})),relations:EDGE_KINDS.map((kind,i)=>({sourceId:'n0',targetId:`n${i}`,kind}))};const diagnosis={entries:DIAGNOSTIC_STATES.map((state,i)=>({subjectId:`n${i}`,state}))};const vm=buildDiagnosticGraphViewModel(candidate,diagnosis);expect(new Set(vm.nodes.map(n=>n.kind))).toEqual(new Set(NODE_KINDS));expect(new Set(vm.edges.map(e=>e.kind))).toEqual(new Set(EDGE_KINDS));expect(new Set(vm.nodes.map(n=>n.state).filter(Boolean))).toEqual(new Set(DIAGNOSTIC_STATES))});
  it('decomposes only explicit separable composites and preserves support targets',()=>{const vm=buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis);expect(vm.nodes.filter(n=>n.kind==='SUBCLAIM').map(n=>n.id)).toEqual(['C34-C09-S1','C34-C09-S2']);expect(vm.edges.find(e=>e.kind==='SUPPORTS')?.target).toBe('C34-C09-S1');expect(vm.nodes.find(n=>n.id==='C34-C09-S1')?.maximumDefendableClaim).toBeTruthy()});
  it.each(['C30','ADV-WI01-15'])('%s remains indivisible',id=>expect(buildDiagnosticGraphViewModel(fixtures[id].candidate,fixtures[id].diagnosis).nodes.some(n=>n.kind==='SUBCLAIM')).toBe(false));
  it('keeps simple and legacy v0.7 claims atomic and tolerates missing optionals',()=>{const vm=buildDiagnosticGraphViewModel({caseId:'legacy',schemaVersion:'0.7',claims:[{id:'c',kind:'CLAIM'}]});expect(vm.nodes).toHaveLength(1);expect(vm.nodes[0].supportPath).toEqual([])});
  it('does not invent C36 support',()=>{const vm=buildDiagnosticGraphViewModel(fixtures.C36.candidate,fixtures.C36.diagnosis);expect(vm.edges.some(e=>e.target==='C36-C02')).toBe(false)});
});
