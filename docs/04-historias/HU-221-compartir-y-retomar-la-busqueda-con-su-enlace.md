---
id: HU-221
titulo: "Compartir y retomar la búsqueda exacta con su enlace"
epica: EP-002
prioridad: alta
complejidad: M
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-219, HU-222, HU-121]
---

# HU-221 — Compartir y retomar la búsqueda exacta con su enlace

**Como** líder de área que encontró en el banco una combinación útil para su proyecto,
**quiero** copiar el enlace de lo que estoy viendo y que al abrirlo yo o un colega invitado de mi cuenta veamos exactamente los mismos filtros, el mismo orden y la misma vista,
**para** retomar o discutir esa búsqueda sin tener que rehacerla.

## Criterios de aceptación

### Happy path — el enlace reproduce el estado

**Esquema del escenario:** quien abre el enlace ve lo mismo que yo
**Dado** que en «Todo el banco» tengo los filtros «Desarrollador backend» y «Disponible ahora», el orden «Disponibilidad más próxima» y la vista de tabla,
**Y** que copié el enlace con «Copiar enlace» y el portal me confirmó «Enlace copiado»,
**cuando** <quien> abre ese enlace,
**Entonces** ve «Todo el banco» con los mismos filtros marcados, el mismo orden y la vista de tabla
**Y** ve los mismos perfiles, en el mismo orden

**Ejemplos:**

| quien |
|---|
| yo, en otra pestaña |
| un colega con sesión de su correo invitado en un enlace de mi misma cuenta |

### Error — el enlace trae valores que el portal no reconoce

**Dado** que recibí un enlace con el filtro de Rol «Desarrollador backend», un valor de Seniority que no existe y un parámetro que el portal no conoce,
**cuando** lo abro,
**Entonces** veo los resultados con el filtro de Rol aplicado
**Y** el valor inválido y el parámetro desconocido se ignoran, sin pantalla de error

### Error — un enlace de estado largo abierto desde otra cuenta

**Dado** que un invitado de otra cuenta, con sesión válida, abre un enlace de estado largo (`?v=1&s=…`) generado en mi cuenta,
**cuando** carga el portal,
**Entonces** ve un aviso neutro de que ese enlace de búsqueda no está disponible y «Todo el banco» sin filtros
**Y** no ve ninguno de mis filtros ni ningún dato de mi búsqueda

### Edge case — una búsqueda demasiado larga para la dirección

**Dado** que combiné tantos filtros que la dirección superaría 2 000 caracteres,
**cuando** toco «Copiar enlace»,
**Entonces** el enlace copiado es corto, de la forma `?v=1&s=…`
**Y** al abrirlo con una sesión de mi cuenta veo el mismo estado que tenía al copiarlo

### Edge case — la ficha abierta viaja con el enlace

**Dado** que tengo abierta la ficha de PS-0142 sobre mis resultados filtrados,
**cuando** abro en otra pestaña el enlace que copié en ese momento,
**Entonces** veo los mismos resultados con la ficha de PS-0142 abierta
**Y** al cerrarla vuelvo a la misma lista filtrada

## Notas

Cubre **RF-2.5** («todo el estado —conjunto curado y filtros— se refleja en la URL, es compartible y pre-cargable. Requisito duro»), el recorrido de §6.3 *reunión en vivo* en su parte de enviar el estado actual, y **RF-19.8** (token de estado largo). Diseño en **ADR-0004**: la URL es la única fuente del estado de búsqueda, se escribe sin navegar (`shallow`, `replace`), los parámetros desconocidos se ignoran, un valor inválido cae a su valor por omisión, `v=1` siempre, y por encima de 2 000 caracteres el estado se guarda en servidor con un token aleatorio de 128 bits ligado a sesión válida **de la misma cuenta** (404 neutro en cualquier otro caso).

**Qué es «todo el estado».** Ámbito (selección o «Todo el banco»), filtros (HU-219), orden (HU-222), vista (HU-121) y ficha abierta (HU-120, `ficha=`). **«Mi equipo» no es estado de búsqueda**: vive en servidor por invitado (CRN-12, HU-192) y no viaja en el enlace.

**El enlace no es una llave.** Con acceso nominal (RF-1.2.11) abrir el enlace exige sesión de un correo invitado; quien no lo tenga ve la puerta de acceso de HU-090 y, al superarla, el estado. Esta historia no cambia esa regla.

**Divergencia con ADR-0004 que hay que consolidar (no cambia el alcance).** La lista cerrada de parámetros de ADR-0004 (H34: `v`, `rol`, `tec`, `sen`, `mod`, `pais`, `vista`, `ambito`, `ficha`, `s`, `cmp`) no tiene las facetas **Categoría**, **Sector** y **Disponibilidad** de RF-2.3 ni el **orden** de RF-2.7. Esta historia los necesita; los nombres concretos (por ejemplo `cat`, `sec`, `disp`, `orden`) los fija la enmienda de la ADR en el change de EP-002. *Elegido por el modelo por delegación del sponsor:* ampliar la lista cerrada, no meter esos valores en parámetros existentes.

**Pruebas.** Ida y vuelta del contrato con fast-check (QA-16), e2e de copiar y abrir en otra pestaña y con un segundo invitado sembrado de la misma cuenta, y la verificación de la URL de 2 000 caracteres en staging que ADR-0004 (V4-3) exige antes de cerrar EP-002.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-2.5 · RF-19.8 · RF-1.2.11 · §6.3 · ADR-0004 (H4, H34, QA-16, V4-3) · CRN-12 · depende de HU-219 (filtros), HU-222 (orden) y HU-121 (vista) · relacionada con HU-120 (`ficha=`) y HU-090 (puerta)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: serializa el estado que crean HU-219, HU-222 y HU-121, de la misma épica (se construye después de ellas); la ficha abierta (HU-120) ya está construida |
| N | Negociable | ✓ fija que la URL es la única fuente, la tolerancia a valores desconocidos y el token largo ligado a la cuenta; los nombres de parámetro y el texto del aviso son negociables |
| V | Valiosa | ✓ requisito duro del PRD: el cliente retoma su búsqueda y la comparte con un colega invitado sin rehacerla |
| E | Estimable | ✓ M: parsers y serializador del contrato único, el servicio de estado largo con su tabla y el botón de copiar; ADR-0004 ya resolvió el diseño |
| S | Pequeña | ✓ M: una capacidad (el estado en la URL) en cinco escenarios |
| T | Testeable | ✓ ida y vuelta automatizada, e2e con dos invitados sembrados de la misma cuenta y uno de otra, URL de 2 000 caracteres en staging |
