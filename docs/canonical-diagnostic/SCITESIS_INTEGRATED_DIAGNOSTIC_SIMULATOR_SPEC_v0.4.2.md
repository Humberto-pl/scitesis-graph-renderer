SCITESIS — INTEGRATED DIAGNOSTIC SIMULATOR SPEC v0.4.2

Estado: DEVELOPMENT / SUCCESSOR EXPLÍCITO DE CONCEPTUAL SIMULATOR v0.3  
Fecha: 15 de septiembre de 2026  
Sustituye para nuevas simulaciones integradas: SCITESIS\_CONCEPTUAL\_SIMULATOR\_SPEC\_v0.3.md  
No reescribe: v0.3, simulaciones históricas, golds, IAM v0.1, Graph v0.2, Motor histórico, Renderer ni baselines frozen.

0\. PROPÓSITO

Esta especificación define la primera versión integrada del Simulador de SciTesis capaz de reconstruir la arquitectura conceptual de una investigación y, una vez cerrada y revisada esa representación, ejecutar provisionalmente mediante IA el diagnóstico que en la arquitectura definitiva corresponderá a IAM → Graph → Motor Diagnóstico → Gravedad/Reparación.

v0.4 amplía v0.3. No lo reinterpreta.

v0.3 terminaba antes del diagnóstico. v0.4 conserva íntegramente esa frontera dentro de su FASE A y añade una FASE B diagnóstica explícitamente separada.

Regla maestra:

ARQUITECTURA CONCEPTUAL DEFINE.  
SIMULADOR v0.4 ANTICIPA.  
MOTOR FUTURO IMPLEMENTA.  
RENDERER REPRESENTA.

El Simulador no constituye una arquitectura conceptual paralela. Toda decisión diagnóstica debe derivarse de autoridades explícitas y debe poder ser sustituida posteriormente por una implementación computable sin cambiar el significado de la salida.

1\. AUTORIDADES Y PRECEDENCIA

Para nuevas ejecuciones v0.4, la precedencia mínima es:

1\. SciTesis — Arquitectura Conceptual del Sistema Maestro de Diagnóstico Metodológico v0.8.  
2\. Diccionario Ontológico Canónico v1.4.  
3\. Catálogo Canónico de Relaciones v1.4.  
4\. Mapa Maestro y Grafo Canónico v1.4.  
5\. SCITESIS\_CONCEPTUAL\_SIMULATOR\_SPEC\_v0.3.md, para reconstrucción conceptual prediagnóstica y cierre relacional.  
6\. SciTesis — Adjudicación Conceptual de Defendibilidad Def\_e(c) v0.1.  
7\. SciTesis — Adjudicación Conceptual de Dependencia Justificativa, Frontier, Breakpoints y Propagación v0.1.  
8\. SciTesis — Contrato Computable Mínimo de Diagnóstico v0.1.2.  
9\. SciTesis — JSON Schema de Salida Diagnóstica v0.1.2.  
10\. SciTesis — Batería Adversarial de Fixtures Diagnósticos v0.1.2.  
11\. IAM/Graph/Compiler/Motor vigentes, únicamente para compatibilidad downstream y nunca para reducir silenciosamente la arquitectura conceptual.

Cuando una autoridad posterior y explícita adjudica una cuestión que v0.3 dejaba fuera de alcance, prevalece esa adjudicación para v0.4. Cuando no existe adjudicación suficiente, el Simulador no inventa: produce UNKNOWN \+ REVIEW\_REQUIRED.

2\. RELACIÓN EXACTA CON v0.3

v0.4 hereda sin modificación sustantiva de v0.3:

\- canon completo ENT-001–ENT-039;  
\- canon REL-001–REL-074;  
\- regla “el canon se carga completo; la tesis instancia solo lo que contiene”;  
\- IAM simulado rico como representación experimental, no IAM v0.1;  
\- separación objeto / función / rol / plano epistémico;  
\- lectura documental completa;  
\- provenance obligatoria;  
\- contextual multi-axial interpretation;  
\- entity assertion proposal;  
\- relation proposal;  
\- inference reconstruction;  
\- relational closure audit;  
\- Human Review;  
\- prohibición de silent defaults y silent repairs;  
\- preservación de incertidumbre local;  
\- prohibición de convertir contract PASS en validez semántica.

