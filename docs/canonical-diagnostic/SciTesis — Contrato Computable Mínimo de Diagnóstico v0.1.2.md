SCITESIS — CONTRATO COMPUTABLE MÍNIMO DE DIAGNÓSTICO v0.1.2

Estado: ESPECIFICACIÓN INTERMEDIA PARA MOTOR Y SIMULADOR DIAGNÓSTICO IA

1\. PROPÓSITO

Este documento traduce la Arquitectura Conceptual v0.8 a un contrato mínimo común de entrada, derivación y salida que deberá ser respetado por dos implementaciones distintas: (a) el Motor Diagnóstico computable futuro y (b) el Simulador Diagnóstico IA usado como MVP. No modifica Graph v0.2, IAM, el canon ENT/REL, el runtime frozen ni Renderer.

La finalidad del contrato es permitir que el Simulador anticipe funcionalmente al Motor sin constituir una arquitectura paralela. Cuando ambos reciban el mismo Graph confirmado, scope y estado de evaluación, deberán producir resultados semánticamente comparables aunque difieran en el mecanismo interno de razonamiento.

2\. PRINCIPIO DE CONVERGENCIA

Arquitectura Conceptual define la semántica. Este contrato define la forma computable mínima. El Simulador IA ejecuta provisionalmente el contrato. El Motor lo implementa de manera reproducible. El Renderer solo consume sus salidas.

Ninguna salida válida puede introducir nuevas entidades o relaciones canónicas. Toda inferencia diagnóstica adicional debe expresarse como propiedad derivada, resultado diagnóstico, vista derivada o metadata de derivación.

3\. INPUT CONTRACT

Cada ejecución diagnóstica recibe, como mínimo:

graph\_ref: referencia inequívoca a un Graph v0.2 confirmado o al snapshot explícitamente autorizado para diagnóstico.  
graph\_version: versión/hash/revisión del grafo usado.  
scope: conjunto de claims, objetivos, componentes o target(s) relevantes para la evaluación.  
evaluation\_state\_id: identificador del estado de evaluación e.  
diagnostic\_rule\_version: versión de reglas/criterios aplicada.  
active\_adjudications: adjudicaciones vigentes que afectan interpretación o diagnóstico.  
active\_diagnostic\_conditions: condiciones diagnósticas vigentes que pueden bloquear o limitar defendibilidad.  
active\_defeaters: ataques/defeaters aplicables y adjudicados bajo e.  
uncertainty\_policy: política para decidir cuándo producir REVIEW\_REQUIRED en lugar de una conclusión definitiva.

El contrato no autoriza diagnosticar sobre un scope implícito cuando su delimitación pueda alterar la frontier. Si el scope es materialmente ambiguo, la salida debe reflejar REVIEW\_REQUIRED o solicitar adjudicación upstream.

4\. PRECONDICIONES

La ejecución debe verificar antes de diagnosticar:

A. existencia y validez estructural de los CLAIM relevantes;  
B. integridad mínima de los INFERENCE\_STEP usados;  
C. coherencia de REL-067 PREMISE\_IN, REL-068 WARRANTS, REL-069 ASSUMPTION\_FOR y REL-070 CONCLUDES;  
D. preservación de REL-072 REBUTS, REL-073 UNDERCUTS y REL-074 UNDERMINES cuando sean aplicables;  
E. disponibilidad del estado de revisión/provenance necesario para evitar presentar como certeza una estructura materialmente ambigua;  
F. compatibilidad del snapshot con Graph v0.2.

Una falla de precondición no debe ser convertida automáticamente en falla metodológica de la tesis. Puede ser una insuficiencia de reconstrucción y debe distinguirse como tal.

5\. OBJETOS COMPUTABLES DERIVADOS

El contrato reconoce los siguientes objetos derivados, no ontológicos:

