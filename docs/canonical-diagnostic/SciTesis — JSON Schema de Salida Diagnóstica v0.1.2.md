SCITESIS — JSON SCHEMA DE SALIDA DIAGNÓSTICA v0.1.2

Estado: ESPECIFICACIÓN SERIALIZABLE DERIVADA DEL CONTRATO COMPUTABLE MÍNIMO v0.1.2

1\. PROPÓSITO

Definir la forma serializable mínima que deberán producir tanto el Simulador Diagnóstico IA como el Motor Diagnóstico futuro. Este schema no redefine la semántica; la hereda de Arquitectura Conceptual v0.8 y del Contrato Computable Mínimo de Diagnóstico v0.1.2.

Se adopta JSON Schema Draft 2020-12 como formato de referencia. Esta versión fija estructura, obligatoriedad, tipos y enums mínimos. No fija todavía almacenamiento físico, API pública ni implementación del Motor.

2\. PRINCIPIOS

\- Los IDs de entidades y relaciones siempre referencian objetos existentes en Graph v0.2 o resultados derivados explícitamente identificados como tales.  
\- No se serializan nuevas ENT/REL.  
\- REVIEW\_REQUIRED se representa como estado de adjudicación/resolución, no como valor sustantivo de defendibilidad, actividad o afectación.  
\- UNKNOWN representa valor semántico no resuelto cuando corresponda.  
\- maximum\_defensible\_reformulation permanece separado de frontier.  
\- cause/origin, breakpoint y downstream consequence permanecen separados.

3\. ENVELOPE RAÍZ

Campos requeridos:

schema\_version  
run\_metadata  
scope  
inference\_step\_states  
claim\_defendibility  
viable\_dependency\_view  
breakpoints  
downstream\_effects  
defendability\_frontier  
compatibility\_maximums  
review\_required\_items  
explanation\_summary

additionalProperties \= false en la versión implementable salvo extensiones versionadas explícitas.

4\. RUN\_METADATA

Objeto requerido:

run\_id: string  
graph\_ref: string  
graph\_version: string  
diagnostic\_graph\_ref: string  
diagnostic\_graph\_version: string  
diagnostic\_graph\_origin: PROVIDED | DERIVED  
evaluation\_state\_id: string  
diagnostic\_rule\_version: string  
simulator\_or\_engine: SIMULATOR\_AI | DIAGNOSTIC\_ENGINE  
implementation\_version: string  
active\_adjudication\_refs: array\[string\]  
active\_diagnostic\_condition\_refs: array\[string\]  
active\_defeater\_refs: array\[string\]

No se incluye un timestamp como requisito semántico del contrato; puede añadirse como metadata operacional en una versión posterior sin cambiar la semántica diagnóstica.

5\. SCOPE

Objeto requerido:

scope\_id: string  
target\_claim\_ids: array\[string\]  
objective\_refs: array\[string\]  
component\_refs: array\[string\]  
scope\_payload: object | null  
scope\_status: RESOLVED | REVIEW\_REQUIRED  
scope\_notes: string | null

Regla: si scope\_status=REVIEW\_REQUIRED, la ejecución puede producir resultados parciales, pero no debe presentar frontier global como definitivamente resuelta.

6\. INFERENCE\_STEP\_STATE

Cada elemento de inference\_step\_states requiere:

inference\_step\_id: string  
active\_state: ACTIVE | INACTIVE | UNKNOWN  
activity\_adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
required\_inputs\_satisfied: TRUE | FALSE | UNKNOWN  
applicable: TRUE | FALSE | UNKNOWN  
defeated: TRUE | FALSE | UNKNOWN  
blocking\_reasons: array\[string\]  
supporting\_diagnostic\_evidence\_ids: array\[string\]  
rule\_version: string  
explanation\_trace: array\[TraceItem\]

Invariante:

Si activity\_adjudication\_status=REVIEW\_REQUIRED, active\_state puede ser UNKNOWN; no puede inventarse ACTIVE/INACTIVE si la incertidumbre material cambiaría el diagnóstico.

