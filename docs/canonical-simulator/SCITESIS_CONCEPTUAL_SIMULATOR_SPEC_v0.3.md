# SCITESIS CONCEPTUAL SIMULATOR SPEC v0.3

**Estado:** FROZEN / CANONICAL SIMULATOR SPEC v0.3 / CANON-COMPLETE + RELATIONALLY-CLOSED CONCEPTUAL COVERAGE  
**Fecha:** 14 de septiembre de 2026  
**Sustituye para nuevas simulaciones:** `SCITESIS_CONCEPTUAL_SIMULATOR_SPEC_v0.2.md`  
**No reescribe:** simulaciones, golds, diagnósticos ni baselines históricos ya congelados.  
**Freeze declaration:** esta versión queda congelada como especificación normativa del simulador conceptual rico de SciTesis. Cualquier cambio sustantivo posterior deberá realizarse mediante una nueva versión explícita y no por edición silenciosa de v0.3.  

## 0. PROPÓSITO

Esta especificación define el simulador conceptual de SciTesis como una capa IA capaz de **reconocer, proponer, relacionar y someter a adjudicación humana cualquier objeto o relación perteneciente a la arquitectura conceptual canónica vigente**, sin reducir de antemano el vocabulario a un subconjunto conveniente para un caso, un enfoque metodológico o el runtime operacional actual.

Regla maestra de cobertura:

> **El canon se carga completo; la tesis particular instancia solo lo que contiene.**

Por tanto, la ausencia de un tipo o relación en una tesis debe ser un resultado del análisis del documento, nunca una consecuencia de que el simulador desconozca esa parte de la arquitectura.

El simulador sigue terminando **antes del diagnóstico**. Su producto principal es una representación conceptual-semántica suficientemente cerrada, trazable y revisada para alimentar una simulación diagnóstica o una proyección operacional posterior.

### 0.1 Cambio normativo principal de v0.3

v0.3 conserva íntegramente el canon y los contratos de salida de v0.2, pero corrige una insuficiencia procedimental observada en la regresión QUALIS: la presencia correcta de entidades no demuestra por sí sola que el grafo haya materializado suficientemente sus relaciones científicas, metodológicas, teóricas e inferenciales.

Por ello, toda nueva simulación debe ejecutar una **segunda pasada relacional obligatoria** mediante `SCITESIS_CONCEPTUAL_SIMULATOR_RELATIONAL_CLOSURE_AUDIT_v0.1.md` después de la reconstrucción inferencial primaria y antes del cierre de G3/G4, Human Review, G5/G6 y de la validación final contra Output Schema.

Esta modificación **no cambia** ENT-001–ENT-039, REL-001–REL-074, Output Contract v0.2 ni Output Schema v0.2. Cambia el procedimiento exigible para poder declarar completitud semántica.

### 0.2 IAM simulado rico: definición y frontera

Para esta SPEC, **IAM simulado rico** designa la representación interna experimental del simulador que conserva la riqueza completa de la arquitectura conceptual canónica aplicable. **No es IAM v0.1**, no está restringido a sus seis clases de objeto, sus enums ni sus campos, y no pretende modificarlo.

El IAM simulado rico puede representar cualquier ENT-001–ENT-039, REL-001–REL-074, subtipo, rol, vista derivada, propiedad estructural derivable, estado de incertidumbre y registro analítico autorizado por la arquitectura vigente, siempre respetando sus fronteras semánticas y de no duplicación.

La relación entre ambos modelos es unidireccional para interoperabilidad:

```text
ARQUITECTURA CANÓNICA RICA
        ↓
IAM SIMULADO RICO
        ↓  adapter / compatibility mapping
IAM v0.1 OPERATIVO
        ↓
VALIDATOR → GRAPH COMPILER → GRAPH v0.2
```

Por tanto, **IAM v0.1 nunca funciona como techo conceptual del simulador**. Si un elemento del IAM simulado rico no cabe legalmente en IAM v0.1 o Graph v0.2, se conserva en la simulación y se registra la limitación de proyección; no se degrada semánticamente para hacerlo caber.

---

# 1. PRINCIPIO DE AUTORIDAD Y PRECEDENCIA

Para semántica conceptual, esta v0.3 usa como autoridades inmediatas, en este orden:

1. **SciTesis — Arquitectura Conceptual del Sistema Maestro de Diagnóstico Metodológico v0.7**.
2. **SciTesis — Diccionario Ontológico Canónico v1.4**.
3. **SciTesis — Catálogo Canónico de Relaciones v1.4**.
4. **SciTesis — Mapa Maestro y Grafo Canónico v1.4**.
5. **SciTesis — IAM v0.1 — Especificación cerrada**, exclusivamente como autoridad del formato intermedio operativo al que eventualmente se proyecta una parte del modelo simulado; **no limita la semántica ni el vocabulario interno del simulador**.
6. **SciTesis — Contrato IAM v0.1 → Graph v0.2**, exclusivamente como autoridad de la frontera de materialización downstream.
7. **SciTesis — Especificación de Tipado Teórico v0.1**, solo en aquello preservado o absorbido por las autoridades anteriores.
8. Graph/Compiler/Motor vigentes, exclusivamente para restricciones downstream y compatibilidad; no son autoridad para eliminar, simplificar ni seleccionar semántica conceptual del simulador.

Cuando haya conflicto entre una decisión histórica y v1.4/v0.7, prevalece la decisión normativa posterior para nuevos artefactos. Los tombstones y aliases históricos se conservan para lectura y migración, pero no se reactivan.

### 1.1 Procedimiento subordinado de cierre relacional

Esta SPEC incorpora por referencia, con fuerza normativa subordinada, `SCITESIS_CONCEPTUAL_SIMULATOR_RELATIONAL_CLOSURE_AUDIT_v0.1.md`. El procedimiento no es una nueva autoridad ontológica: ejecuta el Catálogo REL vigente sobre los objetos ya reconocidos y obliga a buscar, sustentar, adjudicar o justificar la ausencia de relaciones materialmente relevantes.

Una simulación v0.3 que omita esta segunda pasada no puede declarar `CONFIRMED_SIMULATED_GRAPH`, aunque sus archivos validen contra JSON Schema.

### 1.2 Regla de no selección ontológica previa

Está prohibido construir una “ontología del simulador” menor que el canon. La única selección permitida ocurre **después de leer el documento**, mediante instanciación justificada, abstención, no detección o no aplicabilidad.

### 1.3 Regla de no invención

Si el documento contiene un fenómeno que no puede representarse con ENT-001–ENT-039, sus subtipos/roles canónicos y REL-001–REL-074, el simulador registra `ONTOLOGY_GAP` como **hallazgo de cobertura interno, no como nuevo estado ontológico o de review**. No crea un nuevo ENT-ID, REL-ID, subtipo, estado semántico o equivalencia ad hoc.

### 1.4 Regla de separación de capas

El simulador mantiene cuatro capas canónicas de conocimiento y una capa operacional de proyección:

- **CAPA A — ESTRUCTURA CIENTÍFICA DEL ESTUDIO**.
- **CAPA B — CONOCIMIENTO EXTERNO Y TEÓRICO**.
- **CAPA C — ESTRUCTURA ARGUMENTAL**.
- **CAPA D — DIAGNÓSTICO Y GOBERNANZA**: conocida por el simulador, pero no ejecutada como diagnóstico durante la simulación semántica.
- **CAPA E — PROYECCIÓN OPERACIONAL**: capa de compatibilidad que determina qué parte del IAM simulado rico puede traducirse, sin pérdida semántica indebida, a IAM v0.1/Graph/runtime vigente.

No debe inferirse que algo no existe conceptualmente porque aún no tenga mapping operacional.

---

# 2. ORIENTACIÓN CONCEPTUAL NO NEGOCIABLE

SciTesis es inference-centric, funcional, relacional, condicional, trazable/versionado, no compensatorio y sensible al estado de desarrollo del estudio.

La unidad diagnóstica final sigue siendo **ENT-011 CLAIM/SUBCLAIM**. La transición argumental que conduce a una conclusión es **ENT-039 INFERENCE_STEP**.

Principios obligatorios:

1. **Objeto != función**.
2. **Teoría != evidencia del estudio**.
3. **Conocimiento externo != evidencia generada por la tesis**.
4. **SourceUnit/provenance != evidencia**.
5. **Claim != inference step**.
6. **Resultado/hallazgo != evidencia automáticamente**.
7. **WARRANT, BACKING y PREMISE son roles/relaciones, no entidades raíz**.
8. **CASCARILLA no es entidad ontológica**.
9. **Marco teórico y estado de la cuestión son vistas/roles documentales, no nodos activos ENT-006/ENT-007**.
10. **No existe SUPPORTS genérico como sustituto de relaciones canónicas específicas**.

---

# 3. COBERTURA CANÓNICA COMPLETA DE ENTIDADES

El simulador debe cargar y conocer **ENT-001–ENT-039 completos**. Conocer no significa instanciar. Para control interno de la simulación puede asignarse `simulator_scope`, que es **metadata no canónica del simulador** y no altera tipo, estatus ni semántica ENT:

- `SEMANTICALLY_INSTANTIABLE`: puede aparecer como objeto del estudio durante S1–S8.
- `KNOWN_DOWNSTREAM`: pertenece al canon, pero normalmente se materializa en diagnóstico/gobernanza downstream.
- `TOMBSTONE`: solo lectura/migración; prohibido instanciar en nuevos grafos.
- `CONDITIONAL`: instanciable solo cuando el caso lo requiere.

Mapa de alcance v0.3:

- Estructura científica y teórica prediagnóstica: ENT-001, ENT-004, ENT-005, ENT-008, ENT-009, ENT-010, ENT-011, ENT-012, ENT-013, ENT-014, ENT-015, ENT-016, ENT-017, ENT-018, ENT-019, ENT-020, ENT-021, ENT-022, ENT-023, ENT-036, ENT-037, ENT-038, ENT-039.
- Gobernanza/diagnóstico conocido downstream: ENT-024, ENT-025, ENT-026, ENT-027, ENT-028, ENT-029, ENT-030, ENT-031, ENT-032, ENT-033, ENT-034, ENT-035, ENT-002, ENT-003.
- Tombstones: ENT-006, ENT-007.

## 3.1 Registro ontológico canónico íntegro

Las siguientes definiciones se incorporan normativamente desde el Diccionario Ontológico Canónico v1.4. No pueden ser sustituidas por aliases simplificados del runtime.

