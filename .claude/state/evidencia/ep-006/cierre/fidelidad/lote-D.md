# Fidelidad final EP-006 (11.3) — lote D

- Lote D · contexto aislado `fid-lote-d` · administradora `fid-d@trycore.com` · 2026-10-01 (sesión hasta 6:43 a. m.)
- Panel http://127.0.0.1:3101, HEAD de `feature/ep-006-administracion-del-inventario`, BD efímera `ps_t_9bb06e62`.
- Capturas a 1440 de ancho (la ventana quedó en 1440×769 de alto útil; la comparación es estructural).
- Datos propios creados: familia **«FidD Seguridad de la información»** (sin modalidades). No se fusionó ni desactivó nada: las hojas de fusión y desactivación se abrieron sobre valores sembrados y se **cancelaron** sin confirmar. «Agregar término» con «FidD pagos inmediatos» fue rechazado por el servidor (no se guardó). La propuesta de Gemini se abrió en edición y se canceló.

| Pantalla | App | Veredicto |
|---|---|---|
| catalogos | app-catalogos-1440.png | FIEL. Cabecera con «Fusionar duplicados» + «Crear rol», pestañas con conteo, tabla Rol/Familia/Perfiles/Editar/··· y paginación «1–N de N · ordenados por uso». La pestaña extra «Motivos de pausa» (D31-2) empuja el filtro y la búsqueda a una fila propia bajo las pestañas, consecuencia directa de D31. Las 25 filas por página están aprobadas (ss1 desv. 6). |
| catalogos--duplicado | app-catalogos--duplicado-1440.png | FIEL. Hoja «Crear tecnología» con «react»: campo en rojo, «React ya existe. Las mayúsculas no la hacen distinta: usa la que hay.», tarjeta del existente con «Ver en la lista», «Grupo», botón principal deshabilitado. |
| catalogos--parecidos | app-catalogos--parecidos-1440.png | FIEL en estructura: aviso ámbar «Se parece a React, que ya existe…» con «Usar React» y casilla «Raect es una tecnología distinta de React». Detalle de texto: dice «La usan 1 perfil» (el verbo no pasa a singular; ver abajo). |
| catalogos--familia-sin-modalidades | app-catalogos--familia-sin-modalidades-1440.png | FIEL. «Crear rol» con familia FidD: «✓ Ningún rol parecido en el catálogo.», ayuda de familia y aviso «… no tiene modalidades de prueba. Puedes crear el rol, pero…» con el enlace «Definir modalidades». |
| catalogos--fusion | app-catalogos--fusion-1440.png | FIEL. Hoja «Fusionar tecnologías» Cypress→Playwright: Se fusiona / Destino / Invertir, «2 perfiles pasan de Cypress a Playwright», lista PS con estado Publicado/Borrador, pie «Nada cambia hasta que confirmes. Después no se deshace.», «Fusionar en Playwright». Tiene «Elegir otros valores» (ss1 desv. 3). Las filas del fondo no llevan las marcas «Destino de la fusión»/«Se fusiona en»; ya pasaba igual en la captura aceptada de ss1. |
| catalogos--modalidad-en-uso | app-catalogos--modalidad-en-uso-1440.png | FIEL. «Desactivar «Prueba práctica revisada por un arquitecto»» · «Modalidad de prueba · Desarrollo», aviso «7 fichas publicadas la citan…» con «1 borrador también la tiene», lista «Fichas publicadas que la citan», texto de reactivación y botón rojo «Desactivar modalidad». |
| lexico-busqueda | app-lexico-busqueda-1440.png | FIEL. Dos columnas: propuestas de Gemini (Rechazar/Editar/Aprobar, meta y «p. ej.») + tarjeta lateral «Agregar término»; pestañas Términos/Sin coincidencia con búsqueda. El léxico de esta BD está vacío y muestra «Aún no hay términos. Agrega el primero con el formulario.». No sale el aviso «Deshacer» del prototipo (ss1 desv. 4). |
| lexico-busqueda--propuestas | app-lexico-busqueda--propuestas-1440.png | FIEL. Hay 3 propuestas pendientes. Con «Editar», la fila se tiñe y marca «● Editando», y la tarjeta lateral pasa a «Editar la propuesta» con su procedencia («Propuesta de Gemini del 1 oct, a partir de 4 búsquedas… de 3 cuentas»), campos rellenos y «Cancelar»/«Aprobar editada». |
| lexico-busqueda--equivalencia-invalida | app-lexico-busqueda--equivalencia-invalida-1440.png | FIEL. Con «Kafka Streams», el valor queda en rojo y sale «No se guardó: «Kafka Streams» no está en el catálogo de tecnologías.», «Lo más parecido del catálogo:» con chips y «¿Falta en el catálogo? Agrégala en Catálogos.». |
| lexico-busqueda--candidatas | app-lexico-busqueda--candidatas-1440.png | FIEL. Vista «Sin coincidencia» con selector de mes, «Búsquedas sin resultados» y «Subrayado: lo que no reconoció», filas con Descartar / Llevar a reclutamiento / Llevar al léxico. Con «Llevar al léxico», la tarjeta lateral nombra la búsqueda de origen («Desde la búsqueda «…»») y muestra «Cancelar». «No reconoció ninguna palabra» está aprobado (ss1 desv. 5). Detalle menor: la fila de origen no se tiñe como en el prototipo (`li.pp-fila` sin fondo). |

## Desviaciones nuevas

Ninguna afecta a la estructura, la composición, la paleta ni la tipografía. Hay dos detalles menores sin decisión registrada:

1. **catalogos--parecidos: el verbo no concuerda en singular.** Con un solo perfil dice «La usan 1 perfil»; debería decir «La usa 1 perfil». El sustantivo sí se singulariza, el verbo no. Archivo: `apps/panel/src/catalogos/HojasCatalogo.tsx:244` (`L${a|o} usan`).
2. **lexico-busqueda--candidatas: la fila de origen no se resalta.** Tras «Llevar al léxico», el prototipo tiñe la fila de la búsqueda de la que sale el término; la app no la marca (la tarjeta lateral sí nombra la búsqueda). Archivo: `apps/panel/app/lexico/page.tsx:66`. Hoy la clase solo cambia con `lx-fila-resuelta`; no hay estado de «seleccionada».

## Consola

`list_console_messages` (error/warn, incluidas navegaciones previas): 1 mensaje, `Failed to load resource: 422 (Unprocessable Entity)`. Es la respuesta esperada del servidor al guardar la equivalencia inválida «Kafka Streams». No hay errores de JavaScript ni avisos.
