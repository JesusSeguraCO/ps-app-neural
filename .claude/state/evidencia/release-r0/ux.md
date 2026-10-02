# Release Gate R0 (EP-001 + EP-006) · gate `ux` · revisión Krug

- Fecha: 2026-10-01 · HEAD `c3ff45b` · builds standalone de portal y panel (BUILD_ID 21:43; ningún commit posterior toca `apps/` ni `packages/`).
- Servidores propios en :3200 (portal) y :3201 (panel) con `scripts/entorno-dev.sh` y borde emulado (`x-ps-edge`); detenidos al terminar.
- Navegador: MCP chrome-devtools, contextos aislados `ux-r0-*` (cliente, admin, observador), a 1440×900 y 390×844 (móvil, táctil).
- Datos: solo INSERCIONES propias en la BD de dev (3 enlaces «Cuenta UX R0» activo/vencido/revocado con su invitado y token; 1 sesión de portal vigente y 1 vencida; usuarios `ux-r0-admin@` y `ux-r0-obs@trycore.com` con sesiones vigentes y vencidas). La prueba de «Invitar» registró 1 petición pendiente (`colega@gmail.com`) del enlace UX R0. No se aplicó ninguna importación ni se tocó ningún perfil ficticio (la vista previa de importación no escribe en el banco).

## Veredicto: **FAIL** (1 bloqueante) → `releases[].gates.ux: false`

El bloqueante impide una tarea clave del cliente (abrir la ficha de un perfil del banco) y además falla sin decir nada. Todo lo demás se puede completar; el resto son recomendaciones.

## Lighthouse (medido, no opinado)

| Pantalla | Dispositivo | Accesibilidad | Buenas prácticas | Fallos relevantes |
|---|---|---|---|---|
| Puerta de acceso `/e` | escritorio | 100 | 100 | — |
| Aterrizaje `/` | escritorio | 100 | 100 | `label-content-name-mismatch` en el logo (`aria-label` distinto del texto visible) |
| Invitar `/invitar` | escritorio | 100 | 100 | ídem logo |
| Banco `/banco` | móvil 390 | 100 | 100 | — |
| Inventario `/inventario` | escritorio | 100 | 100 | `label-content-name-mismatch`: «Administración · Administración · sesión…» |
| Editor `/inventario/PS-1656` | escritorio | 96 | 100 | `target-size` en el enlace «Tecnologías» del lateral «Para publicar»; ídem Administración |
| Importar `/importar` | móvil 390 | 100 | 100 | — |

SEO 50–75 es esperado (portal privado con `noindex`); no aplica. Informes en `ux/lh/*.json|html`.

## BLOQUEANTE

### B1. «Ver ficha» no hace nada para perfiles publicados con datos fuera de contrato (banco del cliente)
- **Pantalla**: portal, `/banco` (y `/banco?categoria=…`).
- **Evidencia**: `ux/13-banco-ver-ficha-muda-PS-0201-1440.png`. Al pulsar «Ver ficha de Camila Restrepo» la URL cambia a `?ficha=PS-0201` y la página se recarga **sin panel, sin mensaje y sin cambio visible**. El servidor registra `{"evento":"ficha_fuera_de_contrato","codigo":"PS-0201","campos":["validacion"]}` (`apps/portal/src/banco/datos.ts:27-35`, que devuelve `null` a propósito). Barrido de los 142 publicados: **4 no abren** (PS-0201, PS-0223, PS-0230, PS-0238); en la categoría Calidad fallan **2 de 3**. Los 4 están publicados sin modalidad de prueba (dato heredado), justo el caso que el comentario del código prevé para producción.
- **Por qué bloquea**: se ofrece una acción obvia que no responde. Es la «pantalla muda» que Krug y `krug-ux.md` prohíben, y en la tarea central del cliente (evaluar un perfil). El cliente no sabe si falló, si debe reintentar o si el perfil existe.
- **Fix** (cualquiera de las dos, mejor ambas):
  1. **No ofrecer lo que no se puede abrir.** Si un publicado no cumple el contrato de ficha, sacarlo del catálogo del cliente (vista `catalogo_publicable`) o pintar la tarjeta sin enlace y con «Estamos actualizando este perfil» (el mismo texto que ya usa la selección para `no_publicado`).
  2. **Si ya se pidió la ficha, que lo diga.** Abrir el panel lateral en estado de error explicable («Este perfil se está actualizando; vuelve más tarde o escribe a People Service»), no `null` callado. Del lado del panel, que esos perfiles salgan en «Con incoherencia» con el motivo «sin modalidad de prueba» para que Talento Humano los corrija.

## RECOMENDADO (no bloquean)

