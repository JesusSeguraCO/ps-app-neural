# EP-006 · sub-slice 4, paso 1 — editor con varios sectores (D23)

- Base: `e05a6d2` + este commit · rama `feature/ep-006-administracion-del-inventario` · 2026-10-01
- Cambio: `EntradaPerfil.sectorIds[]` (antes `sectorId`), `PerfilEditor.sectores[]` (antes `sector`, solo el primero), auditoría con campo `sectores`; zod `sectorIds` (≤ 8, `sectorId` → 400); editor con `BuscadorCatalogo tipo="sector"` + chips + alta en el catálogo con parecidos (como tecnologías). Se retiran las opciones de sector del `<select>`.
- TDD: rojo comprobado (7 ✗ en `perfiles-panel.test.ts`) → verde. vitest completo 825 ✓ / 3 omitidos preexistentes. HTTP contra el panel standalone: 16 ✓ (nuevo: combobox, `sectorId` → 400, dos sectores → 201 y en la ficha). e2e panel 22 ✓ (nuevo: elegir 3, quitar 1, guardar, recargar → Banca, Seguros; axe de `/inventario/nuevo` sin incidencias).
- Mutación: guardar solo el primer sector (`r.sectores.slice(0, 1)`) → 7 ✗, MUERTO; árbol restaurado.
- Fidelidad (MCP, panel :3101, 1440): `app-perfil-editor--sectores-1440.png` — rótulo «Sectores» y varios valores como el prototipo (`ed-sec` «Separados por coma»); se elige del catálogo con chips en lugar de texto con comas (misma desviación aprobada que tecnologías/rol, D22). Consola sin errores ni avisos; scrollWidth = clientWidth.
- Pendiente aparte: «más peso visual» del sector en la ficha (D23) es de la cara cliente, no del editor.
