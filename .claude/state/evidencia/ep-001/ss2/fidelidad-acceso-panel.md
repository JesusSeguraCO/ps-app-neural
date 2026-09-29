# Fidelidad visual del acceso y marco del panel (Chrome DevTools MCP) — 2026-09-29T03:39:18Z
Dos revisiones independientes (ux-fidelity-reviewer, contexto limpio) contra docs/05-prototipo/pantallas/ a 1440×900 y 390×844 + observación propia tras los arreglos. HEAD df394ea.
1.ª: D1 marco sin construir (alta), D2 títulos a 400, D3 marca oculta en móvil, D4 enlaces separados, D5 sesión caducada genérica, D6 correo simplificado, D7 errata → corregidos (024f783, 5e0bd9e); la 2.ª los confirmó.
2.ª: panel-acceso FIEL; código y caducada con detalles menores; admin-shell con N2 «...» suelto en patrones.css (marco a una columna) y N5 desborde a ~1140 px en móvil → corregidos (df394ea) y observados tras rebuild: dos columnas a 1440, menú horizontal a 390 sin scroll de página. N1 peso 500, N4 hora resaltada, N6 viewport del correo → corregidos.
Nuevo e2e/marco.panel.spec.ts (16 passed en total): grid, 12 destinos deshabilitados sin href, sin scroll a 320/390, axe 0 graves, cerrar sesión. Mutaciones: patrones.css con «...» → 3 fallan; sin position:relative → 2 fallan.
Desviaciones intencionales registradas en openspec/changes/acceso-y-aterrizaje-curado/design.md.
Capturas: test-results/fidelidad-ss2/ (fuera de Git).
