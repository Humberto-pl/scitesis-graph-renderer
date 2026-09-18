# TEST / INTEGRATION FIXTURE — integration-rich

Este par de artifacts es **sintético, determinista y exclusivamente de TEST / INTEGRATION**. No representa una tesis real, un piloto validado, un diagnóstico experto, producción ni material client-ready. Su propósito es detectar regresiones de composición en el pipeline existente; no valida la calidad diagnóstica.

Identidad compatible: `graph_ref = integration-rich-g1`, `graph_version = 1.0`.

## Conteos y proyección esperada

| Métrica | Esperado |
| --- | ---: |
| G_I nodes | 30 |
| G_I relations | 36 |
| inference_steps estructurales | 8 |
| premise_groups | 4 |
| claims diagnosticados | 7 |
| inference steps diagnosticados | 8 |
| review items | 4 |
| breakpoints | 5 |
| downstream effects | 5 |
| H_e transitions | 4 |
| breakpoint origins proyectados (records) | 3 |
| breakpoint targets proyectados (records) | 4 |
| downstream effects proyectados | 4 |
| frontier members proyectados | 2 |
| BREAKPOINT_ASSOCIATION connectors | 2 |
| DOWNSTREAM_REFERENCE connectors | 2 |
| unresolved breakpoint connectors | 3 |
| unresolved downstream connectors | 3 |
| unmatched claims | 1 (`C-MISSING`) |
| unmatched inference steps | 1 (`I-MISSING`) |
| unmatched review items | 1 (`REV4`) |
| unmatched breakpoint sources | 2 records (`STEP-MISSING`) |
| unmatched breakpoint targets | 1 (`TARGET-MISSING`) |
| unmatched downstream effects | 1 (`CLAIM-MISSING`) |
| unmatched frontier members | 1 (`C-MISSING`) |

Los breakpoints ejercitan resolución total, target ausente, source ausente y dos records distintos en un mismo source. Los downstream effects cubren `AFFECTED`, `NOT_AFFECTED`, `UNKNOWN`, `FAILURE_REF_UNRESOLVED`, target ausente y source ausente. Dos review items permanecen separados sobre `C3`. Los premise groups usan `linked` y `convergent`; `PG1` ejercita la anti-duplicación del inspector. H_e contiene referencias proyectables y no proyectables, pero no genera topología ni connectors. Frontier y compatibility maximums tampoco generan connectors.

## Qué no prueba

No prueba interpretación PDF/IAM, corpus empírico, corrección científica, reconstrucción de H_e o rutas, G_D estructural, calidad de layout para producción ni production hardening. No introduce semántica nueva.
