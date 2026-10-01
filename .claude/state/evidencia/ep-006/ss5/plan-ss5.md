# EP-006 · sub-slice 5 (HU-128, HU-129, HU-130) — arranque

## Estado al abrir (tras cerrar el sub-slice 4 en 30222d7)
- Sub-slice 4 completo: tareas 4.1–4.6 [x], wiring ss4 13 passing con evidencia en `../ss4/`. D23 (varios sectores en el editor) hecho.
- BD local migrada a 0016. Dev DB: PS-0901…0960 importados por el recorrido (59 archivados + PS-0917 en borrador con edición manual), lote de medición PS-1101…1300 revertido (archivados). Ficticios PS-0142/0160/0187 sin tocar.

## Siguiente: tareas 5.1–5.6 de `openspec/changes/administracion-del-inventario/tasks.md`
- 5.1 guardas de publicar en el dominio (`evaluarPublicacion` ya existe; sector opcional por D24).
- HU-128 escenario de importación: ya cubierto en ss4 (consentimiento rechazado) — no repetir.

## Pendientes operativos
- V3-5 en DigitalOcean diferida por el sponsor (D26), no bloquea; repetir al desplegar (local: 200 filas en 0,63 s, 0 × 503).
- Desviaciones ss2–ss4 aprobadas (D25). Autonomía D27: aprobar decisiones de diseño que den valor y registrarlas.
- Hub: revisar cola/rechazados antiguos en la consola.
- Fidelidad local: panel :3101 (`scripts/entorno-dev.sh panel`, sin EDGE_SECRET) + worker real (`scripts/entorno-dev.sh worker`, `node apps/worker/dist/worker.js`, dobles). Liberar :3101 antes del runner de e2e. Subidas MCP solo desde `.local/` (raíz del workspace).
