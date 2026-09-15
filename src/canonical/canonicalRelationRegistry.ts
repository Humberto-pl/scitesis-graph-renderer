import type { CanonicalRegistryEntry } from './registryTypes';

export const CANONICAL_RELATION_IDS = [
  'REL-001', 'REL-002', 'REL-003', 'REL-004', 'REL-005', 'REL-006', 'REL-007', 'REL-008', 'REL-009',
  'REL-010', 'REL-011', 'REL-012', 'REL-013', 'REL-014', 'REL-015', 'REL-016', 'REL-017', 'REL-018',
  'REL-019', 'REL-020', 'REL-021', 'REL-022', 'REL-023', 'REL-024', 'REL-025', 'REL-026', 'REL-027',
  'REL-028', 'REL-029', 'REL-030', 'REL-031', 'REL-032', 'REL-033', 'REL-034', 'REL-035', 'REL-036',
  'REL-037', 'REL-038', 'REL-039', 'REL-040', 'REL-041', 'REL-042', 'REL-043', 'REL-044', 'REL-045',
  'REL-046', 'REL-047', 'REL-048', 'REL-049', 'REL-050', 'REL-051', 'REL-052', 'REL-053', 'REL-054',
  'REL-055', 'REL-056', 'REL-057', 'REL-058', 'REL-059', 'REL-060', 'REL-061', 'REL-062', 'REL-063',
  'REL-064', 'REL-065', 'REL-066', 'REL-067', 'REL-068', 'REL-069', 'REL-070', 'REL-071', 'REL-072',
  'REL-073', 'REL-074',
] as const;

export type CanonicalRelationType = typeof CANONICAL_RELATION_IDS[number];
export type CanonicalRelationRegistryEntry = CanonicalRegistryEntry<CanonicalRelationType>;

const namedEntries: Readonly<Partial<Record<CanonicalRelationType, Pick<CanonicalRelationRegistryEntry, 'canonicalName' | 'description'>>>> = {
  'REL-019': { canonicalName: 'SUSTENTA', description: 'Specific scientific-support relation, not generic support.' },
  'REL-026': { description: 'Historical tombstone; not instantiable in new graphs.' },
  'REL-029': { canonicalName: 'JUSTIFICA', description: 'Diagnostic/decisional justification.' },
  'REL-055': { canonicalName: 'JUSTIFICA_TEORICAMENTE', description: 'Theoretical justification; distinct from WARRANTS.' },
  'REL-056': { canonicalName: 'APORTA_SOPORTE_EMPIRICO_EXTERNO', description: 'External empirical support; does not make external knowledge study evidence.' },
  'REL-068': { canonicalName: 'WARRANTS', description: 'Inferential warrant relation; distinct from theoretical justification.' },
  'REL-072': { canonicalName: 'REBUTS', description: 'Rebuts an inferential conclusion.' },
  'REL-073': { canonicalName: 'UNDERCUTS', description: 'Undercuts an inferential transition.' },
  'REL-074': { canonicalName: 'UNDERMINES', description: 'Undermines an inferential input.' },
};

export const CANONICAL_RELATION_REGISTRY: readonly CanonicalRelationRegistryEntry[] = Object.freeze(
  CANONICAL_RELATION_IDS.map(id => Object.freeze({
    id,
    status: id === 'REL-026' ? 'tombstone' as const : 'active' as const,
    ...namedEntries[id],
  })),
);

const relationById: Readonly<Partial<Record<string, CanonicalRelationRegistryEntry>>> = Object.freeze(
  Object.fromEntries(CANONICAL_RELATION_REGISTRY.map(entry => [entry.id, entry])),
);

export function canonicalRelationSemantics(canonicalType: string): CanonicalRelationRegistryEntry | undefined {
  return relationById[canonicalType];
}

