# Release Gate R0-ep001-ep006 · gate smell (simple-design-reviewer) — FAIL

Diff `acce296..c3ff45b` (EP-001 + EP-006). Regla 1 de Beck: vitest con BD 1227 ✓ / 3 omitidos; e2e 60 ✓ (runner).

## Bloqueantes
- **B1 · Umbral de 30 días duplicado en la capa determinista.** `packages/dominio/src/inventario/coherencia.ts:50` `UMBRAL_DIAS = 30` (usado en `:109`) y `packages/dominio/src/catalogo/banda.ts:18` `DIAS_SIN_TOCAR = 30` (bandeja, `vigencia.ts:99,107`). Misma regla (HU-133, RF-8.14.4); pueden divergir sin aviso. Fix: una sola constante (p. ej. `dominio/inventario/umbrales.ts`).
- **B2 · «Días desde» con tres semánticas.** Días civiles de Bogotá (`vigencia.ts:20` `diasCivilesDesde`) frente a milisegundos/24 h (`banda.ts:33` `sinTocar`, `apps/panel/src/inventario/EstadoEnLista.tsx:188-190`, `apps/panel/app/inventario/page.tsx:66-69`). Caso límite: actualizado el día D a las 23:00, visto el D+31 a la 01:00 → 31 días civiles (entra en «Por revisar») y «hace 30 días» en la fila. Fix: todo con `diasCivilesDesde`.

## Recomendado (no bloquea)
- R1 «Hoy en Colombia» reimplementado en ~10 sitios (`apps/panel/app/inventario/hoy.ts:2`, `apps/panel/src/importacion/servicio.ts:48`, `apps/worker/src/despacho.ts:363`, `EditorPerfil.tsx:196`, `administracion/accesos/page.tsx:136`, `banda.ts:17,22`, `perfil.ts:140`, `fecha/colombia.ts:7,36`) → un único `dominio/fecha/colombia.ts`.
- R2 `sumarDias` triplicado (`vigencia.ts:28`, `colocados.ts:10`, `importacion/plan.ts:168`) y validación de fecha triplicada (`colocados.ts:16`, `plan.ts:171`, `validacion.ts:87`; esta última acepta 2026-02-30).
- R3 La vista reimplementa funciones del dominio con tests: `EditorPerfil.tsx:194-199` (≈ `fechaDeOpcionDisponibilidad`), `Asistente.tsx:1134-1137` (≈ `aPlantilla`).
- R4 Código muerto: `esVisibleEnPortal` (`dominio/inventario/estados.ts:67`) solo en tests.
- R5 Componentes «Dios»: `EditorPerfil.tsx` (2707 líneas, función principal ~1600), `PasoPegar`, `ResultadoImportacion`, `HojaValor`, `evaluarFila`, `infra/postgres/perfiles-panel.ts` (1115 líneas).
- R6 Test intermitente: `apps/v8-2.test.ts:59` crea un temporal dentro de `apps/portal/` mientras `apps/sin-borrado-fisico.test.ts:12-20` recorre `apps/` (1 fallo de 4 sin BD).
- R7 Paginación/búsqueda/URL duplicadas en `catalogos`, `lexico` e `inventario` (`slice(0, 200)` ×5).

## Nits
Servicios de acceso del portal y del panel casi idénticos; `EditorPerfil.tsx` (cliente) importa tipos de `@ps/infra`; `datos.ts:30-32` detecta ZodError por nombre; etiquetas de modalidad en tres sitios; exportaciones sin uso externo (`formatoDeArchivo`, `CAMPO`); `interpretarConsulta` solo en tests (consumidor en EP-009, D46).

## Veredicto
**FAIL** por B1 y B2. Con ambos corregidos y la suite en verde, `smell` puede pasar; R1–R7 como deuda registrada.