H\_e: vista de dependencia justificativa viable bajo el estado e.  
Active\_e(i): estado derivado de actividad de un INFERENCE\_STEP i.  
Def\_e(c): estado de defendibilidad de la formulación actual del claim c.  
M\_e: conjunto de MAXIMAL\_DEFENDABLE\_CLAIMS dentro del scope.  
DEFENDABILITY\_FRONTIER(e, scope): vista diagnóstica de M\_e.  
INFERENTIAL\_BREAKPOINT: resultado derivado anclado normalmente a ENT-039.  
downstream\_affected\_claim: consecuencia diagnóstica derivada.  
route\_local\_maximum\_defendable\_claim: resultado restringido para una trayectoria explícitamente lineal.

6\. ESTADOS MÍNIMOS DE ACTIVIDAD DEL INFERENCE\_STEP

Cada INFERENCE\_STEP relevante debe producir un registro de actividad con:

inference\_step\_id  
active\_state: ACTIVE | INACTIVE | UNKNOWN  
activity\_adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
required\_inputs\_satisfied: TRUE | FALSE | UNKNOWN  
applicable: TRUE | FALSE | UNKNOWN  
defeated: TRUE | FALSE | UNKNOWN  
blocking\_reasons\[\]  
supporting\_diagnostic\_evidence\_ids\[\]  
rule\_version

Regla conceptual mínima:

Active\_e(i) ⇔ RequiredInputsSatisfied\_e(i) ∧ Applicable\_e(i) ∧ ¬Defeated\_e(i)

Si cualquiera de los términos necesarios es UNKNOWN y su resolución puede cambiar el diagnóstico, active\_state debe permanecer UNKNOWN y activity\_adjudication\_status debe ser REVIEW\_REQUIRED.

7\. SEMÁNTICA MÍNIMA DE SOPORTE

JOINT/LINKED: cuando varias entradas son conjuntamente necesarias para un mismo step, todas las entradas requeridas deben satisfacer la política de defendibilidad aplicable. La falla de una entrada requerida bloquea esa derivación. No existe compensación por fuerza de las demás.

CONVERGENT/ALTERNATIVE: cuando varios INFERENCE\_STEP distintos constituyen derivaciones suficientes independientes hacia el mismo claim, basta con que una permanezca viable para que el target conserve una vía justificativa suficiente, salvo condición bloqueante adicional.

La multiplicidad de caminos topológicos no prueba independencia. Si la independencia no puede adjudicarse con suficiente fundamento, el sistema debe emitir REVIEW\_REQUIRED antes de usarla para evitar propagación.

8\. CLAIM DEFENDIBILITY RECORD

Para cada claim relevante se emitirá como mínimo:

claim\_id  
scope\_id  
def\_e\_value: TRUE | FALSE | UNKNOWN  
defendibility\_state: vocabulario vigente del Motor | null  
adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
viable\_derivation\_ids\[\]  
blocked\_derivation\_ids\[\]  
blocking\_condition\_ids\[\]  
active\_defeater\_ids\[\]  
maximum\_defensible\_reformulation: valor existente en ENT-011 cuando corresponda; no se redefine aquí.  
explanation\_trace\[\]  
rule\_version

def\_e\_value=TRUE exige al menos una derivación justificativa suficiente y viable dentro del scope y ausencia de condición diagnóstica bloqueante aplicable.

def\_e\_value=FALSE exige que no permanezca ninguna derivación suficiente viable relevante, o que exista una condición bloqueante que impida defender la formulación actual.

Cuando la incertidumbre estructural o diagnóstica impide resolver lo anterior sin introducir una inferencia no adjudicada, def\_e\_value=UNKNOWN y adjudication\_status=REVIEW\_REQUIRED. REVIEW\_REQUIRED no se escribe dentro de defendibility\_state.

9\. H\_e — VISTA DE DEPENDENCIA JUSTIFICATIVA VIABLE

H\_e debe derivarse de G\_I \+ G\_D bajo e. No se persiste como grafo canónico.

Cada transición incluida debe poder explicar:

source\_claim\_or\_input\_id  
inference\_step\_id  
target\_claim\_id  
transition\_state  
why\_active\_or\_blocked  
required\_for\_step cuando esté derivado  
required\_for\_target cuando esté derivado  
alternative\_route\_context cuando exista  
provenance / rule version

