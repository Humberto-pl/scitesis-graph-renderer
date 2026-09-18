import { readEntities, record, shapeError } from './loaderUtils';
import { loadGiGraphContract, type GiGraphContract, type GiGraphContractResult } from './giGraphContract';
import type { AuxiliaryLoadResult, GiArtifact } from './types';

/** Full G_I file boundary used by the application import flow. */
export function loadFullGiArtifact(input: unknown): GiGraphContractResult {
  return loadGiGraphContract(input);
}

/** Read-only adaptation to the stabilized exact-reference boundary. */
export function asGiAuxiliaryArtifact(artifact: GiGraphContract): GiArtifact {
  return artifact;
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
