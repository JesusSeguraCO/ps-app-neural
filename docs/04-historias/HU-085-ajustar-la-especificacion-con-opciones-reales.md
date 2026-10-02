---
id: HU-085
titulo: "Ajustar mi especificación con las opciones que el banco realmente tiene"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-070, HU-209]
---

# HU-085 — Ajustar mi especificación con las opciones que el banco realmente tiene

**Como** líder de área que está afinando lo que necesita,
**quiero** ajustar cada campo del Perfil Objetivo eligiendo entre opciones coherentes con lo que ya seleccioné, con su conteo real, y poder añadir lo que el banco no tiene,
**para** no tener que adivinar cómo nombra Trycore las cosas ni descubrir al final que mi combinación no existe.

## Criterios de aceptación

### Happy path — la cascada acota las opciones con su conteo

**Dado** que el banco tiene 12 perfiles de Desarrollador Frontend (React 11, TypeScript 9, Next.js 5, Angular 3, Vue.js 2) y 14 de Desarrollador Backend (Java 10, Kafka 4)
**Cuando** elijo la familia de rol «Desarrollador Frontend»
**Entonces** el campo de tecnologías ofrece «React · 11», «TypeScript · 9», «Next.js · 5», «Angular · 3» y «Vue.js · 2», y no ofrece Java ni Kafka
**Y** las opciones de seniority, sector y modalidad muestran cuántos perfiles quedan con lo ya elegido
**Y** veo el acceso «Ver todas las tecnologías del banco»

### Happy path — añadir una necesidad que el banco no cubre

**Dado** que elegí «Desarrollador Frontend» y «React»
**Cuando** añado «Web Components», que no existe en el banco
**Entonces** queda marcada «no está en el banco · no filtra; viaja con tu solicitud como necesidad no cubierta»
**Y** los resultados y el contador no cambian, y ninguna tarjeta muestra una línea de evidencia para «Web Components»

### Error — escribo a mano algo que el banco sí tiene

**Dado** que elegí «Desarrollador Frontend» y el banco tiene «TypeScript · 9»
**Cuando** escribo «typescript» en «Añadir»
**Entonces** se marca la opción del banco «TypeScript · 9»
**Y** no se crea ninguna necesidad «no está en el banco» con ese nombre

### Edge case — cambio de familia con tecnologías ya elegidas

**Dado** que tengo «React» y «TypeScript» marcadas como deseables con «Desarrollador Frontend»
**Cuando** cambio la familia de rol a «Desarrollador Backend»
**Entonces** «React» y «TypeScript» siguen visibles, señaladas «ningún Desarrollador Backend la tiene», con «Quitar» a un toque
**Y** no se borran en silencio

### Edge case — un campo con una sola opción no es filtro

**Dado** que los 38 perfiles publicados tienen los países de la tabla
**Cuando** abro el Perfil Objetivo
**Entonces** el país del profesional aparece o no como filtro según la tabla, y cada tarjeta muestra su país en todos los casos

| Países de los perfiles publicados | Filtro de país del profesional |
|---|---|
| Colombia 38 | no aparece |
| Colombia 37 · México 1 | aparece con «Colombia · 37» y «México · 1» |

## Notas

Cubre **RF-13.7** (opciones consecuentes con el conteo real del banco), **RF-13.7.1** (tecnologías es selección múltiple, nunca texto libre), **RF-13.7.2** (dos niveles: primero lo del banco, y se puede añadir lo que no tenemos, marcado como no disponible), **RF-13.7.3** (lo que no está en el banco no filtra pero viaja a la solicitud, HU-211, y al registro de demanda, EP-010) y **RF-13.5.5** (un filtro con una sola opción no se ofrece; la misma regla de opciones consecuentes). La mitigación del «en contra» de RF-13.7 (la cascada puede ocultar opciones) es el acceso a la lista completa del banco con su conteo.

**Refinada el 2026-10-02 (discovery de EP-009).** El antiguo error «combinación sin ningún perfil» pasa a **HU-209** (el aviso único a nivel de panel es del motor único, RF-13.8.2); aquí queda el error propio de la cascada.

**Decisiones por delegación del sponsor (elegidas por el modelo):**
- **Conteo de una opción** = perfiles que cumplen los obligatorios actuales más esa opción, calculado por el mismo motor (como el prototipo, «Senior · 2 con lo demás»).
- **Al cambiar de familia**, las tecnologías que ya no corresponden **siguen aplicadas como deseables** hasta que el cliente las quite (no se pierde nada en silencio; solo ordenan, no vacían).
- Lo escrito en «Añadir» se compara con la forma normalizada del catálogo y del léxico (HU-065): si existe, se usa la opción del banco.

**Fuente de diseño:** `docs/05-prototipo/pantallas/perfil-objetivo.html` («Basta con alguna de las marcadas», «Web Components no está en el banco») (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.7 · RF-13.7.1 · RF-13.7.2 · RF-13.7.3 · RF-13.5.5 · RF-8.16.7 (la relación rol–tecnologías emerge de los perfiles) · ADR-0004 (`opcionesConsecuentes()`) · depende de HU-070 y HU-209 (misma épica) · relacionada con HU-174, HU-211 y HU-153 (EP-003, país en la tarjeta)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas de la misma épica (panel y motor) |
| N | Negociable | ✓ son fijos los dos niveles, el conteo real, que lo ajeno no filtra y que nada se borra en silencio; disposición y textos se negocian |
| V | Valiosa | ✓ el cliente ve qué existe antes de pedirlo y lo que no existe queda como demanda |
| E | Estimable | ✓ M: `opcionesConsecuentes()` en el motor puro, normalización de lo escrito y el campo con dos niveles |
| S | Pequeña | ✓ M: cinco escenarios sobre los campos del panel |
| T | Testeable | ✓ unitarios del motor con banco sembrado (conteos exactos) y e2e de la cascada, el añadido, el cambio de familia y el filtro de país con uno y dos países |
