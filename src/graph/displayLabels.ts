import { DIAGNOSTIC_STATES, type DiagnosticState, type EdgeKind, type GraphNode, type NodeKind } from './types';

const states: Record<DiagnosticState, string> = {
  DEFENDIBLE: 'Defendible',
  DEFENDIBLE_CON_RESTRICCIONES: 'Defendible con restricciones',
  NO_SOSTENIDO_EN_SU_FORMULACION_ACTUAL: 'No se sostiene tal como está formulado',
  NO_RESPALDADO_POR_DATOS_DEL_ESTUDIO: 'No respaldado por los datos del estudio',
  NO_ADJUDICABLE_HASTA_RECONCILIACION: 'No puede evaluarse hasta resolver una contradicción',
  NO_EXIGIBLE_AUN: 'Aún no corresponde exigir esta conclusión',
  JUSTIFICACION_DE_RECOMENDACION_LIMITADA: 'Justificación de recomendación limitada',
  HIPOTESIS_PLAUSIBLE_NO_DEMOSTRADA: 'Hipótesis plausible no demostrada',
};

const relations: Record<EdgeKind, string> = {
  SUPPORTS: 'respalda', DECOMPOSES_TO: 'se descompone en', AGGREGATES_TO: 'contribuye al resultado global',
  MEASURES: 'mide', ESTIMATES: 'estima', TARGETS: 'se dirige a', DEPENDS_ON: 'depende de',
  DERIVED_FROM: 'deriva de', CONTRADICTS: 'contradice', RESTRICTS: 'restringe', REQUIRES: 'requiere',
  FIRES_ON: 'se activa sobre',
};

const nodeKinds: Record<NodeKind, string> = {
  CLAIM: 'Claim', SUBCLAIM: 'Subclaim', EVIDENCE: 'Evidencia', METHOD: 'Método', INSTRUMENT: 'Instrumento',
  SAMPLE: 'Muestra', TEST: 'Prueba', RULE: 'Regla', STATE: 'Estado', REPAIR: 'Reparación', AGGREGATION: 'Agregación',
};

export const stateDisplayLabel = (code: DiagnosticState) => states[code];
export const edgeDisplayLabel = (code: EdgeKind) => relations[code];
export const nodeKindDisplayLabel = (code: NodeKind) => nodeKinds[code];
export const withCanonicalCode = (label: string, code: string, show: boolean) => show ? `${label} · ${code}` : label;

export const isDiagnosticState = (value: unknown): value is DiagnosticState =>
  typeof value === 'string' && (DIAGNOSTIC_STATES as readonly string[]).includes(value);

/** Resolves STATE content for display only; unknown/future values safely retain their canonical text. */
export function nodeDisplayText(node: Pick<GraphNode, 'kind' | 'label' | 'text'>, showCodes: boolean): string {
  const original = node.text ?? node.label;
  if (node.kind !== 'STATE' || !isDiagnosticState(original)) return node.label;
  return withCanonicalCode(stateDisplayLabel(original), original, showCodes);
}
