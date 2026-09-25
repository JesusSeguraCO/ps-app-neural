# Portal de Perfiles People Service · componentes

Paquete de handoff. Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui.
El prototipo navegable vive en `Portal de Perfiles.dc.html`, en la raíz del proyecto:
es la referencia de comportamiento e interacción de todo lo que hay aquí.

## v2 · Portal tecnológico con acentos de marca

El prototipo de referencia es ahora `Portal de Perfiles v2.dc.html`. La versión
anterior (`Portal de Perfiles.dc.html`) se conserva, pero ya no es la guía visual.

- **Claro y oscuro nativos.** `styles/portal-theme.css` reescribe los tokens
  `--tc-*` para `:root` y `.dark`, y expone las variables estándar de shadcn
  (`--background`, `--primary`, `--ring`, `--radius`…). Los componentes no cambian
  de clases: cambian de tema solos. `next-themes` con `attribute="class"` y
  `defaultTheme="system"`; `ConmutadorTema` en la topbar y en el sidebar.
- **Tipografía.** Geist para interfaz y Geist Mono para códigos, conteos y
  atajos (`next/font/google`). Poppins y Karla quedan para comunicación.
- **Forma.** Radios de 10px en controles, 16px en tarjetas y 20px en el héroe
  de búsqueda. Sombras sutiles de dos capas; en oscuro, más profundas y sin tinte.
- **Marca como acento.** Logo, teal (acciones, foco, marcas de evidencia) y navy
  (chips obligatorios, placa de verificado, sidebar). Degradados solo en tres
  sitios: el botón primario (teal vertical), el héroe (malla teal + navy muy
  suave con retícula de puntos) y la palabra destacada del titular.
- **Botones.** Son `Button` de shadcn con las variantes `default` (teal),
  `outline`, `secondary`, `ghost` y `destructive`; ya no se monta el `Button`
  del bundle Trycore, cuyo navy y teal no se adaptan a oscuro.

## Cómo se instala

```bash
npx shadcn@latest add accordion alert badge button card checkbox collapsible \
  command dialog dropdown-menu form input label popover radio-group select \
  sheet table textarea toggle-group
npm i class-variance-authority clsx tailwind-merge lucide-react nuqs next-themes
```

Luego:

1. Importa los tokens del sistema Trycore en `app/layout.tsx` (los `tokens/*.css`
   del design system, antes de `globals.css`).
2. Importa `styles/product-tokens.css` justo después: son las tintas derivadas
   que el sistema no nombra (teal y verdes/ámbares oscurecidos hasta 4.5:1, y las
   dos superficies que separan lo verificado de lo declarado).
3. Reemplaza `tailwind.config.ts` por el de esta carpeta: las utilidades quedan
   enlazadas a las variables CSS del sistema. **Ningún hex suelto en los componentes.**
4. Copia `lib/` y `components/portal/` a tu proyecto.

## Qué hay

