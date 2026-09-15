import type { CanonicalSimulatorGraphViewModel } from './types';

export type CanonicalFilterDimension =
  | { readonly mode: 'all' }
  | { readonly mode: 'selected'; readonly values: ReadonlySet<string> };

export interface CanonicalVisibilityFilterState {
  readonly entityTypes: CanonicalFilterDimension;
  readonly relationTypes: CanonicalFilterDimension;
  readonly epistemicPlanes: CanonicalFilterDimension;
  readonly reviewStates: CanonicalFilterDimension;
  readonly explicitnessValues: CanonicalFilterDimension;
}

export interface AvailableCanonicalFilters {
  readonly entityTypes: readonly string[];
  readonly relationTypes: readonly string[];
  readonly epistemicPlanes: readonly string[];
  readonly reviewStates: readonly string[];
  readonly explicitnessValues: readonly string[];
}

export interface CanonicalVisibility {
  readonly visibleNodeIds: ReadonlySet<string>;
  readonly visibleEdgeIds: ReadonlySet<string>;
}

const ALL: CanonicalFilterDimension = Object.freeze({ mode: 'all' });

export function resetCanonicalFilters(): CanonicalVisibilityFilterState {
  return {
    entityTypes: ALL,
    relationTypes: ALL,
    epistemicPlanes: ALL,
    reviewStates: ALL,
    explicitnessValues: ALL,
  };
}

export function isCanonicalFilterActive(filters: CanonicalVisibilityFilterState): boolean {
  return Object.values(filters).some(dimension => dimension.mode === 'selected');
}

const matches = (dimension: CanonicalFilterDimension, value: string | null | undefined): boolean =>
  dimension.mode === 'all' || (value != null && dimension.values.has(value));

const sortedValues = (values: Iterable<string | null | undefined>): string[] =>
  [...new Set([...values].filter((value): value is string => value != null))].sort((a, b) => a.localeCompare(b));

/** Derives only values instantiated by the current full ViewModel; it is not an ontology source. */
export function deriveAvailableCanonicalFilters(model: CanonicalSimulatorGraphViewModel): AvailableCanonicalFilters {
  return {
    entityTypes: sortedValues(model.nodes.map(node => node.canonical_type)),
    relationTypes: sortedValues(model.edges.map(edge => edge.canonical_type)),
    epistemicPlanes: sortedValues(model.nodes.map(node => node.epistemic_plane)),
    reviewStates: sortedValues([
      ...model.nodes.map(node => node.review_state),
      ...model.edges.map(edge => edge.review_state),
    ]),
    explicitnessValues: sortedValues([
      ...model.nodes.map(node => node.explicitness),
      ...model.edges.map(edge => edge.explicitness),
    ]),
  };
}

/**
 * Computes presentation-only visibility. Review state and explicitness apply literally to both
 * nodes and edges. Epistemic plane applies only to nodes. Missing/null values never match an
 * active selection. The full model and artifact-owned values are never changed.
 */
export function computeCanonicalVisibility(
  model: CanonicalSimulatorGraphViewModel,
  filters: CanonicalVisibilityFilterState,
): CanonicalVisibility {
  const visibleNodeIds = new Set(model.nodes.filter(node =>
    matches(filters.entityTypes, node.canonical_type)
    && matches(filters.epistemicPlanes, node.epistemic_plane)
    && matches(filters.reviewStates, node.review_state)
    && matches(filters.explicitnessValues, node.explicitness),
  ).map(node => node.id));

  const visibleEdgeIds = new Set(model.edges.filter(edge =>
    visibleNodeIds.has(edge.source)
    && visibleNodeIds.has(edge.target)
    && matches(filters.relationTypes, edge.canonical_type)
    && matches(filters.reviewStates, edge.review_state)
    && matches(filters.explicitnessValues, edge.explicitness),
  ).map(edge => edge.id));

  return { visibleNodeIds, visibleEdgeIds };
}
