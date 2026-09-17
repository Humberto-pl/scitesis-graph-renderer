import { record } from './loaderUtils';

/**
 * Executable, presentation-neutral contract for a materialized interpreted graph.
 * Unknown fields are intentionally retained so producers can add compatible
 * extensions without this boundary rewriting their artifact.
 */
export interface GiGraphEntity extends Record<string, unknown> {
  id: string;
  canonical_type: string;
  canonical_name?: string;
  subtype?: string | null;
  label?: string;
  text?: string;
  attributes?: Record<string, unknown>;
  discourse_role?: string | null;
  argumentative_role?: string | null;
  epistemic_plane?: string | null;
  explicitness?: string;
  confidence?: unknown;
  review_state?: string;
  functional_relevance?: string;
  projection_status?: string;
  provenance?: unknown[];
  origin?: string;
  version?: unknown;
  iam_source?: unknown;
}

export interface GiGraphRelation extends Record<string, unknown> {
  id: string;
  canonical_type: string;
  canonical_name?: string;
  source_id: string;
  target_id: string;
  attributes?: Record<string, unknown>;
  explicitness?: string;
  confidence?: unknown;
  review_state?: string;
  projection_status?: string;
  provenance?: unknown[];
  origin?: string;
  version?: unknown;
  iam_source?: unknown;
}

export interface GiInferenceStep extends Record<string, unknown> {
  id: string;
  canonical_type: string;
  premise_ids: string[];
  premise_group_ids: string[];
  assumption_ids: string[];
  warrant_assertion_ids: string[];
  backing_ids: string[];
  conclusion_id: string;
  explicitness: string;
  review_state: string;
  provenance: unknown[];
  origin: string;
  version: unknown;
  iam_source: unknown;
}

export interface GiPremiseGroup extends Record<string, unknown> {
  id: string;
  mode: string;
  member_ids: string[];
  target_inference_step_id: string;
  review_state: string;
  provenance: unknown[];
  origin: string;
  version: unknown;
  iam_source: unknown;
}