### ENT-001 — INVESTIGACIÓN
Objeto raíz del estudio diagnosticado. Estatus: CANÓNICO, sin cambio sustantivo.

### ENT-002 — USUARIO
Persona responsable del proyecto que aporta información, restricciones y decisiones. Estatus: CANÓNICO DE GOBERNANZA.

### ENT-003 — ASESOR/EVALUADOR
Actor que revisa, confirma, modifica o rechaza juicios diagnósticos. Estatus: CANÓNICO DE GOBERNANZA.

### ENT-004 — EXTERNAL_KNOWLEDGE / CONOCIMIENTO EXTERNO O ANTECEDENTE
Definición: ítem de conocimiento antecedente externo movilizado para situar, contrastar, delimitar, contextualizar o aportar soporte empírico externo, cuando no posee una representación canónica más específica como ENT-036 THEORETICAL_ASSERTION, ENT-037 THEORETICAL_RESOURCE o ENT-038 MEASUREMENT_SPECIFICATION. Puede incluir conocimiento empírico, síntesis de literatura, claims de vacío y hechos contextuales; el conocimiento metodológico externo se representa aquí solo cuando funciona como antecedente y no como especificación interna del estudio.
Subtipos canónicos iniciales:
- PRIOR_EMPIRICAL_FINDING
- LITERATURE_SYNTHESIS
- KNOWLEDGE_GAP_CLAIM
- CONTEXTUAL_FACT
Atributos mínimos: subtype; source_id; study_id cuando aplique; text_anchor; provenance=EXTERNAL; explicitness; confidence; temporal_scope; referent_scope.
No confundir con ENT-023 Evidencia científica del estudio ni ENT-025 Evidencia diagnóstica. Tampoco usar ENT-004 como contenedor alternativo para una afirmación teórica o recurso teórico que pueda tiparse como ENT-036 o ENT-037.
Estatus: CANÓNICO REFINADO; reemplaza el uso agregado de ENT-004 v1.1.

### ENT-005 — REVISIÓN DE LITERATURA
Actividad/proceso de búsqueda, selección, evaluación, organización y síntesis de conocimiento externo.
No confundir con sus productos. Puede producir o alimentar ENT-004, ENT-036 y ENT-037.
Estatus: CANÓNICO COMO ACTIVIDAD/PROCESO.

### ENT-006 — MARCO TEÓRICO/CONCEPTUAL
Estatus: RETIRADO COMO ENTIDAD ACTIVA — TOMBSTONE HISTÓRICO.
Representación nueva: vista derivada del subgrafo compuesto por ENT-004, ENT-018, ENT-036, ENT-037 y ENT-038, más sus relaciones con claims, decisiones y resultados.
Prohibición: no asignar nuevas aristas epistemológicas a ENT-006.

### ENT-007 — ESTADO DE LA CUESTIÓN
Estatus: RETIRADO COMO ENTIDAD ACTIVA — TOMBSTONE HISTÓRICO.
Representación nueva: ENT-004 subtype=LITERATURE_SYNTHESIS con function_role=STATE_OF_KNOWLEDGE, o vista derivada correspondiente.

### ENT-008 — CONTRIBUCIÓN CIENTÍFICA PRETENDIDA
Diferencia que el estudio pretende introducir respecto del conocimiento previo. Estatus: CANÓNICO, sin cambio sustantivo.

### ENT-009 — PROBLEMA/PROPÓSITO
Incertidumbre, fenómeno o propósito que da razón al estudio. Se mantiene como entidad compuesta provisional. Estatus: CANÓNICO PROVISIONAL EN GRANULARIDAD.

### ENT-010 — PREGUNTA
Demanda de conocimiento que delimita qué debe producir el estudio. Estatus: CANÓNICO.

### ENT-011 — INFERENCIA / CLAIM
Afirmación que el estudio pretende sostener y cuyo estado de defendibilidad se adjudica según evidencia, supuestos, amenazas y estructura inferencial pertinente. ENT-011 representa el contenido proposicional/conclusión; no la transición argumental que conduce a ella, que corresponde a ENT-039 INFERENCE_STEP.
Normalización nueva: SUBCLAIM no es entidad raíz independiente; se representa como instancia de ENT-011 con parent_claim_id y structural_role=SUBCLAIM. Claim central/secundario es rol/centralidad, no clase raíz.
Estatus: CANÓNICO NUCLEAR.

### ENT-012 — FUNCIÓN METODOLÓGICA
Trabajo epistémico necesario o pertinente para sostener claims. Estatus: CANÓNICO NUCLEAR.

### ENT-013 — REQUISITO DE EVIDENCIA
Especificación de la evidencia necesaria para satisfacer una función o respaldar una inferencia. Estatus: CANÓNICO.

### ENT-014 — SUPUESTO
Premisa necesaria o relevante para una inferencia, modelo o decisión. Cuando condiciona una transición inferencial concreta, permanece como ENT-014 y participa en ENT-039 mediante el rol/relación argumental correspondiente; no se convierte en subtipo de ENT-039.
Regla de normalización: ASSUMPTION no se duplica dentro de ENT-036. Cuando un supuesto es de origen teórico se instancia ENT-014 con provenance/role apropiados y se relaciona con ENT-037 o ENT-036.
Estatus: CANÓNICO.

### ENT-015 — AMENAZA / EXPLICACIÓN ALTERNATIVA
Condición o interpretación rival que puede debilitar una inferencia.
Regla de normalización: ALTERNATIVE_EXPLANATION no se duplica como subtipo independiente de ENT-036 cuando cumple el papel de amenaza/rival; se usa ENT-015 y se registra su origen teórico cuando corresponda.
Estatus: CANÓNICO.

### ENT-016 — DISEÑO
Organización estratégica del estudio para producir evidencia. Estatus: CANÓNICO.

### ENT-017 — SELECCIÓN DE UNIDADES/CASOS
Estrategia mediante la cual ingresan personas, casos, documentos, eventos u observaciones. Estatus: CANÓNICO.

### ENT-018 — CONCEPTUAL_ENTITY / ENTIDAD CONCEPTUAL O FENOMÉNICA
Definición: objeto conceptual o fenoménico con identidad relevante para la investigación.
Subtipos canónicos iniciales:
- CONCEPT
- CONSTRUCT
- DIMENSION
- VARIABLE
- ANALYTIC_CATEGORY
- PHENOMENON
Reglas:
- no todo concepto es constructo;
- no todo constructo es medido;
- una dimensión se instancia separadamente solo cuando afecta medición, análisis, inferencia o trazabilidad;
- una categoría analítica puede ser previa, emergente o híbrida;
- PHENOMENON preserva objetos de estudio que no son constructos ni variables.
Estatus: CANÓNICO REFINADO; sustituye la semántica agregada Constructo/fenómeno de v1.1.

### ENT-019 — MEDICIÓN / PRODUCCIÓN DE DATOS
Procedimiento mediante el cual se generan u obtienen registros analizables. Incluye medición, entrevista, observación, registro documental y otras formas pertinentes.
No confundir con ENT-038, que especifica la estructura conceptual/operacional de una medición cuando tal granularidad es necesaria.
Estatus: CANÓNICO.

### ENT-020 — DATO
Registro empírico producido u obtenido antes de su transformación analítica. Estatus: CANÓNICO.

### ENT-021 — ANÁLISIS / INTERPRETACIÓN
Procedimiento que transforma datos en estimaciones, patrones, categorías, explicaciones o interpretaciones. Estatus: CANÓNICO.

### ENT-022 — RESULTADO / HALLAZGO
Producto directo del análisis antes de adjudicar su función de soporte. Estatus: CANÓNICO.

### ENT-023 — EVIDENCIA CIENTÍFICA DEL ESTUDIO
Resultado o conjunto de resultados que desempeña función de soporte empírico para un claim propio.
Regla: VALIDITY_EVIDENCE, cuando es evidencia producida o evaluada por el estudio, se representa mediante ENT-023 con evidence_type=VALIDITY, no como subtipo de ENT-038.
Estatus: CANÓNICO NUCLEAR.

### ENT-024 — VÍNCULO DE RESPALDO
Entidad asociativa de trazabilidad que representa un vínculo específico de respaldo, condicionamiento o cuestionamiento entre objetos respecto de una inferencia o claim. No representa la transición inferencial misma y no sustituye ENT-039 INFERENCE_STEP. Puede conservar evaluaciones, procedencia o metadatos del vínculo cuando sea necesario reificar la relación para diagnóstico. Estatus: CANÓNICO REFINADO; frontera explícita con ENT-039.

### ENT-025 — EVIDENCIA DIAGNÓSTICA
Información observada por SciTesis o un evaluador para justificar un juicio metodológico. Estatus: CANÓNICO NUCLEAR DE GOBERNANZA.

### ENT-026 — EVALUACIÓN DIAGNÓSTICA
Instancia versionada de evaluación de una investigación. Estatus: CANÓNICO.

### ENT-027 — FALLA METODOLÓGICA
Condición establecida que reduce la capacidad del estudio para cumplir una función o sostener un claim. Estatus: CANÓNICO NUCLEAR.

### ENT-028 — CONSECUENCIA DIAGNÓSTICA
Efecto epistemológico previsto de una falla sobre funciones, respaldo, alcance o claims. Estatus: CANÓNICO.

### ENT-029 — VALORACIÓN DE GRAVEDAD
Juicio multidimensional de importancia metodológica de una falla en el caso concreto. Estatus: CANÓNICO; no es propiedad fija de la clase de falla.

### ENT-030 — VALORACIÓN DE REPARABILIDAD
Juicio separado sobre posibilidad de corregir, contener, explicitar o reformular. Estatus: CANÓNICO.

### ENT-031 — MÓDULO DIAGNÓSTICO
Conjunto coherente y versionado de funciones, requisitos y reglas activables por propiedades del estudio. Estatus: CANÓNICO.

### ENT-032 — REGLA/ACTIVADOR
Expresión declarativa y versionada que clasifica, activa, diagnostica o deriva estados/decisiones. Estatus: CANÓNICO.

### ENT-033 — ACTIVACIÓN DE MÓDULO
Registro de que un módulo resulta activo/inactivo para un caso, con fundamento y versión. Estatus: CANÓNICO DE TRAZABILIDAD.

