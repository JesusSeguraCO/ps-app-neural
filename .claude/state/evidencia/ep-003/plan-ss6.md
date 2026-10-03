# EP-003 · arranque del sub-slice 6 (HU-156, HU-158)

Estado de partida (SS1–SS5 hechos, rama feature/ep-003-evidencia-del-perfil, sin push):
- SS5: validación técnica desplegable (`Validacion` en `packages/ui/src/FichaPerfil.tsx`, details/summary,
  cinco campos D59, «Cumple el estándar», mes de año), bloque «Conversación con Trycore» con el contacto
  vigente en portal y vista previa (`contacto` se lee en el servidor: `contactoDeFicha` en
  `apps/portal/src/banco/datos.ts`, `leerContacto` en las páginas del editor del panel). Copy en
  `packages/ui/src/copy.ts` (D73): ahí deben ir también SLA, garantía Neural Speed y pie del estándar.
- B.4 probado sobre ficha/tarjeta/API en `apps/ficha-ss5-portal.test.ts` (aporte, vínculo, capacidad, anclaje).
- SARO/DISC ya viajan en `FichaPerfil` (`seguridad`, `disc`, anulables, mes de año) desde SS1 y se dibujan
  como filas simples en lo verificado: SS6 fija su presentación final (HU-156) y su omisión sin marca.
- Ayudas de e2e del portal: `e2e/ayudas/perfiles-publicados.ts` (publicar con sello/experiencia, enlace,
  worker con doble de Mailgun, `confirmarReporte`, axe). Mutaciones: plantilla `scratchpad/mutar-ss5.py`
  (multi-fichero, recompila portal/panel cuando hace falta).
- Perfiles de captura en ps_ep003: PS-0356/0357/0358 (SS4), PS-0408 (Nivel 1) y PS-0409 (Nivel 0). No alterar
  PS-0142 y los ficticios fijados. Migraciones 0030–0031 libres (D127).

Tareas (tasks.md §6), TDD: 6.1 contrato `seguridad`/`disc` + test de heredado sin datos que sigue abriendo
ficha → 6.2 líneas SARO (texto del alcance, también desactivado) y DISC con competencias en lo verificado,
omitidas sin marca, sin puntaje ni DISC detallado → 6.3 cierre: condiciones operativas, SLA de 10 días hábiles
en el tamaño del texto, garantía Neural Speed, código fuera de la cabecera y del `<title>` (hoy está en
`fp-linea` de la cabecera), solo al pie con la línea del estándar → 6.4 regresión HU-129 (mismo HTML portal /
vista previa, ahora con contacto en los dos) → 6.5 fidelidad → 6.6 journey (heredado sin SARO → completarlo).

Pendientes para el sponsor: aprobar capturas de `ss1/`…`ss5/fidelidad.md`.
