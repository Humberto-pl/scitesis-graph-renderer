import { useState, type ChangeEvent } from 'react';
import type { AuxiliaryArtifactKind, AuxiliaryLoadError } from '../diagnostic/auxiliary/types';

export function AuxiliaryArtifactLoader({ kind, onJson, error }: { kind: AuxiliaryArtifactKind; onJson: (value: unknown, fileName: string) => void; error?: AuxiliaryLoadError }) {
  const [reading, setReading] = useState(false);
  const change = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget, file = input.files?.[0];
    if (!file) return;
    setReading(true);
    try { onJson(JSON.parse(await file.text()) as unknown, file.name); }
    catch { onJson(undefined, file.name); }
    finally { setReading(false); input.value = ''; }
  };
  return <div className="auxiliary-loader"><label className="file-picker">{reading ? 'Cargando…' : `Cargar G_${kind === 'GI' ? 'I' : 'D'}`}<input type="file" accept=".json,application/json" aria-label={`Cargar G_${kind === 'GI' ? 'I' : 'D'}`} onChange={change} disabled={reading} /></label>{error && <div role="alert"><strong>{error.code}</strong> {error.message}</div>}</div>;
}