Regla de seguridad: raw reachability no puede ser usada como sustituto de dependencia justificativa ni de necesidad.

10\. MAXIMAL\_DEFENDABLE\_CLAIMS Y FRONTIER

Dentro de C\_scope se calcula:

M\_e \= { c ∈ C\_scope : Def\_e(c) y no existe c' ∈ C\_scope tal que Def\_e(c') y c ≺\_e+ c' }

La salida frontier debe contener:

scope\_id  
evaluation\_state\_id  
member\_claim\_ids\[\]  
frontier\_cardinality  
graph\_version  
diagnostic\_rule\_version  
active\_adjudication\_refs\[\]  
frontier\_status: RESOLVED | REVIEW\_REQUIRED  
explanation\_trace\[\]

MAXIMUM\_DEFENDABLE\_CLAIM no es un campo global obligatorio. Solo puede emitirse cuando frontier\_cardinality \= 1 y además existe un máximo real para el scope, o cuando el cálculo se declara route-local sobre una trayectoria inequívocamente lineal.

11\. INFERENTIAL\_BREAKPOINT RECORD

Cada breakpoint debe emitir:

breakpoint\_id\_derivado  
scope\_id  
route\_or\_path\_ref  
origin\_of\_failure\_ref  
breakpoint\_step\_id  
affected\_transition\_target\_id  
failure\_mode: string | null  
active\_defeater\_or\_blocking\_condition\_ref  
first\_break\_on\_route: TRUE | FALSE | UNKNOWN  
adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
explanation\_trace\[\]

Failure modes mínimos del MVP:

UNSATISFIED\_REQUIRED\_PREMISE  
UNSATISFIED\_REQUIRED\_WARRANT\_OR\_ASSUMPTION  
INAPPLICABLE\_STEP  
UNDERCUT\_INFERENCE  
REBUTTED\_CONCLUSION  
BLOCKING\_DIAGNOSTIC\_CONDITION

Si el failure\_mode no puede adjudicarse sin inventar semántica, failure\_mode=null y adjudication\_status=REVIEW\_REQUIRED.

El breakpoint localiza dónde deja de transmitirse defendibilidad. No sustituye el objeto diagnóstico que explica la causa ni implica por sí mismo que el INFERENCE\_STEP sea lógicamente inválido.

12\. DOWNSTREAM PROPAGATION RECORD

Para cada par falla-target materialmente relevante se podrá emitir:

failure\_ref  
target\_claim\_id  
affected\_state: AFFECTED | NOT\_AFFECTED | UNKNOWN  
adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
lost\_viable\_derivation\_ids\[\]  
remaining\_viable\_derivation\_ids\[\]  
required\_dependency\_refs\[\]  
alternative\_route\_refs\[\]  
propagation\_reason  
explanation\_trace\[\]

AFFECTED solo puede emitirse cuando la falla elimina todas las derivaciones suficientes viables relevantes para el target o activa una condición bloqueante equivalente.

NOT\_AFFECTED debe emitirse cuando al menos una derivación suficiente e independiente permanezca viable.

Cuando necesidad, suficiencia o independencia no pueden adjudicarse de forma estable, affected\_state=UNKNOWN y adjudication\_status=REVIEW\_REQUIRED.

13\. EXPLANATION TRACE

Toda conclusión diagnóstica material debe ser explicable. explanation\_trace debe permitir reconstruir, en orden lógico, al menos:

1\. qué objeto o condición originó el problema;  
2\. qué evidencia diagnóstica lo respalda;  
3\. qué INFERENCE\_STEP o transición queda bloqueado o cuestionado;  
4\. qué ruta se pierde;  
5\. si existen rutas alternativas;  
6\. por qué el claim conserva o pierde defendibilidad;  
7\. cómo se deriva su pertenencia o no a la frontier.

El Simulador puede generar esta traza mediante IA; el Motor deberá generarla mediante referencias y reglas computables. La semántica final debe ser equivalente.

