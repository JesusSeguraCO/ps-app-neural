# SS5 · fidelidad visual (tarea 5.5) — PENDIENTE DE APROBACIÓN DEL SPONSOR

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011 · rama feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T21:34:43Z
- Captura real con MCP chrome-devtools, contexto aislado «ep003», portal de este worktree en 3200 (borde 3203)
  contra `ps_ep003`, con la sesión abierta por la puerta en SS4. Perfiles PS-0408 (Nivel 1, reporte confirmado
  por la API del panel en el e2e de SS5, renombrado «Daniela Ortiz») y PS-0409 (Nivel 0, «Eva Romero»).
  Contacto de captura Eida Tinjacá; la fila se retiró al terminar (la BD aislada no tenía contacto antes).
  Computador 1440×900; teléfono 390×844 DPR 3 con toque emulado (el toque pliega el bloque: `open=false`).

## Referencia
- `docs/05-prototipo/pantallas/ficha-perfil.html` (captura `fidelidad/prototipo-ficha-perfil.png`): hoja lateral,
  «Verificado por Trycore» teñido, «Declarado» sin caja.
- `docs/07-prototipo/handoff/components/portal/validacion-tecnica.tsx`: acordeón abierto por omisión con
  estructura fija de campos.

| Pantalla | Captura | Observación |
|---|---|---|
| Verificado por Trycore (sello, SARO, DISC) | fidelidad/verificado-por-trycore-computador.png | bloque teñido con escudo, como el prototipo |
| Validación técnica Nivel 1 abierta | fidelidad/validacion-nivel1-computador.png | cinco campos D59 en orden fijo, «Cumple el estándar», «febrero de 2026», línea de alineación; flecha de plegado |
| Validación técnica Nivel 0 | fidelidad/validacion-nivel0-computador.png | solo «Prueba aplicada» con el texto de la modalidad; sin fecha ni promesa |
| Declarado + Conversación con Trycore | fidelidad/declarado-y-contacto-computador.png | trayectoria solo en lo declarado; contacto vigente con el texto de representación |
| Teléfono, abierta | fidelidad/validacion-nivel1-telefono-abierta.png | campos en una columna; sin scroll horizontal (0 px) |
| Teléfono, plegada tras un toque | fidelidad/validacion-nivel1-telefono-plegada-tras-toque.png | details/summary nativo: no depende del cursor |

## Desviaciones (a favor de las HU/decisiones)
1. Campos y orden de D59 (prueba aplicada · qué se evaluó · resultado · evaluador · fecha), no los del handoff
   (prueba · evaluador · fecha · resultado · alcance).
2. El encabezado del bloque es «Validación técnica» dentro de «Verificado por Trycore» (el origen ya lo declara
   la sección), sin el rótulo extra «Lo que verificamos» del handoff.
3. El bloque «Conversación con Trycore» no existe en el prototipo: se construyó con el patrón de sección de la
   ficha (`fp-seccion` + `pp-seccion__cabecera`) y `ContactoTrycore` (HU-147).
4. Sin «Sumar al equipo» en el pie (EP-004, D101).

El gate `fidelity` NO se toca.
