import { layoutGraph } from './layout';
import type { CandidateArtifact, DiagnosisArtifact, GraphEdge, GraphNode, GraphOptions, GraphViewModel } from './types';

const edgeId = (kind:string, source:string, target:string) => `edge:${kind}:${source}:${target}`;
export function buildDiagnosticGraphViewModel(candidate: CandidateArtifact, diagnosis: DiagnosisArtifact = {}, options: GraphOptions = {}): GraphViewModel {
  const diagnosisById = new Map((diagnosis.entries ?? []).map(entry => [entry.subjectId, entry]));
  const rawNodes: Omit<GraphNode,'position'>[] = [];
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const add = (entity: CandidateArtifact['claims'][number], parentClaimId?: string) => {
    if (seen.has(entity.id)) return; seen.add(entity.id);
    const d = diagnosisById.get(entity.id);
    rawNodes.push({ id: entity.id, canonicalId: entity.id, kind: entity.kind, label: entity.text ?? entity.id, text: entity.text, sourceRefs: [...(entity.sourceRefs ?? [])], state: d?.state, rules: [...(d?.rules ?? [])], supportPath: [...(d?.supportPath ?? [])], maximumDefendableClaim: d?.maximumDefendableClaim, gravity:d?.gravity, reparability:d?.reparability, parentClaimId, collapsible: entity.kind === 'CLAIM' && entity.decomposition === 'COMPOSITE_SEPARABLE' ? 'subclaims' : undefined });
  };
  candidate.claims.forEach(claim => {
    add(claim);
    // Only an explicit canonical decomposition permits subclaim nodes; legacy and indivisible claims remain atomic.
    if (claim.decomposition === 'COMPOSITE_SEPARABLE') (claim.subclaims ?? []).forEach(sub => { add(sub, claim.id); edges.push({id:edgeId('DECOMPOSES_TO',claim.id,sub.id),source:claim.id,target:sub.id,kind:'DECOMPOSES_TO',label:'DECOMPOSES_TO'}); });
  });
  [...(candidate.entities ?? []), ...(diagnosis.entities ?? [])].forEach(entity => add(entity as CandidateArtifact['claims'][number]));
  const relations = [...(candidate.relations ?? []), ...(diagnosis.relations ?? [])];
  relations.forEach(rel => { if (seen.has(rel.sourceId) && seen.has(rel.targetId)) edges.push({ id: rel.id ?? edgeId(rel.kind,rel.sourceId,rel.targetId), source:rel.sourceId,target:rel.targetId,kind:rel.kind,label:rel.label ?? rel.kind }); });
  // Support paths are validation metadata, not permission to invent edges.
  rawNodes.forEach(node => { if (node.kind === 'CLAIM' || node.kind === 'SUBCLAIM') node.collapsible ??= edges.some(e=>e.kind==='SUPPORTS'&&e.target===node.id) ? 'evidence' : undefined; });
  const sortedEdges = edges.sort((a,b)=>a.id.localeCompare(b.id));
  return { graphId:`diagnostic:${candidate.caseId}`,sourceCaseId:candidate.caseId,nodes:layoutGraph(rawNodes,sortedEdges,options),edges:sortedEdges,metadata:{adapterVersion:'0.1',sourceSchemaVersion:candidate.schemaVersion ?? '0.7-compatible',generatedDeterministically:true} };
}
