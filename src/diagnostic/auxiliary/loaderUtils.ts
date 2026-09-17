import type { AuxiliaryEntityFragment, AuxiliaryLoadError } from './types';

export const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export function readEntities(value: unknown, details: string[]): AuxiliaryEntityFragment[] | undefined {
  if (!Array.isArray(value)) { details.push('entities must be an array.'); return undefined; }
  const entities: AuxiliaryEntityFragment[] = [];
  value.forEach((item, index) => {
    if (!record(item) || typeof item.id !== 'string' || item.id.length === 0) { details.push(`entities[${index}].id must be a non-empty string.`); return; }
    for (const key of ['canonical_type', 'type_id', 'label', 'text']) if (key in item && typeof item[key] !== 'string') details.push(`entities[${index}].${key} must be a string when present.`);
    entities.push(structuredClone(item) as AuxiliaryEntityFragment);
  });
  return details.length === 0 ? entities : undefined;
}

export const shapeError = (details: string[]): AuxiliaryLoadError => ({ code: 'UNSUPPORTED_SHAPE', message: 'El artifact no cumple la forma auxiliar mínima soportada.', details });