La salida de FASE A de v0.4 debe ser semánticamente equivalente a una ejecución válida de v0.3 sobre el mismo documento y las mismas adjudicaciones, salvo cambios impuestos explícitamente por Arquitectura v0.8.

3\. FRONTERA NUEVA DE v0.4

Una ejecución v0.4 puede continuar después de CONFIRMED\_SIMULATED\_GRAPH hacia diagnóstico, pero solo cuando:

A. la representación prediagnóstica supera los gates heredados de v0.3;  
B. el scope diagnóstico está explícito o adjudicado;  
C. la incertidumbre estructural material que pueda cambiar el diagnóstico está resuelta o marcada;  
D. el estado de evaluación e está identificado;  
E. el Simulador puede distinguir fallas de reconstrucción de fallas metodológicas de la tesis.

Si estas condiciones no se cumplen, la ejecución diagnóstica puede ser parcial, pero no puede presentar como RESOLVED una frontera, propagación o defendibilidad que dependa de la ambigüedad pendiente.

4\. ARQUITECTURA DE EJECUCIÓN v0.4

FASE A — RECONSTRUCCIÓN CONCEPTUAL

Documento/PDF  
→ S0 Document normalization  
→ S1 Candidate segmentation  
→ S2 Contextual multi-axial interpretation  
→ S3 Canonical entity proposal  
→ S4 Canonical relation proposal  
→ G1/G2 coverage gates  
→ S5 Inference reconstruction  
→ S5R Relational closure audit  
→ G3/G4 coverage gates  
→ S6 Target/reference resolution  
→ S7 Human Review queue  
→ HUMAN REVIEW  
→ S8 Confirmed or provisional simulated graph assembly  
→ G5/G6 final semantic completeness  
→ CONFIRMED\_SIMULATED\_GRAPH

FASE B — DIAGNÓSTICO GRAPH-NATIVE SIMULADO

Confirmed or provisional simulated graph  
→ D0 Diagnostic preconditions  
→ D1 Scope and evaluation state  
→ D2 Diagnostic evidence derivation  
→ D3 Rule applicability/exigibility and methodological failure detection  
→ D4 G\_D assembly / active diagnostic conditions  
→ D5 Iterative resolution of Active\_e(i) and Def\_e(c)  
→ D6 Active-only viable justificatory dependency H\_e  
→ D7 Route analysis  
→ D8 Inferential breakpoints  
→ D9 Downstream propagation  
→ D10 Maximal defendable claims  
→ D11 Defendability frontier  
→ D12 Compatibility maximums  
→ D13 Gravity/Reparability only when an authorized output contract exists  
→ D14 Structured explanation trace  
→ D15 Diagnostic output validation  
→ DIAGNOSTIC\_OUTPUT\_v0.1.2

FASE C — PRESENTACIÓN

DIAGNOSTIC\_OUTPUT\_v0.1.2  
→ proyección comunicacional  
→ Renderer o informe visible

FASE C no puede recalcular ni reinterpretar resultados diagnósticos.

5\. D0 — PRECONDICIONES DIAGNÓSTICAS

Antes de diagnosticar, verificar como mínimo:

\- claims relevantes identificados;  
\- INFERENCE\_STEP relevantes identificados;  
\- cada step tiene una conclusión recuperable;  
\- roles PREMISE/WARRANT/ASSUMPTION no se confunden con tipos ontológicos;  
\- JOINT/LINKED y CONVERGENT/ALTERNATIVE no están colapsados;  
\- REBUTS, UNDERCUTS y UNDERMINES permanecen diferenciados;  
\- provenance y review state permiten distinguir evidencia del documento de reconstrucción del sistema;  
\- scope es suficientemente explícito;  
\- el evaluation\_state\_id es identificable;  
\- una falla de parseo/reconstrucción no se presenta como falla metodológica.

Fallo material de precondición: REVIEW\_REQUIRED o diagnóstico parcial. Nunca silent repair.

6\. D1 — SCOPE Y ESTADO DE EVALUACIÓN

Toda defendibilidad se evalúa bajo un estado e y un scope.

El scope debe identificar los claims, objetivos, componentes o targets pertinentes. Un claim terminal defendible fuera del scope no pertenece automáticamente a la frontier del scope evaluado.

El estado e debe conservar referencias a:

\- graph/snapshot version;  
\- active adjudications;  
\- active diagnostic conditions;  
\- active defeaters;  
\- diagnostic rule version;  
\- incertidumbres relevantes.