export interface GiGraphContract extends Record<string, unknown> {
  graph_ref: string;
  graph_version: string;
  entities: GiGraphEntity[];
  relations: GiGraphRelation[];
  premise_groups?: GiPremiseGroup[];
  inference_steps?: GiInferenceStep[];
  reference_bindings?: unknown[];
  ontology_gaps?: unknown[];
  projection_gaps?: unknown[];
  validation?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface GiGraphContractError {
  code: 'INVALID_GI_GRAPH';
  message: string;
  details: string[];
}

export type GiGraphContractResult =
  | { ok: true; artifact: GiGraphContract }
  | { ok: false; error: GiGraphContractError };

const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

function stringArray(value: unknown, path: string, details: string[]): value is string[] {
  if (!Array.isArray(value)) { details.push(`${path} must be an array.`); return false; }
  let valid = true;
  value.forEach((item, index) => {
    if (!nonEmptyString(item)) { details.push(`${path}[${index}] must be a non-empty string.`); valid = false; }
  });
  return valid;
}

function commonOptionalFields(value: Record<string, unknown>, path: string, details: string[]): void {
  for (const key of ['canonical_name', 'label', 'text', 'explicitness', 'review_state', 'projection_status', 'origin']) {
    if (key in value && typeof value[key] !== 'string') details.push(`${path}.${key} must be a string when present.`);
  }
  if ('attributes' in value && !record(value.attributes)) details.push(`${path}.attributes must be an object when present.`);
  if ('provenance' in value && !Array.isArray(value.provenance)) details.push(`${path}.provenance must be an array when present.`);
}

function duplicateIds(items: Array<{ id: string }>, path: string, details: string[]): Set<string> {
  const ids = new Set<string>();
  items.forEach((item, index) => {
    if (ids.has(item.id)) details.push(`${path}[${index}].id duplicates "${item.id}".`);
    ids.add(item.id);
  });
  return ids;
}

/**
 * Validates only declared shape and referential integrity. It neither derives
 * missing topology nor evaluates the semantic correctness of graph content.
 */
export function loadGiGraphContract(input: unknown): GiGraphContractResult {
  const details: string[] = [];
  if (!record(input)) return invalid(['root must be an object.']);
  if (!nonEmptyString(input.graph_ref)) details.push('graph_ref must be a non-empty string.');
  if (!nonEmptyString(input.graph_version)) details.push('graph_version must be a non-empty string.');
  for (const key of ['reference_bindings', 'ontology_gaps', 'projection_gaps']) {
    if (key in input && !Array.isArray(input[key])) details.push(`${key} must be an array when present.`);
  }
  for (const key of ['validation', 'metadata']) {
    if (key in input && !record(input[key])) details.push(`${key} must be an object when present.`);
  }

  const entities: GiGraphEntity[] = [];
  if (!Array.isArray(input.entities)) details.push('entities must be an array.');
  else input.entities.forEach((item, index) => {
    const path = `entities[${index}]`;
    if (!record(item)) { details.push(`${path} must be an object.`); return; }
    if (!nonEmptyString(item.id)) details.push(`${path}.id must be a non-empty string.`);
    if (!nonEmptyString(item.canonical_type)) details.push(`${path}.canonical_type must be a non-empty string.`);
    for (const key of ['subtype', 'discourse_role', 'argumentative_role', 'epistemic_plane']) {
      if (key in item && item[key] !== null && typeof item[key] !== 'string') details.push(`${path}.${key} must be a string or null when present.`);
    }
    if ('functional_relevance' in item && typeof item.functional_relevance !== 'string') details.push(`${path}.functional_relevance must be a string when present.`);
    commonOptionalFields(item, path, details);
    if (nonEmptyString(item.id) && nonEmptyString(item.canonical_type)) entities.push(item as GiGraphEntity);
  });

  const relations: GiGraphRelation[] = [];
  if (!Array.isArray(input.relations)) details.push('relations must be an array.');
  else input.relations.forEach((item, index) => {
    const path = `relations[${index}]`;
    if (!record(item)) { details.push(`${path} must be an object.`); return; }
    for (const key of ['id', 'canonical_type', 'source_id', 'target_id']) if (!nonEmptyString(item[key])) details.push(`${path}.${key} must be a non-empty string.`);
    commonOptionalFields(item, path, details);
    if (nonEmptyString(item.id) && nonEmptyString(item.canonical_type) && nonEmptyString(item.source_id) && nonEmptyString(item.target_id)) relations.push(item as GiGraphRelation);
  });

  const inferenceSteps: GiInferenceStep[] = [];
  if ('inference_steps' in input && !Array.isArray(input.inference_steps)) details.push('inference_steps must be an array when present.');
  else if (Array.isArray(input.inference_steps)) input.inference_steps.forEach((item, index) => {
    const path = `inference_steps[${index}]`;
    if (!record(item)) { details.push(`${path} must be an object.`); return; }
    for (const key of ['id', 'canonical_type', 'conclusion_id', 'explicitness', 'review_state', 'origin']) if (!nonEmptyString(item[key])) details.push(`${path}.${key} must be a non-empty string.`);
    for (const key of ['premise_ids', 'premise_group_ids', 'assumption_ids', 'warrant_assertion_ids', 'backing_ids']) stringArray(item[key], `${path}.${key}`, details);
    if (!Array.isArray(item.provenance)) details.push(`${path}.provenance must be an array.`);
    for (const key of ['version', 'iam_source']) if (!(key in item)) details.push(`${path}.${key} is required.`);
    if (nonEmptyString(item.id)) inferenceSteps.push(item as GiInferenceStep);
  });

  const premiseGroups: GiPremiseGroup[] = [];
  if ('premise_groups' in input && !Array.isArray(input.premise_groups)) details.push('premise_groups must be an array when present.');
  else if (Array.isArray(input.premise_groups)) input.premise_groups.forEach((item, index) => {
    const path = `premise_groups[${index}]`;
    if (!record(item)) { details.push(`${path} must be an object.`); return; }
    for (const key of ['id', 'mode', 'target_inference_step_id', 'review_state', 'origin']) if (!nonEmptyString(item[key])) details.push(`${path}.${key} must be a non-empty string.`);
    stringArray(item.member_ids, `${path}.member_ids`, details);
    if (!Array.isArray(item.provenance)) details.push(`${path}.provenance must be an array.`);
    for (const key of ['version', 'iam_source']) if (!(key in item)) details.push(`${path}.${key} is required.`);
    if (nonEmptyString(item.id)) premiseGroups.push(item as GiPremiseGroup);
  });

  const entityIds = duplicateIds(entities, 'entities', details);
  duplicateIds(relations, 'relations', details);
  const inferenceIds = duplicateIds(inferenceSteps, 'inference_steps', details);
  const premiseGroupIds = duplicateIds(premiseGroups, 'premise_groups', details);
  relations.forEach((relation, index) => {
    if (!entityIds.has(relation.source_id)) details.push(`relations[${index}].source_id references missing entity "${relation.source_id}".`);
    if (!entityIds.has(relation.target_id)) details.push(`relations[${index}].target_id references missing entity "${relation.target_id}".`);
  });
  inferenceSteps.forEach((step, index) => {
    for (const field of ['premise_ids', 'assumption_ids', 'warrant_assertion_ids', 'backing_ids'] as const) {
      if (Array.isArray(step[field])) step[field].forEach(id => { if (!entityIds.has(id)) details.push(`inference_steps[${index}].${field} references missing entity "${id}".`); });
    }
    if (Array.isArray(step.premise_group_ids)) step.premise_group_ids.forEach(id => { if (!premiseGroupIds.has(id)) details.push(`inference_steps[${index}].premise_group_ids references missing premise group "${id}".`); });
    if (nonEmptyString(step.conclusion_id) && !entityIds.has(step.conclusion_id)) details.push(`inference_steps[${index}].conclusion_id references missing entity "${step.conclusion_id}".`);
  });
  premiseGroups.forEach((group, index) => {
    if (Array.isArray(group.member_ids)) group.member_ids.forEach(id => { if (!entityIds.has(id)) details.push(`premise_groups[${index}].member_ids references missing entity "${id}".`); });
    if (nonEmptyString(group.target_inference_step_id) && !inferenceIds.has(group.target_inference_step_id)) details.push(`premise_groups[${index}].target_inference_step_id references missing inference step "${group.target_inference_step_id}".`);
  });

  if (details.length) return invalid(details);
  return { ok: true, artifact: structuredClone(input) as GiGraphContract };
}

function invalid(details: string[]): GiGraphContractResult {
  return { ok: false, error: { code: 'INVALID_GI_GRAPH', message: 'El artifact no cumple el contrato estructural G_I.', details } };
}