7\. CLAIM\_DEFENDIBILITY\_RECORD

Cada elemento requiere:

claim\_id: string  
scope\_id: string  
def\_e\_value: TRUE | FALSE | UNKNOWN  
defendibility\_state: string | null  
adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
viable\_derivation\_ids: array\[string\]  
blocked\_derivation\_ids: array\[string\]  
blocking\_condition\_ids: array\[string\]  
active\_defeater\_ids: array\[string\]  
maximum\_defensible\_reformulation: string | null  
explanation\_trace: array\[TraceItem\]  
rule\_version: string

Invariantes:

A. def\_e\_value=TRUE \=\> adjudication\_status=RESOLVED.  
B. def\_e\_value=FALSE \=\> adjudication\_status=RESOLVED.  
C. def\_e\_value=UNKNOWN \=\> adjudication\_status=REVIEW\_REQUIRED.  
D. REVIEW\_REQUIRED no es valor permitido de defendibility\_state.  
E. defendibility\_state conserva el vocabulario vigente/histórico del Motor cuando exista mapeo; puede ser null mientras ese mapeo no esté fijado.

8\. VIABLE\_DEPENDENCY\_VIEW

Objeto requerido:

view\_id: string  
scope\_id: string  
evaluation\_state\_id: string  
transitions: array\[ViableTransition\]  
view\_status: RESOLVED | REVIEW\_REQUIRED  
derivation\_rule\_version: string

ViableTransition requiere:

source\_claim\_or\_input\_id: string  
inference\_step\_id: string  
target\_claim\_id: string  
transition\_state: ACTIVE  
required\_for\_step: TRUE | FALSE | UNKNOWN  
required\_for\_target: TRUE | FALSE | UNKNOWN  
alternative\_route\_refs: array\[string\]  
why\_active: string  
provenance\_refs: array\[string\]

Regla: transition\_state no se deriva por raw reachability.

9\. BREAKPOINT\_RECORD

Cada elemento requiere:

breakpoint\_id: string  
scope\_id: string  
route\_or\_path\_ref: string  
origin\_of\_failure\_ref: string | null  
breakpoint\_step\_id: string  
affected\_transition\_target\_id: string  
failure\_mode: enum | null  
active\_defeater\_or\_blocking\_condition\_ref: string | null  
first\_break\_on\_route: TRUE | FALSE | UNKNOWN  
adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
explanation\_trace: array\[TraceItem\]

failure\_mode enum v0.1.2:

UNSATISFIED\_REQUIRED\_PREMISE  
UNSATISFIED\_REQUIRED\_WARRANT\_OR\_ASSUMPTION  
INAPPLICABLE\_STEP  
UNDERCUT\_INFERENCE  
UNDERMINED\_REQUIRED\_INPUT  
REBUTTED\_CONCLUSION  
BLOCKING\_DIAGNOSTIC\_CONDITION

Invariante: si failure\_mode=null por incertidumbre material, adjudication\_status=REVIEW\_REQUIRED.

10\. DOWNSTREAM\_EFFECT\_RECORD

Cada elemento requiere:

failure\_ref: string  
target\_claim\_id: string  
affected\_state: AFFECTED | NOT\_AFFECTED | UNKNOWN  
adjudication\_status: RESOLVED | REVIEW\_REQUIRED  
lost\_viable\_derivation\_ids: array\[string\]  
remaining\_viable\_derivation\_ids: array\[string\]  
required\_dependency\_refs: array\[string\]  
alternative\_route\_refs: array\[string\]  
propagation\_reason: string | null  
explanation\_trace: array\[TraceItem\]

Invariantes:

AFFECTED \=\> remaining\_viable\_derivation\_ids debe estar vacío salvo que una condición bloqueante independiente explique la afectación.  
NOT\_AFFECTED \=\> debe existir al menos una derivación suficiente viable o una justificación equivalente.  
UNKNOWN \=\> adjudication\_status=REVIEW\_REQUIRED.