Frontier, breakpoints y downstream effects no son propiedades intemporales del nodo: son resultados dependientes de e y scope.

7\. D2 — ACTIVE\_e(i)

Para cada ENT-039 relevante:

Active\_e(i) ⇔ RequiredInputsSatisfied\_e(i) ∧ Applicable\_e(i) ∧ ¬Defeated\_e(i)

Estados semánticos mínimos:

ACTIVE  
INACTIVE  
UNKNOWN

Estado de adjudicación separado:

RESOLVED  
REVIEW\_REQUIRED

REVIEW\_REQUIRED nunca sustituye ACTIVE/INACTIVE/UNKNOWN.

JOINT/LINKED usa semántica AND para entradas requeridas.

CONVERGENT/ALTERNATIVE permite semántica OR entre derivaciones suficientes independientes.

La mera multiplicidad topológica de paths no demuestra independencia.

8\. D3 — H\_e

H\_e es una vista derivada de dependencia justificativa viable bajo e. No es un nuevo Graph canónico ni una nueva capa ontológica.

Una transición de H\_e debe conservar al menos:

source claim/input  
inference step  
target claim  
transition state  
required\_for\_step cuando esté adjudicado  
required\_for\_target cuando esté adjudicado  
alternative routes  
provenance  
rule/adjudication references

Raw reachability no equivale a dependencia justificativa ni a necesidad.

9\. D4 — DEF\_e(c)

Def\_e(c) responde si la formulación actual del claim c puede sostenerse bajo e y scope.

Valores mínimos:

TRUE: existe al menos una derivación justificativa suficiente y viable relevante, y no existe condición bloqueante aplicable que impida defender la formulación actual.

FALSE: no permanece ninguna derivación suficiente viable relevante, o una condición bloqueante aplicable impide defender la formulación actual.

UNKNOWN: la información representada no permite resolver TRUE/FALSE sin inventar necesidad, suficiencia, independencia, applicability, defeat, prioridad o scope.

UNKNOWN implica REVIEW\_REQUIRED cuando la incertidumbre es material.

Def\_e(c) no es verdad, probabilidad ni calidad promedio.

Def\_e(c) no redefine maximum\_defensible\_reformulation. Una formulación original puede ser FALSE mientras una reformulación más débil sea defendible.

10\. D5 — RUTAS JUSTIFICATIVAS

La ruta diagnósticamente relevante es una trayectoria justificativa viable o intentada, no cualquier path topológico.

Para cada target material, el Simulador debe identificar:

\- derivaciones suficientes vivas;  
\- derivaciones bloqueadas;  
\- entradas conjuntamente necesarias;  
\- bottlenecks compartidos;  
\- rutas alternativas realmente independientes cuando pueda adjudicarse;  
\- incertidumbre sobre suficiencia o independencia.

No puede usar número de paths, longitud, centralidad o posición textual como sustituto de estas propiedades.

11\. D6 — INFERENTIAL\_BREAKPOINT

INFERENTIAL\_BREAKPOINT es un resultado derivado, normalmente anclado a ENT-039. No es una nueva entidad.

Es el primer punto de una trayectoria justificativa intentada donde deja de transmitirse defendibilidad.

Debe registrar separadamente:

origin\_of\_failure\_ref  
breakpoint\_step\_id  
affected\_transition\_target\_id  
failure\_mode  
active\_defeater\_or\_blocking\_condition\_ref  
first\_break\_on\_route  
adjudication\_status  
explanation\_trace

Failure modes mínimos:

UNSATISFIED\_REQUIRED\_PREMISE  
UNSATISFIED\_REQUIRED\_WARRANT\_OR\_ASSUMPTION  
INAPPLICABLE\_STEP  
UNDERCUT\_INFERENCE  
UNDERMINED\_REQUIRED\_INPUT  
REBUTTED\_CONCLUSION  
BLOCKING\_DIAGNOSTIC\_CONDITION

Si el failure mode no puede adjudicarse: null \+ REVIEW\_REQUIRED.

El breakpoint no implica por sí mismo que el step sea lógicamente inválido.

12\. D7 — PROPAGACIÓN DOWNSTREAM

La propagación no se calcula por descendant closure.

Para cada falla-target:

AFFECTED: la falla elimina todas las derivaciones suficientes viables relevantes para el target, o activa una condición bloqueante equivalente.

NOT\_AFFECTED: al menos una derivación suficiente e independiente permanece viable.

UNKNOWN: necesidad, suficiencia o independencia no pueden resolverse responsablemente.

UNKNOWN material implica REVIEW\_REQUIRED.

La salida debe indicar qué derivaciones se perdieron y cuáles permanecen.

Fallas cooperativas deben poder representarse sin crear SUPPORT\_SET como ENT. Una combinación de fallas puede afectar un target aunque cada falla aislada deje viva otra ruta.

13\. D8–D9 — MAXIMAL\_DEFENDABLE\_CLAIMS Y DEFENDABILITY\_FRONTIER

Sea C\_scope el conjunto de claims relevantes y ≺\_e la precedencia justificativa viable.

M\_e \= { c ∈ C\_scope : Def\_e(c)=TRUE y no existe c' defendible en C\_scope tal que c ≺\_e+ c' }

MAXIMAL\_DEFENDABLE\_CLAIMS es el concepto formal.

DEFENDABILITY\_FRONTIER(e,scope) es la vista diagnóstica de M\_e.

La frontier puede tener cero, uno o varios miembros.

No llamar maximum a cada miembro de una frontier múltiple.

Si ciclos relevantes impiden determinar maximalidad bajo el soporte formal disponible en v0.4, producir REVIEW\_REQUIRED; no romper ciclos por ID, orden textual o intuición.

14\. D10 — COMPATIBILITY MAXIMUM

MAXIMUM\_DEFENDABLE\_CLAIM solo puede emitirse cuando:

A. existe un verdadero máximo bajo el scope y relación pertinentes; o  
B. la consulta es route-local sobre una trayectoria inequívocamente lineal.

Frontier cardinality=1 no basta por sí sola para probar un máximo global.

15\. D11 — GRAVEDAD Y REPARABILIDAD

Defendibilidad, gravedad y reparabilidad permanecen separadas.

Defendibilidad: ¿puede sostenerse ahora el claim?  
Gravedad: ¿qué tan comprometedor es el problema?  
Reparabilidad: ¿qué intervención puede restaurar la trayectoria y con qué restricciones/costo?

v0.4 puede simular gravedad y reparabilidad únicamente cuando las reglas aplicables estén presentes en las autoridades vigentes. Si no existe adjudicación suficiente, debe producir una recomendación provisional claramente marcada o REVIEW\_REQUIRED; no crear scoring universal compensatorio.

16\. D12 — EXPLICABILIDAD

Toda conclusión material debe ser trazable como mínimo a:

1\. objeto/condición de origen;  
2\. evidencia diagnóstica;  
3\. step/transición afectada;  
4\. ruta perdida;  
5\. rutas alternativas;  
6\. decisión Def\_e(c);  
7\. efecto downstream;  
8\. pertenencia/no pertenencia a frontier;  
9\. incertidumbres pendientes;  
10\. reparación prioritaria cuando corresponda.

La explicación natural nunca reemplaza el objeto estructurado.

17\. D13 — OUTPUT CONTRACT

Toda ejecución diagnóstica debe producir una salida compatible con SciTesis Diagnostic Output v0.1.2:

schema\_version  
run\_metadata  
scope  
inference\_step\_states\[\]  
claim\_defendibility\[\]  
viable\_dependency\_view  
breakpoints\[\]  
downstream\_effects\[\]  
defendability\_frontier  
compatibility\_maximums\[\]  
review\_required\_items\[\]  
explanation\_summary

No omitir arrays vacíos: usar \[\].

La salida visible al usuario se deriva después de este envelope.

18\. POLÍTICA DE INCERTIDUMBRE

REVIEW\_REQUIRED es estado de adjudicación, no estado semántico de defendibilidad, actividad, afectación ni failure mode.

Usar UNKNOWN \+ REVIEW\_REQUIRED cuando una decisión material exigiría inventar:

\- necesidad;  
\- suficiencia;  
\- independencia;  
\- scope;  
\- applicability;  
\- defeat;  
\- prioridad entre defeaters;  
\- regla composicional;  
\- resolución de ciclo;  
\- evidencia ausente.

El Simulador puede registrar una hipótesis provisional, pero no puede usarla silenciosamente para emitir RESOLVED.

19\. REGLAS DE NO INVENCIÓN