14\. OUTPUT ENVELOPE MÍNIMO

Cada ejecución debe poder serializar una salida equivalente a:

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

La forma exacta de JSON Schema se definirá en la siguiente capa de implementación. Este documento fija primero el significado y la obligatoriedad mínima de cada bloque.

15\. REVIEW\_REQUIRED COMO ESTADO DE SEGURIDAD

REVIEW\_REQUIRED no es una tercera clase sustantiva de defendibilidad equiparable a DEFENDABLE o NOT\_DEFENDABLE. Es un estado de imposibilidad responsable de adjudicación bajo la información disponible.

Debe usarse cuando resolver el caso exigiría inventar necesidad, suficiencia, independencia de rutas, scope, applicability, defeat, prioridad entre defeaters o cualquier otra relación no respaldada por la representación vigente.

16\. INVALIDACIÓN Y RECOMPUTACIÓN

Todo resultado derivado debe invalidarse o reconsiderarse cuando cambie materialmente cualquiera de los siguientes elementos:

graph\_version  
scope  
evaluation\_state  
active adjudications  
active diagnostic conditions  
active defeaters  
diagnostic\_rule\_version

Los resultados persistidos por cache deben conservar metadata suficiente para detectar esa invalidez.

17\. SEPARACIÓN SIMULADOR / MOTOR

El Simulador Diagnóstico IA puede inferir provisionalmente Active\_e(i), H\_e, Def\_e(c), breakpoints, propagación y frontier mediante razonamiento guiado por este contrato. Debe devolver los mismos campos mínimos y marcar cualquier heurística no adjudicada como provisional o REVIEW\_REQUIRED.

El Motor futuro deberá producir las mismas categorías de salida mediante reglas reproducibles. Puede usar algoritmos, índices y estructuras internas diferentes siempre que respete el significado de cada campo.

Una discrepancia entre Simulador y Motor no se resolverá por autoridad del componente. Debe clasificarse como: error de implementación; insuficiencia de input; ambigüedad conceptual; diferencia de regla/version; o caso no adjudicado.

18\. SEPARACIÓN CON RENDERER

Renderer puede consumir, por ejemplo:

claim\_id \+ defendibility\_state  
is\_frontier\_member  
breakpoint\_step\_id  
downstream\_affected\_state  
remaining\_alternative\_routes  
explanation\_trace  
gravity/reparability cuando estén disponibles upstream

Renderer no calcula ninguno de esos valores ni decide cómo propagar fallas.

19\. NO OBJETIVOS DE v0.1.2

Este contrato no resuelve todavía:

algoritmo completo de ciclos/SCC;  
preferencias exhaustivas entre defeaters;  
criterio formal definitivo de independencia de rutas;  
enumeración exhaustiva de minimal support sets;  
optimización algorítmica de H\_e;  
mapeo final entre def\_e\_value y el vocabulario histórico/vigente de defendibility\_state del Motor;  
reglas completas de gravedad y reparabilidad;  
contrafactual repair avanzado.

20\. CASOS MÍNIMOS DE ACEPTACIÓN

A. Cadena lineal: C1 defendible → I2 bloqueado → C2 no defendible. Frontier incluye C1; breakpoint I2.

B. Bifurcación: C1→C2 defendible y C1→C4 defendible. M\_e={C2,C4}; no se emite maximum global.

C. Convergencia: I1 bloqueado→C, I2 activo→C. C puede permanecer defendible; I1 es breakpoint local de una ruta.

D. JOINT: P1 defendible \+ P2 no defendible → I → C, ambas requeridas. I queda inactivo; C solo cae si no hay soporte alternativo suficiente.

E. REBUT: P→I activo→C y un rebuttal bloqueante afecta C. C puede quedar NOT\_DEFENDABLE sin declarar I inválido.

F. UNDERMINE: ataque a P, donde P es requerido por I→C. El origen está en P/ataque; I puede ser breakpoint; C queda affected solo si no hay alternativa suficiente.

G. Scope: un claim terminal defendible fuera del scope no pertenece a la frontier del scope evaluado.

