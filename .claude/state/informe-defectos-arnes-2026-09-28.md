# Defectos del arnés `@trycore/spec-build-harness` — proyecto ps-app-neural

Fecha: 2026-09-28 · Versión del arnés: ver `.claude/.build-harness-version` · Modo: runtime
Detectados comparando la respuesta cruda de `GET /agent/context` (HTTP 200) con la proyección
local `.claude/state/runtime-projection.json`.

## 1. `wiring_failing` llega como lista de cadenas y se proyecta como `None`

- **Dónde:** `.claude/hooks/build/lib/agent-context.sh`, bucle de `wiring` (≈ líneas 47-53).
- **Hub envía:** `"wiring_failing": ["BND-otp-mail-send-access-code", "otp-mail#send-access-code"]`.
- **El arnés hace:** `w = as_dict(w)` → `{}` → `{"item_id": None, "kind": None}`.
- **Síntoma:** el `SessionStart` y `slice-ops.sh status` muestran «None(None)» por cada item, y
  `next-step` pide «cablear el item «None»». No se puede saber qué falta sin leer el hub.
- **Arreglo propuesto:**
  ```python
  for w in as_list(first(sl.get("wiring_checklist"), sl.get("wiring"), sl.get("wiring_failing"), [])):
      if isinstance(w, str):
          wiring.append({"item_id": w, "kind": None})
          continue
      w = as_dict(w)
      ...
  ```

## 2. `nudges` llega como objeto agrupado y se descarta entero

- **Dónde:** mismo fichero, bucle de `nudges` (≈ líneas 64-71).
- **Hub envía:** `{"gates_abiertos": [{"epic_code","slice_id","gate","phase","pendientes"}], "slices_sin_reflexion": [], "epicas_sin_release": [], "epicas_aprobadas_sin_reclamar": [], "total": 1}`.
- **El arnés hace:** `as_list(dict)` → `[]`. Los avisos del hub nunca llegan a la sesión.
- **Arreglo propuesto:** si `nudges` es dict, aplanar cada grupo con lista a
  `{"kind": <grupo>, "message": <resumen del item>}`.

## 3. `project_facts.foundation` booleano se lee como falso

- **Dónde:** mismo fichero, `foundation_done` (≈ línea 87).
- **Hub envía:** `"project_facts": {"foundation": true, ...}`.
- **El arnés hace:** `as_dict(proj.get("foundation")).get("done")` → `as_dict(True)` = `{}` → `False`.
- **Síntoma:** local `foundation_done=false` mientras el hub lo tiene en `true`.
- **Arreglo propuesto:** `f = proj.get("foundation"); foundation_done = f if isinstance(f, bool) else as_dict(f).get("done", False)`.

## 4. `graph-bundle.py --for-sync` descarta `acceptance_ref` de las historias

- **Dónde:** `.claude/scripts/lib/graph-bundle.py`, `emitir_para_sync`, línea ≈ 231:
  `hs.append({"code": hcode, "title": htitle[...]})`.
- **Contrato del hub:** cada historia admite `acceptance_ref` (el hub la devuelve en `null` en el ack
  del primer sync).
- **Síntoma:** columna «Criterios –» para las 81 historias aunque todas tienen AC en G/W/T.
- **Arreglo propuesto:** proyectar `acceptance_ref` si viene (ruta del `HU-XXX.md` + ancla de
  «Criterios de aceptación»), con tope de longitud como `docs_ref`.

## 5. La plantilla de `/build:graph-sync` y `/build:onboard` no incluye `docs_ref`

- **Dónde:** `.claude/commands/build/graph-sync.md` §1 (y la fase de grafo de `/build:onboard`).
- **Síntoma:** «La documentación de esta épica no está disponible» y «Fuente del grafo: sin
  referencia» en el hub; el re-sync responde «ya está al día» porque compara grafos sin docs.
- **Arreglo propuesto:** incluir `docs_ref` (ruta de la sección de la épica en `epicas.md`) en la
  plantilla del JSON y derivarlo en `--from-docs`.
- **Mitigación aplicada en este proyecto:** propuesta `afd276b2e7ae4a80911f62070e38397d` con
  `docs_ref` en las 11 épicas (pendiente de aprobación humana).

