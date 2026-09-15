/**
 * Literal, deterministic presentation for artifact-owned metadata.
 * Only an absent property (`undefined`) is omitted; null and other JSON values
 * remain visible and are never completed or semantically normalized.
 */
export function artifactValue(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (value === null || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return stableJson(value);
}

export function provenanceValue(value: unknown): string | undefined {
  return artifactValue(value);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, nestedValue: unknown) => {
    if (!nestedValue || Array.isArray(nestedValue) || typeof nestedValue !== 'object') return nestedValue;
    return Object.fromEntries(Object.entries(nestedValue as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)));
  }, 2);
}