v0.4 no puede:

\- crear ENT-040 o nuevos ENT-ID;  
\- crear REL-075 o nuevos REL-ID;  
\- crear SUPPORTS genérico;  
\- crear SUPPORT\_SET como entidad;  
\- crear support\_strength primitivo universal;  
\- redefinir REL-067 como necesidad global;  
\- derivar necesidad por simple existencia de PREMISE\_IN;  
\- colapsar REBUTS/UNDERCUTS/UNDERMINES;  
\- usar confidence del extractor como fuerza epistemológica;  
\- convertir ausencia en falla sin applicability/exigibility;  
\- promediar fallas para decidir defendibilidad;  
\- inventar maximum global;  
\- recalcular diagnóstico en Renderer;  
\- alterar retrospectivamente v0.3.

20\. MODOS DE USO

GRAPH-FIRST

Entrada: Graph confirmado/snapshot autorizado \+ scope \+ e.  
Uso: pruebas, fixtures, convergencia con Motor futuro.

INTEGRATED-FROM-THESIS

Entrada: tesis/proyecto \+ canon \+ contexto.  
Uso: MVP comercial y validación con casos reales.

En modo integrado, FASE A debe completarse antes de FASE B. La IA puede ejecutar ambas en una misma sesión, pero los estados y outputs deben permanecer separados.

21\. BATERÍA DE ACEPTACIÓN

v0.4 no puede considerarse estable sin superar, como mínimo, F01–F16 de la Batería Adversarial v0.1.2:

\- lineal con ruptura;  
\- bifurcación con máximos incomparables;  
\- convergencia con ruta viva;  
\- JOINT con premisa fallida;  
\- bottleneck compartido;  
\- rebuttal;  
\- undercut;  
\- undermine;  
\- claim terminal fuera de scope;  
\- necesidad no adjudicada;  
\- claim compuesto;  
\- ciclo;  
\- fallas cooperativas;  
\- movimiento de frontier tras reparación.

Una explicación plausible no compensa un output estructurado incorrecto.

22\. COMPATIBILIDAD FUTURA

El Motor futuro debe poder sustituir progresivamente las funciones simuladas sin cambiar el contrato de salida.

Orden sugerido de sustitución:

1\. validación de inputs/invariantes;  
2\. Active\_e(i);  
3\. H\_e;  
4\. Def\_e(c);  
5\. downstream propagation;  
6\. breakpoints;  
7\. frontier;  
8\. gravedad/reparabilidad;  
9\. contrafactuales de reparación.

Las discrepancias Simulador/Motor se clasifican como:

\- error de implementación;  
\- insuficiencia de input;  
\- diferencia de versión/regla;  
\- ambigüedad conceptual;  
\- caso no adjudicado.

El Simulador no tiene autoridad superior por ser más flexible.

23\. GATE DE COHERENCIA v0.4

Esta versión es coherente solo mientras:

\- v0.3 permanece intacta e históricamente válida;  
\- Graph/canon ENT/REL no se modifica por esta SPEC;  
\- la nueva capa diagnóstica permanece derivada;  
\- Def\_e(c), frontier, breakpoint y propagación conservan Arquitectura v0.8;  
\- REVIEW\_REQUIRED permanece separado de UNKNOWN;  
\- maximum\_defensible\_reformulation permanece separado de frontier;  
\- causa, breakpoint y consecuencia permanecen diferenciados;  
\- Renderer permanece sin inteligencia diagnóstica;  
\- runtime/baselines históricos no se reinterpretan.

24\. ESTADO DE v0.4

v0.4 es un successor explícito de alcance ampliado. Conserva la reconstrucción conceptual rica de v0.3 y añade una simulación diagnóstica graph-native conforme a Arquitectura v0.8.

No declara production readiness ni congela el Motor. Su propósito es servir como MVP diagnóstico controlado y como referencia funcional de transición hacia la arquitectura computable.

25\. SIGUIENTE ARTEFACTO

SCITESIS\_INTEGRATED\_DIAGNOSTIC\_SIMULATOR\_MASTER\_PROMPT\_v0.4.2 debe operacionalizar esta SPEC sin añadir semántica nueva y debe producir exactamente el output contract diagnóstico vigente.

26\. CORRECCIONES POST-AUDITORÍA — v0.4.2

