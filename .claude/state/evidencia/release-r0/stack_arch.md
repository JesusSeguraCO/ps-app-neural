# Release Gate R0-ep001-ep006 · gate stack_arch (stack-guardian) — FAIL

Diff `acce296..c3ff45b`. Lectura de código + una consulta de permisos en la BD local (`BEGIN READ ONLY … ROLLBACK`).

## Cumple
- Dependencias: todas en la allowlist y en versión (`next 15.5.26`, `react ^19`, `zod ^4`, `tailwindcss ^3.4`, `typescript ^5`, `eslint ^9`, `pg ^8`).
- Fronteras: Gemini (`packages/infra/src/gemini/lexico.ts`, server-only, fetch con timeout 6 s, esquema estricto, doble), Mailgun (`packages/infra/src/mailgun/index.ts`, timeout 10 s, doble); HubSpot sin adaptador en R0 (E-6 → EP-007).
- Gemini solo propone léxico con aprobación humana; sin nombres de perfiles hacia el modelo (`apps/worker/src/proponer-lexico.ts`).
- Sin claves en el cliente: sin `NEXT_PUBLIC_*`; `"use client"` solo importa tipos de `@ps/infra`; CSP `connect-src 'self'`.
- Capa determinista sin E/S, `Math.random` ni `Date.now`; matriz D5 en una función.
- Roles por proceso, sin `SET ROLE`, migrador propio; migraciones sin DML salvo la excepción enumerada (0013).
- Cola en PostgreSQL con `FOR UPDATE SKIP LOCKED`; Dockerfiles `node:22-slim` sin privilegios.
- E-11/E-12 cumplidas en código; D44 no contradice ADR-0003 (guardas en el dominio, re-evaluadas al aplicar).

## Bloqueantes
1. **`ps_worker` con escritura general sobre el inventario.** `packages/infra/migraciones/0005_inventario_minimo.ts:216` `GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA inventario TO ps_panel, ps_worker` (y 0020:73 sobre `cargas_operaciones`/`diferencias_operaciones`). Contradice ADR-0009:98 (CON-9/QA-5, permisos tipo por tipo; rechaza expresamente «ps_worker con escritura en todo el inventario») y ADR-0008:75. Único uso de escritura sobre consentimientos: la siembra ficticia (`apps/worker/src/sembrar-ficticios.ts:319`).
   - (a) Migración que retire el permiso general y conceda la lista de ADR-0009/E-11; la siembra a una función que se niega en producción o al rol de instalación. (b) Registrar la divergencia con un ADR que sustituya la fila.
2. **Operación y despliegue comprometidos por los ADR sin construir ni diferimiento registrado:** `verificar_auditoria` con ancla diaria (ADR-0003 QA-11), `vigilar` (ADR-0009 QA-13), `purgar` (`identidad.purgar_vencidos` nunca se invoca: retención de códigos y sesiones, Ley 1581), latido (`config.ts:61` exige `LATIDO_URL`), `exportar_banco`; `.do/app-*.yaml`, envío a DOCR firmado con `cosign`, agente y `compose.yaml` de staging (ADR-0010:70,74). El planificador solo tiene `proponer_lexico` (`worker.ts:79-90`).
   - (a) Registrar como diferido a una release concreta con «no producción hasta entonces». (b) Construirlo antes de cerrar R0.

## Divergencias no registradas (no bloquean si se registran)
3. `CORREO_TALENTO_HUMANO` (`config.ts:69-71`) cita una enmienda de ADR-0010 §3.3 inexistente.
4. El panel exige `SPACES_KEY/SECRET/BUCKET` (`config.ts:35-37`) con Spaces diferido (E-10): contradice CON-6.
5. El test V3-7 (`migracion-0013.test.ts:18-29`) es un grep, no el analizador que pide ADR-0003:446.
6. `normalizar`/`reconocer` en `packages/dominio` en vez de `packages/motor` (ADR-0004:89-91).
7. El bloque de dominio de `CLAUDE.md` cita secretos retirados por CON-6 (`LINK_SIGNING_SECRET`, `OTP_PEPPER`, `MAILGUN_API_KEY`); vigentes: `MAILGUN_SENDING_KEY`, `MAILGUN_SUPPRESSIONS_KEY`, `OTP_PEPPER_CLIENTE`, `OTP_PEPPER_PANEL`.
- Enmiendas del backlog sin incorporar al cuerpo de los ADR: E-11/E-12 (ADR-0003:94,109,179; ADR-0009:98), E-5, E-8 (`PORTAL_ORIGEN`), E-9; fila E-1 desactualizada.
- D44: `faltasDePublicado` (`plan.ts:552`) reimplementa la lista de `evaluarPublicacion` (`perfil.ts:66`); el encabezado de 0017 sigue sobreafirmando para la edición de un publicado por SQL.

## Veredicto
**FAIL** por 1 y 2. Para PASS: arreglar o registrar 1 y decidir 2; 3–7 arreglar o registrar en `docs/adr/_backlog-arquitectonico.md`.

## Re-verificación incremental (PR #11) — PASS
- (1) Cerrado: en la BD local (migrada hasta 0026, consulta READ ONLY) `ps_worker` no escribe consentimientos, colocaciones, cargas/diferencias de Operaciones ni los catálogos de ciudades, familias, modalidades, modalidades de prueba, motivos de pausa, países y seniorities; INSERT/UPDATE en `perfiles` y sus cuatro hijas; UPDATE en `lotes_importacion`, `lote_filas`, `inventario_version`; INSERT en `candidatas_lexico` (0013) y alta de roles, tecnologías y sectores (HU-086); DELETE en ninguna. Coincide con ADR-0009:98. La siembra sale del worker (`migrar.js --sembrar-ficticios` con `SEMBRAR_PANEL_URL`/`SEMBRAR_WORKER_URL`, se niega en producción).
- (2) Cerrado: diferimiento registrado en `docs/adr/_backlog-arquitectonico.md` E-14 (decisión del sponsor, «ningún entorno con datos reales hasta construirlo»); E-15 registra las divergencias 3–7.
- Sin divergencias nuevas (el proceso `sembrar` es un modo del job; sin cambios en dependencias, Dockerfiles ni `.do/`). Menor: incorporar al texto de ADR-0009, al promover E-13, el alta de catálogos, `INSERT` en `propuestas_lexico` (0013) y en `referencias_auditoria` (0025).