R1. **El editor dice «Cumple 4 de 4 condiciones» mientras bloquea la publicación.** Editor `/inventario/PS-1656` (`ux/23-editor-bloqueo-1440.png`). El lateral muestra «Cumple 4 de 4 condiciones.», debajo «Completar 1 dato obligatorio · Tecnologías» y el botón «Publicar» desactivado. El inventario dice del mismo perfil «Falta 1 condición para publicar». Es una contradicción en una decisión de alto impacto (bloquear la publicación). Origen: `apps/panel/src/inventario/EditorPerfil.tsx:1473-1476`, que cuenta solo `condiciones` e ignora `faltanDatos`. Fix: si hay datos que faltan, titular «No se puede publicar todavía: falta 1 dato obligatorio» y usar el mismo vocabulario que el inventario.

R2. **El panel le promete a Talento Humano algo que el portal no cumple.** En Colocados (`ux/34-colocados-1440.png`) se lee «El cliente ve la banda, nunca la fecha ni la cuenta», pero el aterrizaje del cliente (`ux/03-aterrizaje-1440.png`) muestra a la colocada PS-0137 con «Se libera el 15 dic 2026». Además, el banco muestra a esa misma persona como «En más de 1 mes · Ver ficha», mientras la selección dice «Colocado en otro proyecto… no se puede sumar al equipo» (`ux/05-banco-1440.png`). Hay que alinear las tres superficies. Si la fecha en la selección es intencional (RF-19.2), corregir la frase del panel y marcar al colocado también en el banco. Lo derivo también a coherencia y seguridad (¿la fecha exacta debe cruzar al cliente?).

R3. **Banco en móvil: el único filtro queda al final de 142 tarjetas.** El aside «En el banco» empieza en y≈30 676 px de un documento de 30 886 px a 390 de ancho (`ux/10-banco-390.png`). Fix: en móvil, mostrar las categorías como chips arriba de la lista o con un botón «Filtrar por categoría».

R4. **«Buscar perfiles» no tiene caja de búsqueda.** Navegación «Buscar» y h1 «Buscar perfiles», pero solo hay una lista y un filtro por categoría bajo el rótulo «En el banco» (`ux/05-banco-1440.png`). El rótulo promete algo que no existe (la búsqueda es de EP-002). Fix mientras llega EP-002: llamarlo «Explorar el banco» y titular el aside «Filtrar por categoría»; marcar la categoría activa (hoy «Calidad» activa se ve igual que las demás, aunque el chip superior sí la muestra).

R5. **La ficha recorre «1 de 1» cuando la selección dice «Los 3 perfiles del correo».** Punto conocido, confirmado: con 1 disponible, 1 pausado y 1 colocado, la ficha dice «1 de 1 · selección para ti» (`ux/04-ficha-lateral-1440.png`), sin aviso de que los otros 2 no se pueden abrir. Fix: «1 de 1 que puedes abrir · 2 no disponibles», o recordar el conteo del correo en la cabecera de la ficha.

R6. **El enlace vencido invita a «Entra con tu correo» y lleva a una página sin campo de correo.** `ux/11-enlace-vencido-390.png` → `/acceso` muestra «Abre el enlace de tu correo». Fix: el mismo texto que la pantalla de revocado: «¿Te llegó uno más reciente? Ábrelo desde ese correo», sin enlace.

R7. **Resultado de una importación revertida contradice el aviso.** `ux/29-importar-resultado-revertida-1440.png`: el aviso dice «los creados quedaron archivados», pero los contadores siguen en «57 creados en borrador» y el subtítulo dice «Las otras 57 ya están en el banco». Fix: con `fase=revertido`, rotular los contadores en pasado («se habían creado 57 · hoy archivados») y quitar «ya están en el banco» (`apps/panel/src/importacion/Resultado.tsx:268-271`).

R8. **La vista previa de la ficha en el panel muestra un botón «Sumar al equipo» que la ficha real del cliente no tiene** (`ux/24-vista-previa-1440.png` frente a `ux/04-ficha-lateral-1440.png`). La vista previa dice «Así la verá el cliente». Fix: ocultarlo mientras EP-004 no exista, o marcarlo como «(próximamente)».

## NIT

