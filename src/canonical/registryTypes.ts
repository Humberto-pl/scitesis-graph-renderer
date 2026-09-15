export type CanonicalEntityType = 'ENT-001' | 'ENT-002' | 'ENT-003' | 'ENT-004' | 'ENT-005' | 'ENT-006' | 'ENT-007' | 'ENT-008' | 'ENT-009' | 'ENT-010' | 'ENT-011' | 'ENT-012' | 'ENT-013' | 'ENT-014' | 'ENT-015' | 'ENT-016' | 'ENT-017' | 'ENT-018' | 'ENT-019' | 'ENT-020' | 'ENT-021' | 'ENT-022' | 'ENT-023' | 'ENT-024' | 'ENT-025' | 'ENT-026' | 'ENT-027' | 'ENT-028' | 'ENT-029' | 'ENT-030' | 'ENT-031' | 'ENT-032' | 'ENT-033' | 'ENT-034' | 'ENT-035' | 'ENT-036' | 'ENT-037' | 'ENT-038' | 'ENT-039';
export type CanonicalRelationType = 'REL-001' | 'REL-002' | 'REL-003' | 'REL-004' | 'REL-005' | 'REL-006' | 'REL-007' | 'REL-008' | 'REL-009' | 'REL-010' | 'REL-011' | 'REL-012' | 'REL-013' | 'REL-014' | 'REL-015' | 'REL-016' | 'REL-017' | 'REL-018' | 'REL-019' | 'REL-020' | 'REL-021' | 'REL-022' | 'REL-023' | 'REL-024' | 'REL-025' | 'REL-026' | 'REL-027' | 'REL-028' | 'REL-029' | 'REL-030' | 'REL-031' | 'REL-032' | 'REL-033' | 'REL-034' | 'REL-035' | 'REL-036' | 'REL-037' | 'REL-038' | 'REL-039' | 'REL-040' | 'REL-041' | 'REL-042' | 'REL-043' | 'REL-044' | 'REL-045' | 'REL-046' | 'REL-047' | 'REL-048' | 'REL-049' | 'REL-050' | 'REL-051' | 'REL-052' | 'REL-053' | 'REL-054' | 'REL-055' | 'REL-056' | 'REL-057' | 'REL-058' | 'REL-059' | 'REL-060' | 'REL-061' | 'REL-062' | 'REL-063' | 'REL-064' | 'REL-065' | 'REL-066' | 'REL-067' | 'REL-068' | 'REL-069' | 'REL-070' | 'REL-071' | 'REL-072' | 'REL-073' | 'REL-074';

/** Simulator reachability is descriptive, non-canonical metadata from SPEC v0.3 §3. */
export type SimulatorScope =
  | 'SEMANTICALLY_INSTANTIABLE'
  | 'KNOWN_DOWNSTREAM'
  | 'CONDITIONAL'
  | 'TOMBSTONE';

export interface CanonicalEntityDefinition {
  readonly id: CanonicalEntityType;
  readonly canonicalType: CanonicalEntityType;
  readonly canonicalName: string;
  readonly description: string;
  readonly lifecycle?: 'HISTORICAL_TOMBSTONE';
  readonly simulatorScope: SimulatorScope;
  readonly subtypes?: readonly string[];
}

export interface CanonicalRelationDefinition {
  readonly id: CanonicalRelationType;
  readonly canonicalType: CanonicalRelationType;
  readonly canonicalName: string;
  readonly description: string;
  readonly lifecycle?: 'HISTORICAL_TOMBSTONE';
}
