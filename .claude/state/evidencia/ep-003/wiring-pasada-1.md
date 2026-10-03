# EP-003 · verificación adversarial de cableado · pasada 1

- verificador: wiring-adversarial-verifier (contexto virgen, solo lectura sobre código)
- sha HEAD: f939e1d · rama: feature/ep-003-evidencia-del-perfil · fecha: 2026-10-02
- entorno: BD aislada ps_ep003 (:54329 / :64329), portal 3200, panel 3201. No se tocó la BD ps ni 3100/3101.

## Veredicto: PASA (CABLEADO COMPLETO), con dos tareas de registro para el orquestador

Ningún hueco de código: todos los escenarios de las 15 historias y todos los puntos de integración llegan
a un test que se ejecutó en esta pasada a HEAD y salió verde.

## Ejecutado en esta pasada (a HEAD f939e1d)
1. Suite completa vitest (REQUIERE_BD=1, BD efímeras creadas desde ps_ep003): 144 ficheros, 1554 tests, rc 0, 0 omitidos.
2. Los 40 ficheros de test citados por los 95 items de `ss1..ss7/wiring/`, en modo verbose: 368 tests, rc 0.
   Se cotejaron las 416 líneas «✓ fichero > … > test» citadas como evidencia contra la salida: las 416 aparecen (0 faltan).
3. e2e en Chromium real (`.local/playwright.ep003.config.ts`, 3200/3201, worker real lanzado por los specs): 71 pasan, 1 omitido (esqueleto.comun: "ruta de la otra app", es esperado), rc 0.
   Esto incluye journey-ep003, estandar-recorrido, ficha-saro-cierre, ficha-validacion-contacto, tarjeta-evidencia, importacion-saro, incompleto-lenguaje y validaciones-entrada.
4. Mutación propia sobre la refactorización d751aa1 (posterior a las mutaciones registradas de SS3), en una copia aparte en el scratchpad:
   `faltasDePublicado` sin condiciones → 2 tests fallan · sin faltanDatos → 2 fallan · devuelve [] → 6 fallan. Los tres mutantes mueren.

## Lo que se intentó refutar y no se pudo
- Una sola `evaluarPublicacion` (packages/dominio/src/inventario/perfil.ts:98). La consumen el panel (perfiles-panel.ts:364), la importación (plan.ts:697) y el conteo del portal (indicadores.ts → contarIncompletos).
  La guarda SQL de la 0028 (líneas 74-81) es defensa en profundidad documentada; no es una segunda fuente de la regla.
- La marca «Incompleto» no llega al cliente: la vista 0029 expone solo booleanos y enteros (migracion-0029.test, mutante M12 muerto). El e2e journey-ep003 lo confirma en el portal.
- Lista negra B.4: apps/ficha-ss5-portal.test.ts siembra motivación, correo, teléfono, promedio y certificaciones en campos internos y comprueba 22 claves prohibidas en el HTML/RSC de la selección y del banco y en el JSON de la API.
- Rutas gemelas de HU-194: los `avisos` viajan en la creación (POST perfiles), en la edición (PATCH perfiles/[codigo]) y en sus rutas de rechazo (`responderRechazos(..., { avisos })`).
  La importación queda fuera por la propia HU-194 (línea 68).
- 401/403: `pedir` (apps/panel/src/acceso/cliente.ts:15) redirige con 401. El nuevo `?previsualizar` de catálogos explica el 403 y el 401 (HojasCatalogo.tsx:179-183). No hay rutas nuevas, solo modificadas, y todas están detrás de conSesionPanel + conAutorizacion.
- Stubs o TODO en el diff de apps/ y packages/: ninguno.

## Hallazgos
| # | Severidad | Dónde | Qué | Cómo reproducirlo / arreglo mínimo |
|---|---|---|---|---|
| 1 | MEDIA (estado, no código) | `.claude/state/runtime-projection.json` (active_slice) · `ss*/wiring-items.json` | El runtime del slice tiene `hus: []` y la lista de cableado vacía (`wiring_failing: []`, `slice-ops.sh status` → `[]`). Los 95 items solo existen en `wiring-items.json`, con los campos `item_id/kind/ref` y sin `status`, `evidence` ni `verified_at_sha`. El estado del cableado no vive en la fuente única, y el orquestador no tiene dónde estampar el sello. | `python3 -c "import json;print(json.load(open('.claude/state/runtime-projection.json'))['active_slice'])"`. Arreglo: registrar las 15 HU y los 95 items en el estado del slice, cada uno con su `evidence` (fichero `ssN/wiring/<id>.md`), antes de aplicar este veredicto. |
| 2 | BAJA | `ss2/wiring-items.json` · HU-178 escenario 4 («completar el último incompleto devuelve la afirmación») | No tiene item propio: hay ac1, ac2, ac3 y ac5, pero falta ac4. Sí está cubierto, en dos tramos: incompletos.test.ts:179-204 (completar desde la escritura del panel deja el conteo de ps_portal en 0) y apps/estandar-portal.test.ts:110 (el conteo produce la frase en el portal real). | `grep -o 'HU-178-ac[0-9]' ss*/wiring-items.json \| sort -u`. Arreglo: añadir el item `HU-178-ac4-ultimo-incompleto-devuelve-afirmacion` con esos dos tests como evidencia. |
| 3 | BAJA | `gate-tdd.md:3-4` | Dice que el código de apps/ y packages/ de HEAD es idéntico al de e5ceb69, pero d751aa1 tocó después `packages/dominio/src/importacion/plan.ts`. Queda mitigado: el runner corrió a 9c04167, que ya incluye d751aa1, y los mutantes de esta pasada mueren. | `git diff --stat e5ceb69..HEAD -- apps packages`. Arreglo: corregir la frase y citar los mutantes de esta pasada. |
| 4 | BAJA | `openspec/changes/ep-003-evidencia-del-perfil/tasks.md:15,26,35,45,54,63,73` | Las tareas de fidelidad 1.9-7.6 siguen sin marcar mientras el gate fidelity está en true. Afecta al seguimiento, no al cableado. | Arreglo: marcarlas con la referencia a gate-fidelity.md y a D124/D126/D134, o dejar el gate en false si falta la aprobación. |
| 5 | BAJA | `packages/dominio/src/catalogo/evidencia.ts:116` | `textoDeLinea` se exporta pero ningún código de producción lo usa. | Ejecutar `grep -rnw textoDeLinea apps packages`. Arreglo: quitar el export, o usarlo donde se arma el texto de la línea. |
| 6 | BAJA | `apps/panel/src/inventario/VistaPrevia.tsx:54` y `PublicacionMasiva.tsx:231` | El mapa campo→ancla (saro_alcance, saro_fecha, disc_fecha) está copiado en los dos componentes. Si se añade un campo exigido, una de las dos copias puede quedar atrás. | Arreglo: extraer el mapa a un módulo compartido. |

## Items reproducidos en esta pasada (para que el orquestador estampe `verified_at_sha` = f939e1d)
Los 95 items de ss1-ss7 (`wiring-items.json`): 88 por los tests vitest citados (416 de 416 líneas reproducidas) y los 7 INT-SSn-journey-smoke e INT-SS5/SS6-vista-previa-misma-ficha por la corrida e2e de esta pasada.
Items «sin cambios desde <sha>»: ninguno (es la primera pasada y es completa).
Items que deberían estar en failing: ninguno.
