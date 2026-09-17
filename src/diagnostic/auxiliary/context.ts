import type { RunMetadata } from '../types';
import type { AuxiliaryArtifactState, AuxiliaryEntityIndex, AuxiliaryResolvedEntity, DiagnosticAuxiliaryContext, GdArtifact, GiArtifact, ReferenceResolution } from './types';

export const notLoaded = <T>(): AuxiliaryArtifactState<T> => ({ status: 'NOT_LOADED' });

export function classifyGi(artifact: GiArtifact, metadata: RunMetadata, fileName?: string): AuxiliaryArtifactState<GiArtifact> {
  return artifact.graph_ref === metadata.graph_ref && artifact.graph_version === metadata.graph_version
    ? { status: 'LOADED_COMPATIBLE', artifact, fileName }
    : { status: 'LOADED_MISMATCH', artifact, fileName, expectedRef: metadata.graph_ref, expectedVersion: metadata.graph_version };
}
export function classifyGd(artifact: GdArtifact, metadata: RunMetadata, fileName?: string): AuxiliaryArtifactState<GdArtifact> {
  return artifact.diagnostic_graph_ref === metadata.diagnostic_graph_ref && artifact.diagnostic_graph_version === metadata.diagnostic_graph_version
    ? { status: 'LOADED_COMPATIBLE', artifact, fileName }
    : { status: 'LOADED_MISMATCH', artifact, fileName, expectedRef: metadata.diagnostic_graph_ref, expectedVersion: metadata.diagnostic_graph_version };
}

const add = (target: Record<string, AuxiliaryResolvedEntity[]>, entity: AuxiliaryResolvedEntity) => { (target[entity.id] ??= []).push(entity); };
export function buildAuxiliaryEntityIndex(gi: AuxiliaryArtifactState<GiArtifact>, gd: AuxiliaryArtifactState<GdArtifact>): AuxiliaryEntityIndex {
  const index: AuxiliaryEntityIndex = { gi: {}, gd: {}, mismatchGi: {}, mismatchGd: {} };
  const indexArtifact = (state: AuxiliaryArtifactState<GiArtifact> | AuxiliaryArtifactState<GdArtifact>, artifact: 'GI' | 'GD') => {
    if (state.status !== 'LOADED_COMPATIBLE' && state.status !== 'LOADED_MISMATCH') return;
    const value = state.artifact;
    const ref = artifact === 'GI' ? (value as GiArtifact).graph_ref : (value as GdArtifact).diagnostic_graph_ref;
    const version = artifact === 'GI' ? (value as GiArtifact).graph_version : (value as GdArtifact).diagnostic_graph_version;
    value.entities.forEach(raw => {
      if (state.status === 'LOADED_MISMATCH') (artifact === 'GI' ? index.mismatchGi : index.mismatchGd)[raw.id] = true;
      else add(artifact === 'GI' ? index.gi : index.gd, { artifact, id: raw.id, kind: raw.canonical_type ?? raw.type_id, label: raw.label, text: raw.text, artifactRef: ref, artifactVersion: version, raw: structuredClone(raw) });
    });
  };
  indexArtifact(gi, 'GI'); indexArtifact(gd, 'GD');
  return index;
}

export function createAuxiliaryContext(gi: AuxiliaryArtifactState<GiArtifact>, gd: AuxiliaryArtifactState<GdArtifact>): DiagnosticAuxiliaryContext {
  return { gi, gd, index: buildAuxiliaryEntityIndex(gi, gd) };
}

export function resolveAuxiliaryReference(ref: string, context?: DiagnosticAuxiliaryContext): ReferenceResolution {
  if (!context) return { status: 'UNRESOLVED', ref };
  const matches = [...(context.index.gi[ref] ?? []), ...(context.index.gd[ref] ?? [])];
  if (matches.length === 1) return { status: 'RESOLVED', ref, artifact: matches[0].artifact, entity: matches[0] };
  if (matches.length > 1) return { status: 'AMBIGUOUS', ref, matches };
  const artifacts: ('GI' | 'GD')[] = [];
  if (context.index.mismatchGi[ref]) artifacts.push('GI');
  if (context.index.mismatchGd[ref]) artifacts.push('GD');
  return artifacts.length ? { status: 'AUXILIARY_MISMATCH', ref, artifacts } : { status: 'UNRESOLVED', ref };
}
