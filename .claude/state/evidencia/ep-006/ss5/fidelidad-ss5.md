# EP-006 · sub-slice 5 — fidelidad (captura real por MCP chrome-devtools)

- Panel standalone :3101 (NODE_ENV=production, dobles, sin EDGE_SECRET local) sobre la BD local migrada a 0017; sesión de administradora local; perfiles nuevos PS-1307…1311 (los ficticios sembrados no se tocaron).
- Comparado contra `docs/05-prototipo/pantallas/` (mismo slug):

| Pantalla | App | Veredicto |
|---|---|---|
| perfil-editor--publicar-bloqueado | `app-perfil-editor--publicar-bloqueado-1440.png` (PS-1308) | FIEL: aviso «No se publicó PS-1308: falta el consentimiento nominal registrado.» + «Registrar consentimiento» (abre la hoja), lateral «Cumple 3 de 4». |
| perfil-editor--sin-modalidad | `app-perfil-editor--sin-modalidad-1440.png` (PS-1309) | FIEL: aviso con «Elegir modalidad». Texto corregido tras la captura para una sola modalidad («Desarrollo tiene una: elígela»). |
| inventario-perfiles--publicacion-masiva | `app-inventario-perfiles--publicacion-masiva-1440.png` | FIEL: «Se publicaron 1 de 3…», «No se publicaron» con motivo y salida por perfil. |
| vista-previa-ficha | `app-vista-previa-ficha--bloque-opcional-1440.png` (lista, necesidad híbrida con ciudad) | FIEL |
| vista-previa-ficha--bloque-incompleto | `app-vista-previa-ficha--bloque-incompleto-1440.png` y `-390.png` | FIEL: bloques numerados en la ficha y en el lateral, nombran el dato; sin scroll horizontal en móvil. Contornos contiguos separados tras la captura. |
| vista-previa-ficha--bloque-opcional | idem | FIEL: «Opcionales sin datos · no impiden publicar», sin título ni hueco en la ficha. |

## Desviaciones (aprobadas por el modelo bajo D27, registradas en D28)
1. Vista previa como modo del editor (sin recarga ni tercer nivel de migas): así refleja los cambios sin guardar (HU-129 edge) sin enviarlos al servidor.
2. «Declarado por la persona» en lugar de «Declarado por la profesional»: el modelo no guarda género.
3. Formación en «Declarado», no en «Verificado»: RF-3.12 la define como autodeclarada. Referencias, identidad, antecedentes e inglés verificados del prototipo no existen aún en el modelo (validaciones del sub-slice 6 / EP-003).
4. «Publicar» con lo que falta queda `aria-disabled` pero pulsable: al pulsarlo dice qué falta (HU-128 «me dice exactamente qué falta»).
5. Selección en el inventario con barra «N seleccionados · Publicar los N» (patrón `ip-lote` del prototipo de disponibilidad en bloque, que el sub-slice 7 amplía).
6. La banda usa los rótulos del PRD («En 2 semanas»), no los del prototipo (decisión del sponsor 2026-09-28).
