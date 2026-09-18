import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import fixture from '../diagnostic/auxiliary/fixtures/gi-full-valid.json';
import { loadGiGraphContract } from '../diagnostic/auxiliary/giGraphContract';
import { adaptGiGraphForRender } from '../graph/giGraphRenderAdapter';
import { buildGiGraphViewModel } from '../graph/giGraphViewModel';
import { GiStructuralGraphRenderer } from './GiStructuralGraphRenderer';

function model() {
  const loaded = loadGiGraphContract(structuredClone(fixture));
  if (!loaded.ok) throw new Error(loaded.error.details.join('\n'));
  return adaptGiGraphForRender(buildGiGraphViewModel(loaded.artifact));
}

describe('GiStructuralGraphRenderer', () => {
  it('exposes every materialized node and edge without metadata topology', () => {
    const value = model();
    render(<GiStructuralGraphRenderer model={value} />);
    expect(screen.getAllByRole('button', { name: /Inspeccionar entidad/ })).toHaveLength(value.nodes.length);
    expect(screen.getAllByRole('button', { name: /Inspeccionar relación/ })).toHaveLength(value.edges.length);
    expect(screen.getByRole('status')).toHaveTextContent('4/4 nodos · 3/3 relaciones');
  });

  it('inspects literal entity, inference step, and premise group fields without adding topology', () => {
    const value = model();
    render(<GiStructuralGraphRenderer model={value} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad E1' }));
    const inspector = screen.getByRole('complementary', { name: 'Inspector estructural G_I' });
    expect(within(inspector).getByText('Premise one')).toBeInTheDocument();
    expect(within(inspector).getByText('Inference step · I1')).toBeInTheDocument();
    expect(within(inspector).getByText('Premise group · PG1')).toBeInTheDocument();
    expect(value.nodes).toHaveLength(4);
    expect(value.edges).toHaveLength(3);
  });

  it('inspects an edge and applies visual filters and depth-one focus without mutating the model', () => {
    const value = model();
    const before = structuredClone(value);
    render(<GiStructuralGraphRenderer model={value} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar relación R1' }));
    expect(screen.getByRole('complementary')).toHaveTextContent('E1');
    expect(screen.getByRole('complementary')).toHaveTextContent('I1');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar entidad E1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enfocar nodo seleccionado' }));
    expect(screen.getByRole('status')).toHaveTextContent('2/4 nodos · 1/3 relaciones');
    fireEvent.click(screen.getByText('Filtros estructurales'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'premise' }));
    expect(screen.getByRole('status')).toHaveTextContent('1/4 nodos · 0/3 relaciones');
    expect(value).toEqual(before);
  });

  it('states mismatch and absence of a diagnostic overlay explicitly', () => {
    render(<GiStructuralGraphRenderer model={model()} mismatch />);
    expect(screen.getByText(/sin overlay diagnóstico/)).toBeInTheDocument();
    expect(screen.getByText(/no coincide con el Diagnostic Output activo/)).toBeInTheDocument();
  });
});
