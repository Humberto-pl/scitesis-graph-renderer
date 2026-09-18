import type { AuxiliaryArtifactKind, AuxiliaryLoadError } from '../diagnostic/auxiliary/types';
import type { GiGraphContractError } from '../diagnostic/auxiliary/giGraphContract';
import { JsonFileInput, type JsonFileError } from './JsonFileInput';

export type AuxiliaryImportError = AuxiliaryLoadError | GiGraphContractError | JsonFileError;

export function AuxiliaryArtifactLoader({ kind, onJson, onParseError, error }: {
  kind: AuxiliaryArtifactKind;
  onJson: (value: unknown, fileName: string) => void;
  onParseError: (error: JsonFileError) => void;
  error?: AuxiliaryImportError;
}) {
  const label = `Cargar G_${kind === 'GI' ? 'I' : 'D'}`;
  return <div className="auxiliary-loader">
    <JsonFileInput label={label} onJson={onJson} onError={onParseError}>{label}</JsonFileInput>
    {error && <div role="alert"><strong>{error.code}</strong> {error.message}</div>}
  </div>;
}