## 6. (Vertical de discovery) El aviso de inicio cuenta «81 sin AC»

- **Dónde:** hook de `SessionStart` de `@trycore/spec-product-flow`.
- **Hecho:** las HU tienen `## Criterios de aceptación` con escenarios `### Happy path / Error / Edge case`
  en G/W/T (p. ej. HU-123: 5). La heurística no reconoce ese formato.

## 7. Los tipos `arch.*` del catálogo del arnés no están registrados en el hub

- **Hecho:** la consola «Tipos de asset» solo lista `core.doc`, `core.library_allowlist`, `core.policy`,
  `core.rule`, `core.stack_profile` y `core.template`. Faltan `arch.drivers`, `arch.adr` y `arch.backlog`
  de `.claude/asset-types.json`, aunque el aviso de la consola dice que los cambios aditivos del
  catálogo del harness se auto-publican al registrarse.
- **Sospecha:** `harness_asset_types` no encontró el fichero al registrar el agente, o el registro
  fue anterior a la siembra de `.claude/asset-types.json`. Re-registrar es idempotente.
- **Tampoco hay tipos de producto** (épica, historia): hoy la documentación de discovery solo puede
  publicarse como `core.doc`.

## 8. No hay forma de retirar un item de wiring obsoleto ni de cerrar un `BND-*` como `na` (2026-09-29)

- **Dónde:** `slice-ops.sh wiring update <id> <passing|failing>` (sin `retired`/`na`) y la consola del hub (el sponsor no encontró cómo retirarlos).
- **Caso real (EP-001):** seis items quedan `failing` para siempre y bloquean el gate `tdd` (`dod.md`: `tdd` no cierra con un `BND-*` en `failing`):
  - obsoletos por decisión del sponsor: `BND-hubspot-contacto-de-cuenta` y `HU-122-ac4-contacto-crm` (2026-09-28: la generación del enlace no lee HubSpot); `BND-hubspot-get-company-status` (2026-09-29: la renovación ya no consulta HubSpot; el adaptador se retiró del código);
  - duplicado con el formato de id antiguo: `otp-mail#send-access-code`;
  - `na: no_credentials` legítimo según `boundary-check.md` §6 (Mailgun se verifica en staging): `BND-otp-mail-send-access-code`, `BND-otp-mail-send-notification`. La reference dice que un `na` «no siembra item», pero no contempla el item ya sembrado: `verified[]` local registra el `na` y el hub sigue con el item en `failing`.
- **Síntoma:** el slice no puede avanzar de `red` sin marcar `passing` algo que no tiene ejecución real (lo que el `wiring-adversarial-verifier` debe tumbar).
- **Arreglo propuesto:** un estado terminal `retired` (con motivo y autor humano) y `na` (con `reason_code` del catálogo cerrado de `boundary-check.md` §6) en `wiring update` y en la consola, que no cuenten como `failing` y que el Release Gate (`integration`) enumere como hoy enumera `verified[?status=="na"]`.
- **Agravante (2026-09-29):** `slice-ops.sh escalate` pasa el slice a `ESCALATED` y desde ahí el hub rechaza todo `wiring_item_updated` («solo un slice ACTIVE procesa wiring_item_updated (status=ESCALATED)»); la superficie de agente no tiene cómo volver a `ACTIVE`. Escalar este mismo defecto congeló el slice: los seis cierres autorizados por el sponsor se rechazaron y no se reenvían solos. Reactivar el slice es acto humano en la consola; después hay que re-emitirlos.

## Defecto: `design_source_applies` no se puede corregir (2026-10-01, EP-006)
- Estado del hub: `design_source_applies=false` con `design_source_confirmed=true` en un proyecto con UI.
- La consola del hub no expone el campo; `slice-ops.sh fact design-source --applies true` se rechaza con «es un hecho HUMANO: no entra por la superficie de agente» y remite a `PATCH /orchestrator/projects/{project_id}`, sin forma de hacerlo desde el front.
- Efecto: la tarea 11.4 de EP-006 no se podía cerrar por un campo que nadie puede cambiar. Se resolvió con la decisión D49 del sponsor (declarar y cerrar); la fidelidad se verificó con captura MCP.
- Pedido: exponer el campo en la consola o aceptar el hecho desde el agente con `--by` humano.