### ENT-034 — INTERVENCIÓN
Acción destinada a reparar, contener, reconocer una falla o restringir un claim. Estatus: CANÓNICO.

### ENT-035 — ESTADO DIAGNÓSTICO
Clasificación comunicacional de un objeto evaluado. Valores de v1.1 SOLIDO/REVISAR/PRIORITARIO/CRITICO se conservan como vocabulario histórico de esta capa; no sustituyen los estados canónicos de defendibilidad del Motor.
Estatus: CANÓNICO COMO VALORACIÓN COMUNICACIONAL, separado de defendibilidad.

### ENT-036 — THEORETICAL_ASSERTION / AFIRMACIÓN TEÓRICA
Definición: afirmación con trabajo conceptual, relacional, explicativo, predictivo o delimitador extraída, formulada o movilizada teóricamente por el estudio. Puede participar en ENT-039 como PREMISE, WARRANT o BACKING según el contexto argumental, sin cambiar de identidad ontológica.
Subtipos canónicos iniciales:
- DEFINITION
- STRUCTURE_ASSERTION
- RELATION_PROPOSITION
- MECHANISM_PROPOSITION
- THEORETICAL_EXPECTATION
- BOUNDARY_CONDITION
No incluye ASSUMPTION ni ALTERNATIVE_EXPLANATION como subtipos propios para evitar duplicar ENT-014 y ENT-015.
Atributos mínimos: subtype; proposition_text; source_id; explicitness; confidence; scope; provenance; version.
No confundir con ENT-011: una afirmación teórica puede justificar o delimitar un claim sin ser un hallazgo empírico que la tesis pretende demostrar.
Estatus: ENTIDAD RAÍZ CANÓNICA incorporada en v1.2 y preservada en v1.3.

### ENT-037 — THEORETICAL_RESOURCE / RECURSO TEÓRICO
Definición: recurso teórico o conceptual citado o movilizado por el estudio sin presumir que cumpla una función sustantiva.
Subtipos canónicos iniciales:
- THEORY
- CONCEPTUAL_MODEL
- TAXONOMY
- SENSITIZING_CONCEPT
- INTERPRETIVE_TRADITION_OR_LENS
Atributos mínimos: subtype; canonical_name; source_id; provenance; explicitness; confidence; scope; version.
Regla: una teoría citada sin relaciones funcionales no se clasifica automáticamente como contributiva.
Estatus: ENTIDAD RAÍZ CANÓNICA incorporada en v1.2 y preservada en v1.3.

### ENT-038 — MEASUREMENT_SPECIFICATION / ESPECIFICACIÓN DE MEDICIÓN
Definición: objeto que representa una pieza explícita de la cadena conceptual-operacional necesaria para interpretar una medición o puntuación cuando el claim depende de ella.
Subtipos canónicos iniciales:
- OPERATIONAL_DEFINITION
- MEASUREMENT_MODEL
- INDICATOR
- INSTRUMENT_SPECIFICATION
- SCORING_RULE
- SCORE_INTERPRETATION
Reglas de no duplicación:
- el procedimiento de administración/producción permanece en ENT-019;
- las observaciones/respuestas permanecen en ENT-020;
- la evidencia de validez permanece en ENT-023 cuando funciona como evidencia;
- la definición conceptual general puede representarse como ENT-036 subtype=DEFINITION y conectarse con ENT-018; OPERATIONAL_DEFINITION se reserva para el puente operacional.
Estatus: ENTIDAD RAÍZ CANÓNICA incorporada en v1.2 y preservada en v1.3.

### ENT-039 — INFERENCE_STEP / PASO INFERENCIAL
Definición: unidad estructural del grafo que representa una transición inferencial situada mediante la cual una o más entradas proposicionales, evidenciales o asumidas contribuyen, bajo una licencia o esquema inferencial, a una conclusión inmediata.
Naturaleza: entidad estructural argumental. No es evidencia, teoría, supuesto ni claim.
Entradas permitidas conceptualmente: ENT-011 CLAIM/SUBCLAIM, ENT-023 EVIDENCIA CIENTÍFICA DEL ESTUDIO, ENT-036 THEORETICAL_ASSERTION, ENT-004 EXTERNAL_KNOWLEDGE y ENT-014 SUPUESTO, según la función desempeñada.
Salida: una conclusión inmediata representada como ENT-011 CLAIM. Un claim intermedio puede actuar posteriormente como entrada de otro ENT-039.
Roles contextuales asociados: PREMISE, WARRANT, BACKING y ASSUMPTION. Estos roles no reciben ENT-ID independiente.
Atributos mínimos: explicitness; inferential_status; inference_scheme_id cuando aplique; source/provenance cuando exista formulación textual o reconstrucción trazable; confidence de extracción/reconstrucción; version; adjudication_status cuando corresponda.
Valores conceptuales mínimos de inferential_status: STRICT | DEFEASIBLE | UNKNOWN. inference_scheme_id pertenece a vocabulario controlado extensible y no constituye una taxonomía universal cerrada en esta versión.
Regla crítica: directness, coverage, linked/convergent/chained, rutas alternativas, redundancia, bottlenecks y contribución contrafactual no son atributos epistemológicos primitivos de ENT-039; se derivan preferentemente de la topología del subgrafo.
Regla de explicitud: toda inferencia no expresada explícitamente por el autor debe conservar su condición de IMPLICIT_RECONSTRUCTED o SYSTEM_INFERRED, o codificación canónica equivalente futura.
Estatus: NUEVA ENTIDAD RAÍZ CANÓNICA v1.3.

---

# 4. VISTAS, ROLES Y NO-ENTIDADES CANÓNICAS

La cobertura exhaustiva incluye también decisiones negativas y vistas derivadas:

- `MARCO_TEORICO_CONCEPTUAL_VIEW`: vista derivada, no entidad.
- `STATE_OF_KNOWLEDGE_VIEW`: vista sobre ENT-004/LITERATURE_SYNTHESIS, no reactivación de ENT-007.
- `CONTEXT_VIEW`: vista derivada; CONTEXT no es entidad raíz.
- `THEORY_ANCHOR`: rol/propiedad derivada, no entidad.
- `CASCARILLA`: diagnóstico/reporte derivado, no entidad.
- `CLAIM_COMPONENT`: no entidad raíz; usar ENT-011 SUBCLAIM/estructura.
- `WARRANT`, `BACKING`, `PREMISE`, `SUPPORT_SET`: no entidades raíz.
- `ASSUMPTION`: **sí** es ENT-014 y no subtype de ENT-036.
- `ALTERNATIVE_EXPLANATION` cuando funciona como amenaza/rival: **sí** es ENT-015 y no subtype de ENT-036.

---

# 5. COBERTURA CANÓNICA COMPLETA DE RELACIONES

El simulador debe cargar y reconocer **REL-001–REL-074 completos**, con sus dominios, fronteras y estatus. Una relación puede quedar `UNRESOLVED`, `ABSTAIN` o no instanciada, pero no puede ser sustituida por una relación genérica por desconocimiento del catálogo.

Reglas generales:

- una arista expresa una sola semántica;
- una inversa de lectura no genera automáticamente una segunda arista almacenada;
- la existencia de una relación no implica suficiencia diagnóstica;
- linked, convergent, chained, directness, coverage, required_for_target, redundancia, bottleneck y contribución contrafactual son propiedades derivadas, salvo decisión canónica posterior;
- `REL-019 SUSTENTA` se reserva a ENT-023 evidencia del estudio → ENT-011 claim propio;
- `REL-055 JUSTIFICA_TEORICAMENTE` no equivale a `REL-068 WARRANTS`;
- `REL-029 JUSTIFICA` es diagnóstico/decisional;
- `REL-056 APORTA_SOPORTE_EMPIRICO_EXTERNO` no convierte conocimiento externo en evidencia del estudio;
- `REL-026 INTERPRETA_MEDIANTE` es tombstone histórico y no se instancia en nuevos grafos.

## 5.1 Catálogo REL-001–REL-074 íntegro

### REL-001 CONTIENE — Conservada. Agregadores incluyen componentes. ENT-001 Investigación puede contener ENT-004, ENT-005, ENT-008–ENT-024, ENT-036–ENT-039 cuando corresponda. DEP-06.

### REL-002 PERTENECE_A — Conservada como vista admisible; preferir REL-001 en backbone. DEP-06.

### REL-003 SITUA — Refinada. Origen: ENT-004 EXTERNAL_KNOWLEDGE, especialmente LITERATURE_SYNTHESIS, PRIOR_EMPIRICAL_FINDING o CONTEXTUAL_FACT. Destino: ENT-001 Investigación, ENT-009 Problema/propósito, ENT-008 Contribución. No usar ENT-007.

### REL-004 SINTETIZA — Refinada. Origen: ENT-004 subtype=LITERATURE_SYNTHESIS. Destino: múltiples ENT-004 externos tipados. Expresa integración crítica de conocimiento antecedente. No usar ENT-007.

### REL-005 INFORMA — Refinada. Origen permitido: ENT-004, ENT-005, ENT-018, ENT-036, ENT-037, ENT-028, ENT-029, ENT-030. Destino: ENT-009, ENT-010, ENT-011, ENT-016, ENT-019, ENT-021, ENT-008, ENT-035, ENT-034 y, cuando proceda, ENT-038. No utilizar como sustituto de DEFINE, JUSTIFICA_TEORICAMENTE, OPERATIONALIZA o INTERPRETA cuando esas semánticas sean observables.

### REL-006 DELIMITA — Refinada. Origen: ENT-004, ENT-009, ENT-018, ENT-036, ENT-037, ENT-023, ENT-034. Destino: ENT-009, ENT-010, ENT-011, ENT-008, ENT-018. Delimitar es constitutivo o restrictivo de alcance; no implica falla.

### REL-007 DEFINE_RESPECTO_DE — Refinada. Origen: ENT-008 Contribución científica pretendida. Destino: ENT-004 EXTERNAL_KNOWLEDGE, en especial LITERATURE_SYNTHESIS. No usar ENT-007.

### REL-008 MOTIVA — Refinada. Origen: ENT-009, ENT-008, ENT-004 y, cuando la tesis lo explicite, ENT-036/ENT-037. Destino: ENT-010, ENT-011 o ENT-001. Motivación no equivale a necesidad.

### REL-009 COMPROMETE — Conservada. Origen: ENT-010 Pregunta; excepcionalmente una formulación metodológica que obligue un claim. Destino: ENT-011. DEP-01.

