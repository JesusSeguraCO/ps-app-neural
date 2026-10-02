# EP-006 · sub-slice 2 — fidelidad visual (MCP chrome-devtools) — FIEL con desviaciones registradas

- sha observado: `b77822a` (más el `id` de los campos del Sello y la barra del buscador, incluidos en ese commit); build standalone del panel recompilado tras cada ajuste.
- Entorno: panel standalone :3101 (NODE_ENV=production, dobles declarados, sin EDGE_SECRET local), BD local migrada a 0014 con la siembra ficticia; sesión de administradora local. Perfiles de la verificación creados por la API del panel (PS-0239 completo, PS-0240 incompleto, PS-0241 en familia sin modalidades).
- Recorrido real por clics/teclado: crear un perfil con solo nombre y «Kafka» (Enter elige del catálogo) → borrador con lo que falta; elegir un rol de familia sin modalidades (aviso al momento); escribir «Desarrolador full stak» → «Crear…» → hoja con el parecido → «Usar este»; añadir experiencia nombrando al cliente en el texto (rechazo) y corregirla; registrar un consentimiento sin nombre (rechazo «No válido para este uso · Firmado el 14 mar 2025») y luego el nominal sin clientes; revocar el de un publicado (PS-0142 pasa a borrador).
- Consola: sin errores salvo el 422 esperado del consentimiento anonimizado (el navegador registra el estado HTTP de la respuesta de rechazo) y, antes del ajuste, el aviso «campo sin id» de los campos del Sello (corregido).
- Ancho móvil: la ventana no baja de 500 px; capturas «-390» tomadas a 500 px en app y prototipo. Sin desbordamiento horizontal (scrollWidth = clientWidth).

| Pantalla (manifest) | 1440 | Móvil | Veredicto |
|---|---|---|---|
| inventario-perfiles | app/proto | app/proto 390 | FIEL en lo construido (controles de sub-slices 3, 7 y 8 pendientes) |
| perfil-editor | app/proto | app/proto 390 | FIEL con desviaciones 1–4 (tras pasar las casillas del alcance de grises a activas) |
| perfil-editor--familia-sin-modalidades | app/proto | — | FIEL |
| perfil-editor--campos-incompletos | app/proto | — | FIEL |
| perfil-editor--consentimiento-invalido | app/proto | — | FIEL |

## Desviaciones (registradas en design.md §12, pendientes de visto bueno del sponsor)
1. Rol con buscador del catálogo en lugar de `<select>` (HU-125 edge: escribir y ver parecidos antes de crear).
2. Seniority, años de experiencia y la sección «Ficha para el cliente» (capacidad, anclaje, resumen, formación, vínculo, idiomas, Sello Personal): campos del Anexo B que el prototipo no dibuja.
3. Hojas propias: alta/edición de experiencia, alta de valor del catálogo con parecidos, registro y revocación del consentimiento.
4. Autor por correo, no por nombre (identidad del panel); rótulos de disponibilidad del PRD.

## Fuera de este sub-slice (lo entregan los siguientes, no es recorte)
«Vista previa» y «Publicar» (5); evaluador, fecha, resultado, reporte detallado y artefacto (6); en el listado: «Importar» (3), disponibilidad editable, selección en bloque y «Más acciones» (7), «Con incoherencia» (8).
