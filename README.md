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