26.1. Precedencia normativa corregida  
Para ejecución v0.4.2 se distingue entre autoridad conceptual y contrato operacional. Arquitectura Conceptual v0.8 y el canon ENT/REL gobiernan el significado. El Contrato Computable Mínimo v0.1.2 y el JSON Schema v0.1.2 gobiernan la operacionalización y serialización vigentes. Las adjudicaciones conceptuales v0.1 conservan valor de fundamento y trazabilidad, pero cuando contienen formulaciones preliminares posteriormente refinadas por v0.8/Contrato v0.1.2/Schema v0.1.2, prevalece la formulación posterior explícita. En particular, REVIEW\_REQUIRED no es failure\_mode ni valor sustantivo, y H\_e contiene solo transiciones viables.

26.2. Estados de salida de FASE A y Human Review  
FASE A puede terminar en dos estados distintos:  
A. CONFIRMED\_SIMULATED\_GRAPH: existe Human Review real o adjudicación humana equivalente suficiente para confirmar la representación materialmente relevante.  
B. PROVISIONAL\_SIMULATED\_GRAPH: la reconstrucción supera los gates automáticos, pero una o más decisiones estructurales relevantes no han sido confirmadas por un humano.  
PROVISIONAL\_SIMULATED\_GRAPH puede alimentar FASE B únicamente para diagnóstico provisional. Toda conclusión que dependa de una adjudicación no humana material debe conservar UNKNOWN \+ REVIEW\_REQUIRED o declararse provisional; no puede presentarse como RESOLVED por el solo razonamiento del modelo. El término CONFIRMED\_SIMULATED\_GRAPH queda reservado al estado A.

26.3. Generación explícita de la capa diagnóstica G\_D  
FASE B se divide obligatoriamente en dos subfases:  
B1 — DETECCIÓN DIAGNÓSTICA PRIMARIA: a partir de G\_I/snapshot autorizado, derivar evidencia diagnóstica, evaluar applicability/exigibility de reglas metodológicas, identificar fallas metodológicas y condiciones diagnósticas activas, preservar REBUTS/UNDERCUTS/UNDERMINES y construir/actualizar G\_D usando exclusivamente las entidades y relaciones diagnósticas permitidas por el canon vigente, incluyendo ENT-024–ENT-035 cuando sean aplicables. Ausencia de evidencia no se convierte en falla sin exigibility/applicability.  
B2 — IMPACTO SOBRE DEFENDIBILIDAD: usar G\_I \+ G\_D \+ e para resolver actividad, defendibilidad, rutas, breakpoints, propagación y frontier.  
Por tanto, en modo INTEGRATED-FROM-THESIS no se presupone active\_diagnostic\_conditions como dato externo: deben derivarse en B1 y conservar trazabilidad completa. Para los objetos canónicos materializados en G\_D, provenance conserva el significado y vocabulario de Graph v0.2 (STUDY | EXTERNAL | DIAGNOSTIC\_SOURCE | null); AI | RULE | HUMAN no son valores de provenance. El mecanismo o agente de producción/derivación/adjudicación se registra por separado como metadata no ontológica derivation\_origin=AI | RULE | HUMAN. derivation\_origin no sustituye provenance, type\_id, explicitness, review/adjudication state ni evidencia diagnóstica. En GRAPH-FIRST estas condiciones pueden recibirse ya adjudicadas, preservando la misma separación.

26.4. Evaluación iterativa Active\_e ↔ Def\_e  
Active\_e(i) y Def\_e(c) se resuelven conjuntamente por dependencia, no mediante dos barridos globales independientes. Para scopes acíclicos del MVP:  
1\. adjudicar claims/condiciones base evaluables bajo e;  
2\. evaluar los steps cuyas entradas requeridas ya sean resolubles;  
3\. actualizar Def\_e de sus conclusiones;  
4\. habilitar nuevos steps y repetir;  
5\. detener al alcanzar punto fijo sin cambios materiales.  
En DAGs esto equivale a un recorrido topológico condicionado por la semántica justificativa. Si un ciclo relevante impide estabilizar sin política SCC adjudicada, los objetos afectados quedan UNKNOWN \+ REVIEW\_REQUIRED.

