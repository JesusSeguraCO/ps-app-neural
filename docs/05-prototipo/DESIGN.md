# DESIGN.md — reglas visuales del Portal de Perfiles People Service

> Fuente de verdad **en prosa** de la identidad visual. Los mismos valores viven como CSS custom
> properties en `tokens.css` (fuente única que importan todos los prototipos). Si este archivo y
> `tokens.css` divergen, gana `tokens.css` y la divergencia se reporta como drift.

## Identidad

**Portal tecnológico con acentos de marca** (v2). Superficie clara y neutra, marca Trycore como
acento: teal para acción, foco y evidencia; navy para autoridad (chips obligatorios, placa de
verificado, sidebar del panel). Claro y oscuro nativos. Heredada del prototipo v2 de
claude.ai/design ya aprobado por el sponsor (ver Procedencia): no se reabre la dirección estética.

## Paleta

| Token | Claro | Uso |
|---|---|---|
| `--tc-bg-canvas` | #F6F7FA | Fondo de la app |
| `--tc-card` | #FFFFFF | Tarjetas y paneles |
| `--tc-bg-subtle` | #F1F3F7 | Chips, filas alternas, campos de solo lectura |
| `--tc-border` / `--tc-border-s` | #E4E7EE / #D3D8E2 | Separadores / bordes fuertes y campos |
| `--tc-text-h` / `--tc-text-b` / `--tc-text-m` / `--tc-text-s` | #0B1020 / #3B4256 / #5C6377 / #6B7285 | Titulares / cuerpo / secundario / ayudas |
| `--tc-primary` | #00A19A | Teal de marca: bordes, foco, marcas ✓. **Nunca como texto sobre blanco** |
| `--pp-teal-ink` | #007A75 | Teal en contacto con texto (enlaces, texto destacado) |
| `--pp-teal-fill` | degradado #00857F→#006F6A | Relleno del botón primario |
| `--pp-press` | degradado navy | CTA principal de cierre (enviar solicitud) |
| `--tc-navy` | #1D2751 | Autoridad: chip obligatorio, placa verificado, sidebar |
| `--tc-primary-surface` (+ `-border`, `-ink`) | #F0FAF9 | Bloque de lo **verificado** |
| `--tc-surface-declared` | #FAFBFC | Bloque de lo **declarado** (se distingue de lo verificado) |
| `--tc-green-bg` / `--tc-ok-*` | — | Evidencia cumplida ✓, disponible |
| `--tc-amber-bg` / `--tc-warn-*` | — | Avisos, «lo más cercano», por confirmar |
| `--tc-red` / `--tc-red-bg` / `--tc-danger-ink` | — | Errores, bloqueo, revocado |
| `--tc-focus-ring` | #007A75 | Contorno de foco (no depende solo del color) |

