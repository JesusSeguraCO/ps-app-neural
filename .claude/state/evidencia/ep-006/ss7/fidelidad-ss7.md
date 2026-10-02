# EP-006 · sub-slice 7 — fidelidad y clics reales (MCP chrome-devtools)

- Panel standalone :3101 sobre la BD de desarrollo migrada a 0019; perfiles propios PS-1328…1332 (fechas atrasadas solo en dev para simular días). Ficticios sin tocar salvo el motivo dado a PS-0151 (pausado sembrado sin motivo).

| Pantalla | App | Veredicto |
|---|---|---|
| inventario-perfiles--lote | `app-inventario-perfiles--lote-1440.png`, `app-inventario-perfiles--lote-resultado-1440.png` | FIEL: barra «3 seleccionados · Disponibilidad · Aplicar a los 3 · El cliente verá la banda»; «Aplicar» → «Disponibilidad actualizada en 3 de 3» con resultado por perfil; filas con select de disponibilidad y Editar + «Más acciones». Sin scroll horizontal en tabla ni documento a 1440 (arreglado: «Pausar» suelto desbordaba). |
| inventario-perfiles--pausar-motivo | `app-inventario-perfiles--pausar-motivo-1440.png` | FIEL: hoja con los tres motivos y su ayuda, nota de 30 días y desvío «¿Está ocupada hasta una fecha?». Arreglado: la hoja heredaba `nowrap` de la celda. Pausar PS-1331 → `pausado`, motivo y `pausado_en` en BD, fuera de `catalogo_publicable`. |
| bandeja-vigencia | `app-bandeja-vigencia-1440.png` | FIEL: grupos «por confirmar» (107 d), «Por revisar» (86 d, con «Confirmar sin cambios»), «Pausados hace más de 30 días» (64 d, motivo), pie y conteo del menú. |
| bandeja-vigencia--pausado-reactivar | `app-bandeja-vigencia--pausado-reactivar-1440.png` | FIEL: «Disponibilidad al reactivar» con la banda que verá el cliente, Cancelar/Archivar/Reactivar. Reactivar → publicado, pausa limpia, portal con la fecha. |
| bandeja-vigencia--vacia | `app-bandeja-vigencia--vacia-1440.png` | FIEL: «20 de 20 publicados al día · meta 9 de cada 10», «No hay perfiles pendientes de revisión», texto de causa y «La próxima en entrar es Laura Méndez (PS-0142), el 12 oct» (20 días + 31 = 12 oct, correcto). Sin «Ver los que entran esta semana» (desviación D31). Capturada en un panel :3102 sobre una copia desechable de la BD (`ps_vacia`, todos los publicados al día), borrada después: la BD de dev no se tocó. |
| inventario-perfiles--pausar-motivo (desvío) | `app-inventario-perfiles--pausar-desvio-fecha-1440.png` | FIEL al comportamiento de HU-133 «el motivo es una fecha»: «Más acciones» → «Pausar a Sara Londoño» → «Poner la fecha en que queda libre» cierra la hoja sin pausar y abre en la fila «Fecha en que queda libre Sara Londoño» con el foco. |
| bandeja-vigencia (enlaces) | `app-bandeja-vigencia--en-enlaces-1440.png` | FIEL: tras generar por la UI un enlace curado con PS-1328 (/enlaces/nuevo), su fila dice «La fecha en que quedaba libre venció el 10 sep · en 1 enlace activo», como «· en 2 enlaces activos» del prototipo. |

Consola sin errores ni avisos; scrollWidth = clientWidth (1440) en todas.

Móvil 390 (emulación MCP, :3101): `app-inventario-perfiles--lote-390.png`, `app-bandeja-vigencia-390.png` — scrollWidth = clientWidth = 390; filas en tarjeta con casilla, estado, select de disponibilidad y «Más acciones»; las pestañas de estado se desplazan dentro de su propia franja (patrón de ss2). Consola limpia.

Desviaciones aprobadas bajo D27 y registradas en D31 (`design.md` §12, sub-slice 7): Pausar en «Más acciones»; motivos en Catálogos; sin «quién» en la fila (HU-138, ss10); sin «Deshacer» en el aviso; bandeja vacía sin «Ver los que entran esta semana».
