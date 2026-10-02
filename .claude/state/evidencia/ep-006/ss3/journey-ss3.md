# EP-006 · sub-slice 3 — journey smoke (tarea 3.7)

Recorrido por la UI real del panel (MCP chrome-devtools, :3101, BD local con la siembra): exportar el banco → editar dos disponibilidades (PS-0142 → 2031-01-15, PS-0201 → 2031-02-01) → pegar como celdas de hoja de cálculo → 23/23 columnas emparejadas por nombre → guardar el emparejamiento «Banco completo (journey 3.7)» → vista previa: **2 actualizados, 14 sin cambios**, 0 errores → «Volver a pegar» → pegar de nuevo y **aplicar la plantilla** (23 como en la plantilla) → misma vista previa (2 actualizados, 14 sin cambios); la tarjeta de PS-0142 muestra solo «Disponibilidad 2026-09-29 → 2031-01-15».

Banco intacto: huella md5 de `inventario.perfiles` y `inventario_version` iguales antes y después (`dd646214…|7`).

Datos de prueba que quedaron en la BD de desarrollo: 9 lotes `calculado` y 4 plantillas («Altas de Operaciones», «Banco completo (journey 3.7)», «Disponibilidad mensual», «Exportación del banco»). No tocan perfiles.
