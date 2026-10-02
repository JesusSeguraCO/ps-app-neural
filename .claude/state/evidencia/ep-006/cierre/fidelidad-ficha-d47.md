# EP-006 · D47 — fidelidad de la ficha del perfil en el portal (captura real por MCP chrome-devtools)

- Fecha: 2026-10-01 · commit 83ad7a6 (build standalone del portal de 21:08, sin fuentes posteriores).
- Portal standalone :3100 (`NODE_ENV=production`, entorno `scripts/entorno-dev.sh portal`, cabecera `x-ps-edge`) sobre la BD de desarrollo.
  Insertado solo: enlace «Cuenta Fidelidad» (`c49f9389-12cb-418b-acf8-6122bf393798`, PS-0142/PS-0151/PS-0187), un invitado y una sesión de 1 día. Ningún perfil tocado. Servidor parado al terminar.
- Consola del portal: **0 mensajes** (ni errores ni violaciones de CSP) en 1440 y 390, claro y oscuro. Sin scroll horizontal a 390 (scrollWidth 390).
- Tokens medidos con getComputedStyle, idénticos en app y prototipo: hoja 600 px, fondo `#fff` / `rgb(17,21,31)`, h2 Geist 17/600, persona 15 px, «Verificado» `rgb(0,97,94)` / `rgb(94,234,212)`, bloque verificado `rgb(240,250,249)` / `rgba(45,212,196,.07)`, velo `rgba(11,16,32,.45)` / `rgba(0,0,0,.6)`, barra 12/16/12/24, cabecera 24/40/18/24 en escritorio, dt/dd 13 px, botones de la barra 44×44 en móvil.
- Árbol accesible (take_snapshot) de app y prototipo: misma estructura (dialog modal → navigation «Recorrer perfiles» [anterior, siguiente, «N de M · selección para ti»] → «Cerrar la ficha» → banner [h2, persona, disponibilidad, meta] → región «Verificado por Trycore» → región «Declarado por…»). Foco inicial en «Cerrar», como `fp-foco` del prototipo.

## Fuente de verdad
`docs/05-prototipo/manifest.json` marca **las cinco pantallas `ficha-perfil*` como `borrador` (épica EP-003)**. La ficha usa el mismo componente que `vista-previa-ficha*`, que sí está **`aprobada`** (EP-006), y HU-129 exige que ambas se vean igual. Donde las dos fuentes chocan, manda la aprobada. Un borrador no acredita fidelidad por sí solo: ver «Decisión pendiente».

## Veredicto por pantalla

| Pantalla | Capturas | Veredicto |
|---|---|---|
| ficha-perfil--sin-criterios (principal) | `fidelidad/app-ficha-perfil--sin-criterios-1440{,-oscuro}.png` · `fidelidad/proto-ficha-perfil--sin-criterios-1440{,-oscuro}.png` · snapshots `fidelidad/snapshot-*-1440.txt` | **DESVIACIONES** (1 sin documentar: D-1) |
| ficha-perfil--movil (390) | `fidelidad/app-ficha-perfil--movil-390{,-oscuro}.png` · `fidelidad/proto-ficha-perfil--movil-390{,-oscuro}.png` | **DESVIACIONES** (D-1 y D-2) |
| ficha-perfil (estructura común) | `fidelidad/proto-ficha-perfil-1440.png` vs app sin-criterios 1440 | **DESVIACIONES** (D-1); «Frente a tu búsqueda» y «Sumar al equipo»/toast = N/A |
| ficha-perfil--dato-ausente (estructura común) | `fidelidad/proto-ficha-perfil--dato-ausente-1440.png` | **DESVIACIONES** (D-1); criterios y «Lo más cercano» = N/A; «Sin dato registrado» = intencional (I-4) |
| ficha-perfil--extremo (estructura común) | `fidelidad/proto-ficha-perfil--extremo-1440.png` | **DESVIACIONES** (D-1); criterios = N/A; título largo no se probó con datos reales (la regla `overflow-wrap:anywhere` del prototipo sí está en `packages/ui/ficha.css`) |

## Región × veredicto (sin-criterios, 1440)