| Archivo | Componente | Primitiva shadcn |
|---|---|---|
| `tarjeta-perfil.tsx` | `TarjetaPerfil` + `.Evidencia` + `.Pie` | `Card` |
| `evidencia-criterio.tsx` | `EvidenciaCriterio` | — |
| `tabla-resultados.tsx` | `TablaResultados` | `Table` + `Checkbox` |
| `conmutador-vista.tsx` | `ConmutadorVista` | `ToggleGroup` |
| `barra-instruccion.tsx` | `BarraInstruccion` | `Textarea` |
| ~~`bloque-interpretacion.tsx`~~ | Retirado en v2: los criterios viven en el Perfil objetivo | — |
| `importar-perfiles.tsx` + `lib/importar-csv.ts` | `ImportarPerfiles` (CSV → revisión → borradores) | `Button` + `Table` |
| `editor-bio.tsx` | `EditorBio` (lo declarado + vista previa en vivo) | `Input` + `Textarea` + `Label` |
| `perfiles-recomendados.tsx` + `lib/recomendados.ts` | `PerfilesRecomendados` (bajo los resultados, tras buscar) | `Button` |
| `panel-perfil-objetivo.tsx` | `PanelPerfilObjetivo` | `Popover` + `Command` + `ToggleGroup` |
| `chip-criterio.tsx` | `ChipCriterio` | `Badge` |
| `validacion-tecnica.tsx` | `ValidacionTecnica` | `Accordion` |
| `indicador-equipo.tsx` | `IndicadorEquipo` | — |
| `pregunta-perfilamiento.tsx` | `PreguntaPerfilamiento` | `Card` + `RadioGroup` |
| `aviso-cero.tsx` | `AvisoCero` | `Alert` |
| `estado-vacio.tsx` | `EstadoVacio` | — |
| `badges.tsx` | `BadgeDisponibilidad`, `BadgeEstado` | `Badge` |
| `ficha-perfil.tsx` | `FichaPerfil` | `Sheet side="right"` |
| `puerta-acceso.tsx` | `PuertaAcceso` | `Input` + `Label` |
| `acceso-vencido.tsx` | `AccesoVencido` | — |
| `copiar-enlace-vista.tsx` | `CopiarEnlaceVista` | `Button` |
| `orbe-busqueda.tsx` | `OrbeBusqueda` (estado «buscando») | — |
| `conmutador-tema.tsx` | `ConmutadorTema` | `Button` + `next-themes` |
| `franja-servicio.tsx` | `FranjaServicio` (onboarding de una vez) | `Button` |
| `cta-equipo-flotante.tsx` | `CtaEquipoFlotante` (aparece con el primer perfil) | `Button` + `Link` |
| `topbar-cliente.tsx` | `TopbarCliente` | `Button` + `Link` |
| `generador-enlace.tsx` | `GeneradorEnlace` | `Input` + `Select` + `Checkbox` |

`lib/types.ts` es el contrato de datos. `lib/use-criterios-url.ts` mantiene el
estado en la URL con `nuqs`.

Ningún componente escribe un hex: todo pasa por utilidad (`text-primary-ink`,
`bg-primary-surface`, `bg-grad-sidebar`). El espaciado usa la escala base-4 del sistema (`--tc-sp-1` a `--tc-sp-10`,
mapeada en `tailwind.config.ts`). Los únicos valores arbitrarios que quedan son
ajustes ópticos de 3, 5, 7, 9 y 11px —en `badges.tsx`, `chip-criterio.tsx` e
`indicador-equipo.tsx`, todos por debajo del primer paso de la escala— y los
tamaños de tipografía intermedios que el sistema sí define en px sueltos
(10.5, 11.5, 12.5, 14.5, 16.5). Aparte quedan tres medidas de composición que no
son espaciado: `max-w-[620px]` y `max-w-[420px]` (ancho de columna de lectura) y
`top-[88px]` (el desplazamiento del panel pegajoso bajo la topbar).

## Decisiones que no se negocian en implementación

**Vocabulario.** Perfil, talento, profesional. Nunca recurso, candidato,
staffing, horas-hombre, reservar, bloquear disponibilidad, stock, unidad, ítem.

**Sobre las personas.** Nombre y primer apellido. Sin foto, nunca. Sin correo ni
teléfono. El título visual es la capacidad; el código de referencia va al pie en
letra pequeña. No hay insignia ni sello por perfil: todos los publicados cumplen
el estándar y repetirlo en cada tarjeta lo devalúa.

**Sin porcentajes de coincidencia.** Solo conteo honesto — «cumple 3 de 4
deseables» — y el detalle de cuáles sí y cuáles no, incluidos los incumplidos.

**Nunca se numera el banco completo.** El conteo aparece solo como resultado de
una búsqueda o de un filtro («6 perfiles encontrados»). Sin criterios y con
ámbito «banco completo» se dice «Todo nuestro talento verificado». El tamaño del
inventario solo se ve en el panel de Talento Humano.

**Sin tarifas ni rangos de precio** en ninguna vista del cliente.

**Verificado vs. declarado.** La distinción es visual y explícita, no una nota al
pie. `FichaPerfil` la expresa con `tratamiento` (`columnas` · `bandas` · `placa`);
la semántica es la misma en los tres.

