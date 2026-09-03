# SciTesis Graph Renderer v0.1

Herramienta interna React/TypeScript para inspeccionar `Candidate + Diagnosis`. La transformación pura (`buildDiagnosticGraphViewModel`) no depende de React Flow; el layout determinista y la UI son capas separadas. Los fixtures de `src/fixtures` son exclusivamente demostrativos/de prueba y no reemplazan artefactos canónicos.

## Mapping del ViewModel

- `canonicalId` corresponde al `entityId` canónico de Candidate/Diagnosis y nunca es un ID inventado para la UI.
- `state` corresponde a `defendibilityState`.
- `gravity` corresponde a `severity`.
- `maximumDefendableClaim` conserva la formulación textual disponible, mientras que `isMaximumDefendable` marca estructural e inequívocamente el nodo que representa ese máximo defendible.

## Uso

```sh
npm install
npm run dev
```

## Contrato de entrada

El renderer consume el contrato canónico de `Candidate Schema v0.8` y `Diagnosis` sin alterar su semántica.

Para claims, la composición canónica se representa mediante:

- `composition_type`: `ATOMIC | COMPOSITE_SEPARABLE | COMPOSITE_INSEPARABLE`
- `subclaims`: componentes explícitos del claim cuando corresponde
- `aggregation_policy`: `NONE | COMPONENTWISE_RECOVERABLE`

Solo un claim con `composition_type: COMPOSITE_SEPARABLE` habilita nodos `SUBCLAIM` y relaciones `DECOMPOSES_TO`. Los claims `ATOMIC` y `COMPOSITE_INSEPARABLE` permanecen indivisibles.

La compatibilidad con Candidate v0.7 se mantiene para claims simples sin estos campos opcionales.
