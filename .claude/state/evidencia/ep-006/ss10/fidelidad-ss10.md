# EP-006 · sub-slice 10 — fidelidad y clics reales (MCP chrome-devtools), tarea 10.6

- BD efímera propia `ps_t_59b5d246` (no la de desarrollo): ficticios, inscritos del prototipo admin-accesos (karen y eida
  administradoras; mariana, laura, carlos observadores; sebastián de baja) y la historia de PS-0142 y de PS-0239 por las vías
  reales (consentimiento, importación aplicada por el worker, carga de Operaciones, alta, edición, archivado). Script en
  `.local/fid-ss10/` (fuera de Git).
- Panel standalone :3101 (NODE_ENV=production, dobles, sin EDGE_SECRET) y worker con el doble de Mailgun: **entrada real**
  de Karen y de Mariana con el código de un uso que registró el doble. Comparación a 1440 con `docs/05-prototipo/pantallas/`.

| Pantalla | App | Veredicto |
|---|---|---|
| admin-accesos | `app-admin-accesos-1440.png` | FIEL tras corregir: «Inscrito hoy» arriba, «Tú», administradoras y el resto por su última entrada; «Entró hoy, 4:45 p. m. · sesión abierta», «Entró el 22 sep», «rol cambiado hoy, … por …»; dados de baja con fecha y autor. |
| admin-accesos--alta | `app-admin-accesos--alta-1440.png` | FIEL: hoja con correo y rol (observador por omisión). Clic real en «Inscribir» → aviso «analista.mercadeo@trycore.com inscrito como observador…» y fila «Inscrito hoy». |
| admin-accesos--correo-externo | `app-admin-accesos--correo-externo-1440.png` | FIEL: campo en rojo y «Solo se inscriben correos @trycore.com. No se inscribió y la lista quedó igual.» |
| admin-accesos--cambio-rol | `app-admin-accesos--cambio-rol-1440.png` | FIEL: «Rol actual», radios, «Pasar a observador». El aviso «Tiene una sesión abierta…» solo sale si la tiene (Eida no). Clic real → aviso y «1 administradora». |
| admin-accesos--ultimo-admin | `app-admin-accesos--ultimo-admin-1440.png` | FIEL: «Cambiar tu rol · eres tú», «No puedes quitarte el rol.» con el texto del prototipo y el botón deshabilitado. |
| admin-accesos--baja | `app-admin-accesos--baja-1440.png` | FIEL: los tres párrafos y «Dar de baja» en rojo. Clic real → Carlos en «Dados de baja · baja el 1 oct por karen…». |
| admin-contacto | `app-admin-contacto-1440.png` | FIEL tras corregir: «Así lo verá el cliente» con «Eida Tinjacá, Coordinación de Servicio: eida…»; lista con viñetas; historial con el correo en monoespaciado y los nombres en texto. Clic real en «Guardar contacto» → aviso del prototipo. |
| admin-contacto--correo-externo | `app-admin-contacto--correo-externo-1440.png` | FIEL tras corregir: error del prototipo y la vista sigue con «escribe a People Service: people.service@…». |
| admin-contacto--observador | `app-admin-contacto--observador-1440.png` | FIEL: «Contacto que ve el cliente · solo consulta», «Tu rol es de consulta…», «Contacto vigente» en lectura con «Último cambio», sin «Accesos al panel». Llegó por `/administracion/accesos` → texto adicional «Llegaste por la dirección de Accesos…» (D38). |
| auditoria-perfil | `app-auditoria-perfil-1440.png` | FIEL tras corregir: cabecera con rol, código y estado; pestañas; filtros; tabla Cuándo/Campo/Antes/Después/Quién con el antes tachado; iconos de proceso (lote, carga, otro); «Importación «inventario-sep.xlsx» · confirmó …» enlazada al lote; «Carga de Operaciones «…» · corte … · cargó …»; colocación con fechas legibles; páginas. |
| auditoria-perfil--archivado | `app-auditoria-perfil--archivado-1440.png` | FIEL: «Archivado el 1 oct 2026 · no aparece en el portal», sin «Editar perfil», «Publicación: Borrador → Archivado» como un cambio más y el historial desde el alta. |
| móvil | `app-auditoria-perfil-movil.png` | Tarjetas apiladas del prototipo (campo y hora, antes, → después, quién); sin scroll horizontal a 500 px (mínimo de la ventana). |

Corregido en esta pasada (D41): orden y textos de la lista de accesos, «escribe a» en la vista del buzón, viñetas, historial
del contacto, iconos de proceso, subetiqueta repetida, fechas de la colocación y la siembra ficticia nombrada como tal.
Desviaciones que quedan (D41): hora en 12 h en el registro (el prototipo usa 24 h; el panel entero usa a. m./p. m.), autor
por correo, «Filtrar» visible (sin JavaScript), sin «Exportar registro», «Enlaces y solicitudes» ni «Qué vio el cliente» (D40),
filas de alta «Sin valor → Ninguna» y «Disponibilidad confirmada» que el prototipo no muestra (el historial es completo), y el
menú y el pie de la observadora como en el resto del panel.

Consola sin errores ni avisos en ambas sesiones.
