# Gate `data` — EP-006 (administracion-del-inventario)

- Fecha: 2026-10-01 · verificador: data-consistency-checker (solo lectura sobre código; sin escrituras en la BD de desarrollo)
- Anclaje: HEAD `b4110f8` (rama feature/ep-006-administracion-del-inventario)
- Clase de evidencia: determinista (vitest + PostgreSQL real con BD efímeras `ps_t_*` + SELECT en `BEGIN READ ONLY … ROLLBACK` sobre la BD local `ps`). Gemini real no se ejecutó (sin llave en este entorno; evidencia viva fuera de alcance de este gate).
- HU-131 (artefactos/Spaces) no exigida: diferida por D29.

## Ejecución

| Comando | Resultado |
|---|---|
| `eval "$(scripts/bd-local.sh entorno)" && npx vitest run packages` | 67 ficheros ok, 2 saltados · 840 tests ok, 3 saltados (Gemini real sin llave; 2 de `entorno.test.ts` que solo corren con `REQUIERE_BD=1`) |
| `REQUIERE_BD=1 npx vitest run apps/{aplicar-importacion-panel,catalogos-lexico-panel,coherencia-panel,colocados-panel,contacto-trycore,editar-publicado-panel,importacion-panel,observador-panel,perfiles-panel,publicar-panel,recorrido-ep006,registro-perfil,sin-borrado-fisico,validacion-panel,vigencia-panel,accesos-panel,catalogo-portal,banco-portal,ficha-compartida}.test.ts apps/worker` | 25 ficheros, 226 tests ok, 0 saltados (servidores standalone reales + BD efímera) |
| Sonda propia en el scratchpad (no en el repo): importación real (`calcularPlan` → `registrarLote` → `confirmarLote` → `aplicarLote`) sobre BD efímera sembrada con `sembrarFicticios` | **Rompe invariante** (ver hallazgo H1) |
| `verificarCadena(AUDIT_HMAC_KEY de entorno-dev)` sobre la BD local, en `BEGIN READ ONLY` | `{"ok":true,"filas":9400}` |
| 20 consultas SQL de invariante en `BEGIN READ ONLY … ROLLBACK` | ver tabla |

## Invariantes

