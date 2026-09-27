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
- **Radios**: 6 px tags y kbd · 10 px controles (botones, campos) · 16 px tarjetas y paneles ·
  píldora solo para chips y CTAs.

## Sombras

| Token | Uso |
|---|---|
| `--tc-sh-1` | Controles y elementos de baja elevación |
| `--tc-sh-2` | Tarjetas |
| `--tc-sh-3` | Hojas laterales (ficha), diálogos |
| `--tc-sh-focus` | Anillo de foco de campos |
| `--pp-cmd-shadow` | Barra de instrucción / búsqueda |

## Componentes

- **Topbar del cliente**: logo Trycore + nombre de la cuenta, indicador de «Mi equipo» con conteo,
  conmutador de tema. Fondo `--pp-header` translúcido.
- **Shell del panel**: sidebar navy (`--tc-grad-sidebar`) de 252 px con navegación; área de
  contenido sobre `--tc-bg-canvas` con padding 24.
- **Puerta de acceso** (cliente y panel): tarjeta centrada de 16 px de radio, explica **por qué**
  pide el correo (RF-1.2.5); código de un uso en Geist Mono con 6 casillas; mensajes neutros que
  no revelan si un correo está invitado.
- **Tarjeta de perfil**: nombre + primer apellido, rol, banda de disponibilidad (badge), evidencia
  ✓/– por criterio (nunca porcentajes), «cumple N de M»; lo verificado sobre
  `--tc-primary-surface`, lo declarado sobre `--tc-surface-declared`.
- **Chips de criterio**: obligatorio = navy lleno; deseable = contorno teal.
- **Estados de un perfil en enlace curado**: nunca desaparece en silencio; etiqueta de estado real
  y fecha si aplica (RF-19.2).
- **Botones**: primario teal (`--pp-teal-fill`), CTA de cierre navy (`--pp-press`), secundario
  contorno, destructivo rojo; 10 px de radio, altura táctil ≥ 44 px en móvil (M-2).

## Don'ts (lista explícita)

- No inventar colores, fuentes, spacing ni radios fuera de los tokens.
- No introducir dependencias externas en los prototipos (CDNs, frameworks, fuentes remotas).
- No "interpretar" el diseño al construir: copiar valores exactos.
- No usar `--tc-primary` (#00A19A) como color de texto ni como relleno bajo texto blanco.
- No mostrar porcentajes de coincidencia: evidencia ✓/– por criterio y conteos.
- No mostrar foto, contacto, CV, tarifas ni fecha exacta de disponibilidad del profesional
  (lista negra B.4, D-9, RF-3.13): solo banda de disponibilidad.
- No revelar en pantalla si un correo está o no invitado (mensajes neutros).

## Procedencia

- **Origen de los tokens**: manual de marca — design system Trycore
  (`docs/07-prototipo/_ds/`) + tema v2 del Portal de Perfiles
  (`docs/07-prototipo/handoff/styles/`), prototipo v2 de claude.ai/design confirmado como fuente de
  diseño por Jesús Segura el 2026-09-24. Sin variantes estéticas: la identidad ya estaba decidida.
- **Fecha**: 2026-09-27.
- **Reconciliaciones**: el tema v2 sustituye Poppins/Karla del design system por Geist, y los
  radios de 2/4/6 px por 6/10/16 px; rige el v2 (es lo que construirá la app). Fuentes pasadas de
  Google Fonts a autoalojadas (ADR-0010: 0 CDNs).
