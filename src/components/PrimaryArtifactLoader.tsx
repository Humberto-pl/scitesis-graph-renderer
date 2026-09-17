import type { ReactNode } from 'react';
import { JsonFileInput, type JsonFileError } from './JsonFileInput';

export type PrimaryArtifactKind = 'LEGACY_CONFIRMED_SIMULATED_GRAPH' | 'DIAGNOSTIC_OUTPUT';
export type PrimaryImportError = JsonFileError | { code: string; message: string; details?: string[] };

const labels: Record<PrimaryArtifactKind, string> = {
  LEGACY_CONFIRMED_SIMULATED_GRAPH: 'Cargar Legacy artifact',
  DIAGNOSTIC_OUTPUT: 'Cargar Diagnostic Output',
};

/** Routes an explicitly selected primary role; it deliberately knows no artifact contract. */
export function PrimaryArtifactLoader({ kind, onJson, onParseError, error }: {
  kind: PrimaryArtifactKind;
  onJson: (value: unknown, fileName: string) => void;
  onParseError: (error: JsonFileError) => void;
  error?: PrimaryImportError;
}) {
  const details: ReactNode = error?.details?.length ? <ul>{error.details.map((detail, index) => <li key={`${index}-${detail}`}>{detail}</li>)}</ul> : null;
  return <section className="artifact-loader" aria-label={`Importar ${labels[kind]}`}>
    <JsonFileInput label={labels[kind]} onJson={onJson} onError={onParseError}>{labels[kind]}</JsonFileInput>
    <span className="local-processing">Procesamiento local · PRIMARY</span>
    {error && <div role="alert"><strong>{error.code}</strong><p>{error.message}</p>{details}</div>}
  </section>;
}
