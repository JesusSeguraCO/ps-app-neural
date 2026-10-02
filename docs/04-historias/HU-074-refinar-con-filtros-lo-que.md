---
id: HU-074
titulo: "Refinar con filtros lo que la instrucción me devolvió"
epica: EP-002
prioridad: alta
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-219, HU-220]
---

# HU-074 — Refinar con filtros lo que la instrucción me devolvió

**Como** líder de área que ya tiene resultados de una instrucción escrita en sus propias palabras,
**quiero** añadir filtros sobre esos resultados sin perder lo que la instrucción entendió,
**para** recuperar el control cuando la instrucción devuelve más de lo que puedo revisar.

## Criterios de aceptación

### Happy path — un filtro añadido sobre la instrucción

**Dado** que mi instrucción quedó interpretada como rol «Desarrollador backend» y tecnología «Java», con 11 perfiles en los resultados,
**cuando** marco «Disponible ahora» en la faceta Disponibilidad,
**Entonces** veo los 4 de esos 11 que además están disponibles ahora
**Y** veo los criterios de la instrucción bajo «Tu instrucción» y el filtro bajo «Filtro añadido», como dos grupos distintos
**Y** en el recorrido de la visita el evento «filtros aplicados» queda después del evento de la instrucción

### Alterno — quitar todos los filtros conserva la instrucción

**Dado** que tengo dos filtros añadidos sobre una instrucción que devolvía 11 perfiles,
**cuando** toco «Quitar todos los filtros»,
**Entonces** vuelvo a ver los 11 perfiles de la instrucción
**Y** el grupo «Tu instrucción» sigue a la vista con sus criterios

### Error — el filtro añadido deja cero, no la instrucción

**Dado** que mi instrucción devolvía 6 perfiles de desarrollo móvil y ninguno de ellos está disponible ahora,
**cuando** marco «Disponible ahora» en la faceta Disponibilidad,
**Entonces** veo el aviso del cero, que dice que lo causa el filtro añadido y que la instrucción sí tiene 6 perfiles
**Y** el aviso ofrece quitar ese filtro de un toque, con «quitarlo muestra 6», y la instrucción sigue intacta

### Edge case — filtrar sin instrucción previa

**Dado** que no escribí ninguna instrucción y estoy en «Todo el banco»,
**cuando** marco «Desarrollador backend» en la faceta Rol,
**Entonces** las facetas funcionan sobre el banco completo como en HU-219
**Y** no aparece ningún grupo «Tu instrucción»
**Y** el evento «filtros aplicados» queda en una visita sin evento de instrucción

## Notas

Cubre **RF-14.2** («Los filtros se subordinan a refinamiento posterior; no desaparecen», M-09). El último escenario preserva a propósito la ruta por facetas de principio a fin como condición de control para las sesiones con clientes.

**La prueba que puede tumbar la Fase 2.** RF-14.2 la fija: medir el uso de filtros después de una consulta por instrucción; si más de la mitad de las sesiones los usan, la jerarquía de la Fase 2 está mal planteada. Esta historia garantiza que el dato existe y es separable (el orden del evento respecto de la instrucción, ADR-0006). La lectura la hacen **HU-110** (qué facetas se tocan después de instruir) y **HU-111** (la regla del 50 %), en EP-008.

**Refinada el 2026-10-02 (discovery de EP-002), sin recortar alcance.** La versión anterior (PRD v2.0) tenía tres escenarios y dependencias sin declarar. Se precisan con datos concretos, se añade el escenario de «quitar todos conserva la instrucción» y el cero ahora dice qué lo causa (prototipo `cero-resultados--por-filtro`, «De dónde sale el cero»). El cero genérico por facetas, sin instrucción, pasó a **HU-223**; este escenario solo fija que el filtro no destruye la instrucción.

**Independiente de EP-009 por partición, como HU-119 (decisión elegida por el modelo por delegación del sponsor, mismo patrón que D87).** Escribir e interpretar la instrucción es **HU-065** y mostrar cómo se entendió es **HU-068** (EP-009). Esta historia **no** construye la instrucción: recibe en el estado de búsqueda los criterios que la instrucción produjo, marcados con su origen («instrucción»), y dibuja encima los filtros como una capa aparte. Se construye y verifica de punta a punta con un estado sembrado en la URL (contrato de HU-221) que trae criterios de origen «instrucción»; cuando EP-009 exista, HU-065 los produce y esta historia no cambia. El contrato del origen de cada criterio lo define el change de EP-002 en `packages/contratos` y lo consume EP-009.

**Frontera con EP-009.** Si el filtro añadido entra como obligatorio o como deseable lo decide el motor de criterios (RF-13.9, HU-118). Mientras EP-009 no exista, un filtro siempre acota (se comporta como obligatorio).

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-14.2 · §14.7 (prueba que puede tumbar la Fase 2) · RF-7.1 · ADR-0006 (orden de eventos en la visita) · depende de HU-219 y HU-220 · consume los criterios de origen «instrucción» que produce HU-065 (EP-009) · la lectura es de HU-110 y HU-111 (EP-008) · relacionada con HU-068, HU-118, HU-221 y HU-223

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita los filtros y etiquetas de HU-219 y HU-220 (misma épica); de EP-009 solo consume criterios ya resueltos, y se prueba con estado sembrado (patrón de HU-119) |
| N | Negociable | ✓ fija las dos capas, que quitar filtros no borra la instrucción y que el cero nombra su causa; los textos y la forma de los grupos son negociables |
| V | Valiosa | ✓ el cliente recupera el control sin perder lo escrito, y el portal produce el dato que decide si la Fase 2 se mantiene |
| E | Estimable | ✓ S: un origen por criterio en el estado, un grupo de etiquetas más en la barra de HU-220 y el texto del cero por origen |
| S | Pequeña | ✓ S: cuatro escenarios sobre superficies que construyen HU-219 y HU-220 |
| T | Testeable | ✓ un estado sembrado con criterios de origen «instrucción», un banco con conteos conocidos y el recorrido de la visita (HU-167) dan resultados, grupos y orden de eventos observables |