11\. DEFENDABILITY\_FRONTIER

Objeto requerido:

scope\_id: string  
evaluation\_state\_id: string  
member\_claim\_ids: array\[string\]  
frontier\_cardinality: integer \>= 0  
graph\_version: string  
diagnostic\_rule\_version: string  
active\_adjudication\_refs: array\[string\]  
frontier\_status: RESOLVED | REVIEW\_REQUIRED  
explanation\_trace: array\[TraceItem\]

Invariantes:

frontier\_cardinality \= longitud(member\_claim\_ids).  
Si frontier\_status=RESOLVED, todos los member\_claim\_ids deben corresponder a claims con def\_e\_value=TRUE.  
No puede inferirse un maximum global simplemente porque frontier\_cardinality=1; además debe verificarse condición de máximo real o scope/ruta lineal aplicable.

12\. COMPATIBILITY\_MAXIMUM

Cada elemento opcional requiere:

scope\_id: string  
route\_or\_path\_ref: string | null  
claim\_id: string  
maximum\_kind: TRUE\_GLOBAL\_MAXIMUM | ROUTE\_LOCAL\_MAXIMUM  
basis: string

No existe maximum\_kind=FRONTIER\_MEMBER.

13\. REVIEW\_REQUIRED\_ITEM

Cada elemento requiere:

item\_id: string  
subject\_ref: string  
review\_reason: string  
blocking\_question: string  
possible\_impact: string  
recommended\_adjudication\_target: string | null

Este bloque centraliza asuntos que impiden una adjudicación responsable sin convertirlos en fallas metodológicas de la tesis.

14\. TRACE\_ITEM

TraceItem requiere:

sequence: integer \>= 1  
trace\_kind: ORIGIN | DIAGNOSTIC\_EVIDENCE | INFERENCE\_STEP | LOST\_ROUTE | ALTERNATIVE\_ROUTE | DEFENDIBILITY\_DECISION | FRONTIER\_DECISION | OTHER  
subject\_ref: string | null  
rule\_ref: string | null  
message: string

La traza debe conservar orden lógico, no necesariamente cronología de ejecución.

15\. EXPLANATION\_SUMMARY

Objeto requerido:

summary\_status: COMPLETE | PARTIAL\_REVIEW\_REQUIRED  
primary\_findings: array\[string\]  
frontier\_summary: string  
breakpoint\_summary: string  
propagation\_summary: string  
review\_required\_summary: array\[string\]

Este bloque es comunicacional; no sustituye los registros estructurados precedentes.

16\. JSON SCHEMA DE REFERENCIA — ESQUELETO IMPLEMENTABLE

{  
  "$schema": "https://json-schema.org/draft/2020-12/schema",  
  "$id": "scitesis://diagnostic-output/0.1.2",  
  "title": "SciTesis Diagnostic Output v0.1.2",  
  "type": "object",  
  "additionalProperties": false,  
  "required": \[  
    "schema\_version",  
    "run\_metadata",  
    "scope",  
    "inference\_step\_states",  
    "claim\_defendibility",  
    "viable\_dependency\_view",  
    "breakpoints",  
    "downstream\_effects",  
    "defendability\_frontier",  
    "compatibility\_maximums",  
    "review\_required\_items",  
    "explanation\_summary"  
  \],  
  "properties": {  
    "schema\_version": {"const": "0.1.2"},  
    "run\_metadata": {"$ref": "\#/$defs/runMetadata"},  
    "scope": {"$ref": "\#/$defs/scope"},  
    "inference\_step\_states": {"type": "array", "items": {"$ref": "\#/$defs/inferenceStepState"}},  
    "claim\_defendibility": {"type": "array", "items": {"$ref": "\#/$defs/claimDefendibility"}},  
    "viable\_dependency\_view": {"$ref": "\#/$defs/viableDependencyView"},  
    "breakpoints": {"type": "array", "items": {"$ref": "\#/$defs/breakpoint"}},  
    "downstream\_effects": {"type": "array", "items": {"$ref": "\#/$defs/downstreamEffect"}},  
    "defendability\_frontier": {"$ref": "\#/$defs/frontier"},  
    "compatibility\_maximums": {"type": "array", "items": {"$ref": "\#/$defs/compatibilityMaximum"}},  
    "review\_required\_items": {"type": "array", "items": {"$ref": "\#/$defs/reviewRequiredItem"}},  
    "explanation\_summary": {"$ref": "\#/$defs/explanationSummary"}  
  }  
}

