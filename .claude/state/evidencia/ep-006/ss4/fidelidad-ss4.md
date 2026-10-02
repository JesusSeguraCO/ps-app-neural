# EP-006 · sub-slice 4 — fidelidad visual (MCP chrome-devtools) — FIEL con desviaciones registradas

- Base observada: `7863757` + la UI de este commit; panel standalone :3101 (NODE_ENV=production, dobles declarados, sin EDGE_SECRET local) y **worker real** (`apps/worker/dist/worker.js`, dobles mailgun/gemini/spaces/latido) sobre la BD local migrada a 0016. Sesión de administradora local. Prototipo: `docs/05-prototipo/pantallas/importar-perfiles--*.html`.
- La captura de filas-con-error se tomó con la caché del navegador aún en el build anterior: muestra «0 excluidas por ti», que el build final oculta (comprobado en el DOM tras recargar sin caché).
- Consola: sin errores. A 500 px (mínimo de la ventana MCP) sin desborde; a 320/390 lo cubre el e2e (axe + scroll) de `/importar?vista=historial` y del resultado.

| Pantalla (manifest) | App | Prototipo | Veredicto |
|---|---|---|---|
| importar-perfiles--filas-con-error | app-…-filas-con-error-1440.png | proto-…-filas-con-error-1440.png | FIEL (desv. 1, 2) |
| importar-perfiles--campos-rechazados | app-…-campos-rechazados-1440.png | proto-…-campos-rechazados-1440.png | FIEL (desv. 3) |
| importar-perfiles--revertir | app-…-revertir-1440.png | proto-…-revertir-1440.png | FIEL (desv. 4) |
| importar-perfiles--revertir-no-ultima | app-…-revertir-no-ultima-1440.png | proto-…-revertir-no-ultima-1440.png | FIEL |
| perfil-editor (sectores, D23) | app-perfil-editor--sectores-1440.png | perfil-editor.html («Sectores») | FIEL (desv. 5) |

## Desviaciones (registrar en design.md §12, pendientes de visto bueno del sponsor)
1. Nombre de la importación = nombre del archivo cargado; si se pegó, «Hoja pegada» (el prototipo muestra un nombre sin decir de dónde sale).
2. Autor por correo (identidad del panel), igual que en sub-slices 2 y 3.
3. La columna rechazada no muestra su valor («sí»): el lote guarda solo el nombre de la columna rechazada; «rechazado» va como etiqueta de estado.
4. «Hoy / Si lo incluyes» lista solo los campos que difieren, con el valor completo del panel (no el resumen libre del prototipo).
5. Sectores con buscador del catálogo y etiquetas, como tecnologías, en lugar de texto separado por comas (D23; misma desviación aprobada para rol y tecnologías, D22).
