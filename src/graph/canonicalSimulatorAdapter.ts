import type {
  CanonicalSimulatorGraphViewModel,
  ConfirmedSimulatedGraphArtifact,
  GraphOptions,
  SimulatorGraphNode,
} from './types';
import { canonicalEntitySemantics, canonicalRelationSemantics } from '../canonical/canonicalRegistry';

function positionFor(index: number, direction: GraphOptions['direction']): SimulatorGraphNode['position'] {
  return direction === 'TB' ? { x: 0, y: index * 190 } : { x: index * 340, y: 0 };
}

export function buildCanonicalSimulatorGraphViewModel(
  artifact: ConfirmedSimulatedGraphArtifact,
  options: GraphOptions = {},
): CanonicalSimulatorGraphViewModel {
  const entityIds = new Set(artifact.entities.map(entity => entity.id));
  const relationWithMissingEndpoint = artifact.relations.find(
    relation => !entityIds.has(relation.source_id) || !entityIds.has(relation.target_id),
  );

  if (relationWithMissingEndpoint) {
    throw new Error(`Canonical relation ${relationWithMissingEndpoint.id} references a missing endpoint`);
  }

  return {
    graphId: `canonical-simulator:${artifact.case_id}`,
    sourceCaseId: artifact.case_id,
    nodes: artifact.entities.map((entity, index) => ({
      ...entity,
      position: positionFor(index, options.direction ?? 'LR'),
      canonicalSemantics: canonicalEntitySemantics(entity.canonical_type),
    })),
    edges: artifact.relations.map(relation => ({
      ...relation,
      source: relation.source_id,
      target: relation.target_id,
      canonicalSemantics: canonicalRelationSemantics(relation.canonical_type),
    })),
    metadata: {
      adapterVersion: 'canonical-simulator-0.1',
      sourceSchemaVersion: artifact.contract_version,
      sourceArtifactType: artifact.artifact_type,
      generatedDeterministically: true,
      premiseGroups: artifact.premise_groups,
      inferenceSteps: artifact.inference_steps,
    },
  };
}
