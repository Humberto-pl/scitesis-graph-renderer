import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import qualis from '../fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import { ArtifactFileLoader, MAX_ARTIFACT_FILE_BYTES, type ImportError } from './ArtifactFileLoader';

const jsonFile = (name = 'artifact.json', text = JSON.stringify(qualis), size?: number) => ({
  name,
  size: size ?? new TextEncoder().encode(text).length,
  text: vi.fn().mockResolvedValue(text),
});

describe('ArtifactFileLoader', () => {
  it('loads a valid JSON artifact and preserves the filename', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(<ArtifactFileLoader onLoad={onLoad} onError={onError} />);

    const file = jsonFile('qualis.json');
    fireEvent.change(screen.getByLabelText('Cargar artifact JSON'), { target: { files: [file] } });

    await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
    expect(onLoad.mock.calls[0][1]).toBe('qualis.json');
    expect(onError).not.toHaveBeenCalled();
  });

  it('rejects an invalid extension without loading', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(<ArtifactFileLoader onLoad={onLoad} onError={onError} />);

    fireEvent.change(screen.getByLabelText('Cargar artifact JSON'), { target: { files: [jsonFile('artifact.txt')] } });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_EXTENSION' })));
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('rejects a file above the operational size limit without reading or loading it', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    const file = jsonFile('large.json', '{}', MAX_ARTIFACT_FILE_BYTES + 1);
    render(<ArtifactFileLoader onLoad={onLoad} onError={onError} />);

    fireEvent.change(screen.getByLabelText('Cargar artifact JSON'), { target: { files: [file] } });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'FILE_TOO_LARGE' })));
    expect(file.text).not.toHaveBeenCalled();
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('propagates invalid JSON without loading', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(<ArtifactFileLoader onLoad={onLoad} onError={onError} />);

    fireEvent.change(screen.getByLabelText('Cargar artifact JSON'), { target: { files: [jsonFile('broken.json', '{')] } });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_JSON' })));
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('can process the same file again after the input is reset', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(<ArtifactFileLoader onLoad={onLoad} onError={onError} />);
    const input = screen.getByLabelText('Cargar artifact JSON') as HTMLInputElement;
    const file = jsonFile('same.json');

    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(2));
    expect(onError).not.toHaveBeenCalled();
  });

  it('renders structured errors accessibly', () => {
    const error: ImportError = { code: 'SCHEMA_VALIDATION_FAILED', message: 'Invalid artifact', details: ['/case_id: invalid'] };
    render(<ArtifactFileLoader onLoad={vi.fn()} onError={vi.fn()} error={error} />);
    expect(screen.getByRole('alert')).toHaveTextContent('SCHEMA_VALIDATION_FAILED');
    expect(screen.getByRole('alert')).toHaveTextContent('/case_id: invalid');
  });
});
