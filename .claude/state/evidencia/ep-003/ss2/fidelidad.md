# SS2 · fidelidad visual (tarea 2.7) — PENDIENTE DE APROBACIÓN DEL SPONSOR (D124)

- sha: 0b2a7fb5ec31e074f116b73930500a8287575bd3 · rama feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T20:03:21Z
- Captura real con MCP chrome-devtools, contexto aislado «ep003», panel de este worktree en 3201 (borde
  emulado en 3202 con la cabecera de borde) contra la BD aislada `ps_ep003` (migrada a la 0029, con los
  cuatro heredados de `--heredados-incompletos`). 1440×900. Consola: solo el 422 esperado de la fecha futura.

## Referencia
- Listado: `docs/05-prototipo/pantallas/inventario-perfiles.html` (pestañas y fila); la marca y la pestaña
  «Incompletos» no están dibujadas → patrón de la pestaña «Con incoherencia» (punto ámbar) y la sub-línea
  de estado de la fila (D124).
- Pregunta D1: `perfil-editor--incompleto-al-guardar.html` (captura `fidelidad/prototipo-perfil-editor--incompleto-al-guardar.png`):
  misma hoja lateral, mismos botones y textos; cambia el título («Este cambio no se puede publicar») y se
  añade la línea «No se puede publicar mientras falte …» cuando el perfil ya estaba incompleto (HU-178).
- Aviso de lenguaje: sin prototipo → patrón `pp-aviso--warn` del editor (D124), aparte del `pp-aviso--danger` del rechazo.

| Pantalla | Captura | Observación |
|---|---|---|
| Listado filtrado «Incompletos» con marcas | fidelidad/listado-filtro-incompleto.png | 4 heredados; marca ámbar sin truncar bajo «Publicado»; conteo con punto en la pestaña |
| Editor de un publicado incompleto | fidelidad/editor-publicado-incompleto.png | aviso ámbar «Incompleto: falta … Sigue publicado…» sobre el aviso de publicado |
| Pregunta D1 por incompleto + aviso de lenguaje | fidelidad/pregunta-d1-incompleto-con-aviso.png | título, motivo, lista de lo que falta; el aviso «stock» dentro de la hoja, sin confundirse con la causa |
| Aviso de lenguaje con error de fecha a la vez | fidelidad/aviso-lenguaje-con-error-fecha.png | rechazo rojo «No se guardó» (role=alert) y aviso ámbar aparte (role=status) |

Observación menor: la expresión resaltada lleva 2 px de relleno y deja aire visual dentro de las comillas
(«␣stock␣»); se puede ajustar en la pasada de copy (D73). El gate `fidelity` NO se toca.