Este esqueleto fija la topología del envelope. Los $defs completos deberán transcribirse a un archivo .json del repositorio antes de validación runtime. El presente documento es la fuente de diseño para esa transcripción, no un sustituto del archivo ejecutable.

17\. REGLAS DE VALIDACIÓN CROSS-RECORD

El JSON Schema estructural no basta para expresar todas las invariantes. El validator de salida debe comprobar además:

\- todo inference\_step\_id existe en el Graph diagnosticado;  
\- todo claim\_id existe y es ENT-011;  
\- todo breakpoint\_step\_id existe y es ENT-039;  
\- frontier members aparecen en claim\_defendibility;  
\- un claim con def\_e\_value=UNKNOWN no puede entrar a frontier RESOLVED;  
\- REVIEW\_REQUIRED no aparece como defendibility\_state, active\_state, affected\_state ni failure\_mode;  
\- compatibility\_maximums no se genera para cada miembro de frontier;  
\- alternative routes referenciadas existen en la vista o en derivados trazables;  
\- ningún derived ID se confunde con ENT/REL canónicos;  
\- graph\_version y diagnostic\_rule\_version son consistentes entre envelope y derivados.

18\. CASOS DE VALIDACIÓN MÍNIMOS

PASS: cadena lineal con frontier singleton y route-local/global maximum justificable.  
PASS: bifurcación con dos frontier members y compatibility\_maximums vacío.  
PASS: convergencia con una ruta bloqueada y otra viva.  
PASS: incertidumbre con def\_e\_value=UNKNOWN y REVIEW\_REQUIRED separado.  
FAIL: REVIEW\_REQUIRED dentro de defendibility\_state.  
FAIL: breakpoint apuntando a objeto que no es ENT-039 sin justificación de extensión futura.  
FAIL: frontier member con def\_e\_value=FALSE.  
FAIL: propagation AFFECTED por simple reachability con ruta alternativa viva.  
FAIL: campo ENT-040 o REL-075 generado por la salida.

19\. GATE DE COHERENCIA

Este schema conserva:

Graph v0.2 como canon;  
separación G\_I/G\_D;  
propiedades derivadas fuera de la ontología;  
no compensación;  
separación entre extracción/confianza y fuerza epistemológica;  
separación entre Def\_e(c), defendibility\_state histórico y estado de adjudicación;  
separación entre maximum\_defensible\_reformulation y frontier;  
separación entre causa, breakpoint y downstream consequence;  
Renderer sin inteligencia diagnóstica.

20\. SIGUIENTE PASO

Crear el archivo JSON Schema ejecutable en el repositorio a partir de esta especificación y una batería de fixtures positivos/negativos. En paralelo, el Simulador Diagnóstico IA debe producir este envelope sin omitir campos obligatorios ni introducir semántica adicional.

21\. CORRECCIONES DE COHERENCIA v0.1.2

21.1. H\_e serializa solo transiciones viables  
viable\_dependency\_view.transitions contiene exclusivamente transiciones ACTIVE. Las transiciones BLOCKED o UNKNOWN se representan fuera de H\_e mediante inference\_step\_states, blocked\_derivation\_ids, breakpoints, downstream\_effects y review\_required\_items. Por tanto, una ViableTransition no admite BLOCKED ni UNKNOWN.

21.2. UNDERMINE preservado  
failure\_mode incorpora UNDERMINED\_REQUIRED\_INPUT cuando REL-074 UNDERMINES invalida el uso justificativo de una entrada requerida. No debe degradarse automáticamente a UNSATISFIED\_REQUIRED\_PREMISE.