### REL-010 REQUIERE — Conservada. Origen: ENT-011, ENT-012, ENT-031. Destino: ENT-012, ENT-013, ENT-014 y, cuando sea una especificación exigible, ENT-038. DEP-01/02.

### REL-011 RESTRINGE — Conservada y ampliada. Origen: ENT-011, ENT-016, ENT-014, ENT-036 subtype=BOUNDARY_CONDITION cuando se represente como afirmación teórica, restricciones de datos. Destino: ENT-016, ENT-017, ENT-019, ENT-021, ENT-011/alcance. No confundir con DELIMITA.

### REL-012 ORGANIZA — Conservada. Origen: ENT-016 Diseño. Destino: ENT-017, ENT-019, ENT-021 e integración de ramas.

### REL-013 REPRESENTA — Refinada. Origen: ENT-019 Medición/producción y, cuando corresponda, ENT-038 MEASUREMENT_SPECIFICATION. Destino: ENT-018. Se retira ENT-006 como origen. Para relaciones conceptuales internas usar REL-048/050.

### REL-014 PRODUCE — Refinada. ENT-005 Revisión de literatura puede producir/alimentar ENT-004, ENT-036 o ENT-037; ENT-019 produce ENT-020; ENT-021 produce ENT-022; ENT-032 puede producir ENT-033. No usar ENT-006/ENT-007 como destinos.

### REL-015 PROVIENE_DE — Refinada. Origen: ENT-004, ENT-020, ENT-023, ENT-025, ENT-036, ENT-037, ENT-038 cuando requieran procedencia. Destino: fuente documental/bibliográfica, ENT-019, ENT-017, ENT-022 u objeto fuente según el caso. Registra procedencia, no validez.

### REL-016 USA — Conservada y ampliada. Origen: ENT-021, ENT-026, ENT-032, ENT-005. Destino: ENT-020, ENT-025, ENT-004, ENT-036, ENT-037 y otros insumos explícitos.

### REL-017 ES_INSUMO_DE — Conservada como vista operativa; preferir REL-016.

### REL-018 CONTRIBUYE_A — Conservada. Expresa aportación parcial sin suficiencia. Puede conectar ENT-004, ENT-018, ENT-036, ENT-037, ENT-022, ENT-023 o ENT-034 con productos/claims cuando no corresponda una semántica más fuerte.

### REL-019 SUSTENTA — CONSERVADA CON RESTRICCIÓN FUERTE. Origen exclusivo: ENT-023 EVIDENCIA CIENTÍFICA DEL ESTUDIO. Destino: ENT-011 CLAIM propio. ENT-024 y ENT-039 pueden estructurar o contextualizar cómo se usa la evidencia, pero no son evidencia y no pueden originar SUSTENTA. Prohibido usar ENT-004, ENT-036 o ENT-037 como origen para sustituir evidencia propia del estudio.

### REL-020 CONECTA — Conservada y restringida a ENT-024 VÍNCULO DE RESPALDO. Origen: ENT-024; destino: los objetos que el vínculo reifica, típicamente ENT-023 y ENT-011, y cuando el contrato lo requiera ENT-039. No expresa por sí misma premisa, warrant, conclusión ni fuerza justificativa.

### REL-021 CONDICIONA — Conservada para dependencia general o de aplicabilidad. Origen: ENT-014 Supuesto, ENT-017, condiciones de estructura/contexto y, cuando corresponda, ENT-036 subtype=BOUNDARY_CONDITION. Destino: ENT-024, ENT-011, ENT-016, ENT-019 o alcance. Cuando un ENT-014 condiciona específicamente un ENT-039 INFERENCE_STEP usar REL-069 ASSUMPTION_FOR.

### REL-022 DEBILITA — Conservada como relación de consecuencia diagnóstica o debilitamiento ya adjudicado. Origen: ENT-015, ENT-027, evidencia contradictoria aceptada o una objeción adjudicada. Destino: ENT-024, ENT-011, ENT-012 o ENT-039. Para tipar el ataque argumental antes de derivar su consecuencia usar REL-072 REBUTS, REL-073 UNDERCUTS o REL-074 UNDERMINES.

### REL-023 CUESTIONA — Refinada. Origen: ENT-015, ENT-025, ENT-004, ENT-036 o ENT-037 cuando exista una objeción explícita. Destino: ENT-014, ENT-024, ENT-008, ENT-011, ENT-036 o ENT-039. Expresa objeción genérica cuando no se ha reconstruido un tipo de ataque argumental más preciso. Si el target y la función son identificables, prevalecen REL-072 REBUTS, REL-073 UNDERCUTS o REL-074 UNDERMINES.

### REL-024 LIMITA — Conservada. Origen: ENT-028, ENT-023, ENT-027, ENT-034. Destino: ENT-011, ENT-008 o alcance.

### REL-025 CONTRASTA_CON — Refinada. Origen: ENT-022, ENT-023 o ENT-004. Destino: ENT-004, ENT-022 o ENT-023. Para incompatibilidad proposicional usar REL-065; CONTRASTA_CON es comparación neutral.

### REL-026 INTERPRETA_MEDIANTE — TOMBSTONE HISTÓRICO. No instanciar en nuevos grafos. Migrar a REL-064 INTERPRETA.

### REL-027 RETROALIMENTA — Refinada. Origen: ENT-021, ENT-022, ENT-019, ENT-017, ENT-004 actualizado. Destino: ENT-010, ENT-017, ENT-019, ENT-021, ENT-018, ENT-036, ENT-037 o ENT-038 según tradición. DEP-04.

### REL-028 INTEGRA — Conservada. Origen: diseño/análisis/evidencia de ramas. Destino: resultado integrado, evidencia integrada o ENT-011 meta-inferencia. No activar por mera coexistencia de métodos.

### REL-029 JUSTIFICA — Conservada con frontera semántica. Origen: ENT-025, ENT-029, ENT-030. Destino: ENT-027, ENT-035, ENT-026, ENT-034, ENT-033. Para teoría usar REL-055; para evidencia propia usar REL-019.

### REL-030 AFECTA — Conservada. Origen ENT-027; destino ENT-012, ENT-011, ENT-024 o decisión metodológica.

### REL-031 GENERA — Conservada. ENT-027 → ENT-028. Solo cuando la consecuencia está suficientemente justificada.

### REL-032 VALORA — Conservada. ENT-029/ENT-030 → ENT-027/ENT-028.

### REL-033 CLASIFICA — Conservada. ENT-035 o ENT-032 → objeto evaluado. No mezclar aplicabilidad, evaluabilidad, defendibilidad y semáforo.

### REL-034 ABORDA — Conservada. ENT-034 → ENT-027/ENT-028.

### REL-035 ACTIVA — Conservada. ENT-032/propiedad del estudio → ENT-031/ENT-013 y, cuando proceda, subsistema teórico-conceptual o ENT-038.

### REL-036 INTRODUCE — Conservada. ENT-031 → ENT-012/ENT-013/ENT-014 y requisitos tipados adicionales.

### REL-037 REGISTRA — Conservada. Gobernanza/trazabilidad.

### REL-038 EVALUA — Conservada. Actor o evaluación diagnóstica → investigación, claim, relación, requisito o propiedad.

### REL-039 ADJUDICA — Conservada. ENT-003 → estado, activación, falla, evaluación o decisión registrada.

### REL-040 APORTA — Conservada. ENT-002/ENT-003 → ENT-025 o información contextual.

### REL-041 PROPONE — Conservada. ENT-032/ENT-003 → ENT-035, ENT-034, activación o modificación de alcance.

### REL-042 ACEPTA — Conservada. ENT-002 → ENT-034/decisión.

### REL-043 DEPENDE_DE — Conservada. ENT-034 → ENT-034. Para precedencia entre objetos metodológicos usar REL-045.

### REL-044 PARTICIPA_EN — Refinada. Origen: ENT-018 CONCEPTUAL_ENTITY. Destino: ENT-011 o ENT-010. Expresa contenido semántico sin especificar rol causal, predictivo o interpretativo.

### REL-045 PRECEDE_A — Conservada y ampliada a ENT-036/ENT-038 cuando exista precedencia metodológica justificable. No impone secuencia rígida.

### REL-046 HABILITA — Conservada y ampliada a ENT-018/ENT-036/ENT-038 cuando la resolución suficiente permite legítimamente otra actividad o decisión.

### REL-047 REABRE — Conservada y ampliada. Origen: ENT-023, ENT-025, ENT-022, ENT-027, ENT-021. Destino: ENT-010, ENT-011, ENT-016–ENT-019, ENT-036–ENT-038 cuando nueva evidencia obliga a revisión.


6. NUEVAS RELACIONES CANÓNICAS v1.3

### REL-048 DEFINE
Definición: una afirmación teórica de tipo DEFINITION establece el significado o criterios conceptuales de una ENT-018.
Origen: ENT-036 subtype=DEFINITION.
Destino: ENT-018 CONCEPTUAL_ENTITY.
Clase típica: DEP-01/02.
No equivale a INFORMA: DEFINE fija contenido conceptual identificable.

### REL-049 DISTINGUE_DE
Definición: establece una diferencia conceptual explícita entre entidades conceptuales que podrían confundirse.
Origen: ENT-018 o ENT-036 subtype=DEFINITION/STRUCTURE_ASSERTION.
Destino: ENT-018.
Clase: DEP-02/06 semántica.
Dirección: almacenar una sola arista cuando la distinción sea simétrica y marcar symmetric=true si el contrato futuro lo admite.

### REL-050 DESCOMPONE_EN
Definición: expresa que una entidad conceptual posee componentes o dimensiones con identidad metodológicamente relevante.
Origen: ENT-018 subtype=CONSTRUCT/CONCEPT/PHENOMENON.
Destino: ENT-018 subtype=DIMENSION/CONCEPT/ANALYTIC_CATEGORY según el caso.
Clase: DEP-06 con posible consecuencia metodológica.
No usar para listas editoriales sin función diagnóstica.

### REL-051 PREDICE
Definición: una afirmación teórica formula una expectativa direccional o relacional respecto de un claim, resultado esperado o relación conceptual.
Origen: ENT-036 subtype=THEORETICAL_EXPECTATION/RELATION_PROPOSITION.
Destino: ENT-011 o ENT-036.
Clase: DEP-02/03.
No convierte una asociación empírica en causalidad.

