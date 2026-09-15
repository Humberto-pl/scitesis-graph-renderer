import { canonicalEntitiesByType, canonicalEntityRegistry } from './canonicalEntityRegistry';
import { canonicalRelationRegistry, canonicalRelationsByType } from './canonicalRelationRegistry';
import type { CanonicalEntityDefinition, CanonicalRelationDefinition } from './registryTypes';

export { canonicalEntitiesByType, canonicalEntityRegistry, canonicalRelationRegistry, canonicalRelationsByType };
export type * from './registryTypes';

export function canonicalEntityDefinition(canonicalType: string): CanonicalEntityDefinition | undefined {
  return canonicalEntitiesByType[canonicalType as keyof typeof canonicalEntitiesByType];
}

export function canonicalRelationDefinition(canonicalType: string): CanonicalRelationDefinition | undefined {
  return canonicalRelationsByType[canonicalType as keyof typeof canonicalRelationsByType];
}

/** Instance names always win; the registry is only a presentation fallback. */
export function canonicalEntityDisplayName(canonicalType: string, instanceName?: string): string {
  return instanceName ?? canonicalEntityDefinition(canonicalType)?.canonicalName ?? canonicalType;
}

/** Instance names always win; the registry is only a presentation fallback. */
export function canonicalRelationDisplayName(canonicalType: string, instanceName?: string): string {
  return instanceName ?? canonicalRelationDefinition(canonicalType)?.canonicalName ?? canonicalType;
}
