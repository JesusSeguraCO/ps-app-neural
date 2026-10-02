# EP-003 · arranque del sub-slice 4 (HU-153, HU-081, HU-119)

Estado de partida (SS1–SS3 hechos, rama feature/ep-003-evidencia-del-perfil, sin push):
- Migraciones 0027–0029 aplicadas solo en BD temporales y en `ps_ep003` (D125: `ps` NO se migra hasta el
  merge). La 0029 es la última reservada a EP-003: si SS4+ necesitara DDL, hay que decidirlo antes (no
  hay número libre en la reserva). La 0029 trae `operacion.indicadores_publicacion` y amplía
  `solo_claves_de_formato` con saroAlcance/saroFecha/discFecha (re-aplicada en ps_ep003 el 2026-10-02).
- `catalogo_publicable` ya trae `sello_personal` y el orden de carga de tecnologías (0028, SS1).
- Entorno: `.local/playwright.ep003.config.ts` (fuera de Git) con `SOLO_SPEC=<regex>`; panel 3201 + borde
  3202 para capturas MCP con `scratchpad/panel-ep003.sh` y una sesión creada en ps_ep003. Para el
  portal (tarjetas) hará falta además el portal en 3200 con un enlace de cliente.
- Heredados de demo en ps_ep003: PS-0105/0112 siguen incompletos; PS-0118/0124 también (las e2e crean
  los suyos). No alterar PS-0142 y demás ficticios fijados.

Tareas (tasks.md §4), TDD: 4.1 contrato + dominio (`capacidadDeTarjeta`, `tecnologiasDeTarjeta` 5 por
orden de carga D73, `selloValido`) → 4.2–4.3 `TarjetaPerfil` (sello sin insignia; fuera de contrato se
omite con registro `sello_fuera_de_contrato`) → 4.4 `lineaDeEvidencia` (tabla fija + D96) → 4.5 ✓/– en
tarjeta y «Frente a tu búsqueda» desde `CriterioResuelto[]` → 4.6 fidelidad (prototipo v2 sí dibuja la
tarjeta: comparar con `docs/07-prototipo/`) → 4.7 journey.

Pendientes que arrastran SS1–SS3 para el sponsor: aprobar capturas de `ss1/`, `ss2/` y `ss3/fidelidad.md`
(D124).
