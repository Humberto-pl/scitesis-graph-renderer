import { useState, type ChangeEvent, type ReactNode } from 'react';

export const MAX_JSON_FILE_BYTES = 10 * 1024 * 1024;

export type JsonFileError = {
  code: 'INVALID_JSON' | 'INVALID_EXTENSION' | 'FILE_TOO_LARGE' | 'FILE_READ_FAILED';
  message: string;
  details?: string[];
};

/** Reads local JSON only. Contract selection and validation belong to its caller. */
export function JsonFileInput({ label, children, onJson, onError }: {
  label: string;
  children?: ReactNode;
  onJson: (value: unknown, fileName: string) => void;
  onError: (error: JsonFileError, fileName?: string) => void;
}) {
  const [reading, setReading] = useState(false);
  const change = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setReading(true);
    try {
      if (!file.name.toLowerCase().endsWith('.json')) {
        onError({ code: 'INVALID_EXTENSION', message: 'Selecciona un archivo con extensión .json.' }, file.name);
      } else if (file.size > MAX_JSON_FILE_BYTES) {
        onError({ code: 'FILE_TOO_LARGE', message: 'El archivo supera el límite operativo de 10 MB.' }, file.name);
      } else {
        const text = await file.text();
        try { onJson(JSON.parse(text) as unknown, file.name); }
        catch (reason) {
          onError({ code: 'INVALID_JSON', message: 'El archivo no contiene JSON válido.', details: [reason instanceof Error ? reason.message : String(reason)] }, file.name);
        }
      }
    } catch (reason) {
      onError({ code: 'FILE_READ_FAILED', message: 'No se pudo leer el archivo.', details: [reason instanceof Error ? reason.message : String(reason)] }, file.name);
    } finally {
      setReading(false);
      input.value = '';
    }
  };
  return <label className="file-picker">{reading ? 'Cargando…' : children ?? label}<input type="file" accept=".json,application/json" aria-label={label} disabled={reading} onChange={change} /></label>;
}
