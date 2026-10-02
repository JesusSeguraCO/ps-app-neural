# Fidelidad final EP-006 (11.3) — Lote E · Colocados

- Lote E · contexto `fid-lote-e` · administradora `fid-e@trycore.com` · 2026-10-01 18:40–18:51 (Bogotá) · HEAD `defef10`.
- Panel :3101 a 1440×900 (DPR 1) con MCP chrome-devtools; prototipos en `.local/fid-final/proto/colocados*.png`.
- Datos propios creados en el editor del panel (borrador → consentimiento → publicar): FidE Uno `PS-0247`, FidE Dos `PS-7305`, FidE Tres `PS-7306`.
  Archivos subidos (copias en `.local/fid-final/loteE/`): `asignaciones-octubre.xlsx` (rechazo), `asignaciones-fide-01oct.csv` (2 nuevos),
  `asignaciones-fide-02oct.csv` (2 de 4: PS-237 formato, 30/02/2027, 1 diferencia), `asignaciones-fide-03oct.csv` (solo la diferencia).
  «Aceptar la de Operaciones» se pulsó para FidE Uno → «FidE Uno queda con los datos de Operaciones.»
- Corte desactualizado: `UPDATE inventario.cargas_operaciones SET cargado_en = now() - interval '9 days'` (4 cargas), captura, y
  se devolvieron las 4 a su `cargado_en` original (comprobado con diff contra `loteE/cargas-original.txt`). PS-0142 y PS-0187 no se tocaron.

| Pantalla | App | Veredicto |
|---|---|---|
| colocados | `app-colocados-1440.png` | FIEL: meta (cuentas · panel · Operaciones · corte), botones, grupos «Vencen en los próximos 60 días · N · hasta el …» / «Después de 60 días · N», «Faltan» en ámbar dentro de 60 días, fuente por fila, pie. Bandas con los rótulos del PRD (aprobado). |
| colocados--registrar | `app-colocados--registrar-1440.png`, `app-colocados--registrar-guardado-1440.png` | FIEL: hoja con Perfil (publicados sin colocación), «Hoy: «Disponible ahora».», Cliente, inicio = hoy, liberación con su ayuda, Cancelar / Guardar colocado. Clic real en Guardar → aviso «FidE Uno quedó colocado en Bancolombia hasta el 18 dic 2026. Sigue publicado y el cliente ve «Más de 1 mes».» y la fila «Panel · fid-e@…». |
| colocados--sin-fecha-liberacion | `app-colocados--sin-fecha-liberacion-1440.png` | FIEL: campo en rojo y «! Un colocado siempre lleva su fecha de liberación. No se guardó: FidE Uno sigue publicado con «Disponible ahora».»; no se guardó nada. |
| colocados--en-el-portal | `app-colocados--en-el-portal-1440.png` | FIEL: Asignación (registrada por · fecha, cuenta, inicio, vence · faltan), En el inventario (Publicado, disponible desde · fin de la asignación), Lo que ve el cliente (rol, nombre, banda) y «Desde el 18 nov · 1 mes»; Cerrar / Abrir en el inventario. Sin sectores ni modalidad (D35). |
| colocados--carga-operaciones | `app-colocados--carga-operaciones-1440.png` | DESVIACIÓN menor: el aviso verde coincide («Carga aplicada: 2 filas de …csv. 2 colocados nuevos… Se ignoró la columna «Observaciones»…») y el corte pasa a «hoy, 6:49 p. m.», pero las filas recién cargadas no llevan «· nuevo» y muestran «Operaciones · corte 1 oct» en vez de «corte hoy 10:14». |
| colocados--carga-filas-con-error | `app-colocados--carga-filas-con-error-1440.png` | FIEL: aviso ámbar «Se aplicaron 2 de 4 filas de …csv. Las 2 filas de abajo no se aplicaron…» (suma «1 que ya venía… y 1 diferencia»), «Filas que no se aplicaron · 2»: Fila 3 PS-237 (formato PS-XXXX) y Fila 5 «30/02/2027» no válida. |
| colocados--diferencia-operaciones | `app-colocados--diferencia-operaciones-1440.png` | DESVIACIÓN menor: el bloque «Diferencias con Operaciones» es fiel (perfil, cuenta · fila · carga, «En el panel · autor / Liberación 18 dic 2026» frente a «En Operaciones / Liberación 30 dic 2026», «Mantener la del panel» / «Aceptar la de Operaciones», que funciona con clic real), pero la fila de FidE Uno en la tabla no lleva la marca ámbar «· diferencia con Operaciones». |
| colocados--formato-no-admitido | `app-colocados--formato-no-admitido-1440.png` | FIEL: subida real del .xlsx → «No se cargó asignaciones-octubre.xlsx. Solo se admite un archivo JSON o CSV. Nada cambió: … el corte de la carga anterior (hoy, 6:42 p. m.).» con «Elegir otro archivo». |
| colocados--corte-desactualizado | `app-colocados--corte-desactualizado-1440.png` | FIEL: meta «corte 22 sep, 6:51 p. m. · dato desincronizado» en ámbar, botones bajo la meta como en el prototipo, aviso «Dato desincronizado. La última carga de Operaciones es del 22 sep: hace 9 días sin una nueva. Sus 4 colocados siguen a la vista…» con «Cargar archivo»; filas «Operaciones · corte 22 sep». |

## Desviaciones nuevas

1. **colocados--diferencia-operaciones**: la fila de la tabla de un colocado con una diferencia pendiente no muestra «· diferencia con Operaciones» (en ámbar) junto a «Panel · autor». La información está en el bloque de arriba, pero desde la tabla no se ve qué fila tiene una diferencia. Archivo probable: `apps/panel/app/colocados/page.tsx` (`fuente()` / `fila()`; hoy no hay ninguna marca de diferencia en la fila).
2. **colocados--carga-operaciones**: las filas que entraron en la carga recién aplicada no llevan «· nuevo», y el corte de la fila se muestra solo con el día («corte 1 oct») en vez de «corte hoy 10:14» como en el prototipo. Archivo probable: `apps/panel/app/colocados/page.tsx` (`fuente()`, caso `operaciones`, usa `diaCortoDeColombia`).

Ninguna de las dos estaba anotada en `fidelidad-ss9.md` ni en D1–D41.

Observaciones que no son desviaciones de diseño:
- Con datos de prueba (`Sara Londoño · Datos de prueba`) la meta no los cuenta por fuente («5 colocados · 0 en el panel · 4 de Operaciones»). Solo pasa con datos sembrados (`page.tsx`, `meta` no tiene el caso por omisión).
- En «Registrar colocado», el error de liberación se queda visible después de escribir la fecha hasta que se vuelve a pulsar Guardar. El prototipo no muestra esa transición.
- Los contadores de la barra lateral del prototipo («Inventario 128», «Peticiones 3», «Fallos 1») no aparecen; ya pasaba así en ss9.

## Consola

`list_console_messages` (error/warn, con las navegaciones conservadas) en la página del lote: sin mensajes.

## Estado que queda

FidE Uno/Dos/Tres siguen publicadas y colocadas (FidE Uno con los datos de Operaciones tras aceptar la diferencia). Hay 3 cargas nuevas de Operaciones; el corte vigente es la última, de hoy a las 6:50 p. m. Las fechas de las cargas están restauradas.