**Búsqueda asistida.** `BarraInstruccion` es la pieza protagonista de
resultados: panel navy, Enter busca y Shift+Enter abre línea. Mientras dura la
búsqueda, `OrbeBusqueda` reemplaza los resultados —la Frecuencia Orbitacional
girando alrededor del símbolo, con tres pasos legibles— y al resolver las
tarjetas entran con `animate-revelar` escalonado. `lib/use-busqueda-asistida.ts`
orquesta las fases y fija una duración mínima de ~2,3 s. Es la única animación en
bucle del producto, existe solo mientras hay búsqueda, y `motion-reduce` la
congela. Copia `assets/symbol-trycore.svg` a `public/brand/`.

**Ficha: tratamiento elegido.** `FichaPerfil` usa `tratamiento="placa"` por
omisión: lo verificado por Trycore en placa navy, lo declarado en tarjetas
blancas debajo.

**Enlaces personalizados.** Cada cuenta entra por un enlace propio emitido en
el panel (`GeneradorEnlace`): lleva su conjunto curado, la razón declarada y una
vigencia que nunca supera el consentimiento más corto del conjunto. El enlace no
abre el portal — lleva a la puerta, que pide correo y código de un solo uso. Sin
razón declarada no se emite. Del lado del cliente, `CopiarEnlaceVista` permite
llevarse la pantalla exacta a un correo o un chat.

**Estado en la URL.** Filtros, criterios, perfil abierto y vista activa se leen de
`searchParams`. Recargar conserva; un enlace copiado reproduce la pantalla. Es
requisito duro: al portal se llega desde un correo con enlaces profundos.

## Marco de plataforma (v2.1)

- **AppShell** (`app-shell.tsx`): lienzo gris `--pp-frame`, riel de iconos de 76px
  y contenido en un contenedor de radio 24 con sombra suave. Cabecera ligera con
  la cuenta, la vigencia del acceso y «Nueva búsqueda» en píldora oscura
  (`--pp-press`, que se invierte en modo oscuro).
- **Inicio de la búsqueda**: saludo por nombre y hora («Buenas tardes, Mónica»),
  el orbe, el compositor con el botón de enviar dentro, filtros rápidos en píldora
  con icono en círculo de color suave (ámbar, teal, azul, verde) que activan
  criterios reales, y tres tarjetas —la selección curada en navy, búsquedas
  sugeridas y «Tu equipo»— que solo aparecen antes de la primera búsqueda.
- Microcopia de cuidado bajo el compositor: «Buscar no compromete a ningún
  profesional: solo abre una conversación con nosotros».

**Un solo marco para toda la aplicación.** El login (`puerta-acceso.tsx`), la cara
cliente (`AppShell`) y Talento Humano (`AdminShell`) comparten el lienzo
`--pp-frame`, el contenedor de radio 24 y la píldora oscura `--pp-press` para la
acción principal. En el login, los dos paneles flotan sobre el lienzo (el de la
razón en navy con anillos orbitales, el del formulario claro con el orbe pequeño).
En Talento Humano el menú es claro, con icono y texto, y el ítem activo es una
píldora blanca con sombra, igual que en el riel del cliente.

## Hero del conjunto curado · Neural-Grid

`hero-neural-grid.tsx`. Se vende el modelo, no las personas: núcleo Neural-Grid,
cinco componentes en el primer anillo y profesionales en el exterior, con ondas
expansivas desde el núcleo («vibramos a tu frecuencia») y los retratos orbitando. Si mañana son agentes, solo cambia
el anillo exterior. **Los retratos son ilustrativos** (generados) y nunca los de
los perfiles publicados, que siguen sin foto. Los nombres de los componentes
están en `data/perfiles.js → NEURAL_GRID` y son una propuesta pendiente de
validar con el modelo real.