- N1. El logo del portal es un enlace a `#contenido` con `aria-label` distinto del texto (Lighthouse). Por convención, el logo lleva al inicio («Selección para ti»). Dejar el salto a contenido en un enlace aparte.
- N2. La pastilla «Mi equipo 0» parece un botón pero está desactivada (`aria-disabled`, sin `title`). Añadir un estado visual de desactivado o un «próximamente».
- N3. El punto «Disponible ahora» es verde en la tarjeta y gris en la ficha (`ux/09-ficha-390.png`).
- N4. Vocabulario: el editor dice «Tecnologías ancla», la vista previa «Stack» y el cliente «Stack». Unificar.
- N5. «Archivado» usa punto rojo (color de error) para un estado neutro.
- N6. El `aria-label` del pie de la barra lateral duplica «Administración · Administración · sesión…». Además, Administración solo se descubre en la tarjeta de usuario del pie.
- N7. «Plantilla de muestra», «Historial» y «Descargar reporte» se ven como texto plano (botones fantasma sin borde): affordance débil.
- N8. Auditoría: la fecha «29 sep 2026, 12:01 a. m.» se pega a la columna «Campo» (sin espacio).
- N9. La vigencia de acceso («Acceso hasta…») desaparece de la barra en móvil.
- N10. El subtítulo de Vigencia es denso («1 por revisar: 1 publicado sin actualizar en más de 30 días y 0 pausados… meta 9 de cada 10»). Recortarlo.
- N11. Tras una sesión vencida del panel, el nuevo inicio no devuelve a la pantalla donde estaba (no hay `next`).
- N12. Importar: «Falta el código: es obligatorio en toda fila» en modo «Crear y actualizar» no explica qué código poner a un perfil nuevo.

## Lo que está bien (verificado)

- **La puerta explica por qué pide el correo** (cliente y panel), el foco pasa al dígito 1, y un código erróneo da un mensaje accionable («Ese código no sirve. Pide uno nuevo y usa el último que te llegue.»). Respuesta neutra ante correos no invitados (`ux/01`, `ux/02`, `ux/20`).
- **Sesión vencida**. Portal: «Tu sesión terminó… abre el enlace de tu correo» (`ux/12`). Panel: «La sesión se cerró tras 60 minutos sin actividad», con el correo precargado y «Lo que guardaste sigue en el panel» (`ux/21`). Enlace vencido con fecha y petición de uno nuevo; revocado con el contacto (`ux/11`).
- **Selección curada**: no se omite ningún perfil; cada cambio tiene su estado y motivo, y hay un aviso «Dos perfiles cambiaron desde el 26 sep» (`ux/03`, `ux/08`).
- **Bloqueo de publicación con motivo**: el lateral enlaza al campo que falta, y la vista previa lista «Impide publicar: Stack — Falta: tecnologías» con su acción (`ux/23`, `ux/24`), salvo el contador de R1.
- **Importación**: emparejamiento por nombre con columnas no reconocidas visibles («Sin emparejar: no se importa»), vista previa con **antes → después** por campo («Años de experiencia 6 → 12»), filas con error y su motivo, y «Nada ha cambiado todavía en el banco» (`ux/25`–`ux/27`). El historial y el resultado con filas no aplicadas son descargables (`ux/28`, `ux/29`).
- **Observadora**: menú reducido, rol «Consulta» visible, editor en solo lectura con explicación y acción «Avisar a Talento Humano» (`ux/40`, `ux/41`).
- Sin scroll horizontal a 390 en las pantallas recorridas; consola sin errores en el portal.

## No verificado / límites

- **Deshacer una importación** (pantalla de confirmación de reversión): no se ejercitó en vivo, porque todos los lotes existentes ya estaban revertidos y aplicar uno nuevo habría modificado perfiles ficticios. `/importar?deshacer=<lote revertido>` redirige al historial. Solo hay lectura de código (`Resultado.tsx:593+`).
- No se publicó, pausó ni editó ningún perfil, así que el clic en «Publicar» desactivado no se probó. Catálogos, Léxico, Colocados y Administración se vieron en modo lectura, sin crear, fusionar ni aprobar.
- Panel en móvil: solo se revisaron Inventario e Importar a 390.
- Los datos de dev están alterados por los e2e: PS-0142 figura «Publicado» pero su última auditoría dice Publicado→Borrador. No es un hallazgo de UX; puede confundir a otros revisores.

## Re-verificación incremental (PR #11, commit 7c9b885) — PASS
- B1 resuelto: `apps/portal/src/ficha/PanelFicha.tsx` acepta `ficha: Ficha | null` y abre un diálogo «Esta ficha se está actualizando» con la misma barra (← →, «n de N», «Cerrar la ficha», atajos), sin datos del perfil; `apps/portal/app/page.tsx` y `banco/page.tsx` abren el panel siempre que el perfil está en la lista. Test con servidor real en `apps/ficha-portal.test.ts` (texto, «3 de 3 · selección para ti», cerrar; sin «Verificado por Trycore» ni el nombre).
- R2 corregido: el pie de Colocados (página y hoja) dice «En el banco el cliente ve la banda, nunca la fecha ni la cuenta; en la selección de su correo, la fecha en que se libera» (HU-144, D50).
- `ficha-portal.test.ts` + `colocados-panel.test.ts`: 21/21 ✓ sobre el build posterior al arreglo.
- Sin bloqueantes nuevos. NIT: el caso «fuera de contrato» solo se prueba en `/`; falta uno en `/banco?ficha=…`. R1 y R3–R8 quedan como mejoras. Evidencia por código y HTML del servidor real, sin captura nueva.
