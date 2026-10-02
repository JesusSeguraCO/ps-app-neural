# EP-006 · sub-slice 1 — fidelidad visual (MCP chrome-devtools) — FIEL con desviaciones registradas

- sha del código observado: 6d27e06 + ajustes de fidelidad de esta sesión (CSS de hoja en celda, foco de la hoja, orden del menú móvil, atajo «/», estilos de botones del léxico, lista de valores en el formulario del léxico); build standalone del panel recompilado tras cada ajuste.
- Entorno: panel standalone :3101 (NODE_ENV=production, DOBLES=mailgun,gemini,spaces,latido, sin EDGE_SECRET local), BD local migrada a 0013 con la siembra ficticia (perfiles, modalidades, consultas sintéticas) y una corrida de `--proponer-lexico` con el doble de Gemini. Sesión de administradora local creada en la BD de desarrollo.
- Recorrido real por clics/teclado en la app (no capturas de HTML estático): crear «Figma», intentar «figma» (bloqueo), «Fgima» (parecido) y crearla confirmando, fusionar Fgima → Figma (2 perfiles reasignados), crear familia sin modalidades y un rol en ella (advertencia), abrir desactivar de una modalidad citada por 3 fichas, equivalencia inválida «Kafka Streams» (sugerencias), editar y aprobar una propuesta, decidir y llevar candidatas al léxico.
- Consola del navegador: sin mensajes en todo el recorrido.
- Ancho móvil: la ventana del navegador no baja de 500 px; capturas «-390» tomadas a 500 px en app y prototipo por igual. Sin desbordamiento horizontal (scrollWidth 485 ≤ 500).

| Pantalla (manifest) | 1440 | Móvil | Veredicto |
|---|---|---|---|
| catalogos | app/proto | app-catalogos-390 / proto | FIEL |
| catalogos--duplicado | app/proto | — | FIEL |
| catalogos--parecidos | app/proto | — | FIEL |
| catalogos--familia-sin-modalidades | app/proto | — | FIEL |
| catalogos--fusion | app/proto | — | FIEL (tras corregir alineación heredada de la celda) |
| catalogos--modalidad-en-uso | app/proto | — | FIEL (tras quitar el borde de foco de la hoja) |
| lexico-busqueda | app/proto | app/proto 390 | FIEL |
| lexico-busqueda--propuestas | app | — | FIEL |
| lexico-busqueda--equivalencia-invalida | app/proto | — | FIEL |
| lexico-busqueda--candidatas | app/proto | — | FIEL (botones alineados al prototipo) |

## Desviaciones (registradas en design.md §12, pendientes de visto bueno del sponsor)
1. Alta y edición de **modalidad de prueba**: el prototipo no tiene su hoja; se construyó con el patrón PP:hoja (nombre, familia, texto de cara al cliente obligatorio, reto, entregables y criterios para HU-140).
2. Menú «Más acciones» de la fila: el prototipo solo dibuja el botón; se añadió el menú emergente (Editar, Desactivar, Fusionar / Reactivar) con los tokens. En móvil es la única vía a Editar (el prototipo oculta el botón de texto).
3. Hoja de fusión: botón «Elegir otros valores» para volver a escoger origen y destino (el prototipo llega con el par ya elegido).
4. Aviso flotante sin «Deshacer» (el prototipo lo muestra tras guardar un término): ninguna HU pide deshacer; corregir es «Editar».
5. Reconocimiento de candidatas: el intérprete determinista solo conoce catálogo y léxico, así que dice «No reconoció ninguna palabra» donde el prototipo, ilustrativo, reconoce «ingeniero»; el intérprete completo es de EP-009.
6. Paginación: 25 filas (catálogos) y 20 (léxico); el prototipo muestra 8 como muestra.
7. Grupos de tecnología: lista fija de nueve en el dominio (`GRUPOS_TECNOLOGIA`), ampliada desde los cinco del prototipo.
