import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import qualis from './fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';

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
});
