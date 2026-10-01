# EP-006 · sub-slice 8 — fidelidad y clics reales (MCP chrome-devtools)

- Panel standalone :3101 (NODE_ENV=production, dobles, sin EDGE_SECRET) sobre la BD de desarrollo migrada a 0019,
  build de `769639d` + arreglos de esta tanda. Sesión de administradora (admin@ y luego e2e-marco@, ver nota).
- Datos: perfiles propios de dev (PS-1328…1332). PS-1330 se puso a mano como `colocado` con «Disponible ahora» para
  simular la ALTA de colocado (en ss9 colocado deja de ser estado) y se devolvió a `publicado` tras probarla.

| Pantalla | App | Veredicto |
|---|---|---|
| inventario-perfiles--incoherencia | `app-inventario-perfiles--incoherencia-1440.png` | FIEL: pestaña «Con incoherencia» con punto ámbar y conteo; filas con «Contradicción alta» (colocado con «Disponible ahora» → «Usar la fecha de liberación»; archivado con fecha → «Quitar la disponibilidad»), «Bloquea la publicación» (pausado con fecha → «Quitar la disponibilidad» / «Publicar con esa disponibilidad»), «Advertencia media» por confirmar (107 d) y sin actualizar (86 d) → «Ver en Vigencia» / «Confirmar disponibilidad»; selector marcado en rojo con «Contradice el estado pausado». |
| (happy HU-134) pausado al que le ponen fecha | `app-inventario-perfiles--pausado-con-fecha-1440.png` | Clics: «Más acciones» → «Pausar a Natalia Duque» (PS-1331) → motivo → queda pausado **sin disponibilidad** (D32) → en su fila «En 2 semanas» → recarga con la señal roja en la misma fila y sus dos salidas. |
| (error HU-134) publicar con ALTA | `app-inventario-perfiles--incoherencia-no-se-publico-1440.png` | FIEL al aviso del prototipo: «No se publicó Natalia Duque (PS-1331). Su estado y su disponibilidad se contradicen. Resuélvelo en su fila.» en rojo; la lista nombra la contradicción y «Resolver en su fila». |
| salidas | — | «Publicar con esa disponibilidad» → PS-1331 `publicado` con 2026-10-15, pausa limpia. «Usar la fecha de liberación» → PS-1330 disponibilidad = liberación (2026-11-13). |
| inventario-perfiles--archivar | `app-inventario-perfiles--archivar-1440.png` | FIEL: «Archivar a Andrés Gómez» en «Más acciones», confirmación anclada «¿Archivar a …? Se archiva, no se borra. Los clientes con enlace lo verán como «Fuera del banco».» → «Archivar perfil» → PS-1329 `archivado`, `archivado_en`, sin disponibilidad. **Arreglado:** con una sola fila la confirmación quedaba recortada por el marco desplazable de la tabla; ahora menú y confirmación flotan fijos anclados al botón. |
| vista previa de importación | `app-importar-vista-previa--contradiccion-1440.png` | Pegar «PS-1332 · pausado · Decisión de Talento Humano» → tarjeta con «Contradicción alta» en rojo y la contradicción nombrada; sin confirmar (nada se escribió). |
| móvil 390 | `app-inventario-perfiles--incoherencia-390.png` | scrollWidth = clientWidth = 390; la señal y sus acciones pasan bajo la tarjeta. |

Consola sin errores ni avisos.

Notas:
- Dev tiene 260 archivados de corridas viejas de tests que conservan su fecha (anteriores a D32): salen como ALTA
  «Archivado y con disponibilidad», como manda la matriz. En producción no hay datos previos.
- Se perdió la sesión dos veces al reiniciar el panel: no era la app; `lsof -ti tcp:3101 | xargs kill` también mataba el
  proceso de red de Chrome conectado al puerto. Reiniciar solo el que escucha (`-sTCP:LISTEN`) conserva la sesión. El
  límite de códigos por correo hizo entrar con e2e-marco@ (respuesta idéntica sin envío, por diseño).