### REL-052 PROPORCIONA_MECANISMO_PARA
Definición: una afirmación teórica especifica el proceso mediante el cual podría producirse una relación o efecto.
Origen: ENT-036 subtype=MECHANISM_PROPOSITION.
Destino: ENT-011 o ENT-036 subtype=RELATION_PROPOSITION.
Clase: DEP-02/03 según claim.

### REL-053 PROPORCIONA_CONDICION_DE_FRONTERA_PARA
Definición: una afirmación teórica delimita las condiciones bajo las cuales otra afirmación o claim es esperable/aplicable.
Origen: ENT-036 subtype=BOUNDARY_CONDITION.
Destino: ENT-011 o ENT-036.
Clase: DEP-01/02.
Puede coexistir con REL-011 RESTRINGE cuando la consecuencia operacional de la condición de frontera deba representarse.

### REL-054 DERIVA_DE_RECURSO_TEORICO
Definición: una afirmación teórica es atribuida o reconstruida a partir de un recurso teórico determinado.
Origen: ENT-036 THEORETICAL_ASSERTION.
Destino: ENT-037 THEORETICAL_RESOURCE.
Clase: DEP-06/procedencia conceptual.
No implica que la afirmación sea correcta ni que el recurso sostenga evidencia empírica.

### REL-055 JUSTIFICA_TEORICAMENTE
Definición: una afirmación o recurso teórico aporta una razón conceptual explícita para formular, esperar o interpretar un objeto del estudio.
Origen: ENT-036 o ENT-037.
Destino: ENT-010, ENT-011, ENT-016, ENT-018, ENT-038 o decisión metodológica cuando la conexión sea sustantiva.
Clase: DEP-02/03.
Invariante: JUSTIFICA_TEORICAMENTE ≠ SUSTENTA (REL-019) ≠ JUSTIFICA diagnóstico (REL-029).

### REL-056 APORTA_SOPORTE_EMPIRICO_EXTERNO
Definición: un hallazgo empírico previo aporta apoyo externo a una afirmación, expectativa o contextualización, sin convertirse en evidencia producida por el estudio actual.
Origen: ENT-004 subtype=PRIOR_EMPIRICAL_FINDING/LITERATURE_SYNTHESIS.
Destino: ENT-036, ENT-011, ENT-009 o ENT-008 según función.
Clase: DEP-03.
Prohibición: no usar esta arista para adjudicar automáticamente defendibilidad del claim del estudio.

### REL-057 CUALIFICA
Definición: el origen introduce una precisión, excepción, moderación o condición que modifica la interpretación del destino sin negarlo necesariamente.
Origen: ENT-004, ENT-036 o ENT-037.
Destino: ENT-036, ENT-011, ENT-008, ENT-022/ENT-023.
Clase: DEP-03.

### REL-058 OPERACIONALIZA
Definición: una especificación operacional vincula un concepto/constructo con una forma concreta de observación o producción de datos.
Origen: ENT-038 subtype=OPERATIONAL_DEFINITION/MEASUREMENT_MODEL/INSTRUMENT_SPECIFICATION según el nivel.
Destino: ENT-018 subtype=CONSTRUCT/VARIABLE/PHENOMENON.
Clase: DEP-01/02.
No equivale a REPRESENTA: OPERACIONALIZA explicita la traducción conceptual-operativa.

### REL-059 ES_INDICADOR_DE
Definición: un indicador observable es usado como manifestación o componente empírico de un constructo/dimensión.
Origen: ENT-038 subtype=INDICATOR.
Destino: ENT-018 subtype=CONSTRUCT/DIMENSION/VARIABLE.
Clase: DEP-01/02.

### REL-060 GENERA_OBSERVACION
Definición: un procedimiento efectivo de medición o producción de datos genera observaciones/respuestas registrables.
Origen: ENT-019 MEDICIÓN/PRODUCCIÓN DE DATOS. ENT-038 INSTRUMENT_SPECIFICATION especifica el dispositivo o protocolo, pero no produce por sí mismo la observación.
Destino: ENT-020 DATO.
Clase: DEP-06 productiva.

### REL-061 PUNTUA_A
Definición: una regla de puntuación transforma observaciones/respuestas en una puntuación o representación analítica especificada.
Origen: ENT-038 subtype=SCORING_RULE.
Destino: ENT-020 DATO derivado o representación analítica registrada.
Clase: DEP-01/06.

### REL-062 INTERPRETA_PUNTAJE_COMO
Definición: una especificación de interpretación atribuye significado sustantivo a una puntuación o representación analítica.
Origen: ENT-038 subtype=SCORE_INTERPRETATION.
Destino: ENT-018 CONSTRUCT/DIMENSION/VARIABLE o ENT-011 cuando la interpretación entra directamente en el claim.
Clase: DEP-01/02.

### REL-063 JUSTIFICA_MEDICION_DE
Definición: evidencia científica pertinente proporciona fundamento para interpretar una medición como representación del constructo o uso propuesto.
Origen: ENT-023 evidence_type=VALIDITY o ENT-004 cuando se trate de evidencia externa de validación, diferenciando provenance.
Destino: ENT-038 MEASUREMENT_SPECIFICATION o ENT-018.
Clase: DEP-01/03 según inferencia.
Regla: distinguir siempre evidencia de validez propia/externa mediante provenance.

### REL-064 INTERPRETA
Definición: un recurso o afirmación teórica proporciona una lente o estructura conceptual mediante la cual se atribuye significado a un resultado, hallazgo o producto analítico.
Origen: ENT-037 THEORETICAL_RESOURCE o ENT-036 THEORETICAL_ASSERTION; excepcionalmente ENT-018 cuando un concepto funciona explícitamente como lente.
Destino: ENT-022 RESULTADO/HALLAZGO o ENT-021 ANÁLISIS/INTERPRETACIÓN.
Clase: DEP-02/03/05.
Esta es la dirección canónica que sustituye REL-026 INTERPRETA_MEDIANTE.

### REL-065 CONTRADICE
Definición: una afirmación o hallazgo es proposicionalmente incompatible con otra afirmación relevante bajo el mismo alcance o bajo alcances que deberían reconciliarse. Es una relación semántica de incompatibilidad; cuando esa incompatibilidad se usa específicamente para atacar la conclusión de un argumento puede coexistir con REL-072 REBUTS.
Origen: ENT-004, ENT-036, ENT-022 o ENT-023.
Destino: ENT-004, ENT-036, ENT-011, ENT-022 o ENT-023.
Clase: DEP-03.
No equivale a CUESTIONA: CONTRADICE exige incompatibilidad identificable, no mera objeción.

### REL-066 CONTEXTUALIZA
Definición: un hecho contextual aporta condiciones de entorno necesarias para interpretar, acotar o comprender una entidad sin constituir por sí mismo soporte empírico del claim.
Origen: ENT-004 subtype=CONTEXTUAL_FACT.
Destino: ENT-009, ENT-010, ENT-011, ENT-016, ENT-017, ENT-022 o ENT-023.
Clase: DEP-02/03.
No confundir con SITUA, que ubica principalmente respecto del conocimiento antecedente; CONTEXTUALIZA refiere condiciones sustantivas del caso o entorno.

### REL-067 PREMISE_IN
Definición: una proposición o pieza de evidencia participa como premisa de un ENT-039 INFERENCE_STEP.
Origen permitido: ENT-011 CLAIM/SUBCLAIM, ENT-023 EVIDENCIA CIENTÍFICA DEL ESTUDIO, ENT-036 THEORETICAL_ASSERTION y ENT-004 EXTERNAL_KNOWLEDGE cuando actúe proposicionalmente como premisa.
Destino: ENT-039 INFERENCE_STEP.
Clase típica: DEP-01/02/03 según el esquema inferencial.
Regla: PREMISE_IN declara participación proposicional; no adjudica por sí sola suficiencia, necesidad global ni fuerza.

### REL-068 WARRANTS
Definición: una ENT-036 THEORETICAL_ASSERTION proporciona la licencia conceptual o inferencial utilizada para pasar de las premisas a la conclusión de un ENT-039.
Origen: ENT-036 THEORETICAL_ASSERTION.
Destino: ENT-039 INFERENCE_STEP.
Clase típica: DEP-01/02/03.
Regla: WARRANTS no convierte teoría en evidencia del estudio y no equivale a REL-055 JUSTIFICA_TEORICAMENTE. La primera representa un rol dentro de un paso inferencial; la segunda resume una contribución teórica hacia un objeto o claim.

### REL-069 ASSUMPTION_FOR
Definición: un ENT-014 SUPUESTO condiciona la aplicabilidad o aceptabilidad de un ENT-039 INFERENCE_STEP concreto.
Origen: ENT-014 SUPUESTO.
Destino: ENT-039 INFERENCE_STEP.
Clase típica: DEP-01/02.
Regla: usar REL-021 CONDICIONA para dependencias generales; usar ASSUMPTION_FOR cuando el supuesto pertenezca a un paso inferencial identificable.

### REL-070 CONCLUDES
Definición: un ENT-039 INFERENCE_STEP tiene como conclusión inmediata un ENT-011 CLAIM.
Origen: ENT-039 INFERENCE_STEP.
Destino: ENT-011 CLAIM/SUBCLAIM.
Clase: DEP-06 argumental con consecuencia inferencial.
Invariante: todo ENT-039 debe tener exactamente una conclusión inmediata canónica. Varias inferencias pueden concluir en el mismo claim.

### REL-071 BACKS
Definición: una afirmación existente proporciona backing a otra afirmación que desempeña el rol de warrant dentro de un ENT-039 determinado.
Origen: normalmente ENT-036 THEORETICAL_ASSERTION o ENT-004 EXTERNAL_KNOWLEDGE cuando aporte fundamento proposicional al warrant.
Destino: ENT-036 THEORETICAL_ASSERTION que actúa como warrant.
Contexto obligatorio: inference_context_id = ENT-039 en el que el destino desempeña el rol de warrant.
Clase típica: DEP-02/03.
Regla: BACKS es contextual. No se crea entidad WARRANT ni BACKING. Si no puede identificarse el inference_context_id, usar una relación semántica menos específica como REL-055, REL-056 o REL-005 según corresponda.