| # | Invariante | Evidencia | Resultado |
|---|---|---|---|
| 1 | Salida de Gemini = entrada no confiable, validada con esquema | `RespuestaModeloLexico` es `z.strictObject` con topes (`packages/contratos/src/lexico.ts:19-38`); `safeParse` y rechazo `esquema` (`packages/infra/src/gemini/lexico.ts:79-84`); timeout 6 s; lo que vuelve se re-ancla a ids reales del catálogo y a consultas enviadas, descartando lo inexistente (`packages/dominio/src/lexico/lote.ts:72-109`). Queda `pendiente` hasta aprobación humana (CHECK `0013:181-186`; SQL: 0 aprobadas sin `lexico_id`). Tests: `gemini/lexico.test.ts:71,82`, `lote.test.ts:83,110`, `apps/worker/src/proponer-lexico.test.ts:71,90` | OK |
| 1b | Al modelo nunca datos de perfiles (RF-16.2) | `LoteHaciaModelo` estricto (solo id+texto+taxonomía); consultas con nombre/apellido de cualquier perfil no viajan (`lote.ts:24-47`); tests `lote.test.ts:29,39`, `proponer-lexico.test.ts:47` | OK |
| 2 | Tipos/unidades | Fechas civiles de Bogotá con `ahora` inyectado (`vigencia.ts:17-26`; tests V3-4 `coherencia.test.ts:150`, `operaciones.test.ts:166`); carga de Operaciones con rechazo entero ante formato/columnas/tamaño inválidos (`operaciones.test.ts:118-145`); CHECKs de rangos en `0014`/`0020` | OK |
| 3 | Ausentes explícitos (`null`), ausente ≠ vacío ≠ `[vaciar]` | `leerCampo` (`plan.ts:236-245`); tests `plan.test.ts:153-171`, `aplicar-importacion.test.ts:178` | OK |
| 4 | Determinismo | Dominio puro con reloj inyectado; sin `Math.random`/`Date.now()` en `packages/dominio` y `packages/contratos`; propiedad fast-check de ida y vuelta (`plan.test.ts:143`) y de B.4 (`emparejar.test.ts:111`); matriz exhaustiva de coherencia (`coherencia.test.ts:71`); aplicar el mismo lote dos veces no hace nada (`aplicar-importacion.test.ts:155`) | OK (obs. A) |
| 5 | Clasificación acotada y umbrales | Estados exactamente 4 (CHECK `0021:132`; SQL 0 fuera); D5 ALTA/MEDIA en una sola función (`coherencia.ts`) usada por listado, publicar, bandeja e importación | OK (obs. B) |
| 6 | Explicabilidad | Cada incoherencia lleva clave + texto de la contradicción; `evaluarPublicacion` dice qué falta (`perfil.ts:66-106`); vista previa de importación con antes/después por campo (`plan.ts:467-476`) | OK |
| 7a | Consentimiento bloquea publicar; revocar despublica | SQL: 0 publicados sin consentimiento nominal vigente; 0 perfiles con 2 vigentes; 0 `vigente ≠ (revocado_en IS NULL)`. Disparador `0017:20-34`. Revocar → borrador (`estados.ts:52-58`; tests `perfiles-panel.test.ts:344`, `apps/perfiles-panel.test.ts:309`). Portal: `catalogo_publicable` = 122 = publicados con consentimiento | OK |
| 7b | Publicado ⇒ modalidad de prueba activa de su familia y obligatorios (D10, RF-8.4) | **Por importación se rompe**: H1. Además la BD local tiene 4 publicados sin modalidad (PS-0201/0223/0230/0238, semillas de 2026-09-29 previas a la 0017; obs. C) | **FALLA** |
| 7c | Coherencia estado/disponibilidad RF-8.14 | SQL: 0 pausados sin motivo; 0 colocaciones vigentes en no publicados; 0 colocados con disponibilidad antes de la liberación; tests `coherencia.test.ts`, `apps/coherencia-panel.test.ts` | OK |
| 7d | Catálogos sin borrado; fusión | 0 valores fusionados activos; 0 perfiles apuntando a un valor fusionado; DELETE de roles de la app solo en `operacion.kysely_migration(_lock)` para `ps_migrador`; tests `catalogos-panel.test.ts:227,270`, `migracion-0019.test.ts:79`, `apps/sin-borrado-fisico.test.ts` | OK |
| 7e | Importación: modos, no publica, no concede consentimiento, reversión | `plan.ts:370-401,582-594`; tests `aplicar-importacion.test.ts:95-267`, `revertir-importacion.test.ts:97-173`, `apps/worker/src/aplicar-importacion.test.ts:191`; `estado_previo` sin consentimiento ni B.4 (CHECK `0016:74`); SQL: 0 lotes aplicados/revertidos sin `confirmado_por` | OK (salvo H1) |
| 7f | Colocados y carga de Operaciones | Una colocación vigente por perfil (SQL 0 dobles); gana el panel y la diferencia queda a la vista (`colocados.test.ts:423`, `apps/colocados-panel.test.ts:328`); «desincronizado» 7 vs 8 días (`apps/colocados-panel.test.ts:380`) | OK |
| 7g | Auditoría con autor y cadena íntegra | `verificarCadena` ok sobre 9 400 filas; 0 filas sin actor; 0 huecos de `seq`; orígenes `fusion, importacion, migracion, panel, reversion, revocacion, sincronizacion, worker` | OK |
| 8 | Lista negra B.4 nunca cruza al portal | 0 columnas B.4 en `inventario`; `ps_portal` solo SELECT sobre 11 vistas de `operacion` (columnas revisadas: sin foto/contacto/CV/motivación/DISC/promedio/certificaciones; `aporte` excluido por D20); cliente nombrado solo si `incluye_clientes` (SQL: 0 expuestos sin permiso); importación bloquea columnas B.4 (`emparejar.test.ts:76,111,212`), editor las rechaza (`apps/perfiles-panel.test.ts:191`) | OK |

## Hallazgos

### H1 (bloqueante) — una importación deja un perfil publicado incompleto y visible en el portal

- Dónde: `packages/infra/src/postgres/aplicar-importacion.ts:393` aplica la fila de un publicado con `edicionEnTransaccion` sin evaluar las condiciones de publicación. El editor del panel sí lo hace (`perfiles-panel.ts:763-821`, respuesta `deja_incompleto` con la pregunta D1). `calcularPlan` (`packages/dominio/src/importacion/plan.ts:459-476`) tampoco lo marca: solo `codigo/nombre/primerApellido/estado` son no vaciables (`plan.ts:143`). El disparador de defensa en profundidad solo actúa al **entrar** en publicado (`packages/infra/migraciones/0017_publicar_y_ficha.ts:23`), aunque su comentario (líneas 3-4) dice que ninguna vía, «importación» incluida, deja un publicado sin modalidad.
- Reproducción ejecutada (BD efímera, semilla `sembrarFicticios`, publicados con consentimiento y modalidad):
  - `Código | Modalidad de prueba` → `PS-0142 | [vaciar]`: plan `actualizado`, 0 errores, 0 avisos; aplicado. Resultado: `estado=publicado`, `modalidad_prueba_id=NULL`, sigue en `catalogo_publicable`.
  - `Código | Tecnologías | Experiencia` → `PS-0187 | [vaciar] | [vaciar]`: aplicado; publicado con 0 tecnologías, visible en el portal.
  - `Código | Rol` → `PS-0201 | Desarrolladora backend Java` (rol de otra familia): aplicado; la modalidad queda `NULL` y el perfil sigue publicado y visible.
