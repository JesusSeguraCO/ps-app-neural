# EP-006 · sub-slice 3 — fidelidad visual (MCP chrome-devtools) — FIEL con desviaciones registradas

- Base observada: `c7e38af` + ajustes de fidelidad de este commit (tarjetas abiertas, valor nuevo marcado en el diff, motivo «Usa …»); panel standalone recompilado.
- Entorno: panel :3101 (NODE_ENV=production, dobles declarados, sin EDGE_SECRET local), BD local migrada a 0015 con la siembra ficticia; acceso real con código (Mailgun doble) como admin@trycore.com. Prototipo: `docs/05-prototipo/pantallas/importar-perfiles*.html`.
- Recorrido por la UI real: pegar hoja con columna B.4 → emparejamiento propuesto; vista previa con actualizados/nuevo/errores/sin cambios; código repetido → «Desmarcar las dos» → desbloqueado (recalculado en servidor); aplicar plantilla con columna nueva; plantilla con columna faltante; guardar plantilla y verla «Guardada ahora».
- Consola: sin errores, salvo un 409 esperado al guardar un nombre de plantilla repetido (lo explica la pantalla).
- Ancho móvil: la ventana no baja de 500 px; sin desborde horizontal en los dos pasos (scrollWidth = clientWidth).

| Pantalla (manifest) | 1440 | Móvil | Veredicto |
|---|---|---|---|
| importar-perfiles | app/proto | app 390 (500 px) | FIEL (falta «Historial», es del sub-slice 4) |
| importar-perfiles--vista-previa | app/proto | app 390 (500 px) | FIEL con desviaciones 1–3 |
| importar-perfiles--codigo-duplicado | app/proto | — | FIEL (grupo «Con error» en su orden base, no arriba) |
| importar-perfiles--plantilla-guardada | app/proto | — | FIEL con desviación 4 |
| importar-perfiles--plantilla-aplicada | app/proto | — | FIEL (textos idénticos) |
| importar-perfiles--plantilla-columna-faltante | app/proto | — | FIEL (textos idénticos) |

## Desviaciones (registrar en design.md §12, pendientes de visto bueno del sponsor)
1. Aviso agregado «Valores nuevos en la taxonomía» con el valor exacto y cuántas veces se repite (HU-086 lo exige; el prototipo solo lo marca en la tarjeta).
2. La disponibilidad se muestra como fecha (AAAA-MM-DD), que es lo que se guarda; el prototipo muestra rótulos de banda antiguos.
3. Migas sin el tercer nivel «Vista previa» (el paso cambia sin recargar la página).
4. Lista de emparejamientos guardados sin botón «Ver columnas»: el detalle de columnas va en la línea de meta; autor por correo (identidad del panel).
5. Formato ambiguo: pregunta con tres opciones (no está en el prototipo; lo pide la spec §2).

## Fuera de este sub-slice (lo entregan los siguientes, no es recorte)
«Importar N perfiles», resultado, descargar errores y deshacer (4); «Historial» (4); incoherencias en la vista previa (8).