26.5. H\_e estrictamente viable  
H\_e incluye exclusivamente transiciones ACTIVE. Las transiciones BLOCKED y UNKNOWN permanecen fuera de H\_e y se documentan mediante inference\_step\_states, blocked\_derivation\_ids, breakpoints, downstream\_effects y review\_required\_items. La precedencia justificativa ≺\_e y MAXIMAL\_DEFENDABLE\_CLAIMS se calculan únicamente sobre H\_e activo.

26.6. UNDERMINE preservado en diagnóstico  
Se incorpora UNDERMINED\_REQUIRED\_INPUT como failure\_mode específico cuando REL-074 UNDERMINES ataca una entrada requerida y vuelve no utilizable esa entrada para el step. No se colapsa automáticamente en UNSATISFIED\_REQUIRED\_PREMISE.

26.7. Secuencia ejecutiva corregida de FASE B  
El orden lógico vigente es:  
D0 Diagnostic preconditions  
→ D1 Scope and evaluation state  
→ D2 Diagnostic evidence derivation  
→ D3 Rule applicability/exigibility and methodological failure detection  
→ D4 G\_D assembly / active diagnostic conditions  
→ D5 Iterative resolution of Active\_e(i) and Def\_e(c)  
→ D6 Active-only viable justificatory dependency H\_e  
→ D7 Route analysis  
→ D8 Inferential breakpoints  
→ D9 Downstream propagation  
→ D10 Maximal defendable claims  
→ D11 Defendability frontier  
→ D12 Compatibility maximums  
→ D13 Gravity/Reparability only when an authorized output contract exists  
→ D14 Structured explanation trace  
→ D15 Diagnostic output validation  
→ DIAGNOSTIC\_OUTPUT\_v0.1.2  
Esta secuencia prevalece sobre la numeración D2–D13 anterior allí donde exista incompatibilidad.

26.8. Límite temporal de Gravedad/Reparabilidad  
Mientras Diagnostic Output v0.1.2 no contenga registros estructurados específicos de gravedad/reparabilidad, D13 no puede producir decisiones finales serializadas sobre esas dimensiones. Puede registrar necesidad de evaluación posterior o REVIEW\_REQUIRED, pero no esconder resultados normativos dentro de explanation\_summary. La incorporación estructurada de gravedad/reparabilidad requerirá una versión posterior del contrato/schema.

27\. CIERRE REFERENCIAL DE G\_D — v0.4.2  
27.1. Dos referencias de snapshot  
Toda ejecución diagnóstica conserva por separado: graph\_ref \+ graph\_version para G\_I/snapshot estructural y diagnostic\_graph\_ref \+ diagnostic\_graph\_version para G\_D. El Simulador no fusiona silenciosamente ambos grafos bajo un único identificador.

27.2. B1 debe materializar G\_D  
En INTEGRATED-FROM-THESIS, B1 culmina únicamente cuando existe un snapshot G\_D materializado, identificable y trazable para la corrida. run\_metadata debe registrar diagnostic\_graph\_origin=DERIVED. En GRAPH-FIRST, cuando G\_D llega upstream, diagnostic\_graph\_origin=PROVIDED.

27.3. Condición de paso B1→B2  
Antes de B2 debe verificarse que toda evidencia diagnóstica, falla, condición activa o defeater diagnóstico que será citado por la salida posea un ID resoluble en diagnostic\_graph\_ref. Una referencia no resoluble bloquea una salida RESOLVED dependiente de ella.

27.4. Trazabilidad de salida  
supporting\_diagnostic\_evidence\_ids, blocking\_condition\_ids, active\_diagnostic\_condition\_refs, origin\_of\_failure\_ref, active\_defeater\_or\_blocking\_condition\_ref, failure\_ref y TraceItem.subject\_ref de naturaleza diagnóstica deben resolverse contra G\_D. Las referencias estructurales siguen resolviéndose contra G\_I. Los IDs derivados deben resolverse dentro de los propios bloques derivados del envelope.

27.5. Identidad simulada  
En modo integrado, diagnostic\_graph\_ref y diagnostic\_graph\_version deben declarar explícitamente su carácter simulated/provisional y no reutilizar IDs/hashes de baselines frozen. La identidad de G\_D debe permanecer estable durante una misma corrida y cambiar de versión cuando cambie materialmente su contenido.

27.6. Invalidación  
Un cambio de diagnostic\_graph\_version exige invalidar o recomputar Active\_e, Def\_e, H\_e, breakpoints, downstream, frontier y cualquier explicación que dependa de G\_D.  
