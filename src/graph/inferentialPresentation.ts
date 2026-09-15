import type {
  CanonicalSimulatorGraphViewModel,
  SimulatorGraphEdge,
  SimulatorInferenceStep,
  SimulatorPremiseGroup,
} from './types';

export type InferentialRole = 'PREMISE' | 'WARRANT' | 'BACKING' | 'ASSUMPTION' | 'CONCLUSION';

/** Presentation-only projection of the inferential records already present in the artifact. */
export interface InferenceStepView {
  step: SimulatorInferenceStep;
  premiseGroups: SimulatorPremiseGroup[];
  rolesByEntityId: ReadonlyMap<string, ReadonlySet<InferentialRole>>;
  relations: SimulatorGraphEdge[];
}

const addRole = (roles: Map<string, Set<InferentialRole>>, ids: string[], role: InferentialRole) => {
  ids.forEach(id => {
    const entityRoles = roles.get(id) ?? new Set<InferentialRole>();
    entityRoles.add(role);
    roles.set(id, entityRoles);
  });
};

export function inferenceStepView(
  model: CanonicalSimulatorGraphViewModel,
  stepId: string,
): InferenceStepView | undefined {
  const step = model.metadata.inferenceSteps.find(candidate => candidate.id === stepId);
  if (!step) return undefined;

  const rolesByEntityId = new Map<string, Set<InferentialRole>>();
  addRole(rolesByEntityId, step.premise_ids, 'PREMISE');
  addRole(rolesByEntityId, step.warrant_assertion_ids, 'WARRANT');
  addRole(rolesByEntityId, step.backing_ids, 'BACKING');
  addRole(rolesByEntityId, step.assumption_ids, 'ASSUMPTION');
  addRole(rolesByEntityId, [step.conclusion_id], 'CONCLUSION');

  const inputs = new Set([
    ...step.premise_ids,
    ...step.warrant_assertion_ids,
    ...step.backing_ids,
    ...step.assumption_ids,
  ]);
  const relations = model.edges.filter(edge =>
    (inputs.has(edge.source_id) && edge.target_id === step.id)
      || (edge.source_id === step.id && edge.target_id === step.conclusion_id),
  );

  return {
    step,
    premiseGroups: model.metadata.premiseGroups.filter(group =>
      step.premise_group_ids.includes(group.id) && group.target_inference_step_id === step.id,
    ),
    rolesByEntityId,
    relations,
  };
}

export function inferentialRolesByEntity(
  model: CanonicalSimulatorGraphViewModel,
): ReadonlyMap<string, ReadonlySet<InferentialRole>> {
  const result = new Map<string, Set<InferentialRole>>();
  model.metadata.inferenceSteps.forEach(step => {
    addRole(result, step.premise_ids, 'PREMISE');
    addRole(result, step.warrant_assertion_ids, 'WARRANT');
    addRole(result, step.backing_ids, 'BACKING');
    addRole(result, step.assumption_ids, 'ASSUMPTION');
    addRole(result, [step.conclusion_id], 'CONCLUSION');
  });
  return result;
}
