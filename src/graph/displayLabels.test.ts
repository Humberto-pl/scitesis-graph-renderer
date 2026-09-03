import { describe, expect, it } from 'vitest';
import { edgeDisplayLabel, stateDisplayLabel, withCanonicalCode } from './displayLabels';

describe('display labels', () => {
  it('maps canonical edge codes without changing the code', () => {
    expect(edgeDisplayLabel('SUPPORTS')).toBe('respalda');
    expect(withCanonicalCode(edgeDisplayLabel('SUPPORTS'), 'SUPPORTS', true)).toBe('respalda · SUPPORTS');
  });

  it('maps canonical diagnostic states without changing the code', () => {
    expect(stateDisplayLabel('DEFENDIBLE')).toBe('Defendible');
    expect(withCanonicalCode(stateDisplayLabel('DEFENDIBLE'), 'DEFENDIBLE', true)).toBe('Defendible · DEFENDIBLE');
    expect(stateDisplayLabel('NO_RESPALDADO_POR_DATOS_DEL_ESTUDIO')).toBe('No respaldado por los datos del estudio');
  });
});
