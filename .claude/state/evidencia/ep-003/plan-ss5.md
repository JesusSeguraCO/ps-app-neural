# EP-003 · arranque del sub-slice 5 (HU-154, HU-155, HU-157)

Estado de partida (SS1–SS4 hechos, rama feature/ep-003-evidencia-del-perfil, sin push):
- SS4: tarjeta con capacidad, Sello Personal (contrato + `sello_fuera_de_contrato`), evidencia ✓/– en
  tarjeta y «Frente a tu búsqueda» (`packages/ui/src/Evidencia.tsx`, `apps/portal/src/banco/evidencia.ts`).
  `armarFicha` ya aplica `selloValido` (gemela de la tarjeta). Sin migraciones: 0030–0031 libres (D127).
- Entorno: `.local/playwright.ep003.config.ts` con `SOLO_SPEC=<regex>` (ahora también filtra el proyecto
  portal); capturas del portal con `scratchpad/portal-ep003.sh` (3200) + `scratchpad/borde3203.js` (3203)
  + worker del worktree contra ps_ep003 para leer el código de acceso del registro `correo_doble`.
- Perfiles de captura en ps_ep003: PS-0356 Laura Restrepo (sello A), PS-0357 Felipe Arango (sello B),
  PS-0358 Sara Molina (sin sello, «por confirmar»). No alterar PS-0142 y demás ficticios fijados.
- Mutaciones: `scratchpad/mutar-ss4.py` como plantilla; evidencia de wiring con `scratchpad/wiring-ss4.py`.

Tareas (tasks.md §5), TDD:
5.1 test primero de la lista negra B.4 sobre la respuesta de la ficha y de la tarjeta (HTML/RSC y API) con
    un perfil sembrado con `aporte`, `vinculo` y todo lo de B.4 en el panel → 5.2 bloques verificado /
    declarado (la experiencia solo en lo declarado; lenguaje de inventario ausente en los textos del portal)
    en portal y vista previa → 5.3 validación técnica desplegable (`<details>`/botón, abierta por omisión,
    clic/toque) con los cinco campos de D59 en orden fijo, «Cumple el estándar», Nivel 0 sin fecha, línea de
    la sesión de alineación, sin enlaces → 5.4 bloque de contacto con `ContactoTrycore` y texto de
    representación comercial, idéntico para los tres vínculos → 5.5 fidelidad (`validacion-tecnica` del
    prototipo/handoff) → 5.6 journey con cambio del contacto en el panel.

Pendientes para el sponsor: aprobar capturas de `ss1/`…`ss4/fidelidad.md` (D124/D126).
