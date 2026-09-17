import { loadCanonicalArtifact, type ArtifactLoadError } from '../import/canonicalArtifactLoader';
import type { ConfirmedSimulatedGraphArtifact } from '../graph/types';
import { JsonFileInput, MAX_JSON_FILE_BYTES, type JsonFileError } from './JsonFileInput';

export const MAX_ARTIFACT_FILE_BYTES = MAX_JSON_FILE_BYTES;
export type ImportError = ArtifactLoadError | JsonFileError | { code: 'ADAPTER_REJECTED_ARTIFACT'; message: string; details?: string[] };

/** Backward-compatible legacy loader. The shared input parses; only this wrapper invokes the legacy contract. */
export function ArtifactFileLoader({ onLoad, onError, error }: { onLoad: (artifact: ConfirmedSimulatedGraphArtifact, name: string) => void; onError: (error: ImportError) => void; error?: ImportError }) {
  const load = (value: unknown, fileName: string) => {
    const result = loadCanonicalArtifact(value);
    if (result.ok) onLoad(result.artifact, fileName);
    else onError(result.error);
  };
  return <section className="artifact-loader" aria-label="Importar artifact">
    <JsonFileInput label="Cargar artifact JSON" onJson={load} onError={error => onError(error)}>Cargar JSON</JsonFileInput>
    <span className="local-processing">Procesamiento local</span>
    {error && <div role="alert"><strong>{error.code}</strong><p>{error.message}</p>{error.details?.length ? <ul>{error.details.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : null}</div>}
  </section>;
}