**Acento de marca en la acción principal.** `--pp-press` es navy de marca en claro
(degradado #26336A→#1D2751) y teal en oscuro; ya no hay botones negros. Logos de
Neural Grid en `assets/logo-neural-{h,v}{,-dark}.svg` y la marca sola en
`assets/neural-mark.svg` (colores de marca aplicados: los originales llegaron sin estilos).

## Cero resultados, urgencia y panel (v2.2)

- **Solicitud a medida desde el cero.** El aviso sin resultados incluye el
  formulario: cuándo debería empezar (lo antes posible · 2 semanas · 1 mes ·
  3 meses · 6 meses · elegir fechas con rango opcional) y una nota. Valida,
  envía y confirma en el mismo lugar con número de solicitud y el plazo de 10 días
  hábiles. Llega al equipo comercial como solicitud a medida.
- **Urgencia honesta en el conjunto curado.** Franja «Condición especial para
  {cliente} · válida hasta {vencimiento del acceso}» con los días restantes (no un
  reloj de segundos) y sin precios: la condición se conversa con el consultor. En
  cada tarjeta, señales reales: «Libre hasta el 6 oct · luego entra a otro
  proyecto» y «En 2 solicitudes activas de otros clientes». Vienen de
  `data/perfiles.js → SENALES` y en producción DEBEN salir del sistema: no se
  inventan escasez, visitas ni contadores falsos.
- **Panel de Talento Humano.** Filtros por estado con conteo y búsqueda por
  nombre, código o rol; cambio de estado por fila (publicado · borrador · pausado ·
  archivado) que bloquea publicar sin consentimiento; la bandeja de vigencia ahora
  completa el ciclo (solicitar renovación → marcar renovado, 90 días nuevos);
  títulos y botones homogéneos (26px/600 y píldora en toda acción).

## Señales de demanda y móvil (v2.3)

- **Bloque de demanda por tarjeta curada**: punto que late + titular según la
  señal real («El más solicitado de esta selección», «Alta demanda», «Con demanda
  activa», «Ventana corta»), el conteo de solicitudes activas y una barra de
  ventana de disponibilidad («Libre 13 días más · el 6 oct entra a otro
  proyecto»), en ámbar cuando quedan 10 días o menos. Todo sale de datos reales.
- **Móvil** (< 760px): el riel pasa a barra inferior fija con desenfoque, el
  contenedor pierde margen y radio, la cabecera se compacta (solo el cliente),
  la figura Neural-Grid escala para caber, el panel de resultados va en una
  columna y el CTA flotante sube sobre la barra. En Next: `md:` para el riel
  lateral y `max-md:fixed max-md:bottom-0` para la barra.

## Multisector (v2.4)

- El portal no asume banca. Cada cuenta trae `sector`, `ejemplo` (placeholder
  del compositor), sugerencias y su conjunto curado (`data/perfiles.js → CUENTAS`:
  BBVA · Banca, Petrolera Andina · Oil & Gas, Alimentos del Valle · Alimentos y
  bebidas). En el prototipo se cambia con la prop `cuentaDemo`.
- Filtros rápidos: **Sector** y **Seniority** ahora son selectores (listbox
  multiselección con `aria-selected`); el sector de la cuenta aparece primero
  marcado «Tu sector». Catálogo ampliado: Banca, Seguros, Oil & Gas, Energía,
  Alimentos y bebidas, Manufactura, Minería, Logística, Retail, Telecomunicaciones,
  Salud, Sector público.

## Vista tabla (v2.5)

- **El check selecciona, no suma** (convención de Krug: un control hace lo que
  parece). Marcar filas abre una barra de acciones en grupo: «Sumar al equipo»,
  «Comparar» (2–3 perfiles) y «Quitar selección»; el encabezado tiene
  «Seleccionar todos». Sumar al equipo es un botón explícito por fila
  («+ Sumar» / «✓ En tu equipo», `aria-pressed`) y «Ver ficha» es el propio
  título de la capacidad más un botón con flecha.
- **Más información por fila sin más columnas**: encaje «3 de 4 deseables» con
  barra segmentada (sin porcentajes), criterios activos como chips ✓/–
  (el detalle completo en `title`), 3 tecnologías, disponibilidad con ubicación y
  la señal de demanda bajo el nombre.
- **Ordenable** por profesional, encaje y disponibilidad (`aria-sort` en el
  `th`), cabecera pegajosa y scroll dentro del contenedor.

## Iconografía

Lucide (ISC, libre), la familia oficial del sistema Trycore, vía `lucide-react`.
Solo línea, trazo 1.6, color heredado. El mapeo vive en `components/portal/iconos.tsx`:
criterios del Perfil objetivo, bloques verificado/declarado de la ficha, metadatos
de la tarjeta (sector, modalidad, ubicación, disponibilidad) y navegación.
Tamaños: 12px en badges, 14px en metadatos, 15–16px en rótulos y navegación.
Cada icono acompaña un texto que ya dice lo mismo, por eso va `aria-hidden`.

## Lo que no se usa (anti-relleno)

Barrido aplicado a todos los componentes; se revisa en cada PR:

- **Sin franjas de acento** en tarjetas (`border-l-4`, `border-t-4`). La
  jerarquía la dan el fondo, el borde de 1px y la tipografía.
- **Sin texto con degradado.** El único degradado de color vive en el botón
  primario, el orbe y el resplandor del héroe.
- **Sin sobrerrótulos en MAYÚSCULAS espaciadas.** Los rótulos van en frase, a
  12,5px y peso 600. Las mayúsculas quedan solo en cabeceras de tabla.
- **Sin halos de color** alrededor de tarjetas: sombra neutra de dos capas.
- **Estados vacíos centrados**, con icono neutro en tesela, una línea y dos
  acciones, nunca un aviso con barra lateral.
- **Ninguna sección se monta vacía.** «Lo más cercano» y «Perfiles que pueden
  sumarte valor» solo se renderizan con al menos un perfil
  (`{cercanos.length > 0 && …}`).

## Primitivas: qué es componente y qué no

En producción, todo lo que es acción usa `Button` de shadcn y todo lo que es
estado usa `Badge`. El prototipo hace lo equivalente: monta `Button` y `Badge`
del bundle del sistema Trycore, así que peso, tamaño, sombra y hover coinciden
con cualquier otra pantalla de la casa.

Lo que **no** se monta como `Button`, por decisión: la navegación de la topbar
(en producción son `Link` de Next, no botones), los conmutadores de
obligatorio/deseable y de vista (`ToggleGroup`), el disparador y las filas de
opción del `Popover`+`Command`, las sugerencias de la barra de instrucción
(chips, no CTAs), los chips removibles (`Badge` con acción), los ítems de
`DropdownMenu` y los enlaces de texto. Son navegación o controles, no acciones,
y el sistema tampoco los define como botón.

Todo lo que sí es acción —incluidos los que llevan estado deshabilitado
(`Emitir enlace`, `Publicar perfil`, `Comparar`) o icono (`Cambiar
disponibilidad`, `Copiar enlace de esta vista`)— usa la primitiva con sus
props `disabled` e `iconLeft`/`iconRight`, no una reimplementación.

Los badges de estado conservan la geometría del `Badge` del sistema (10px,
`3px 9px`, tracking `.25px`) y solo sustituyen el tinte: las variantes sólidas
del sistema (verde, ámbar, rojo bajo texto blanco) no llegan a 4.5:1, y el
brief exige contraste verificable. Es la única desviación, y es deliberada.

## Accesibilidad — verificable

- Contraste 4.5:1 en texto normal y 3:1 en bordes de control. El teal de contacto
  con texto es siempre `--tc-primary-strong` (#007F7A), nunca `--tc-primary`.
- El recorrido completo se hace con teclado: escribir la instrucción, ajustar el
  panel, abrir una ficha, sumar al equipo, enviar la solicitud.
- Foco visible con indicador que no depende del color (outline de 3px + offset).
- Toda entrada con `<label>` asociada, no solo placeholder.
- `aria-pressed` en chips, filtros y botones de estado; `aria-selected` en filas y
  tarjetas seleccionadas.
- `aria-live="polite"` en el número de resultados, el aviso de cero y los avisos
  del panel de administración.
- Ningún significado descansa en el color: ✓ / – y texto siempre acompañan.
- Jerarquía de encabezados sin saltos, una sola `h1` por pantalla.

## Continuidad hacia móvil

El grid de resultados es por columnas (`auto-fill minmax`), el `Sheet` puede
volverse pantalla completa cambiando su clase de ancho, y las tablas se
desplazan dentro de su contenedor — nunca arrastrando la página.
