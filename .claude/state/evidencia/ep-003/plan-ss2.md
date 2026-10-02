# EP-003 · arranque del sub-slice 2 (HU-178, HU-194)

Estado de partida (SS1 hecho, rama feature/ep-003-evidencia-del-perfil, sin push):
- 0027 (catálogo de alcances SARO) y 0028 (SARO/DISC en el perfil, guarda BD, vistas, fusión, foto previa
  de importación con las tres claves) aplicadas solo en BD temporales y en la BD aislada `ps_ep003`.
  **La BD compartida `ps` (demo 3100/3101) NO está migrada**: al migrarla, la guarda nueva bloquea publicar
  y reactivar en la demo cualquier perfil sin SARO/DISC (PS-0151 pausado, entre otros). Decidir con la demo.
- `evaluarPublicacion` ya tiene `saro_alcance`, `saro_fecha`, `disc_fecha` con `motivo` y `campo`; `faltaDe(c)`.
- Un publicado heredado sin SARO/DISC sigue publicado (la guarda BD solo actúa al entrar en publicado), y
  editarlo hoy ya devuelve `deja_incompleto` con la pregunta D1 (verificar en 2.3, no reescribir).
- La siembra ficticia da SARO/DISC a todos los no borradores: para SS2 hace falta al menos un publicado
  sembrado SIN SARO y otro sin DISC (publicar con todo y luego quitar el dato con UPDATE: la BD lo admite,
  test «un publicado que ya estaba no se toca» de migracion-0028) sin alterar PS-0142/0151/0137/0187.
- Fixture de tests: `entradaValidaciones(bd)` (pruebas/validaciones-entrada.ts) y
  `darModalidadDePrueba(bd, id, { validacionesDeEntrada })`.
- e2e aislado: `.local/playwright.ep003.config.ts` (fuera de Git; portal 3200, panel 3201, BD ps_ep003);
  `BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003`.

Tareas (tasks.md §2), TDD:
1. 2.1 `estadoDeEntrada` en dominio sobre `evaluarPublicacion` («Incompleto: falta …»; SARO alcance+fecha
   se nombran juntos «la verificación SARO (alcance y fecha)»); tabla con sin SARO, sin DISC, sin modalidad,
   sin Sello (no marca).
2. 2.2 `listarInventario` + página `/inventario`: marca y filtro `?estado=incompleto` (FilaInventario gana
   `incompleto`); nunca cruza al portal.
3. 2.3 verificar pregunta D1 en publicado incompleto (HTTP + e2e).
4. 2.4 migración **0029_indicadores_publicacion** (solo booleanos/enteros, legible por ps_portal) + conteo
   con la misma guarda; test portal = panel.
5. 2.5–2.6 `avisosDeLenguaje` (lenguaje.ts) y `avisos[]` en el guardado (también con 422 de fecha).
6. 2.7 fidelidad (sin prototipo: mismo trato que SS1) · 2.8 journey smoke.

Pendientes que arrastra SS1 para el sponsor: aprobar las 6 capturas de `ss1/fidelidad.md`; no hay pantalla
de historial de catálogos (el cambio de texto queda en la cadena de auditoría, como el resto de catálogos).
