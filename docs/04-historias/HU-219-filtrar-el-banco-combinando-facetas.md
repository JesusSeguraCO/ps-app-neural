---
id: HU-219
titulo: "Filtrar el banco combinando facetas y viendo cuántos perfiles deja cada opción"
epica: EP-002
prioridad: alta
complejidad: M
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-167]
---

# HU-219 — Filtrar el banco combinando facetas y viendo cuántos perfiles deja cada opción

**Como** líder de área que amplió la búsqueda al banco completo,
**quiero** combinar filtros de rol, categoría, seniority, tecnología, sector, modalidad y disponibilidad viendo cuántos perfiles deja cada opción antes de marcarla,
**para** acotar el banco a lo que necesita mi proyecto sin probar a ciegas combinaciones que terminan en cero.

## Criterios de aceptación

### Happy path — combinar dos facetas

**Dado** que estoy en «Todo el banco» con 23 perfiles publicados, 9 de ellos con el rol «Desarrollador backend» y 4 de esos 9 con la banda «Disponible ahora»,
**cuando** marco «Desarrollador backend» en la faceta Rol,
**Entonces** veo los 9 perfiles backend en menos de 1 segundo y sin que la página se recargue
**Y** la opción «Disponible ahora» de la faceta Disponibilidad muestra 4
**Y** queda registrado en la visita un evento «filtros aplicados» con la faceta Rol y el valor «Desarrollador backend»

### Happy path — dos valores de la misma faceta suman, facetas distintas acotan

**Dado** que tengo marcada la tecnología «Java» y el banco tiene 7 perfiles con Java, 5 con Kotlin y 2 con las dos,
**cuando** marco también «Kotlin» en la faceta Tecnología,
**Entonces** veo 10 perfiles: los que tienen alguna de las dos
**Y** la faceta Tecnología dice «basta con que tenga alguna»

### Error — una opción no deja ningún perfil con lo que ya marqué

**Dado** que tengo marcado «Desarrollador backend» y ningún perfil backend publicado declara el sector «Seguros»,
**cuando** abro la faceta Sector,
**Entonces** «Seguros» aparece con 0, a la vista y sin deshabilitar
**Y** las demás opciones del sector muestran cuántos perfiles backend dejarían

### Edge case — las siete facetas, con los valores que el banco publicado tiene

**Dado** que el catálogo del panel tiene el sector «Minería» y ningún perfil publicado lo declara,
**cuando** abro el panel de facetas en «Todo el banco»,
**Entonces** veo siete facetas: Rol, Categoría, Seniority, Tecnología, Sector, Modalidad y Disponibilidad
**Y** cada faceta ofrece solo los valores que tiene al menos un perfil publicado, así que «Minería» no aparece
**Y** la Disponibilidad se ofrece por bandas de arranque, nunca por fechas

### Edge case — llegar desde la pregunta de encuadre

**Dado** que elegí la categoría «Datos» en la pregunta de encuadre de un enlace sin selección (HU-093),
**cuando** carga el banco,
**Entonces** veo «Datos» marcada en la faceta Categoría y los perfiles de esa categoría
**Y** puedo añadir otras facetas sobre ella sin volver al encuadre

## Notas

Cubre **RF-2.3** (las siete facetas mínimas) y la primera mitad de **RF-2.4** (filtros combinables con contador por opción). Las etiquetas removibles, segunda mitad de RF-2.4, son de **HU-220**. Tomado de LinkedIn Recruiter (facetas combinables con lógica clara) y de Airbnb (contador antes de aplicar), §6.4.

**Decisiones elegidas por el modelo por delegación del sponsor** (opción conservadora coherente con el PRD; revisables en el PR):
- **Lógica:** dentro de una faceta vale *cualquiera* de los valores marcados; entre facetas distintas se exigen todas. Es la regla de RF-13.8.1 para tecnologías aplicada a todas las facetas, y la que menos ceros produce en un banco de decenas.
- **Contador:** el número de cada opción es **cuántos perfiles vería si la marco**, calculado contra lo ya marcado en las demás facetas (opciones consecuentes, RF-13.7). Contador y resultados salen del **mismo cálculo** (RF-13.8): nunca pueden discrepar.
- **Una opción en 0 se muestra y se puede marcar** (entre facetas distintas se exigen todas, como prueba el primer escenario). Restringir el panel a lo que hoy deja resultados lo volvería una jaula y destruiría el camino del cero (RF-13.7.2). Marcarla lleva al aviso de HU-223.
- **Solo valores del banco publicado.** Un valor del catálogo que ningún perfil publicado declara no se ofrece: no informa nada.
- **Ámbito:** las facetas operan en «Todo el banco» (RF-2.2). La selección curada se presenta como conjunto y no se filtra (§2.5, RF-2.1); el filtro por las categorías de la selección de EP-001 sigue como está.
- **Disponibilidad por banda** (RF-3.13): el cliente solo tiene bandas, nunca fechas (ADR-0004, QA-5).

**Reemplaza el filtro de una sola opción de EP-001** (`packages/dominio/src/catalogo/encuadre.ts`), como anticipaba HU-093: los enlaces `?categoria=` y `?rol=` que genera el encuadre siguen abriendo el banco filtrado, ahora como facetas marcadas.

**Capa determinista.** El filtrado y los contadores son lógica pura sin E/S en `packages/motor` (ADR-0004). EP-009 añade sobre el mismo cálculo la distinción obligatorio/deseable (HU-118) y el motor único de criterios (HU-174); esta historia no la presupone y se prueba sin EP-009.

**Medición.** El evento «filtros aplicados» lo emite esta historia contra el contrato versionado de **HU-167** (EP-008); es la fuente de HU-110 y de la métrica de la épica (al menos 50 % de sesiones con filtro propio). El orden respecto de la instrucción lo deriva HU-110 del contador de la visita.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-2.3 · RF-2.4 (contador) · RF-13.7 · RF-13.7.2 · RF-13.8 · RF-13.8.1 · RF-3.13 · RF-7.1 · §6.4 · ADR-0004 · depende de HU-167 (contrato de eventos) · reemplaza el filtro de una opción de HU-093 · relacionada con HU-220, HU-223, HU-074, HU-110 y HU-118

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: el filtrado se construye sobre el catálogo publicado de EP-001/EP-006; solo el evento depende del contrato de HU-167. No necesita EP-009 |
| N | Negociable | ✓ fija las siete facetas, la lógica cualquiera/todas, el contador consecuente y que el 0 se pueda marcar; la forma del panel, el orden de las facetas y los textos son negociables |
| V | Valiosa | ✓ es el control que repone la sensación de dominio sobre el banco (RF-14.2) y la base de toda la épica |
| E | Estimable | ✓ M: siete facetas sobre campos que el catálogo ya publica (`PerfilCatalogo`), un cálculo puro de conteos y el reemplazo del filtro de EP-001 |
| S | Pequeña | ✓ M: una capacidad (filtrar con contador) en cinco escenarios; etiquetas, orden, URL y cero van en historias propias |
| T | Testeable | ✓ un banco sembrado con conteos conocidos da resultados, contadores y eventos exactos; el tiempo de respuesta se mide en e2e |