### REL-072 REBUTS
Definición: una proposición o evidencia ataca la conclusión de una inferencia sosteniendo una conclusión incompatible o proporcionando razón específica contra el claim concluido.
Origen permitido: ENT-004, ENT-015, ENT-023, ENT-036 o ENT-011, según procedencia y función.
Destino: ENT-011 CLAIM.
Clase típica: DEP-03.
Regla: REBUTS identifica el blanco argumental. Puede coexistir con REL-065 CONTRADICE cuando existe además incompatibilidad proposicional explícita. No equivale a REL-022 DEBILITA, que expresa una consecuencia ya adjudicada.

### REL-073 UNDERCUTS
Definición: una proposición o evidencia ataca la conexión inferencial representada por un ENT-039 sin requerir la negación de su conclusión.
Origen permitido: ENT-004, ENT-015, ENT-023, ENT-036 o ENT-011.
Destino: ENT-039 INFERENCE_STEP.
Clase típica: DEP-03.
Regla: UNDERCUTS debe usarse cuando la objeción afecta la licencia, aplicabilidad o conexión premisas→conclusión, no cuando simplemente contradice el claim.

### REL-074 UNDERMINES
Definición: una proposición o evidencia cuestiona la aceptabilidad de una entrada concreta utilizada en un argumento.
Origen permitido: ENT-004, ENT-015, ENT-023, ENT-036 o ENT-011.
Destino permitido: ENT-011, ENT-014, ENT-023, ENT-036 o ENT-004 cuando ese objeto participa como entrada de un ENT-039.
Contexto recomendado: inference_context_id cuando la misma entrada participa en múltiples inferencias y el ataque es contextual.
Clase típica: DEP-03.
Regla: UNDERMINES ataca una premisa/entrada; REBUTS ataca la conclusión; UNDERCUTS ataca la transición.


6A.1. Propiedades derivadas de la topología argumental
Linked, convergent, chained, directness, coverage, required_for_target, rutas alternativas, redundancia, bottlenecks y contribución contrafactual no reciben REL-ID propio en v1.3. Se derivan de la combinación de ENT-039 y las relaciones REL-067–REL-074, más la estructura CLAIM/SUBCLAIM.


6A.2. JUSTIFICA_TEORICAMENTE como proyección semántica

---

# 6. PIPELINE v0.3

v0.3 preserva las etapas semánticas de v0.2 e introduce `S5R RELATIONAL_CLOSURE_AUDIT` como segunda pasada obligatoria. G3 y G4 pasan a cerrar **después** de S5R, de modo que no puedan declarar cobertura únicamente por presencia de tipos de entidad o por una topología inferencial parcial.

```text
S0 DOCUMENT_NORMALIZATION
→ S1 CANDIDATE_UNIT_SEGMENTATION
→ S2 CONTEXTUAL_MULTIAXIAL_INTERPRETATION
→ S3 CANONICAL_ENTITY_ASSERTION_PROPOSAL
→ S4 CANONICAL_RELATION_PROPOSAL
→ G1 CANON_COVERAGE_GATE
→ G2 THEORY_AND_EXTERNAL_KNOWLEDGE_COVERAGE_GATE
→ S5 INFERENCE_RECONSTRUCTION
→ S5R RELATIONAL_CLOSURE_AUDIT [OBLIGATORIO]
→ G3 SCIENTIFIC_BACKBONE_COVERAGE_GATE
→ G4 INFERENCE_AND_RELATION_COVERAGE_GATE
→ S6 TARGET_REFERENCE_RESOLUTION
→ S7 DECISION_ABSTENTION_AND_HUMAN_REVIEW_QUEUE
→ HUMAN_REVIEW
→ S8 CONFIRMED_SIMULATED_GRAPH_ASSEMBLY
→ G5 FUNCTIONAL_RELEVANCE_GATE
→ G6 FINAL_SEMANTIC_COMPLETENESS_GATE
→ SERIALIZACIÓN DE OUTPUTS
→ OUTPUT_SCHEMA_VALIDATION
→ CONFIRMED_SIMULATED_GRAPH
```

`S5R` no maximiza aristas. Para cada entidad materialmente relevante debe examinar relaciones canónicas compatibles, buscar sustento documental/inferencial, materializar solo las justificadas, conservar incertidumbre y generar review cuando corresponda. Debe detectar también dependencias semánticas ocultas en atributos o sidecars y decidir si requieren una REL canónica explícita.

La validación contra Output Schema ocurre **después** del cierre semántico. Un `Schema PASS` no puede sustituir G3/G4/G6 ni demostrar que S5R fue ejecutado.

Estos nombres son **etapas internas del simulador**, no sustituyen ni renombran la arquitectura de transformación de producto. La arquitectura canónica downstream permanece intacta.

Ningún gate autoriza completar silenciosamente contenido ausente. Para auditoría de cobertura puede usar los siguientes **outcomes internos no ontológicos y no equivalentes a review_state**:

- `ABSENT_IN_DOCUMENT`;
- `NOT_APPLICABLE`;
- `NOT_DETECTED_YET`;
- `UNRESOLVED`;
- `ABSTAIN`;
- `ONTOLOGY_GAP`;
- `COVERED`.

# 7. S0 — NORMALIZACIÓN Y PROVENANCE

Cada `SourceUnit` conserva al menos `unit_id`, literal exacto, localización y orden documental. `SourceSpan` conserva `unit_id`, inicio y fin o equivalente verificable.

Todo objeto o relación diagnósticamente relevante debe ser trazable a:

- source units/spans o derivation explícita permitida;
- attribution;
- explicitness;
- confidence;
- review_state;
- version/origin cuando aplique.

Se mantiene estrictamente:

```text
confidence != review_state != explicitness
```

---

# 8. S1–S2 — UNIDADES CANDIDATAS E INTERPRETACIÓN MULTIAXIAL RICA

S1 produce **unidades/segmentos candidatos**, no proposiciones definitivas. S2 realiza interpretación contextual multiáxial desde la **arquitectura canónica rica**, no desde los enums de IAM v0.1. Para cada unidad, cluster u objeto reconstruido pertinente pueden evaluarse por separado, cuando correspondan:

1. **canonical_entity_candidate**: cualquier ENT-001–ENT-039 aplicable;
2. **canonical_subtype_or_role**: subtipo, structural_role o rol derivado autorizado por el Diccionario/Mapa;
3. **discourse_role**: función discursiva de la unidad, separada de su identidad ontológica;
4. **argumentative_role**: PREMISE, WARRANT, BACKING, ASSUMPTION, ataque u otra función situada cuando proceda, sin convertir roles en entidades;
5. **epistemic_plane**: `STUDY`, `EXTERNAL` o `DIAGNOSTIC_SOURCE` cuando aplique, sin sustituir el tipo del objeto;
6. **attribution_and_provenance**: autoría/fuente, source spans, explicitness y origen de reconstrucción;
7. **functional_relevance**: hipótesis revisable de relevancia funcional;
8. **review_state / review_requirement**: incertidumbre y necesidad de adjudicación humana;
9. **projection_status**: solo metadata de compatibilidad downstream, nunca criterio para seleccionar o descartar semántica.

Estos nombres son **campos internos/sidecar del IAM simulado rico**, no nuevos campos ni enums de IAM v0.1. El adapter downstream es responsable de mapear únicamente aquello que tenga correspondencia legal en IAM v0.1.

Las categorías autorizadas de relevancia funcional son: `CORE_INFERENTIAL`, `SUPPORTING`, `CONTEXTUALLY_NECESSARY`, `METHODOLOGICALLY_NECESSARY`, `PERIPHERAL`, `REDUNDANT`, `IRRELEVANT_TO_DEFENDIBILITY` y `UNRESOLVED`. La ausencia de función detectada no autoriza por sí sola `IRRELEVANT_TO_DEFENDIBILITY`. Cuando esta dimensión se proyecte a IAM v0.1, se serializa como `importance`; dentro del simulador se usa un único nombre: `functional_relevance`.

`necessity_status`, `contribution_mode` y `structural_status` **no se promueven en v0.3 a tipado canónico**: el Diccionario v1.4 los mantiene diferidos. Pueden conservarse únicamente como hipótesis experimentales/sidecar no canónico si un experimento explícito lo requiere, sin formar parte del contrato normativo del simulador.

La IA debe explorar el canon completo antes de asignar `NONE`, `NO_FUNCTION_DETECTED` o `UNRESOLVED`.

---

# 9. S3 — PROPUESTA DE ENTIDADES Y ASSERTIONS

La propuesta debe recorrer explícitamente las cuatro capas canónicas.

## 9.1 Estructura científica

Buscar, cuando existan:

INVESTIGACIÓN, CONTRIBUCIÓN, PROBLEMA/PROPÓSITO, PREGUNTA, CLAIM/SUBCLAIM, FUNCIÓN METODOLÓGICA, REQUISITO DE EVIDENCIA, SUPUESTO, AMENAZA/EXPLICACIÓN ALTERNATIVA, DISEÑO, SELECCIÓN, CONCEPTUAL_ENTITY, MEDICIÓN/PRODUCCIÓN, DATO, ANÁLISIS/INTERPRETACIÓN, RESULTADO/HALLAZGO, EVIDENCIA DEL ESTUDIO y MEASUREMENT_SPECIFICATION.

## 9.2 Conocimiento externo y teoría

Buscar, cuando existan:

- ENT-004 EXTERNAL_KNOWLEDGE y sus subtipos;
- ENT-005 REVISIÓN DE LITERATURA como proceso cuando el texto permite representarlo;
- ENT-036 THEORETICAL_ASSERTION;
- ENT-037 THEORETICAL_RESOURCE;
- ENT-038 MEASUREMENT_SPECIFICATION.

## 9.3 Estructura argumental

Buscar ENT-039 INFERENCE_STEP solo cuando sea necesaria una transición reificada; no forzarla en toda relación simple.

## 9.4 Gobernanza/diagnóstico

ENT-002, ENT-003 y ENT-024–ENT-035 forman parte del canon conocido. ENT-024 pertenece a la capa de trazabilidad/evaluación y no sustituye ENT-039. El simulador semántico no debe fabricar vínculos reificados, evidencia diagnóstica, fallas, gravedad, reparabilidad, módulos, reglas, intervenciones o estados diagnósticos antes de que el proceso correspondiente los produzca. Solo puede registrar objetos de gobernanza/trazabilidad que realmente nazcan del review/auditoría, manteniendo separación de capas.

La misma regla aplica a relaciones: el simulador **carga REL-001–REL-074 completos**, pero una relación canónica solo puede proponerse si sus endpoints legítimos existen en la etapa correspondiente. Las relaciones diagnósticas o de gobernanza no se anticipan durante la reconstrucción científica para completar el grafo.

