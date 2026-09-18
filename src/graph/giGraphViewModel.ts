import type {
  GiGraphContract,
  GiGraphEntity,
  GiGraphRelation,
  GiInferenceStep,
  GiPremiseGroup,
} from '../diagnostic/auxiliary/giGraphContract';

/** A presentation-neutral projection of one materialized G_I entity. */
export interface GiGraphNode extends Readonly<GiGraphEntity> {
  readonly id: string;
}

/** A presentation-neutral projection of one materialized G_I relation. */
export interface GiGraphEdge extends Readonly<GiGraphRelation> {
  readonly id: string;
}

export interface GiGraphViewModelMetadata {
  readonly premiseGroups: readonly GiPremiseGroup[];
  readonly inferenceSteps: readonly GiInferenceStep[];
  readonly referenceBindings: readonly unknown[];
  readonly ontologyGaps: readonly unknown[];
  readonly projectionGaps: readonly unknown[];
  readonly validation: Readonly<Record<string, unknown>> | undefined;
  readonly artifactMetadata: Readonly<Record<string, unknown>> | undefined;
  /** Compatible root fields not declared by GiGraphContract, retained verbatim. */
  readonly extensions: Readonly<Record<string, unknown>>;
}

/**
 * Structural G_I view model. It contains no layout or diagnostic state and its
 * nodes and edges correspond only to materialized entities and relations.
 */
export interface GiGraphViewModel {
  /** Stable structural identity; currently the exact canonical graph_ref. */
  readonly graphId: string;
  readonly graphRef: string;
  readonly graphVersion: string;
  readonly nodes: readonly GiGraphNode[];
  readonly edges: readonly GiGraphEdge[];
  readonly metadata: GiGraphViewModelMetadata;
}

/**
 * Projects an already validated FULL_GI contract without repairing, deriving,
 * or reordering its structure. Cloning separates later presentation work from
 * the validated input while retaining compatible record extensions.
 */
export function buildGiGraphViewModel(artifact: GiGraphContract): GiGraphViewModel {
  const nodes = artifact.entities.map(entity => structuredClone(entity) as GiGraphNode);
  const edges = artifact.relations.map(relation => structuredClone(relation) as GiGraphEdge);
  const extensions = structuredClone(artifact) as Record<string, unknown>;
  for (const key of [
    'graph_ref', 'graph_version', 'entities', 'relations', 'premise_groups', 'inference_steps',
    'reference_bindings', 'ontology_gaps', 'projection_gaps', 'validation', 'metadata',
  ]) delete extensions[key];

  return {
    graphId: artifact.graph_ref,
    graphRef: artifact.graph_ref,
    graphVersion: artifact.graph_version,
    nodes,
    edges,
    metadata: {
      premiseGroups: structuredClone(artifact.premise_groups ?? []),
      inferenceSteps: structuredClone(artifact.inference_steps ?? []),
      referenceBindings: structuredClone(artifact.reference_bindings ?? []),
      ontologyGaps: structuredClone(artifact.ontology_gaps ?? []),
      projectionGaps: structuredClone(artifact.projection_gaps ?? []),
      validation: artifact.validation === undefined ? undefined : structuredClone(artifact.validation),
      artifactMetadata: artifact.metadata === undefined ? undefined : structuredClone(artifact.metadata),
      extensions,
    },
  };
}
