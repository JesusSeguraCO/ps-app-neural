# SS6 · fidelidad visual (tarea 6.5) — PENDIENTE DE APROBACIÓN DEL SPONSOR

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1 · rama feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T21:50Z
- Captura real con MCP chrome-devtools, contexto aislado «ep003», portal de este worktree en 3200 (borde 3203)
  contra `ps_ep003`, con la sesión del banco abierta en SS4. Perfiles: PS-0408 (completo, Sello Personal, Nivel 1),
  PS-0105 (heredado sin SARO, D62), PS-0358 (DISC sin Sello Personal). Computador 1440×900; teléfono 390×844 DPR 3
  con toque. Medido en el teléfono: SLA 15 px (tamaño del texto de la ficha) frente a la referencia 12 px (subida a 13 px en SS7 por M-8); 0 px de
  desplazamiento horizontal.

## Referencia
- `docs/07-prototipo/Portal de Perfiles v2.dc.html` §6 (ficha en panel lateral) y `handoff/components/portal/ficha-perfil.tsx`:
  lista «Lo que verificamos» con título + detalle por validación; al final del cuerpo «Referencia interna {id}. Todos
  los perfiles que publicamos pasan por nuestro estándar Neural-Grid™.» en 12 px.
- `docs/05-prototipo/pantallas/ficha-perfil.html` (ya capturada en ss5/fidelidad/prototipo-ficha-perfil.png).

| Pantalla | Captura | Observación |
|---|---|---|
| SARO, DISC y Sello Personal | fidelidad/saro-disc-sello-computador.png | dentro de «Verificado por Trycore», título + detalle como el prototipo; sin insignias |
| Cierre y referencia | fidelidad/cierre-y-referencia-computador.png | condiciones, servicio de Trycore (SLA destacado en tamaño del texto, garantía), referencia al pie en letra pequeña |
| Heredado sin SARO | fidelidad/heredado-sin-saro-computador.png | sin línea SARO ni marca; DISC y validación siguen |
| Teléfono, DISC sin sello y cierre | fidelidad/cierre-telefono.png | pantalla completa, una columna, sin desbordar |

## Desviaciones (a favor de las HU/decisiones)
1. El prototipo no dibuja el cierre con condiciones, SLA y garantía (HU-158): se construyó con el patrón de sección
   de la ficha (`fp-seccion`, `pp-datos`) y dos párrafos en el tamaño del texto (RF-6.2).
2. El prototipo pone el código también en la cabecera de la tarjeta/ficha; aquí sale de la cabecera y del `<title>`
   y queda solo en la referencia al pie (RF-3.5, HU-158).
3. Las competencias del Sello Personal se leen bajo la evaluación DISC (B.1: el sello sale de la DISC) en lugar de
   una fila aparte; sin fecha DISC (heredado) el Sello Personal registrado conserva su fila.
4. Copy marcado para revisión (D73): «{alcance}. · marzo de 2026» deja un punto antes del separador cuando el texto
   del alcance termina en punto; se propone a Mercadeo redactar los alcances sin punto final o mostrar el mes en su
   propia línea.

El gate `fidelity` NO se toca.