Oscuro: `class="dark"` en `<html>`; `tokens.css` reescribe los mismos nombres (canvas #0A0D16,
teal #2DD4C4, textos claros). Ningún componente cambia de clase para cambiar de tema.

## Tipografía

- **Familias**: Geist (interfaz: titulares y cuerpo) · Geist Mono (códigos de perfil, conteos,
  código de acceso, atajos). Autoalojadas en `fuentes/`.
- **Escala**: 30 (h1) / 22 (h2) / 17 (h3) / 15 (cuerpo) / 13 (small) / 12 (caption) / 10 (badge).
- **Pesos**: 400 cuerpo · 500 etiquetas y botones · 600 titulares · 700 cifras destacadas.
- Titulares con `letter-spacing: -0.02em`. Campos de formulario ≥ 16 px en móvil (M-3).

## Espaciado y radios

- **Spacing scale** (base 4): 4 / 8 / 12 / 16 / 18 (padding de tarjeta) / 24 (área de contenido)
  / 32 / 40.
- **Radios** (v2): 6 px tags, kbd, ítems de navegación y bloques internos · 10 px controles,
  tarjetas, listas, tablas, avisos y toast · 16 px solo superficies que flotan o se destacan solas
  (tarjeta de la puerta de acceso, franja de marca) · píldora solo para chips, «Mi equipo» y el CTA
  navy.

## Sombras

| Token | Uso |
|---|---|
| `--tc-sh-1` | Controles, listas, tablas y tarjetas del panel (la elevación por defecto) |
| `--tc-sh-2` | Solo la tarjeta de la puerta de acceso |
| `--tc-sh-3` | Hojas laterales (ficha), diálogos |
| `--tc-sh-focus` | Anillo de foco de campos |
| `--pp-cmd-shadow` | Barra de instrucción / búsqueda |

## Componentes

- **Topbar del cliente**: logo Trycore + nombre de la cuenta, indicador de «Mi equipo» con conteo,
  conmutador de tema. Fondo `--pp-header` translúcido.
- **Shell del panel**: sidebar navy (`--tc-grad-sidebar`) de 252 px con navegación; «estás aquí»
  por fondo blanco al 12 % + semibold (nunca barra lateral de color); rótulos de grupo en tipo de
  frase y apagados. Área de contenido sobre `--tc-bg-canvas` con padding 32 (16 en móvil).
- **Puerta de acceso** (cliente y panel): logo sobre la tarjeta centrada (16 px de radio) en el
  lienzo plano; explica **por qué** pide el correo en una línea de texto apagado, sin caja
  (RF-1.2.5); código de un uso en Geist Mono con 6 casillas; mensajes neutros que no revelan si un
  correo está invitado.
- **Tarjeta de perfil** (solo cliente): rol como título-enlace, nombre + primer apellido debajo,
  banda de disponibilidad como punto + texto, tecnologías como texto separado por «·», evidencia
  ✓/– por criterio (nunca porcentajes), «cumple N de M»; lo verificado es un tinte
  `--tc-primary-surface` **sin borde** con rótulo «Verificado por Trycore» y escudo; lo declarado va
  **sin caja**, con rótulo apagado «Declarado por…». Sin sombra; hover sube el borde a `--tc-border-s`.
- **Chips de criterio**: obligatorio = navy lleno; deseable = contorno teal.
- **Estados de un perfil en enlace curado**: nunca desaparece en silencio; primera línea de la
  tarjeta con punto ámbar + estado real + fecha (RF-19.2), título atenuado, acción alternativa.
- **Botones**: primario teal (`--pp-teal-fill`), CTA de cierre navy (`--pp-press`), secundario
  contorno, fantasma para terciarias, destructivo rojo; 10 px de radio; 40 px (32 la variante
  `--sm`) en escritorio y ≥ 44 px en móvil (M-2).

Los componentes nuevos de v2 (lista densa, estado, toast, actividad, formulario alineado, barra con
buscador, paginación) se documentan en **Oficio › Patrones** más abajo.


## Oficio (v2 — 2026-09-27)

> Origen: feedback del sponsor sobre la v1 («diseños tipo IA slop… bloques con bordes izquierdos
> de color… que se sienta como una app de primer mundo, hecha por artesanos»). El listón es el
> acabado de Linear, Vercel o Stripe (estética Tailwind/shadcn) **dentro** de la marca v2: mismos
> tokens, Geist, teal para acción, navy para autoridad. El oficio no añade colores; quita ruido.
> Este apartado manda sobre cualquier ejemplo anterior del prototipo.

### Principios

1. **Tipografía antes que cajas.** La jerarquía sale de peso, tamaño y color de texto
   (`--tc-text-h` → `--tc-text-b` → `--tc-text-m` → `--tc-text-s`). Una caja solo existe si agrupa
   algo que el usuario manipula como unidad o si su fondo **significa** algo (verificado, aviso).
2. **Filas, no tarjetas.** En el panel, toda colección es una lista densa (`pp-filas`) o una tabla
   (`pp-tabla`): un contenedor con hairline y filas separadas por 1 px. La tarjeta por ítem queda
   reservada a la tarjeta de perfil del cliente, donde se comparan perfiles lado a lado.
3. **Estado = punto + palabra.** Punto de 6 px (`pp-estado`, o los alias `pp-badge--*`) y texto
   de 12 px. Nada de píldoras gruesas con fondo. El texto siempre dice el significado.
4. **Una primaria por contexto, a la derecha.** Página: una teal en el encabezado. Fila repetida:
   su acción principal es contorno `--sm`, la secundaria fantasma; nunca N botones teal apilados.
   Pie de formulario/hoja: fantasma a la izquierda, primaria a la derecha.
5. **Hairlines y ritmo.** Bordes de 1 px `--tc-border`; espaciado solo en la escala 4/8
   (`--tc-sp-*`); cifras, fechas, horas y códigos con `font-variant-numeric: tabular-nums`.
6. **Confirmar sin gritar.** Una acción recién hecha se confirma con un toast (`pp-toast`):
   una línea, invertido, abajo a la derecha, con «Deshacer» si es reversible. Los avisos
   (`pp-aviso`) son para lo que sigue siendo cierto mientras estés en la pantalla.
7. **Menos palabras.** Sin párrafo introductorio bajo el título; sin «happy talk»; sin listas de
   ✓ que explican cómo funciona el sistema; sin repetir en cada ítem lo que dice el contexto.
   Escribe, borra la mitad, y borra la mitad de lo que queda.
8. **Microdetalles obligatorios.** Hover definido en CSS para todo lo clicable; foco visible
   (`--tc-focus-ring`); truncado con elipsis en correos y nombres largos; `pp-kbd` para atajos
   reales (p. ej. `/` en el buscador); estados vacíos que dicen el siguiente paso.

### Krug (Don't Make Me Think) aplicado

- **De un vistazo**: título de página = dónde estoy; migas en la topbar; pestañas con conteo =
  qué hay; la primaria del encabezado = qué puedo hacer.
- **Estás aquí**: sidebar y topbar marcan el ítem activo con fondo sutil + semibold; pestaña
  activa con subrayado de 2 px en `--tc-text-h`. Nunca solo color, nunca barra lateral de color.
- **Convenciones**: login centrado; enlaces subrayados o con subrayado al pasar; botones con
  forma de botón; títulos de fila que llevan a su detalle son enlaces.
- **Etiquetas que dicen qué pasa**: «Aprobar», «Renovar», «Sumar al equipo», no «Continuar» ni
  «Aceptar». El toast repite el efecto real («Ya puede entrar al enlace de Davivienda»).
- **Errores**: qué pasó + cómo arreglarlo, junto al campo o en un aviso con su acción
  («No se puede publicar. Falta el consentimiento firmado.» + «Subir consentimiento»).
- **Camino feliz evidente**: la acción que el usuario viene a hacer es la más visible de la
  pantalla; las demás bajan a contorno o fantasma.

### Degradados: solo tres usos

1. `--pp-teal-fill` en el botón primario. 2. `--pp-press` en el CTA de cierre (enviar la
solicitud). 3. `--tc-grad-sidebar` como **superficie navy de marca**: la sidebar del panel y, en el
cliente, como mucho una `pp-franja` por pantalla (encabezado de selección curada o confirmación de
solicitud). Retirados: `--pp-hero` detrás de la puerta, el filo `--tc-grad-cta` de la franja.

**Transparencia sobre token.** Única mezcla permitida: `color-mix(in srgb, var(--token) N%,
transparent)` (equivale a `bg-white/10` de Tailwind), solo para hover/activo sobre navy y para
el hover de acciones dentro del toast o de un chip. No es una vía para inventar colores.

### Así no / así sí

| Así no (v1) | Así sí (v2) |
|---|---|
| Aviso de éxito verde con borde izquierdo de 3 px encima de la lista | `pp-toast` invertido abajo a la derecha: «Aprobaste a Paula Henao. Ya puede entrar al enlace de Davivienda. · Deshacer» |
| Una tarjeta con sombra por petición, con `dl` de tres columnas iguales (Pedida por · Enlace · Estado del enlace) | Una fila: nombre 15 semibold + correo 13 apagado; línea meta «Pide Mariana Ospina · Bancolombia — Modernización de pagos · hoy, 9:14 a. m.»; la nota entre comillas en cuerpo |
| Caja gris «Para qué lo invita» con el motivo dentro | El motivo como texto de cuerpo entre «», sin caja ni rótulo |
| Píldora «Pendiente» en cada ítem de la pestaña Pendientes | Nada: la pestaña ya lo dice. Solo se marca la excepción («● Dominio distinto al de la cuenta») |
| «Tu decisión queda en la auditoría…» repetido en cada tarjeta | Se dice una vez (metadato del encabezado o de la auditoría), o no se dice |
| Timeline «Últimas decisiones» con línea vertical teal | `pp-actividad`: columna de hora en mono + frase «**Aprobaste** a …», sin líneas |
| Lista de ✓ que explica qué pasa al aprobar o rechazar | Etiquetas de botón precisas y el toast con el efecto real |
| «POR QUÉ ESTA SELECCIÓN» en mayúsculas con borde izquierdo teal | Texto de la franja firmado por quien seleccionó; sin eyebrow |
| Tecnologías como 4 píldoras grises + verificado y declarado en cajas con borde (sólido y discontinuo) | Tecnologías «Java · Spring Boot · Kafka»; verificado en tinte teal sin borde; declarado sin caja |
| «1 de 6», «2 de 6» encima de cada tarjeta; badge verde «Disponible ahora» | Sin numeración decorativa; «● Disponible ahora» |
| Estado vacío centrado con icono en círculo y borde discontinuo | Título + una frase + siguiente paso, alineado a la izquierda dentro del contenedor de la lista |
| Sidebar con rótulos «BANCO DE PERFILES» teal en mayúsculas y barra teal en el activo | Rótulos en tipo de frase apagados; activo con fondo sutil + semibold |
| Conteo de pestaña en píldora gris | Conteo en mono `--tc-text-s`, sin fondo |

### Patrones v2 (en `_patrones.html`)

- **Encabezado de página** (`pp-encabezado`, `__titulo` 22 px, `__meta` 13 apagado,
  `__acciones`): título + metadatos cortos (conteos) + acciones a la derecha, primaria al final.
- **Lista densa** (`pp-filas`, `pp-fila`, `__principal`, `__titulo`, `__sub`, `__meta`, `__nota`,
  `__acciones`, `--seleccionada`; `pp-filas__cabecera` opcional; `pp-paginacion`).
- **Actividad** (`pp-actividad`, `__item`, `__hora`, `__texto`): historial reciente en una columna
  lateral (`pp-con-lateral`: contenido + 300 px, apila por debajo de 1100 px).
- **Estado** (`pp-estado` `--ok --warn --danger --info --neutro --borrador`; alias `pp-badge--*`).
- **Toast** (`pp-toast`, `__marca`, `__texto`, `__accion`): uno a la vez, fijo abajo a la derecha
  (a lo ancho en móvil).
- **Aviso** (`pp-aviso` `--ok --warn --danger --info`, `__icono`, `__titulo`, `__accion`): tinte
  suave + hairline del mismo tono, sin borde lateral; título en una frase terminada en punto.
- **Barra de herramientas** (`pp-barra`, `pp-buscador`, `__icono`, `__atajo` con `pp-kbd`):
  pestañas a la izquierda, buscador a la derecha, sobre la tabla o la lista.
- **Tabla** (`pp-tabla`): cabecera sin relleno 12 px apagada, filas 13 px, hover
  `--tc-surface-quiet`, acciones fantasma a la derecha (`pp-tabla__acciones`).
- **Pestañas** (`pp-pestanas`): subrayado 2 px `--tc-text-h`, conteo en mono sin píldora.
- **Formulario alineado** (`pp-form--alineado`, `pp-form-fila`, `__etiqueta`, `__control`,
  `pp-form__acciones`): edición en el panel; etiqueta + ayuda a 240 px, control hasta 440 px,
  filas con hairline; apila en móvil. El apilado (`pp-form`) queda para formularios cortos.
- **Datos de la ficha** (`pp-datos__fila`): filas etiqueta (148 px, apagada) / valor con hairline.
- **Estado vacío** (`pp-vacio`): título 15 + frase 13 apagada + siguiente paso; sin icono.
- Retirados: `pp-vacio__icono`, `pp-franja__overline`, el párrafo en `pp-encabezado__texto`,
  `pp-tag` dentro de la tarjeta de perfil (se neutraliza a texto), `pp-aviso` para confirmar
  acciones, `pp-tarjeta` por ítem de lista.

## Don'ts (lista explícita)

- No inventar colores, fuentes, spacing ni radios fuera de los tokens.
- No introducir dependencias externas en los prototipos (CDNs, frameworks, fuentes remotas).
- No "interpretar" el diseño al construir: copiar valores exactos.
- No usar `--tc-primary` (#00A19A) como color de texto ni como relleno bajo texto blanco.
- No mostrar porcentajes de coincidencia: evidencia ✓/– por criterio y conteos.
- No mostrar foto, contacto, CV, tarifas ni fecha exacta de disponibilidad del profesional
  (lista negra B.4, D-9, RF-3.13): solo banda de disponibilidad.
- No revelar en pantalla si un correo está o no invitado (mensajes neutros).

**Oficio (v2):**

- No usar bordes laterales de color como acento: ni en avisos, ni citas, ni timelines, ni en el
  ítem activo de un menú, ni en tarjetas. Tampoco filos de color arriba o abajo de una superficie.
- No poner una tarjeta por ítem donde una fila basta (todo el panel).
- No meter datos en cajas grises de relleno (`--tc-bg-subtle` como fondo de un párrafo o un `dl`).
- No usar píldoras con fondo para estados; no repetir un estado que ya dice la pestaña o el
  título; no más de un indicador por fila salvo que cada uno aporte algo distinto.
- No usar iconos decorativos ni emojis. Iconos solo funcionales: navegación de la sidebar, cerrar,
  buscar, más acciones, el escudo de «Verificado por Trycore».
- No escribir párrafos introductorios que describen la pantalla, subtítulos de marketing, listas
  de ✓ que explican el sistema, ni el mismo texto repetido en cada ítem.
- No usar eyebrows en mayúsculas (`text-transform: uppercase`) salvo, como mucho, la cabecera de
  una tabla muy densa; nunca como rótulo de sección, de bloque o de grupo de navegación.
- No numerar de forma decorativa (01/02/03, «1 de 6» sobre cada tarjeta).
- No usar degradados fuera de los tres usos; no usar sombras más fuertes que `--tc-sh-1` en
  superficies del flujo (`--tc-sh-3` solo para hoja lateral, diálogo y toast).
- No centrarlo todo: el contenido se alinea a la izquierda en una rejilla; solo la puerta de acceso
  se centra, por convención.
- No repartir simetría de plantilla (tres columnas iguales de `dl` en cada tarjeta).
- No poner más de un botón teal por contexto ni botones teal repetidos en cada fila.

## Procedencia

- **Origen de los tokens**: manual de marca — design system Trycore
  (`docs/07-prototipo/_ds/`) + tema v2 del Portal de Perfiles
  (`docs/07-prototipo/handoff/styles/`), prototipo v2 de claude.ai/design confirmado como fuente de
  diseño por Jesús Segura el 2026-09-24. Sin variantes estéticas: la identidad ya estaba decidida.
- **Fecha**: 2026-09-27 (v1) · 2026-09-27 v2 «Oficio» tras el feedback del sponsor.
- **Reconciliaciones**: el tema v2 sustituye Poppins/Karla del design system por Geist, y los
  radios de 2/4/6 px por 6/10/16 px; rige el v2 (es lo que construirá la app). Fuentes pasadas de
  Google Fonts a autoalojadas (ADR-0010: 0 CDNs).
