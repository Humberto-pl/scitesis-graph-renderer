import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import qualis from './fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import gi from './diagnostic/auxiliary/fixtures/gi-minimal-compatible.json';
import gd from './diagnostic/auxiliary/fixtures/gd-minimal-compatible.json';
import gdMismatch from './diagnostic/auxiliary/fixtures/gd-mismatch.json';

const artifactFile = (artifact: unknown, name: string) => ({
  name,
  size: 1024,
  text: vi.fn().mockResolvedValue(JSON.stringify(artifact)),
});

describe('App artifact import integration', () => {
  it('offers an explicit canonical Diagnostic Output route while retaining legacy', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    expect(screen.getByTestId('diagnostic-graph-canvas')).toBeInTheDocument();
    expect(screen.getByText('ID: claim-supported')).toBeInTheDocument();
    expect(screen.getByText('ID: step-rich')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('input-1');

    fireEvent.click(screen.getByRole('button', { name: 'Legacy' }));
    expect(screen.getByText('QUALIS · ejemplo incluido')).toBeInTheDocument();
    expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
  });

  it('keeps the previous artifact visible after schema validation fails', async () => {
    render(<App />);
    expect(screen.getByText('QUALIS · ejemplo incluido')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SciTesis · Graph Renderer' })).toBeInTheDocument();
    expect(screen.getByText('Detalles')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargar artifact JSON')).toBeInTheDocument();
    const details = screen.getByText('Detalles').closest('details');
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(screen.getByText('Detalles'));
    expect(details).toHaveAttribute('open');
    expect(screen.getByText('contract_version')).toBeInTheDocument();

    const invalid = { ...qualis, case_id: '' };
    fireEvent.change(screen.getByLabelText('Cargar artifact JSON'), {
      target: { files: [artifactFile(invalid, 'invalid.json')] },
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('SCHEMA_VALIDATION_FAILED'));
    expect(screen.getByText('QUALIS · ejemplo incluido')).toBeInTheDocument();
    expect(screen.getByText(qualis.case_id)).toBeInTheDocument();
  });

  it('replaces the artifact and clears a previous error after a later valid load', async () => {
    render(<App />);
    const input = screen.getByLabelText('Cargar artifact JSON');

    fireEvent.change(input, {
      target: { files: [artifactFile({ ...qualis, case_id: '' }, 'invalid.json')] },
    });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('SCHEMA_VALIDATION_FAILED'));

    const valid = { ...qualis, case_id: 'QUALIS-RELOADED', execution_id: 'EXEC-RELOADED' };
    fireEvent.change(input, { target: { files: [artifactFile(valid, 'valid.json')] } });

    await waitFor(() => expect(screen.getByText('valid.json')).toBeInTheDocument());
    expect(screen.getByText('QUALIS-RELOADED')).toBeInTheDocument();
    expect(screen.getByText('EXEC-RELOADED')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('preserves the previous artifact when schema passes but the adapter rejects a missing endpoint', async () => {
    render(<App />);
    const broken = structuredClone(qualis);
    broken.relations[0].source_id = 'MISSING-ENDPOINT';

    fireEvent.change(screen.getByLabelText('Cargar artifact JSON'), {
      target: { files: [artifactFile(broken, 'missing-endpoint.json')] },
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('ADAPTER_REJECTED_ARTIFACT'));
    expect(screen.getByRole('alert')).toHaveTextContent('missing endpoint');
    expect(screen.getByText('QUALIS · ejemplo incluido')).toBeInTheDocument();
    expect(screen.getByText(qualis.case_id)).toBeInTheDocument();
  });

  it('loads G_I and G_D independently and opens a read-only auxiliary inspector', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    expect(screen.getByLabelText('Cargar G_I')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargar G_D')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(gi, 'gi.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_D'), { target: { files: [artifactFile(gd, 'gd.json')] } });
    await waitFor(() => expect(screen.getAllByText('LOADED_COMPATIBLE')).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: /STEP_TO_TARGET de transition:/ }));
    expect(screen.getByRole('region', { name: 'Provenance refs' })).toHaveTextContent('RESOLVED');
    expect(screen.getByRole('region', { name: 'Provenance refs' })).toHaveTextContent('GI');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar referencia provenance-1' }));
    expect(screen.getByRole('heading', { name: 'AUXILIARY REFERENCE' })).toBeInTheDocument();
    expect(screen.getByText('graph-minimal')).toBeInTheDocument();
    expect(screen.getByText('Explicit structural provenance')).toBeInTheDocument();
    expect(screen.queryByText('ID: claim-extra')).not.toBeInTheDocument();
  });

  it('shows mismatch, keeps literal refs, and removing one auxiliary preserves the other', async () => {
    render(<App />); fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(gi, 'gi.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_D'), { target: { files: [artifactFile(gdMismatch, 'gd-mismatch.json')] } });
    await waitFor(() => expect(screen.getByText('LOADED_MISMATCH')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar trazabilidad del run' }));
    expect(screen.getByRole('region', { name: 'Diagnostic condition refs' })).toHaveTextContent('condition-1');
    expect(screen.getByRole('region', { name: 'Diagnostic condition refs' })).toHaveTextContent('AUXILIARY_MISMATCH');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar G_I' }));
    expect(screen.getByText('G_I: NOT_LOADED')).toBeInTheDocument();
    expect(screen.getByText('LOADED_MISMATCH')).toBeInTheDocument();
    expect(screen.getByText('ID: claim-supported')).toBeInTheDocument();
  });
});
