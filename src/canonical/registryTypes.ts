export type CanonicalRegistryStatus = 'active' | 'tombstone';

export interface CanonicalRegistryEntry<Id extends string> {
  readonly id: Id;
  readonly status: CanonicalRegistryStatus;
  /** Present only when the local normative inputs available to this package state the name explicitly. */
  readonly canonicalName?: string;
  readonly description?: string;
}