---

# 10. THEORY COVERAGE Y TIPADO TEÓRICO

Antes de cerrar la representación teórica, el simulador debe demostrar que buscó sistemáticamente:

- THEORETICAL_RESOURCE;
- THEORETICAL_ASSERTION;
- CONCEPTUAL_ENTITY;
- EXTERNAL_KNOWLEDGE;
- SUPUESTO ENT-014;
- AMENAZA/EXPLICACIÓN ALTERNATIVA ENT-015;
- MEASUREMENT_SPECIFICATION cuando corresponda;
- relaciones REL-048–REL-066 y REL-067–REL-074 pertinentes.

No se exige convertir cada cita en nodo. La inclusión es funcional: un objeto entra cuando define, distingue, predice, explica, delimita, contextualiza, interpreta, operacionaliza, justifica, contrasta, cuestiona, aporta soporte externo o participa en una inferencia/decisión material.

`THEORETICAL_ASSERTION` v0.3 admite como subtipos canónicos solo los fijados por v1.4:

- DEFINITION;
- STRUCTURE_ASSERTION;
- RELATION_PROPOSITION;
- MECHANISM_PROPOSITION;
- THEORETICAL_EXPECTATION;
- BOUNDARY_CONDITION.

**ASSUMPTION no pertenece aquí**: usar ENT-014.  
**ALTERNATIVE_EXPLANATION no pertenece aquí cuando cumple función de amenaza/rival**: usar ENT-015.

---

# 11. BACKBONE CIENTÍFICO Y GATE DE COBERTURA

El simulador debe comprobar activación/no activación justificada del backbone conceptual:

```text
EXTERNAL_KNOWLEDGE / PROBLEMA / CONTRIBUCIÓN
        ↓
      PREGUNTA
        ↓
      CLAIM(S)
        ↓
FUNCIÓN METODOLÓGICA / REQUISITO DE EVIDENCIA
        ↓
      DISEÑO
        ↓
SELECCIÓN / MEDICIÓN-PRODUCCIÓN
        ↓
       DATO
        ↓
ANÁLISIS / INTERPRETACIÓN
        ↓
RESULTADO / HALLAZGO
        ↓
EVIDENCIA DEL ESTUDIO
        ↓
      CLAIM
```

Este backbone **no es una plantilla obligatoria** para todos los estudios. El gate pregunta, para cada familia potencialmente exigible por claim/diseño/tradición, si está presente, ausente, no aplicable, no detectada o unresolved.

---

# 12. RECONSTRUCCIÓN INFERENCIAL

Para cada claim relevante, el simulador busca y representa cuando corresponda:

- conclusión inmediata;
- premises;
- evidencia del estudio;
- conocimiento externo;
- theoretical assertions;
- warrants;
- backing;
- ENT-014 assumptions;
- ENT-015 threats/alternative explanations;
- rebuttals, undercutters, underminers;
- boundary conditions;
- decisiones metodológicas y requisitos de evidencia;
- dependencias de selección, medición, clasificación y análisis;
- observed vs claimed referent;
- scope/generalization.

Forma canónica de mayor precisión:

```text
ENT-023 / ENT-011 / ENT-004 --REL-067 PREMISE_IN--> ENT-039
ENT-036 --REL-068 WARRANTS-----------------------> ENT-039
ENT-014 --REL-069 ASSUMPTION_FOR-----------------> ENT-039
ENT-039 --REL-070 CONCLUDES----------------------> ENT-011
ENT-036/ENT-004 --REL-071 BACKS------------------> ENT-036 warrant
```

Toda ENT-039 tiene exactamente una conclusión inmediata.

---

# 13. GRUPOS Y PROPIEDADES DERIVADAS

El simulador puede representar premise groups en la capa semántica/intermedia:

- JOINT;
- CONVERGENT;
- ALTERNATIVE;
- UNRESOLVED.

En el grafo canónico, linked/convergent/chained y propiedades como directness, coverage, required_for_target, redundancia, bottleneck y contribución contrafactual se derivan de topología y metadata. No crear REL-ID ni entidades nuevas para ellas.

---

# 14. RELEVANCIA FUNCIONAL, LITERATURA Y “CASCARILLA”

Solo se evalúan **después** de cerrar suficientemente entidades, teoría, relaciones e inferencias.

## 14.1 Relevancia funcional

Las categorías analíticas IAM revisables preservadas por Arquitectura v0.7 son:

- `CORE_INFERENTIAL`;
- `SUPPORTING`;
- `CONTEXTUALLY_NECESSARY`;
- `METHODOLOGICALLY_NECESSARY`;
- `PERIPHERAL`;
- `REDUNDANT`;
- `IRRELEVANT_TO_DEFENDIBILITY`;
- `UNRESOLVED`.

`NO_FUNCTION_DETECTED` puede usarse como estado prudencial cuando no se reconstruye una función suficiente, sin convertirlo automáticamente en irrelevancia.

**CASCARILLA no se almacena como entidad ni relación canónica.** Puede ser una etiqueta de reporte derivada sobre contenido `PERIPHERAL`, `REDUNDANT` o `IRRELEVANT_TO_DEFENDIBILITY` solo cuando exista fundamento suficiente. La desconexión bruta no basta.

Prueba contrafactual de referencia:

> Si se retira este bloque, ¿se pierde algo necesario para comprender constructos, justificar decisiones, sostener evidencia, interpretar resultados, establecer alcance/limitaciones o defender claims relevantes?

La ausencia de cambio al retirar una pieza tampoco implica automáticamente irrelevancia, porque puede existir redundancia funcional.

## 14.2 Literatura como infraestructura epistémica

`LITERATURE_USE` es un **registro analítico auxiliar del IAM simulado rico** —compatible con el objeto homónimo de IAM v0.1 cuando se proyecte— y **no una entidad raíz canónica**. Debe conservar, cuando corresponda, qué fuente se cita, dónde, qué idea se le atribuye, para qué objeto/claim se usa y qué función cumple. Su existencia en la simulación no obliga a reducir la literatura a la estructura de IAM v0.1: los objetos sustantivos siguen representándose con ENT-004, ENT-005, ENT-018, ENT-036, ENT-037, ENT-038 y relaciones canónicas pertinentes.

Dimensiones de evaluación preservadas por la arquitectura:

- `NECESSITY`;
- `SUFFICIENCY`;
- `AUTHORITY`;
- `CURRENCY`;
- `DISCIPLINARY_RELEVANCE`;
- diversidad/cobertura epistémica cuando sea pertinente.

Estas dimensiones no crean ENT-ID ni REL-ID. `AUTHORITY` no verificada externamente permanece `NOT_EXTERNALLY_VERIFIED` o `UNKNOWN`; el texto de la tesis por sí solo no autoriza convertirla en hecho canónico.

# 15. HUMAN REVIEW

La IA propone; el humano adjudica semántica diagnósticamente relevante.

Review prioritario para:

- existencia/tipo ambiguo;
- theoretical assertion dudosa;
- theoretical function dudosa;
- warrant;
- assumption/threat reconstruction;
- inference step implícito;
- relation topology ambigua;
- referent ambiguo;
- claim semantics;
- relevancia/cascarilla no trivial;
- ontology/domain gaps.

Estados de interpretación/revisión preservados de IAM/Arquitectura v0.7:

- `CONFIRMED`;
- `PROBABLE`;
- `TENTATIVE`;
- `AMBIGUOUS`;
- `UNRESOLVED`;
- `ABSTAIN`;
- `REJECTED`.

Estos estados no son defendibilidad, evaluability ni calidad epistemológica; `confidence` tampoco los sustituye. `CONFIRMED` se reserva para adjudicación humana o condición inequívoca definida por contrato.

Operaciones mínimas de revisión humana que la SPEC debe poder representar:

- `CONFIRM`;
- `REJECT`;
- `CHANGE_TYPE`;
- `CHANGE_RELATION`;
- `ADD_RELATION`;
- `DELETE_RELATION`;
- `SPLIT_UNIT`;
- `MERGE_UNITS`;
- `CHANGE_PREMISE_GROUP`;
- `CHANGE_CENTRALITY`;
- `CHANGE_RELEVANCE`.

Toda operación preserva la propuesta automática previa, actor, timestamp/versión y razón cuando corresponda. `ABSTAIN` se preserva como estado/decisión de no adjudicar cuando el contrato aplicable lo permita.

---

# 15A. S5R — RELATIONAL_CLOSURE_AUDIT

S5R ejecuta íntegramente `SCITESIS_CONCEPTUAL_SIMULATOR_RELATIONAL_CLOSURE_AUDIT_v0.1.md`. Es obligatorio para toda simulación v0.3.

Como mínimo debe:

1. revisar todas las entidades activas, con atención reforzada a `CORE_INFERENTIAL` y `METHODOLOGICALLY_NECESSARY`;
2. comprobar relaciones canónicas compatibles por dominio/codominio sin asumir que compatibilidad implica existencia;
3. buscar evidencia documental, inferencial o de provenance para cada relación candidata material;
4. revisar explícitamente el backbone pregunta → claim → función/requisito → diseño → selección/producción → dato → análisis → resultado → evidencia → claim cuando sea aplicable;
5. mantener simultáneamente, cuando corresponda, la semántica científica `REL-019 SUSTENTA` y la semántica argumental `REL-067/068/070`; ENT-039 no sustituye relaciones científicas del backbone;
6. examinar referencias internas en atributos (`derived_from_ids`, `source_ids`, `target_ids` o equivalentes) para determinar si ocultan una dependencia que deba materializarse como REL;
7. justificar los nodos centrales que permanezcan aislados;
8. detectar tanto subconectividad como sobreconectividad;
9. conservar incertidumbre y enviar a S7/Human Review cualquier relación material que no pueda cerrarse legítimamente;
10. dejar evidencia auditable de la corrida usando mecanismos ya permitidos por `simulation_trace.json` v0.2, en particular registros de propuestas, gates, `validation.checks` y/o `experimental_sidecar`; no se exige ampliar Output Schema v0.2.

S5R produce una topología revisada, no un diagnóstico. Está prohibido inventar aristas para satisfacer cobertura.

# 16. GATES DE COBERTURA v0.3

## G1 CANON_COVERAGE_GATE

