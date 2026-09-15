import type { CanonicalRegistryEntry } from './registryTypes';

export const CANONICAL_ENTITY_IDS = [
  'ENT-001', 'ENT-002', 'ENT-003', 'ENT-004', 'ENT-005', 'ENT-006', 'ENT-007', 'ENT-008', 'ENT-009',
  'ENT-010', 'ENT-011', 'ENT-012', 'ENT-013', 'ENT-014', 'ENT-015', 'ENT-016', 'ENT-017', 'ENT-018',
  'ENT-019', 'ENT-020', 'ENT-021', 'ENT-022', 'ENT-023', 'ENT-024', 'ENT-025', 'ENT-026', 'ENT-027',
  'ENT-028', 'ENT-029', 'ENT-030', 'ENT-031', 'ENT-032', 'ENT-033', 'ENT-034', 'ENT-035', 'ENT-036',
  'ENT-037', 'ENT-038', 'ENT-039',
] as const;

export type CanonicalEntityType = typeof CANONICAL_ENTITY_IDS[number];
export type CanonicalEntityRegistryEntry = CanonicalRegistryEntry<CanonicalEntityType>;

const namedEntries: Readonly<Partial<Record<CanonicalEntityType, Pick<CanonicalEntityRegistryEntry, 'canonicalName' | 'description'>>>> = {
  'ENT-006': { description: 'Historical tombstone; not instantiable in new graphs.' },
  'ENT-007': { description: 'Historical tombstone; not instantiable in new graphs.' },
  'ENT-011': { canonicalName: 'CLAIM', description: 'Claim entity; distinct from an inferential transition.' },
  'ENT-039': { canonicalName: 'INFERENCE_STEP', description: 'Explicit inferential transition; not a claim.' },
};

export const CANONICAL_ENTITY_REGISTRY: readonly CanonicalEntityRegistryEntry[] = Object.freeze(
  CANONICAL_ENTITY_IDS.map(id => Object.freeze({
    id,
    status: id === 'ENT-006' || id === 'ENT-007' ? 'tombstone' as const : 'active' as const,
    ...namedEntries[id],
  })),
);

const entityById: Readonly<Partial<Record<string, CanonicalEntityRegistryEntry>>> = Object.freeze(
  Object.fromEntries(CANONICAL_ENTITY_REGISTRY.map(entry => [entry.id, entry])),
);

export function canonicalEntitySemantics(canonicalType: string): CanonicalEntityRegistryEntry | undefined {
  return entityById[canonicalType];
}

