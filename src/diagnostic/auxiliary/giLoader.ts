import { readEntities, record, shapeError } from './loaderUtils';
import { loadGiGraphContract, type GiGraphContract, type GiGraphContractResult } from './giGraphContract';
import type { AuxiliaryLoadResult, GiArtifact } from './types';

export type LoadedGiArtifact =
  | { profile: 'FULL_GI'; artifact: GiGraphContract }
  | { profile: 'MINIMAL_AUXILIARY_GI'; artifact: GiArtifact };

export interface GiSlotLoadError {
  code: 'INVALID_GI_ARTIFACT';
  message: string;
  details: string[];
}

export type GiSlotLoadResult =
  | { ok: true; artifact: LoadedGiArtifact }
  | { ok: false; error: GiSlotLoadError };

/** Full G_I file boundary used by the application import flow. */
export function loadFullGiArtifact(input: unknown): GiGraphContractResult {
  return loadGiGraphContract(input);
}

/** Read-only adaptation to the stabilized exact-reference boundary. */
export function asGiAuxiliaryArtifact(artifact: GiGraphContract): GiArtifact {
  return artifact;
}

export function isFullGiArtifact(loaded: LoadedGiArtifact): loaded is Extract<LoadedGiArtifact, { profile: 'FULL_GI' }> {
  return loaded.profile === 'FULL_GI';
}

export function giArtifactForAuxiliary(loaded: LoadedGiArtifact): GiArtifact {
  return isFullGiArtifact(loaded) ? asGiAuxiliaryArtifact(loaded.artifact) : loaded.artifact;
}

/** Minimal read boundary; this is deliberately not a complete G_I schema. */
export function loadGiArtifact(input: unknown): AuxiliaryLoadResult<GiArtifact> {
  const details: string[] = [];
  if (!record(input)) return { ok: false, error: shapeError(['root must be an object.']) };
  if (typeof input.graph_ref !== 'string' || input.graph_ref.length === 0) details.push('graph_ref must be a non-empty string.');
  if (typeof input.graph_version !== 'string' || input.graph_version.length === 0) details.push('graph_version must be a non-empty string.');
  const entities = readEntities(input.entities, details);
  if (!entities) return { ok: false, error: shapeError(details) };
  return { ok: true, artifact: { graph_ref: input.graph_ref as string, graph_version: input.graph_version as string, entities } };
}

/** Loads either supported profile within the explicitly selected G_I role. */
export function loadGiSlotArtifact(input: unknown): GiSlotLoadResult {
  const full = loadFullGiArtifact(input);
  if (full.ok) return { ok: true, artifact: { profile: 'FULL_GI', artifact: full.artifact } };

  const minimal = loadGiArtifact(input);
  if (minimal.ok) return { ok: true, artifact: { profile: 'MINIMAL_AUXILIARY_GI', artifact: minimal.artifact } };

  return {
    ok: false,
    error: {
      code: 'INVALID_GI_ARTIFACT',
      message: 'El artifact no cumple el perfil G_I completo ni el perfil auxiliar mínimo.',
      details: [
        ...full.error.details.map(detail => `FULL_GI: ${detail}`),
        ...minimal.error.details.map(detail => `MINIMAL_AUXILIARY_GI: ${detail}`),
      ],
    },
  };
}
