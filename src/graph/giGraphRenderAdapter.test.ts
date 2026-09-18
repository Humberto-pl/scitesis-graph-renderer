import { describe, expect, it } from 'vitest';
import fixture from '../diagnostic/auxiliary/fixtures/gi-full-valid.json';
import { loadGiGraphContract } from '../diagnostic/auxiliary/giGraphContract';
import { buildGiGraphViewModel } from './giGraphViewModel';
import { adaptGiGraphForRender } from './giGraphRenderAdapter';

function viewModel() {
  const loaded = loadGiGraphContract(structuredClone(fixture));
  if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
  return buildGiGraphViewModel(loaded.artifact);
}

describe('adaptGiGraphForRender', () => {
  it('maps entities and materialized relations 1:1 while adding only render endpoints', () => {
    const vm = viewModel();
    const before = structuredClone(vm);
    const render = adaptGiGraphForRender(vm);
    expect(render.nodes).toHaveLength(vm.nodes.length);
    expect(render.edges).toHaveLength(vm.edges.length);
    expect(render.nodes.map(node => node.id)).toEqual(vm.nodes.map(node => node.id));
    expect(render.edges.map(edge => edge.id)).toEqual(vm.edges.map(edge => edge.id));
    render.edges.forEach((edge, index) => expect(edge).toMatchObject({ source: vm.edges[index].source_id, target: vm.edges[index].target_id, canonicalId: vm.edges[index].id }));
    expect(vm).toEqual(before);
    expect(vm.edges.every(edge => !('source' in edge) && !('target' in edge))).toBe(true);
  });

  it('is deterministic in LR and TB and preserves the original structural records', () => {
    const vm = viewModel();
    expect(adaptGiGraphForRender(vm)).toEqual(adaptGiGraphForRender(vm));
    expect(adaptGiGraphForRender(vm, { direction: 'TB' })).toEqual(adaptGiGraphForRender(vm, { direction: 'TB' }));
    const render = adaptGiGraphForRender(vm);
    expect(render.nodes[0].entity).toBe(vm.nodes[0]);
    expect(render.edges[0].relation).toBe(vm.edges[0]);
    expect(JSON.stringify(render)).not.toMatch(/Def_e|Active_e|breakpoint|downstream|frontier|supportPath/);
  });

  it('does not turn inference steps or premise groups into topology', () => {
    const vm = viewModel();
    const render = adaptGiGraphForRender(vm);
    expect(render.nodes).toHaveLength(fixture.entities.length);
    expect(render.edges).toHaveLength(fixture.relations.length);
    expect(render.metadata.inferenceSteps).toHaveLength(1);
    expect(render.metadata.premiseGroups).toHaveLength(1);
  });
});