Verifica que la ejecución cargó ENT-001–ENT-039, REL-001–REL-074, tombstones y reglas negativas vigentes. Un tipo no puede faltar del universo del ejecutor por simplificación previa.

## G2 THEORY_AND_EXTERNAL_KNOWLEDGE_COVERAGE_GATE

Verifica búsqueda suficiente de ENT-004, ENT-005, ENT-018, ENT-036, ENT-037, ENT-038, ENT-014/015 cuando correspondan, sus relaciones funcionales y los registros `LITERATURE_USE`/dimensiones de evaluación pertinentes como sidecar analítico no ontológico del IAM simulado rico.

## G3 SCIENTIFIC_BACKBONE_COVERAGE_GATE

Solo puede ejecutarse como gate final de cobertura después de S5R. Verifica cobertura/ausencia/no aplicabilidad del backbone científico activado por los claims y el diseño **como topología explícita**, no solo como inventario de entidades. La presencia de los tipos pertinentes sin búsqueda/adjudicación de sus relaciones no permite `PASS`.

## G4 INFERENCE_AND_RELATION_COVERAGE_GATE

Solo puede ejecutarse como gate final después de S5R. Verifica que los claims relevantes tengan rutas reconstruidas o un estado explícito de por qué no pueden reconstruirse; exige buscar la relación canónica más específica antes de usar relaciones generales como REL-005 INFORMA o REL-018 CONTRIBUYE_A; y comprueba que la capa ENT-039 no haya sustituido relaciones científicas, metodológicas o teóricas que deban coexistir explícitamente.

## G5 FUNCTIONAL_RELEVANCE_GATE

Prohíbe clasificar contenido como periférico, redundante o no contributivo antes de cerrar los gates anteriores.

## G6 FINAL_SEMANTIC_COMPLETENESS_GATE

Antes de `CONFIRMED_SIMULATED_GRAPH`, verifica:

- S5R fue ejecutado y dejó evidencia auditable;
- G3 y G4 corresponden al estado posterior a S5R, no a una evaluación previa reutilizada;

- provenance suficiente;
- cobertura de claims/subclaims;
- cobertura teórica;
- cobertura de backbone;
- rutas inferenciales o razones explícitas de ausencia;
- unresolved/abstain visibles;
- ausencia de tipos/relaciones inventados;
- separación objeto/función;
- consistencia con tombstones;
- estado de proyección de cada objeto.

El resultado del gate puede ser `PASS`, `PASS_WITH_DECLARED_GAPS` o `BLOCKED`; son outcomes de validación interna del simulador, no estados canónicos de entidad, relación, review o defendibilidad.

---

# 17. SALIDA NORMATIVA DEL SIMULADOR

La v0.3 adopta como artefactos obligatorios:

1. `simulation_trace.json` — proceso S0–S8 incluyendo S5R, propuestas, rechazos, supersession, audit trail y cobertura.
2. `confirmed_simulated_graph.json` — semántica adjudicada activa, sin degradación para renderer/runtime.
3. `simulation_manifest.json` — versiones, fuentes, gates y artefactos.

El `confirmed_simulated_graph.json` es la materialización adjudicada del **IAM simulado rico** para un caso. Debe poder contener cualquier ENT/REL canónico **legítimamente instanciado en el caso**, sin degradarlo por limitaciones de IAM v0.1, Graph v0.2, renderer o runtime. No debe confundirse con Graph v0.2 confirmado del producto. `projection_status` es metadata propia del simulador/compatibilidad y **no un tipo, estado epistemológico ni vocabulario ontológico canónico**. Valores como `CONCEPTUAL_SIMULATION_ONLY`, `TRACEABILITY_ONLY` o `KNOWN_DOWNSTREAM` solo describen capacidad de proyección.

Campos mínimos por objeto relevante:

```text
id
canonical_entity_id / canonical_relation_id
kind
subtype/role cuando aplique
text/value
provenance
explicitness
confidence
review_state
projection_status
functional_relevance cuando ya fue evaluada
```

El renderer y el runtime downstream **no determinan** el vocabulario permitido del output conceptual.

---

# 18. PROYECCIÓN OPERACIONAL

El simulador conoce y conserva el canon completo mediante el **IAM simulado rico**. Para integración con el producto, la frontera normativa operativa permanece `IAM v0.1 → Validator → Graph Compiler → Graph v0.2`. Cualquier adapter del simulador debe respetar esa frontera y no reemplazarla.

La proyección ocurre en dos pasos conceptualmente separados:

```text
ARQUITECTURA CANÓNICA RICA
        ↓
IAM SIMULADO RICO
        ↓  compatibility adapter
IAM v0.1 OPERATIVO
        ↓
VALIDATOR → GRAPH COMPILER → GRAPH v0.2
```

El adapter puede producir `UNSUPPORTED_MAPPING` o conservar contenido solo en el artefacto simulado; **nunca puede eliminar, retipar por conveniencia ni colapsar semántica rica para satisfacer el contrato operativo**.

Nunca:

```text
runtime vocabulary
        ↓
limita ontología del simulador
```

Si un objeto canónico no tiene mapping operacional vigente, se conserva y se marca; no se degrada a un tipo semánticamente incorrecto.

---

# 19. PROHIBICIONES v0.3

El simulador NO debe:

- seleccionar de antemano un subconjunto ontológico del canon;
- inventar ENT/REL/subtypes;
- reactivar ENT-006, ENT-007 o REL-026;
- usar SUPPORTS genérico;
- modelar ASSUMPTION como subtype de ENT-036;
- modelar amenaza/rival como subtype de ENT-036 cuando corresponde ENT-015;
- convertir teoría en evidencia del estudio;
- convertir literatura externa en evidencia local;
- convertir resultado en evidencia sin adjudicar función;
- convertir SourceUnit/cita en Evidence automáticamente;
- usar conectividad bruta como medida de relevancia;
- marcar “cascarilla” antes de cerrar cobertura;
- diagnosticar o reparar desde el PDF;
- permitir que renderer, Candidate o Contract M reduzcan el canon conceptual;
- ocultar `UNRESOLVED`, `ABSTAIN`, `NOT_DETECTED_YET` u `ONTOLOGY_GAP`.

---

# 20. VALIDACIÓN INTERNA

Una ejecución v0.3 válida debe producir un `coverage_report` con al menos:

```text
canonical_entities_loaded: 39
canonical_relations_loaded: 74
tombstones_loaded: true
canon_version: v1.4
architecture_version: v0.7
iam_version: v0.1
graph_target: v0.2
entity_families_searched: [...]
relation_families_searched: [...]
coverage_gates: {...}
undeclared_type_count: 0
undeclared_relation_count: 0
silent_default_count: 0
```

Los conteos 39/74 expresan **vocabulario cargado**, no cantidad de instancias creadas en una tesis.

---

# 21. CRITERIO DE ÉXITO

Una simulación es exitosa cuando:

1. no pierde semántica porque el ejecutor desconocía una parte del canon;
2. representa únicamente aquello que la tesis permite sostener;
3. conserva incertidumbre y provenance;
4. reconstruye suficientemente claims, decisiones, evidencia, teoría e inferencias;
5. ejecuta S5R y demuestra que la topología materialmente relevante fue buscada y adjudicada;
6. permite distinguir ausencia documental de omisión de extracción;
7. permite evaluar relevancia funcional sin confundir no-conectividad con irrelevancia;
8. entrega un grafo conceptual independiente del renderer y del runtime;
9. permite comparar después `SIMULATED/HUMAN GOLD` contra runtime real sin que ambos compartan la misma reducción ontológica previa.

---

# 22. REGRESIÓN OBLIGATORIA QUALIS

El caso QUALIS se mantiene como fixture de regresión para v0.3. Una nueva ejecución no puede cerrar semánticamente si:

- omite theoretical resources/assertions funcionalmente relevantes;
- no distingue EXTERNAL_KNOWLEDGE de teoría y evidencia del estudio;
- no representa ENT-014/ENT-015 cuando aparezcan;
- deja claims/subclaims relevantes sin ruta sin declarar la causa;
- deja nodos `CORE_INFERENTIAL` o `METHODOLOGICALLY_NECESSARY` aislados sin examen/justificación relacional;
- representa producción, datos, análisis, resultados o evidencia pero omite sus relaciones canónicas sustentadas;
- usa ENT-039 como sustituto de REL-019 SUSTENTA u otras relaciones científicas que deban coexistir;
- marca contenido como cascarilla antes del cierre de cobertura;
- fuerza producción cualitativa de datos a una ontología exclusivamente cuantitativa;
- pierde resultados/hallazgos cualitativos por falta de mapping operacional.

QUALIS no autoriza por sí solo a modificar el canon; sirve para verificar que el simulador puede **instanciarlo sin reducción previa**.

---

# 23. REGLA MAESTRA DEL EJECUTOR IA

> **Carga primero todo el canon vigente. Luego representa lo que el documento contiene. Después relaciona. Después reconstruye inferencias. Después ejecuta una segunda pasada relacional exhaustiva y no inventiva. Solo entonces verifica G3/G4. Después resuelve referencias. Después explicita incertidumbre. Después pide adjudicación. Solo después evalúa relevancia funcional. Nunca diagnostiques ni repares antes de cerrar suficientemente la representación semántica. Nunca confundas “no lo detecté” con “no existe”.**

---

# 24. DEPENDENCIAS Y COMPATIBILIDAD

Esta SPEC exige `SCITESIS_CONCEPTUAL_SIMULATOR_MASTER_PROMPT_v0.3.md` y adopta `SCITESIS_CONCEPTUAL_SIMULATOR_RELATIONAL_CLOSURE_AUDIT_v0.1.md` como procedimiento subordinado obligatorio.

No exige una nueva versión del Output Contract ni del Output Schema: `SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_CONTRACT_v0.2.md` y `SCITESIS_CONCEPTUAL_SIMULATOR_OUTPUT_SCHEMA_v0.2.json` permanecen vigentes mientras S5R pueda registrar su evidencia dentro de campos ya permitidos (`validation.checks`, gates, registros de propuestas y/o `experimental_sidecar`). Una futura necesidad de cambiar la forma serializada deberá versionarse por separado y no reabrirá esta SPEC silenciosamente.

Ninguna actualización modifica retrospectivamente ejecuciones o baselines v0.1/v0.2.

---

**Fin de SCITESIS CONCEPTUAL SIMULATOR SPEC v0.3**