21.3. Claims fuera de scope  
claim\_defendibility\[\] contiene solo claims evaluados dentro del scope declarado. Un claim fuera del scope no recibe def\_e\_value=FALSE ni UNKNOWN por ese solo hecho; simplemente no se incluye en claim\_defendibility\[\] salvo que exista una razón explícita para evaluarlo dentro de un sub-scope registrado.

21.4. Frontier no resuelta  
Si frontier\_status=REVIEW\_REQUIRED, member\_claim\_ids contiene únicamente miembros ya confirmados que permanecen invariantes bajo las alternativas pendientes; si no puede garantizarse al menos un miembro, debe ser \[\]. Los candidatos inciertos se registran en review\_required\_items y no se mezclan con miembros confirmados.

21.5. Identidad de snapshot simulado  
En modo INTEGRATED-FROM-THESIS, run\_metadata debe usar identificadores explícitamente simulados y trazables para graph\_ref, graph\_version y evaluation\_state\_id. Estos identificadores no pueden confundirse con IDs canónicos ni hashes de baselines frozen; deben declarar su carácter simulated/provisional mediante convención de implementación versionada.

22\. CIERRE REFERENCIAL DE G\_D — v0.1.2  
22.1. Extensión obligatoria de RUN\_METADATA  
run\_metadata incorpora como campos requeridos: diagnostic\_graph\_ref: string; diagnostic\_graph\_version: string; diagnostic\_graph\_origin: PROVIDED | DERIVED. graph\_ref/graph\_version siguen identificando G\_I o el snapshot estructural autorizado; diagnostic\_graph\_ref/diagnostic\_graph\_version identifican exclusivamente el snapshot G\_D usado por la corrida.

22.2. Regla de resolución  
Todo ID diagnóstico emitido debe poder resolverse contra diagnostic\_graph\_ref, salvo que sea un objeto derivado explícitamente presente en el envelope o una referencia estructural resoluble contra graph\_ref. Esta regla cubre supporting\_diagnostic\_evidence\_ids, blocking\_condition\_ids, active\_diagnostic\_condition\_refs, referencias diagnósticas dentro de active\_defeater\_refs, origin\_of\_failure\_ref, active\_defeater\_or\_blocking\_condition\_ref, failure\_ref y subject\_ref de TraceItem cuando corresponda a ORIGIN o DIAGNOSTIC\_EVIDENCE.

22.3. GRAPH-FIRST  
Si G\_D fue provisto upstream, diagnostic\_graph\_origin=PROVIDED y diagnostic\_graph\_ref debe identificar ese snapshot adjudicado. No se permite dejar diagnostic\_graph\_ref vacío mientras se emiten referencias a objetos diagnósticos.

22.4. INTEGRATED-FROM-THESIS  
La fase B1 debe materializar un snapshot G\_D antes de serializar decisiones RESOLVED dependientes de objetos diagnósticos. En este modo diagnostic\_graph\_origin=DERIVED. diagnostic\_graph\_ref y diagnostic\_graph\_version deben usar una convención simulated/provisional trazable y distinta de baselines frozen.

22.5. Invariantes cross-record adicionales  
\- todo supporting\_diagnostic\_evidence\_id debe resolverse en diagnostic\_graph\_ref;  
\- todo blocking\_condition\_id debe resolverse en diagnostic\_graph\_ref;  
\- todo active\_diagnostic\_condition\_ref debe resolverse en diagnostic\_graph\_ref;  
\- todo origin\_of\_failure\_ref o failure\_ref que designe un objeto diagnóstico debe resolverse en diagnostic\_graph\_ref;  
\- todo objeto estructural referido debe resolverse en graph\_ref;  
\- todo ID derivado debe existir en un bloque derivado del envelope o en una vista derivada referenciable;  
\- diagnostic\_graph\_version debe ser consistente con todas las referencias diagnósticas de la corrida.

Una violación de cierre referencial invalida la salida estructurada aunque la explicación natural sea plausible.  
