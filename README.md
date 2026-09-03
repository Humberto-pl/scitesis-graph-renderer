# SciTesis Graph Renderer v0.1.1

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

## Interacción visual e invariantes semánticas

La geometría interactiva está deliberadamente separada de la semántica canónica. El layout inicial se calcula de forma determinista para un mismo `GraphViewModel`; sus posiciones se copian a estado efímero de UI y los nodos pueden moverse libremente. **Restablecer layout** recupera esas posiciones deterministas sin recargar los artefactos, cambiar filtros o modificar la selección.

El drag solo actualiza coordenadas `x/y` de presentación: no altera Candidate, Diagnosis, IDs canónicos, tipos, estados, relaciones, rutas de soporte ni el máximo defendible. La conexión manual está deshabilitada, por lo que el renderer continúa siendo un inspector y no un editor semántico.

Las etiquetas amigables de estados, relaciones y clases de nodo forman otra capa pura de presentación. El toggle **Mostrar códigos canónicos** permite añadir los códigos técnicos a la vista y el panel de detalle los conserva siempre; ningún label sustituye enums, `canonicalId` ni valores del dominio.

Al seleccionar un claim o subclaim, el resaltado recorre exclusivamente aristas ya presentes en el `GraphViewModel`. Limpiar la selección o pulsar el fondo restaura la vista completa y no crea inferencias ni relaciones.

Las puntas de flecha expresan únicamente la dirección canónica `source → target` de cada relación, no causalidad. Los nodos `STATE` presentan una etiqueta amigable cuando el código es conocido y conservan un fallback seguro —además del código accesible mediante el toggle y el inspector— para estados futuros.
