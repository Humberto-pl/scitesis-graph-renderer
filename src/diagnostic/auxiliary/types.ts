export type AuxiliaryArtifactKind = 'GI' | 'GD';

export interface AuxiliaryEntityFragment {
  id: string;
  canonical_type?: string;
  type_id?: string;
  label?: string;
  text?: string;
  [key: string]: unknown;
}

export interface GiArtifact {
  graph_ref: string;
  graph_version: string;
  entities: AuxiliaryEntityFragment[];
}

export interface GdArtifact {
  diagnostic_graph_ref: string;
  diagnostic_graph_version: string;
  entities: AuxiliaryEntityFragment[];
}

export type AuxiliaryLoadError = { code: 'UNSUPPORTED_SHAPE'; message: string; details: string[] };
export type AuxiliaryLoadResult<T> = { ok: true; artifact: T } | { ok: false; error: AuxiliaryLoadError };

export type AuxiliaryArtifactState<T> =
  | { status: 'NOT_LOADED' }
  | { status: 'LOADED_COMPATIBLE'; artifact: T; fileName?: string }
  | { status: 'LOADED_MISMATCH'; artifact: T; fileName?: string; expectedRef: string; expectedVersion: string }
  | { status: 'LOAD_ERROR'; error: AuxiliaryLoadError; previous?: Exclude<AuxiliaryArtifactState<T>, { status: 'NOT_LOADED' | 'LOAD_ERROR' }> };

export interface AuxiliaryResolvedEntity {
  artifact: AuxiliaryArtifactKind;
  id: string;
  kind?: string;
  label?: string;
  text?: string;
  artifactRef: string;
  artifactVersion: string;
  raw: AuxiliaryEntityFragment;
}

export interface AuxiliaryEntityIndex {
  gi: Record<string, AuxiliaryResolvedEntity[]>;
  gd: Record<string, AuxiliaryResolvedEntity[]>;
  mismatchGi: Record<string, true>;
  mismatchGd: Record<string, true>;
}

export interface DiagnosticAuxiliaryContext {
  gi: AuxiliaryArtifactState<GiArtifact>;
  gd: AuxiliaryArtifactState<GdArtifact>;
  index: AuxiliaryEntityIndex;
}

export type ReferenceResolution =
  | { status: 'RESOLVED'; ref: string; artifact: AuxiliaryArtifactKind; entity: AuxiliaryResolvedEntity }
  | { status: 'UNRESOLVED'; ref: string }
  | { status: 'AMBIGUOUS'; ref: string; matches: AuxiliaryResolvedEntity[] }
  | { status: 'AUXILIARY_MISMATCH'; ref: string; artifacts: AuxiliaryArtifactKind[] };