H. Incertidumbre: si no puede decidirse si una premisa es necesaria o meramente contributiva, se emite REVIEW\_REQUIRED y no se fuerza propagación.

21\. GATE DE COHERENCIA

Este contrato es válido solo mientras cumpla simultáneamente:

\- Graph v0.2 permanece como canon computable;  
\- no se introducen nuevas ENT/REL;  
\- REL-067 no se redefine como necesidad global;  
\- no se introduce SUPPORTS genérico;  
\- no se introduce scoring compensatorio universal;  
\- Def\_e(c) conserva la semántica de Arquitectura v0.8;  
\- maximum\_defensible\_reformulation permanece separado de frontier;  
\- causa, breakpoint y consecuencia permanecen diferenciados;  
\- Renderer continúa sin inteligencia diagnóstica;  
\- runtime y baseline históricos no se reinterpretan.

22\. SIGUIENTE PASO

Validar este contrato contra Arquitectura Conceptual v0.8, Graph v0.2 y las adjudicaciones conceptuales previas. Tras superar ese gate, derivar dos artefactos hermanos: (1) JSON Schema / contrato serializable mínimo de salida diagnóstica y (2) especificación/prompt del Simulador Diagnóstico IA que produzca exactamente ese contrato sin redefinir la semántica.

23\. CORRECCIONES NORMATIVAS v0.1.2 — POST-AUDITORÍA

23.1. Generación explícita de G\_D  
Antes de derivar Active\_e(i), H\_e o Def\_e(c), toda ejecución integrada que no reciba ya G\_D/condiciones diagnósticas adjudicadas debe ejecutar una etapa diagnóstica primaria. Esta etapa debe: (a) derivar evidencia diagnóstica a partir del Graph confirmado o snapshot autorizado; (b) evaluar applicability y exigibility de las reglas metodológicas pertinentes; (c) identificar fallas metodológicas y condiciones diagnósticas activas; (d) distinguir ausencia de evidencia de ausencia metodológicamente exigible; (e) producir o actualizar G\_D mediante objetos diagnósticos canónicos ya existentes, sin crear nuevas ENT/REL. Solo después puede evaluarse la viabilidad justificativa.  
En modo GRAPH-FIRST, G\_D o sus condiciones diagnósticas equivalentes pueden venir dadas como input. En modo INTEGRATED-FROM-THESIS deben ser derivadas explícitamente. Para todo objeto canónico materializado en G\_D, provenance conserva exclusivamente el vocabulario de Graph v0.2: STUDY | EXTERNAL | DIAGNOSTIC\_SOURCE | null; en la práctica, los objetos diagnósticos generados por SciTesis usan provenance=DIAGNOSTIC\_SOURCE cuando corresponda. El mecanismo o agente que produjo, derivó o adjudicó el objeto se registra por separado como metadata de derivación no ontológica, mediante derivation\_origin=AI | RULE | HUMAN. derivation\_origin no sustituye provenance, no modifica type\_id y no puede utilizarse como proxy de fuerza epistemológica, validez o estado de adjudicación.

23.2. Orden de evaluación para evitar circularidad  
Active\_e(i) y Def\_e(c) no se calculan como dos barridos globales independientes. Para scopes acíclicos del MVP se adopta una evaluación iterativa por dependencia: (1) establecer claims/condiciones base adjudicables bajo e; (2) evaluar los INFERENCE\_STEP cuyas entradas requeridas ya tengan estado resoluble; (3) derivar claims concluidos por pasos activos o bloqueados; (4) repetir hasta que no aparezcan cambios materiales. En un DAG este procedimiento equivale a un recorrido topológico respetando dependencias justificativas.  
Si la evaluación entra en un ciclo relevante que impide estabilizar estados sin una política SCC ya adjudicada, los objetos afectados permanecen UNKNOWN \+ REVIEW\_REQUIRED. No se rompen ciclos por ID, orden textual ni preferencia heurística.

