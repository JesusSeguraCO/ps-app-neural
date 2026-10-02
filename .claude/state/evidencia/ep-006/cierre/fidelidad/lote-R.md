# Fidelidad final EP-006 (11.3) — Lote R · re-verificación de las correcciones

- Lote R · contexto `fid-lote-r` · administradora `fid-a@trycore.com` · observadora `laura.pineda@trycore.com` (contexto `fid-lote-r-obs`) · 1 oct 2026, 19:00–19:15 (Bogotá).
- Panel :3101 (build nuevo, rama `feature/ep-006-administracion-del-inventario`), BD `ps_t_9bb06e62`, MCP chrome-devtools, ventana 1440 (área útil 1440×769). Clics, teclado y subida de archivo reales en la UI.
- Datos propios creados (prefijo FidR): PS-7389 «FidR Colocada Prueba» (publicada y colocada en el panel, Bancolombia, liberación 18 dic 2026; su diferencia con Operaciones queda **pendiente**) y PS-7390 «FidR Nueva Operaciones» (publicada, colocada por la carga). Carga `asignaciones-fidr.csv` (copia en `.local/fid-final/loteR/`). Corte vigente ahora: hoy 7:13 p. m.
- No confirmado (sin efecto en el banco): publicación masiva de PS-7388/PS-7301 (0 de 2, sin cambios), cambio de resumen en PS-0244 (se abrió la hoja de impacto y se pulsó «Seguir editando»; comprobado que no se guardó), «Docker» en PS-0244 (sin guardar), vista previa de importación FidR PS-9101/9102/9104 (no se importó), hoja «Crear tecnología» con «Raect»/«Dokcer» (no se creó), «Llevar al léxico» (no se guardó), editor de reactivar de PS-0137 (cancelado).

| Pantalla | App | Veredicto |
|---|---|---|
| inventario-perfiles | app-inventario-perfiles-1440.png | FIEL: botón secundario «Importar» a la izquierda de «Crear perfil», como en el prototipo (lleva a `/importar`). |
| inventario-perfiles--publicacion-masiva | app-inventario-perfiles--publicacion-masiva-1440.png | FIEL: con «Importar» en la cabecera; aviso ámbar «Se publicaron 0 de 2…», «No se publicaron 2» con motivo y acción por perfil. |
| inventario-perfiles--observador | app-inventario-perfiles--observador-1440.png | FIEL: el menú lateral de la observadora solo tiene Inventario, Enlaces, Colocados y el pie (enlace a Administración, «Consulta · sesión hasta…»). Aviso de consulta y columna «Avisar» como antes. |
| bandeja-vigencia--pausado-reactivar | app-bandeja-vigencia--pausado-reactivar-1440.png | FIEL: las dos ayudas del editor de reactivar ya no se superponen (top 556–572 px y 588–621 px, una debajo de la otra). |
| vista-previa-ficha | app-vista-previa-ficha-1440.png | FIEL: publicado con cambios sin guardar → «Volver a editar» y botón primario «Guardar cambios». Al pulsarlo se abre la hoja de impacto del editor «Esto cambia para el cliente» (antes/después, «Seguir editando / Confirmar cambios»). |
| vista-previa-ficha--bloque-opcional | app-vista-previa-ficha--bloque-opcional-1440.png | FIEL: en «Opcionales sin datos», «Reporte detallado de validación» lleva el enlace «Registrar reporte detallado» (→ `/inventario/PS-7387/validacion`). |
| perfil-editor--observador | app-perfil-editor--observador-1440.png | FIEL: los campos deshabilitados se ven grises, como en el prototipo. |
| perfil-editor (buscador de tecnologías) | sin captura nueva (no cambia) | FIEL: al escribir «Docker» y pulsar Enter enseguida se añade la etiqueta Docker y el campo se vacía. No se abre la hoja de crear ni aparece el texto contradictorio. |
| importar-perfiles | app-importar-perfiles-1440.png | FIEL: enlace «Historial» a la derecha del título en el paso 1 (→ `/importar?vista=historial`). |
| importar-perfiles--vista-previa | app-importar-perfiles--vista-previa-1440.png | FIEL: al desmarcar PS-9102 se recalcula («Excluida por ti», «1 que desmarcaste»). La fila original de la fila con error sigue en el orden de la hoja: «PS-9104 · FidR Diana · Ruiz · Rol FidR inexistente · Pronto · Python · Cali». |
| importar-perfiles--revertir-no-ultima | app-importar-perfiles--revertir-no-ultima-1440.png | FIEL: la fila pedida (6:45 p. m.) se resalta con el tinte del prototipo y todas las filas dicen «Ver perfiles». Hay un detalle nuevo menor, descrito abajo. |
| Historial (fila con una excluida) | (incluida en la captura anterior) | FIEL: la importación de las 6:49 p. m. dice «2 creados · 1 actualizado · 3 con error · 1 excluida por ti». Coincide con su resultado; antes decía «2 actualizados». |
| catalogos--parecidos | app-catalogos--parecidos-1440.png | FIEL: con «Dokcer» sale «Se parece a Docker, que ya existe. La usa 1 perfil.» (singular). Con 2 perfiles («Raect»/React) sigue diciendo «La usan 2 perfiles». |
| lexico-busqueda--candidatas | app-lexico-busqueda--candidatas-1440.png | FIEL: tras «Llevar al léxico», la fila de origen queda resaltada (`pp-fila--seleccionada`, fondo rgb(240,250,249)) y la tarjeta lateral nombra la búsqueda. |
| colocados--diferencia-operaciones | app-colocados--diferencia-operaciones-1440.png | FIEL: la fila de PS-7389 dice «Panel · fid-a@trycore.com · diferencia con Operaciones», con la marca en ámbar, además del bloque «Diferencias con Operaciones». |
| colocados--carga-operaciones | app-colocados--carga-operaciones-1440.png | FIEL: la fila recién cargada dice «Operaciones · corte hoy 19:13 · nuevo». Las filas de cargas anteriores dicen «corte hoy 18:50» o «corte hoy 18:42», sin «nuevo». |
| colocados--sin-fecha-liberacion | app-colocados--sin-fecha-liberacion-1440.png | FIEL: el error «Un colocado siempre lleva su fecha de liberación…» sale al guardar sin fecha. Al escribir 18/12/2026 desaparece el error y el borde rojo antes de volver a guardar. |

Resumen: 17 FIEL · 0 de las correcciones pedidas siguen fallando.

## Desviaciones que persisten

Ninguna de las correcciones pedidas sigue fallando. Detalles nuevos, menores, que no forman parte de las correcciones:

1. **importar-perfiles--revertir-no-ultima, orden de la lista del aviso.** El prototipo pone primero la importación más reciente (27 sep y después 22 sep). La app las pone en orden cronológico (6:48 p. m. y después 6:49 p. m.). Archivo probable: `apps/panel/src/importacion/Resultado.tsx` (aviso de `HistorialImportaciones` cuando la importación no es la última).
2. (Fuera de la fidelidad, solo informativo) La observadora ya no ve Importar ni Vigencia en el menú, pero `GET /importar` le responde 200 si llega por la dirección. El menú era lo que se pidió revisar; si esa ruta debe tener una guarda por rol, falta decidirlo.

## Consola

- Administradora (`fid-lote-r`, todas las pantallas, con navegaciones conservadas): sin errores ni avisos.
- Observadora (`fid-lote-r-obs`): 0 errores; 1 aviso de Next.js «CSS preloaded … not used within a few seconds». No afecta al funcionamiento.