| Región | Veredicto | Evidencia |
|---|---|---|
| Composición: lista detrás + velo + hoja lateral 600 px a la derecha | FIEL | capturas; la lista de detrás es `aterrizaje-curado` (aprobada), como pide D47 |
| Barra de recorrido (flechas, «N de M · selección para ti», atajos, cerrar) | FIEL | snapshot idéntico; anterior deshabilitado en la posición 1 |
| Cabecera: rol, persona · experiencia | FIEL | mismo tamaño, color y orden |
| Cabecera: disponibilidad + meta | Intencional (I-1) | una línea (`fp-linea`, como `vista-previa-ficha` aprobada) frente a dos líneas (`fp-disp` + `fp-meta`) del borrador |
| Título «Verificado por Trycore» | **DESVIACIÓN D-1** | falta el icono de escudo; está en el borrador **y** en la `vista-previa-ficha` aprobada |
| Bloque verificado (teñido, filas dt/dd) | FIEL | mismos tokens; faltan filas Inglés/Referencias/Identidad/Antecedentes = I-3 |
| «Declarado por la persona» y filas | FIEL salvo el texto I-2 | |
| Pie «Sumar al equipo», toast, «Mi equipo», «En el equipo» | N/A | el portal no tiene equipo todavía |
| «Frente a tu búsqueda» (criterios ✓/–, conteo) | N/A | búsqueda por criterios = EP-009 |
| Tema oscuro | FIEL | tokens `.dark` iguales en los dos |

## Desviaciones a corregir (priorizadas)

**D-1 · Falta el escudo en «Verificado por Trycore» (todas las variantes, 1440 y 390, y también la vista previa del panel).** El prototipo (borrador y aprobado) pone un icono de 14 px antes del texto; la app no lo dibuja (`.fp-seccion__titulo--verificado svg` no existe). La pasada `ss5/fidelidad-ss5.md` lo dejó pasar.
Fix: `packages/ui/src/FichaPerfil.tsx`, dentro de `<h3 … id="fp-verificado">`, antes del texto:
`<svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>`
(el h3 ya es `inline-flex` con `gap: var(--tc-sp-2)` en `packages/ui/ficha.css`; el mismo trazo ya se usa en `apps/panel/src/inventario/EditorPerfil.tsx`).

**D-2 · Móvil (390): la cabecera reserva 40 px a la derecha para un botón de cerrar que en el portal no está ahí.** App `padding: 18px 40px 16px 16px`; prototipo `18px 16px 16px` (`.fp-telefono .pp-hoja__cabecera`). Efecto: la línea de persona y la meta parten antes de tiempo.
Fix: `apps/portal/app/ficha.css`, dentro de `@media (max-width: 767px)`: `.fp-ficha .pp-hoja__cabecera { padding-right: var(--tc-sp-4); }`. Con el cerrar en la barra, también se puede aplicar a escritorio (el prototipo de escritorio conserva 40 px; dejarlo así es fiel).

## Desviaciones intencionales aceptadas
- **I-1** Disponibilidad y meta en una línea (`fp-linea`): así lo dibuja `vista-previa-ficha` (aprobada) y `ficha-perfil--movil`; HU-129 exige el mismo dibujo en panel y portal. **No está registrada en las decisiones**: conviene añadirla al registro (D47) para que no reaparezca como hallazgo.
- **I-2** «Declarado por la persona» y «Sello Personal»: D28 (el modelo no guarda género); «Sello Personal» coincide con la vista previa aprobada.
- **I-3** El bloque verificado solo tiene Sello Personal y Validación técnica; Formación va en Declarado: D28 / `ss5/fidelidad-ss5.md` punto 3 (Inglés, Referencias, Identidad y Antecedentes verificados no existen en el modelo).
- **I-4** Un bloque opcional sin datos no se dibuja (el borrador `--dato-ausente` pone «Sin dato registrado» en Idiomas): manda `vista-previa-ficha--bloque-opcional` (aprobada).
- **I-5** Badge de disponibilidad siempre `pp-badge--banda` (punto gris): coincide con la vista previa aprobada (incluso para «Disponible ahora»). El borrador móvil usa `--disponible` (verde) y el extremo `--por-confirmar` (ámbar), y la tarjeta de la lista ya pinta «Disponible ahora» en verde (`pp-estado--ok`). Si se quiere que tarjeta y ficha coincidan: en `FichaPerfil.tsx` elegir la clase por banda (`inmediato` → `pp-badge--disponible`, `por_confirmar` → `pp-badge--por-confirmar`, resto → `--banda`). Decisión de diseño, no bloqueante.
- **I-6** Textos de banda del PRD («En 1 mes») en lugar de los del prototipo: decisión del sponsor 2026-09-28 (`ss5` punto 6).

## Observación (no es de fidelidad; para ux-krug-reviewer)
La lista dice «Los 3 perfiles del correo» y la barra dice «1 de 2»: el recorrido salta el perfil pausado (PS-0151), que no se puede abrir (`disponibles` en `apps/portal/app/page.tsx`). Es coherente con el código, pero el contador puede confundir. En el prototipo todos los perfiles se pueden abrir.