- Qué se rompe: D10/RF-8.4 (ningún publicado sin modalidad de prueba ni obligatorios), la ficha del cliente sale sin enunciado de Nivel 0 y sin tecnologías.
- Arreglo sugerido (decisión del orquestador/equipo): en el plan, una fila que deje a un publicado sin algo de `evaluarPublicacion` debe ir a error (o a aviso con paso a borrador explícito, como D1); en `aplicarLote`, revalidar con `evaluarPublicacion` tras `edicionEnTransaccion` y abortar. Test que falta: en `aplicar-importacion.test.ts`, los tres casos de arriba deben acabar en `con_error` (o en borrador auditado) y el perfil fuera de `catalogo_publicable`. Opcional: extender el disparador de la 0017 a cualquier UPDATE de un publicado (modalidad/familia).

## Observaciones (no bloquean)

- **A.** No hay test explícito de «N corridas → mismo resultado» para `evaluarCoherencia`, `armarBandeja`/vigencia ni colocados; son puras con `ahora` inyectado y tienen matriz exhaustiva, el riesgo es bajo.
- **B.** El umbral de 30 días está tres veces: `UMBRAL_DIAS` (`dominio/inventario/coherencia.ts:50`), `DIAS_SIN_TOCAR` (`dominio/catalogo/banda.ts:18`, que `vigencia.ts` sí reutiliza) y la banda cuenta días en milisegundos mientras coherencia/vigencia cuentan días civiles. Hoy coinciden en lo que ve el cliente porque «por confirmar» sale siempre de `bandaDeDisponibilidad`; conviene que `coherencia.ts` importe `DIAS_SIN_TOCAR`.
- **C.** BD local: PS-0201, PS-0223, PS-0230 y PS-0238 están publicados sin modalidad de prueba (`origen_creacion=siembra`, auditados por `sistema:sembrar_ficticios` el 2026-09-29, antes de la 0017). Son semillas viejas, no salida de la app (la semilla actual sí les asigna modalidad), pero el portal de desarrollo los muestra. No se tocaron.
- El conjunto de dobles: Gemini solo se probó con el doble declarado y con `fetch` simulado; la corrida real (`frontera-real.test.ts`) quedó saltada por falta de llave.

## Veredicto

**FAIL → `gates.data: false`.** Todo lo demás cuadra con evidencia ejecutada; lo que bloquea es H1: la importación puede dejar publicados incompletos (sin modalidad de prueba, sin tecnologías o con familia cambiada) visibles en el portal. Cierra con el arreglo y el test descritos en H1.

## Arreglo de H1 (2026-10-01, D44)

- `packages/dominio/src/importacion/plan.ts`: `faltasDePublicado` — la fila que dejaría a un publicado sin algo que la
  publicación exige va a `con_error` con el motivo; si la misma fila lo pasa a borrador se aplica; un hueco previo no la
  bloquea. `aplicarLote` recalcula el plan con esta misma función al aplicar, así que la guarda se re-evalúa en el worker.
- Spec `importacion-masiva` enmendada (requisito + escenario «La fila dejaría incompleto a un publicado (D44)»).
- Comentario de la migración 0017 corregido (la importación no pasa por el disparador; la cubre el plan).
- Tests: 7 nuevos en `plan.test.ts` (dominio 424/424 verde) y uno de integración con PostgreSQL real en
  `aplicar-importacion.test.ts` con los tres casos de la sonda (11/11 verde).
- **Mutación:** con `plan.ts` de HEAD el test de integración cae (`expected ['actualizado', …] to deeply equal
  ['con_error', …]`); con el arreglo pasa.
- Observaciones A–C: sin cambio (no bloquean). C (semillas de dev publicadas sin modalidad) no se tocó: es dato de la BD
  de desarrollo anterior a la 0017.

**Veredicto tras el arreglo: PASS** — arreglo en `4380070`; runner completo VERDE sobre `b833742` (1214 tests, 59 e2e): `integration-report-b833742.txt`.
