# SS7 · fidelidad visual (tarea 7.6) — PENDIENTE DE APROBACIÓN DEL SPONSOR

- sha: cc13a17 (+ evidencia) · rama feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T22:40Z
- Captura real con MCP chrome-devtools, contexto aislado «ep003», portal de este worktree en 3200 (borde 3203)
  contra `ps_ep003`, sesión de SS4 (selección «Tres perfiles para Pagos inmediatos»). Computador 1440×900;
  teléfono 390×844 DPR 3 con toque. En el teléfono: `position: static`, 0 diálogos, 0 px de scroll horizontal.
- El encuadre se capturó en su variante del banco sin perfiles (`/banco?categoria=Inexistente`), que monta el mismo
  `Encuadre.tsx` que el enlace sin selección (la sesión del contexto «ep003» trae selección).

## Referencia
- `docs/07-prototipo/Portal de Perfiles v2.dc.html` §1 (aterrizaje curado: `hero-neural-grid`, núcleo + anillo de
  componentes + retratos ilustrativos; texto «capacidad verificada en cinco componentes») y
  `handoff/components/portal/franja-servicio.tsx` («Te respondemos en 10 días hábiles»).

| Pantalla | Captura | Observación |
|---|---|---|
| Selección, encabezado | fidelidad/seleccion-encabezado-computador.png | tras la franja del título, antes de la lista; marca núcleo + 4 nodos; 4 dimensiones |
| Selección, respaldo | fidelidad/seleccion-respaldo-computador.png | tres pilares y el SLA en 15 px al final de la selección |
| Banco | fidelidad/banco-encabezado-computador.png | mismo encabezado antes de la lista |
| Encuadre | fidelidad/encuadre-encabezado-computador.png | antes de «¿Qué necesita tu proyecto?» |
| Teléfono | fidelidad/seleccion-encabezado-telefono.png | en el flujo, una columna, dimensiones en 2×2 |

## Desviaciones (a favor de las HU/decisiones)
1. Cuatro dimensiones (D64), no los «cinco componentes» del prototipo.
2. Sin retratos orbitando ni ondas animadas ni logo Neural Grid: la forma es negociable (HU-159 · N) y los retratos
   son ilustrativos; se conserva la idea núcleo + anillo con una marca SVG decorativa. Si el sponsor quiere el hero
   ilustrado completo, es trabajo de forma, no de alcance.
3. La franja del prototipo es un onboarding de pasos que se cierra (×); aquí el SLA vive en el bloque de respaldo,
   fijo y sin nada que cerrar (RF-6.1/6.2: no bloquear ni esconder el plazo).
4. Aire vertical añadido tras la primera captura (40 px, como la franja) — commit cc13a17.

El gate `fidelity` NO se toca.
