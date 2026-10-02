---
id: HU-228
titulo: "Pedir el perfil a medida desde una opción sin perfiles, un cero por filtros o un equipo vacío"
epica: EP-010
prioridad: media
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-075, HU-077, HU-093, HU-100, HU-223]
---

# HU-228 — Pedir el perfil a medida desde una opción sin perfiles, un cero por filtros o un equipo vacío

**Como** líder de área que encontró en el portal una opción sin perfiles publicados, un cero por mis filtros o llegó a la solicitud con el equipo vacío,
**quiero** ir desde ahí al pedido a medida, con lo que ya elegí,
**para** no quedar en un callejón cuando lo que necesito no está hoy en el banco.

## Criterios de aceptación

### Happy path — desde la opción del encuadre sin perfiles

**Dado** que en la pregunta de encuadre elegí el rol «Ciencia de datos», que hoy no tiene perfiles publicados, y veo «Hoy no hay perfiles publicados de Ciencia de datos» con «Ampliar la búsqueda»,
**cuando** toco «Pedir el perfil a medida»,
**Entonces** llego a la pantalla de cero con «Ciencia de datos» como rol obligatorio de mi Perfil Objetivo
**Y** veo el pedido a medida con su plazo de 10 días hábiles (HU-075, HU-077)

### Happy path — desde el cero que dejaron mis filtros

**Dado** que mis filtros «Desarrollador móvil» y «Disponible ahora» dejaron cero y veo el aviso del cero con cuántos perfiles recupero quitando cada filtro (HU-223),
**cuando** toco «Pedir el perfil a medida»,
**Entonces** llego al pedido a medida con «Desarrollador móvil» y «Disponible ahora» como criterios obligatorios de mi Perfil Objetivo
**Y** el aviso del cero sigue ofreciendo quitar cada filtro si vuelvo atrás

### Happy path — desde el aviso de equipo vacío

**Dado** que mi equipo está vacío y veo «Todavía no tienes perfiles en tu equipo» con sus salidas (HU-100),
**cuando** toco «Pedir un perfil a medida»,
**Entonces** llego al pedido a medida con el Perfil Objetivo que tenga en este dispositivo
**Y** el borrador de la solicitud de equipo que había diligenciado sigue guardado en este navegador, sin enviarse (HU-197)

### Edge case — llego desde el equipo vacío sin Perfil Objetivo en este dispositivo

**Dado** que mi equipo está vacío, este navegador no tiene ningún Perfil Objetivo guardado y veo «Todavía no tienes perfiles en tu equipo»,
**cuando** toco «Pedir un perfil a medida»,
**Entonces** llego al pedido a medida con el Perfil Objetivo vacío, sin criterios inventados
**Y** el pedido me indica que elija al menos rol y seniority antes de enviar (HU-075)

### Error — elegí una categoría, no un rol

**Dado** que en la pregunta de encuadre elegí la categoría «Datos y analítica», que hoy no tiene perfiles publicados,
**cuando** toco «Pedir el perfil a medida»,
**Entonces** llego al pedido a medida con «Datos y analítica» como criterio
**Y** el portal me pide elegir un rol de esa categoría antes de enviar, porque sin rol no sabemos a quién buscar (HU-075)

## Notas

**Nace el 2026-10-02 en la discovery de EP-010** para cerrar tres entradas al camino del cero que otras épicas dejaron explícitamente para EP-010, sin cablear:
- **Criterio recibido de EP-001** (DoR de EP-001, 2026-09-28, decisión del PO, `epicas.md` §EP-010): cuando una opción de la pregunta de encuadre no tiene perfiles publicados, la pantalla ofrece además **pedir el perfil a medida (RF-14.3)**. HU-093 lo dejó escrito: *«se añade a esta pantalla cuando se construya EP-010»*.
- **Cero por facetas de EP-002** (HU-223, discovery paralela del 2026-10-02): su nota deja abierta la frontera con EP-010 con dos opciones —(a) seguir el precedente de HU-093: EP-010 añade la salida «a medida» a esa pantalla; (b) adelantarla a EP-002—. Esta historia construye la (a) **dentro de EP-010**, sin quitar nada a EP-002; si el sponsor elige (b), este escenario se mueve a EP-002 sin cambiar. Mientras EP-010 no exista, HU-223 no promete el plazo de 10 días hábiles.
- **D121** (sponsor, 2026-10-02): no hay solicitud de equipo sin perfiles; el camino es «a medida». HU-100 dice: *«el acceso a ese camino desde este aviso lo cablea HU-077 cuando exista la pantalla del cero»*. HU-077 ya tenía cinco escenarios, así que el cableado vive aquí.

**Partición, no recorte.** Las tres salidas ya estaban comprometidas; cambian de historia, no de alcance.

**Toca código de otras épicas.** La pantalla de encuadre es de EP-001 (HU-093, construida), el aviso del cero por filtros de EP-002 (HU-223) y el aviso de equipo vacío de EP-005 (HU-100). Esta historia añade la acción en cada una sin cambiar sus otros criterios: el encuadre sigue ofreciendo «Ampliar la búsqueda».

**Perfil Objetivo por dispositivo (RF-13.4).** Desde el equipo vacío llega lo que el dispositivo tenga; si no tiene nada, el pedido a medida pide rol y seniority como en HU-075.

## Trazabilidad

Épica madre: **EP-010** · PRD v4.18 · RF-14.3 · RF-1.3 · RF-13.4 · §6.3 · D121 (sponsor, 2026-10-02) · criterio recibido de EP-001 (2026-09-28) · depende de HU-075 y HU-077 (pantalla y envío del pedido a medida), HU-093 (encuadre, EP-001), HU-223 (cero por filtros, EP-002) y HU-100 (equipo vacío, EP-005)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: añade una acción a tres pantallas de otras épicas y lleva a la pantalla de HU-075/HU-077; los escenarios de HU-223 (EP-002) y HU-100 (EP-005) necesitan esas pantallas construidas: el DoR de EP-010 verifica ese orden |
| N | Negociable | ✓ fija que las tres salidas existen y que lo elegido viaja como criterio; textos y ubicación del botón son negociables |
| V | Valiosa | ✓ el cliente que choca con una opción vacía o un equipo vacío tiene una salida que convierte, en lugar de abandonar |
| E | Estimable | ✓ S: tres botones y el paso de los criterios elegidos al Perfil Objetivo |
| S | Pequeña | ✓ S: una capacidad (entrar al pedido a medida desde otra pantalla) en cinco escenarios |
| T | Testeable | ✓ un banco sembrado sin perfiles de un rol y de una categoría, dos filtros que dejan cero y un equipo vacío dan navegación y criterios observables |
