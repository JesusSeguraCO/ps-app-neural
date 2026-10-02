# EP-006 · sub-slice 6 — fidelidad (captura real por MCP chrome-devtools)

- Panel standalone :3101 (NODE_ENV=production, dobles, sin EDGE_SECRET local) sobre la BD de desarrollo migrada a 0018; sesión de administradora local; perfiles PS-1314 (publicado) y PS-1315 (borrador sin rol) creados por la API. Ficticios PS-0142/0160/0187 sin tocar.
- Comparado contra `docs/05-prototipo/pantallas/` (mismo slug). Código observado: `0c2a37b` (6.1) y `60096cc` (6.2/6.4).

| Pantalla | App | Veredicto |
|---|---|---|
| perfil-editor--cambios-declarados | `app-perfil-editor--cambios-declarados-1440.png` | FIEL: hoja «Esto cambia para el cliente», antes tachado / después, «Sin efecto para el cliente» para la motivación, «Sigue cumpliendo las 4 condiciones», autor de la auditoría, «Seguir editando» / «Confirmar cambios». |
| perfil-editor--incompleto-al-guardar | `app-perfil-editor--incompleto-al-guardar-1440.png` | FIEL: pregunta D1, valor nuevo «Sin dato: la publicación lo exige», qué hace cada respuesta, «Descartar el cambio» / «Pasar a borrador». |
| borrador-evidencia | `app-borrador-evidencia-1440.png`, `app-borrador-evidencia-390.png` | FIEL con desviaciones D29/D30: precargado con «De la modalidad de prueba · <modalidad>», casilla, Descartar / Guardar sin confirmar / Confirmar; sin desplazamiento horizontal a 390 px. |
| borrador-evidencia--campo-ambiguo | `app-borrador-evidencia--campo-ambiguo-1440.png` | FIEL: «Editado por ti · ya no es el texto de la plantilla» en el campo corregido. |
| (HU-129 edge) vista previa de un publicado con cambios | `app-vista-previa-ficha--publicado-con-cambios-1440.png` | FIEL al patrón de ss5: «Cambios sin guardar… el portal sigue con la versión vigente». |
| (HU-130 edge) ficha con reporte | `app-vista-previa-ficha--reporte-nivel-1-1440.png` | FIEL a `ficha-perfil` («Validación técnica»: modalidad · resultado / evaluador · fecha / Evaluó…). Arreglado tras la captura: el lateral listaba el reporte como opcional vacío. |
| perfil-editor--adjunto-no-admitido, borrador-evidencia--sin-texto | — | N/A por D29 (subida del artefacto diferida a una versión futura). |

## Desviaciones (aprobadas por el modelo bajo D27, registradas en D30)
1. La cabecera de las hojas no dice «en N enlaces curados»: los enlaces curados aún no existen en la BD.
2. Evaluador, fecha y resultado en la página del borrador, no en el editor; el editor muestra el reporte confirmado en lectura.
3. Criterios editables (uno por línea); sin columna del artefacto; casilla «Revisé cada campo» sin «contra el artefacto».
4. El lateral del borrador explica qué llega a la ficha del cliente (Hoy / Al confirmar / No llega).
5. Los ejemplos de evaluador y resultado van como «p. ej. …» para no parecer valores escritos.
