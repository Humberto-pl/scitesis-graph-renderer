import { MarkerType } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { fixtures } from '../fixtures/cases';
import { buildDiagnosticGraphViewModel } from './adapter';
import { createDisplayEdges } from './flowPresentation';

describe('React Flow edge presentation', () => {
  it('adds a closed target marker to every edge without changing canonical topology', () => {
    const model = buildDiagnosticGraphViewModel(fixtures.C34.candidate, fixtures.C34.diagnosis);
    const before = structuredClone(model);
    const displayed = createDisplayEdges(model.edges, new Set(model.nodes.map(node => node.id)), false);

    expect(displayed).toHaveLength(model.edges.length);
    displayed.forEach((edge, index) => {
      expect(edge.markerEnd).toEqual({ type: MarkerType.ArrowClosed });
      expect({ id: edge.id, source: edge.source, target: edge.target }).toEqual({
        id: model.edges[index].id,
        source: model.edges[index].source,
        target: model.edges[index].target,
      });
    });
    expect(model).toEqual(before);
  });
});
