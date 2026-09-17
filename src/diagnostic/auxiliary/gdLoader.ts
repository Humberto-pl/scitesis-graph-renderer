import { readEntities, record, shapeError } from './loaderUtils';
import type { AuxiliaryLoadResult, GdArtifact } from './types';

/** Minimal read boundary; this is deliberately not a complete G_D schema. */
export function loadGdArtifact(input: unknown): AuxiliaryLoadResult<GdArtifact> {
  const details: string[] = [];
  if (!record(input)) return { ok: false, error: shapeError(['root must be an object.']) };
  if (typeof input.diagnostic_graph_ref !== 'string' || input.diagnostic_graph_ref.length === 0) details.push('diagnostic_graph_ref must be a non-empty string.');
  if (typeof input.diagnostic_graph_version !== 'string' || input.diagnostic_graph_version.length === 0) details.push('diagnostic_graph_version must be a non-empty string.');
  const entities = readEntities(input.entities, details);
  if (!entities) return { ok: false, error: shapeError(details) };
  return { ok: true, artifact: { diagnostic_graph_ref: input.diagnostic_graph_ref as string, diagnostic_graph_version: input.diagnostic_graph_version as string, entities } };
}
