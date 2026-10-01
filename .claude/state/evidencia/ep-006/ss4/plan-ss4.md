# EP-006 · sub-slice 4 (HU-141, HU-087, HU-142) — arranque

## Estado al abrir (2026-10-01, tras cerrar el sub-slice 3 en 6c87369; PRD v4.16 en 7cec90c)
- Sub-slice 3 completo: tareas 3.1–3.7 [x], wiring ss3 passing con evidencia en `../ss3/`.
- Decisiones nuevas del sponsor: D23 (sector con varios valores, como tecnologías) y D24 / PRD D-25 (sector opcional para publicar; ya aplicado en 25dc66e).

## Primero (antes de que la importación escriba en el banco)
1. **Editor con varios sectores (D23):** `apps/panel/src/inventario/EditorPerfil.tsx` hoy usa un `<select>` único (`sectorId`); pasar a selección múltiple del catálogo como las tecnologías (`BuscadorCatalogo`), `EntradaPerfil.sectorIds[]` en `packages/infra/src/postgres/perfiles-panel.ts` (hoy `sectorId` → `perfil_sectores` con un solo valor; `leerPerfil` devuelve `sectores[0]`), zod `entradaPerfil` en `apps/panel/src/inventario/api.ts`. Si no, editar a mano un perfil importado con 2 sectores borra el segundo. Tests: infra, HTTP (`apps/perfiles-panel.test.ts`), e2e del editor; fidelidad de `perfil-editor`.

## Después: tareas 4.1–4.6 de `openspec/changes/administracion-del-inventario/tasks.md`
- Base ya construida: `lotes_importacion` (estado I-2, nace `calculado`), `lote_filas` (datos, cambios, errores, avisos, rechazadas; sin texto original — decidir para HU-142 sin guardar columnas B.4), `calcularPlan`/`mapearFilas` puros, `filasDelLote`, `actualizarPlanLote`, rutas `/api/v1/importacion/*`, pantalla `/importar` (falta botón «Importar N perfiles», resultado, «Historial», descargar errores, deshacer).

## Pendientes operativos
- Hub: 15 eventos en cola sin despachar; la proyección muestra 13 items de wiring con `item_id` null (anteriores a ss3); 11 rechazados antiguos de otro slice (fc61…). Revisar en la consola del hub.
- BD de desarrollo: 9 lotes `calculado` y 4 plantillas de prueba (no tocan perfiles); borrarlos requiere permiso del usuario.
- Fidelidad local: panel standalone en :3101 sin EDGE_SECRET; entrar por /acceso con admin@trycore.com (código en el log del panel, Mailgun doble). Liberar :3101 antes del runner de e2e.
