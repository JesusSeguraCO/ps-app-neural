# EP-006 · 11.2 — pruebas de contrato del panel con Newman (2026-10-01)

- Colección `tests/postman/ep-006.postman_collection.json`, generada por `tests/postman/generar-ep-006.mjs` (versionada).
- Runner `tests/postman/correr-ep-006.sh`: BD efímera propia (`sembrar-ep-006.mts`: roles, migraciones, ficticios, léxico,
  sesiones de administradora y observadora, dos propuestas de léxico), panel standalone :3101 y worker reales (el worker
  aplica la importación que la colección confirma y espera), Newman, y al terminar para todo y borra la BD.
- **Resultado: 226 peticiones, 350 aserciones, 0 fallos** (`newman-ep-006.json`, `newman-ep-006.log`).
- **Cobertura: los 52 métodos de las 42 rutas nuevas de EP-006**, comprobado contra el árbol `apps/panel/app/api/v1`
  (fuera quedan las 9 rutas de EP-001, que tienen su propia colección).

Carpetas: Catálogos (13) · Léxico (9) · Perfiles (32) · Colocados (11) · Importación (21) · Perfiles: revocar y archivar (4) ·
Administración (10) · Transversal (126): la observadora recibe 403 `sin_permiso` en los 42 métodos que escriben o
exportan y lee los de consulta; sin sesión, 401 sin datos; sin CSRF, 403.

Ajustes que dejó la primera corrida (contrato real, no cambio de producto): una fecha que no existe es 422 `fecha_invalida`
(no 400); la observadora que pide un borrador inexistente recibe 404 (pasa el permiso y llega al recurso); el id de la
diferencia con Operaciones se toma de la pestaña Colocados (no hay un GET de diferencias).