## Decisión pendiente (gate de fidelidad)
Las cinco `ficha-perfil*` son `borrador` de EP-003. Opciones: (a) el sponsor aprueba `ficha-perfil--sin-criterios` y `--movil` en el manifest (las otras tres solo en su estructura común) y la fidelidad se acredita con D-1 y D-2 corregidas; (b) se acredita contra `vista-previa-ficha*` (aprobada, mismo componente) y las `ficha-perfil*` quedan como referencia hasta EP-003/EP-009. En los dos casos D-1 hay que corregirla, porque también falla contra la fuente aprobada.

## Re-verificación (r2, 2026-10-01) — solo D-1 y D-2, tras la corrección y D48
- Builds standalone de portal (21:18) y panel (21:19) posteriores a los cambios en `packages/ui/src/FichaPerfil.tsx` y `apps/portal/app/ficha.css` (ninguna fuente más nueva). Portal :3100 y panel :3101 con el entorno de desarrollo y cabecera de borde; los dos servidores parados al terminar.
- BD: solo insertadas una sesión de portal nueva sobre el enlace «Cuenta Fidelidad» y una sesión de panel (12 h) para el usuario existente `e2e-observador@trycore.com` (rol observador, solo lectura; `?vista=ficha` no registra rechazo). Ningún perfil ni usuario modificado.
- Fuente de verdad según **D48**: `vista-previa-ficha*` (aprobada). I-1..I-6 aceptadas.

| Comprobación | Resultado medido | Captura |
|---|---|---|
| D-1 portal 1440 claro | `svg.pp-icono.pp-icono--sm` 14×14 dentro de `#fp-verificado`, trazo `rgb(0,97,94)` (= texto del título) | `fidelidad/app-ficha-perfil--sin-criterios-1440-r2.png` |
| D-1 portal 1440 oscuro | 14×14, trazo `rgb(94,234,212)` | `fidelidad/app-ficha-perfil--sin-criterios-1440-oscuro-r2.png` |
| D-1 y D-2 portal 390 claro | escudo presente; cabecera `padding: 18px 16px 16px` (= prototipo); scrollWidth 390 | `fidelidad/app-ficha-perfil--movil-390-r2.png` |
| D-1 y D-2 portal 390 oscuro | idem | `fidelidad/app-ficha-perfil--movil-390-oscuro-r2.png` |
| D-2 sin efecto en escritorio | cabecera a 1440 sigue `24px 40px 18px 24px` (= prototipo) | idem 1440 |
| D-1 vista previa del panel (PS-0142, `?vista=ficha`) claro y oscuro | escudo 14×14 en el título, alineado (h3 `flex`, alto 20 px); resto de la ficha, lateral «Opcionales sin datos» y pie sin cambios; sin scroll horizontal | `fidelidad/app-vista-previa-ficha-1440-r2.png`, `…-1440-oscuro-r2.png` |
| Consola portal (4 cargas) | 0 mensajes: sin errores ni CSP | — |
| Consola panel (vista previa) | 0 errores; 1 *issue* CSP «blocks the use of eval» desde el chunk `2294-*.js`: es la sonda `try { Function("") } catch` con la que Zod 4 detecta si puede usar JIT. **Ya existía antes** (el arreglo no toca Zod ni ese chunk); la excepción se captura y no rompe nada. Fuera del alcance de D-1/D-2. Para silenciarla: `z.config({ jitless: true })` en un módulo cliente del panel cargado antes de usar Zod. | — |

### Veredicto final por pantalla (D48)
| Pantalla | Veredicto |
|---|---|
| Ficha del portal, escritorio 1440 (ref. `vista-previa-ficha` aprobada; `ficha-perfil--sin-criterios` como referencia) | **FIEL** (I-1..I-6 intencionales y aceptadas) |
| Ficha del portal, móvil 390 (ref. `ficha-perfil--movil`) | **FIEL** (I-1..I-6; equipo y criterios N/A) |
| `vista-previa-ficha` (panel) | **FIEL**; D-1 también corregida aquí |
| `ficha-perfil`, `--dato-ausente`, `--extremo` | Solo referencia por D48 (borrador EP-003/EP-009). En lo común, **FIEL**; criterios y equipo N/A |

Gate de fidelidad para D47: **`true`** (verificado por MCP; las desviaciones que quedan están documentadas: I-1..I-6 y D48).