23.3. Semántica estricta de H\_e  
H\_e contiene únicamente transiciones justificativamente viables y por tanto ACTIVE bajo e. Las transiciones BLOCKED o UNKNOWN no pertenecen a H\_e. Deben conservarse en los registros de actividad, blocked\_derivation\_ids, breakpoints, downstream\_effects y review\_required\_items, según corresponda. La relación ≺\_e y la frontier se calculan exclusivamente sobre las transiciones ACTIVE de H\_e.

23.4. UNDERMINE preservado como failure\_mode  
Se añade al vocabulario mínimo de breakpoint: UNDERMINED\_REQUIRED\_INPUT. Se usa cuando REL-074 UNDERMINES ataca una entrada requerida y ese ataque impide su uso justificativo en el step correspondiente. No debe degradarse automáticamente a UNSATISFIED\_REQUIRED\_PREMISE, aunque ambas situaciones puedan producir un step inactivo.

23.5. Alcance del contrato corregido  
Las correcciones 23.1–23.4 prevalecen sobre cualquier formulación anterior de este documento que pudiera sugerir: (a) que las fallas diagnósticas se presuponen siempre como input; (b) que todos los Active\_e se calculan antes de cualquier Def\_e; (c) que H\_e contiene transiciones bloqueadas o inciertas; o (d) que UNDERMINE carece de failure\_mode propio.

24\. CIERRE REFERENCIAL DE G\_D — v0.1.2  
24.1. Separación de snapshots  
El contrato distingue dos superficies persistibles y referenciables: G\_I, identificado por graph\_ref \+ graph\_version, y G\_D, identificado por diagnostic\_graph\_ref \+ diagnostic\_graph\_version. graph\_ref no cambia de significado ni absorbe silenciosamente G\_D.

24.2. Campos obligatorios de run\_metadata  
Toda salida v0.1.2 debe incluir además: diagnostic\_graph\_ref: string; diagnostic\_graph\_version: string; diagnostic\_graph\_origin: PROVIDED | DERIVED. En GRAPH-FIRST, G\_D puede ser PROVIDED. En INTEGRATED-FROM-THESIS, G\_D debe ser DERIVED y materializado antes de emitir decisiones diagnósticas RESOLVED que dependan de sus objetos.

24.3. Cierre referencial estricto  
Todo identificador diagnóstico emitido por la salida debe ser resoluble de manera inequívoca en uno de tres lugares: (a) G\_I mediante graph\_ref; (b) G\_D mediante diagnostic\_graph\_ref; o (c) un objeto derivado explícitamente presente en el envelope. Esto aplica, como mínimo, a supporting\_diagnostic\_evidence\_ids, blocking\_condition\_ids, active\_diagnostic\_condition\_refs, active\_defeater\_refs cuando apunten a objetos diagnósticos, origin\_of\_failure\_ref, active\_defeater\_or\_blocking\_condition\_ref, failure\_ref y subject\_ref de TraceItem cuando su trace\_kind sea ORIGIN o DIAGNOSTIC\_EVIDENCE.

24.4. Regla para INTEGRATED-FROM-THESIS  
La subfase B1 no termina al inferir mentalmente fallas: debe producir un snapshot G\_D identificable y estable para la corrida. Solo después B2 puede emitir resultados RESOLVED que referencien objetos diagnósticos. Si G\_D no puede materializarse o una referencia no puede resolverse, la ejecución no puede presentarse como referencialmente válida; debe fallar la precondición o usar REVIEW\_REQUIRED cuando corresponda semánticamente.

24.5. No duplicación obligatoria  
Diagnostic Output v0.1.2 no exige copiar todos los nodos/aristas de G\_D dentro del envelope. La trazabilidad se satisface mediante la referencia obligatoria al snapshot G\_D y cierre cross-record verificable. Una implementación futura puede añadir un bundle inline mediante una versión posterior, pero no es requisito de v0.1.2.

24.6. Invalidación  
Un cambio material en diagnostic\_graph\_version invalida o exige recomputar toda salida derivada que dependa de G\_D, igual que un cambio de graph\_version, scope, evaluation\_state o diagnostic\_rule\_version.  
