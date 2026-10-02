---
id: HU-082
titulo: "Decir en qué país y ciudad necesito el perfil"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-070, HU-198]
---

# HU-082 — Decir en qué país y ciudad necesito el perfil

**Como** líder de proyecto que necesita un perfil con presencia física en una sede,
**quiero** indicar el país y la ciudad donde se requiere el perfil y ver, en ese caso, la ciudad de cada profesional,
**para** que Trycore no me proponga gente que no puede estar donde el proyecto la necesita.

## Criterios de aceptación

### Happy path — ubicación obligatoria en presencial e híbrido

**Dado** que mi cuenta tiene sede en Bogotá y mi Perfil Objetivo no tiene modalidad
**Cuando** elijo la modalidad «Híbrido»
**Entonces** aparecen los campos de país y ciudad de la necesidad marcados como obligatorios y vacíos, sin prellenar con Bogotá
**Y** las tarjetas y las fichas de los resultados muestran la ciudad de cada profesional junto a su país, con «La logística concreta se cierra en la sesión de alineación»
**Y** la ciudad del profesional se ofrece como filtro solo si los resultados tienen más de una ciudad

### Error — solicitar presencial sin ubicación

**Dado** que mi modalidad es «Presencial 100%», no indiqué país y tengo 2 perfiles en «Mi equipo»
**Cuando** pulso «Enviar solicitud»
**Entonces** la solicitud no se envía y veo «Indica en qué país y ciudad se necesita el perfil»
**Y** todo lo demás que especifiqué y mi equipo siguen igual

### Edge case — necesidad remota

**Dado** que mi Perfil Objetivo tiene modalidad «Híbrido» y las tarjetas muestran la ciudad de cada profesional
**Cuando** cambio la modalidad a «Remoto»
**Entonces** cada tarjeta muestra el país del profesional y deja de mostrar su ciudad
**Y** los campos de país y ciudad de la necesidad siguen disponibles como opcionales y su ausencia no impide enviar la solicitud

### Edge case — la ciudad no se revela por la puerta de atrás

**Dado** que el banco tiene 20 perfiles publicados y «Desarrollador Frontend» obligatorio deja 12
**Cuando** cambio la modalidad a «Presencial 100%»
**Entonces** la ciudad aparece solo en las 12 tarjetas de los resultados
**Y** el servidor devuelve ciudades únicamente para esos 12 códigos, nunca para los otros 8

### Edge case — la ubicación de la necesidad no filtra perfiles

**Dado** que 12 perfiles cumplen lo obligatorio, todos con modalidades Remoto o Híbrido, y elegí la modalidad «Presencial 100%»
**Cuando** indico la ubicación Bogotá, Colombia
**Entonces** siguen los 12 perfiles y ninguna tarjeta muestra ✓ o – de modalidad ni de ubicación
**Y** veo «"Bogotá, Colombia" quedó como ubicación de la necesidad: no filtra perfiles»

## Notas

Cubre **RF-13.5** completo: **RF-13.5.1** (obligatoria en Presencial 100% o Híbrido, opcional en Remoto; la ubicación de la cuenta no se asume), **RF-13.5.2** (Presencial 100% como modalidad de la necesidad, que no se compara con lo que acepta el profesional), **RF-13.5.3** y **RF-13.5.5.1** (el país del profesional se publica siempre; la ciudad solo con necesidad presencial o híbrida, filtrable con más de un valor), **RF-13.5.5.2** (la ciudad se muestra sobre el conjunto que la necesidad devuelve, no sobre todo el banco) y **RF-13.5.6** (ciudad junto al país y la logística en la alineación). Que país y ciudad viajen a la solicitud es de **HU-211** (RF-13.5.4); al registro de demanda, de EP-010.

**Refinada el 2026-10-02 (discovery de EP-009).** Se corrige la nota anterior («la ciudad se carga sin publicarse»): la revisión de D-18 del 2026-09-18 publica la ciudad cuando la necesidad es presencial o híbrida, y la ficha ya lo decide con `armarFicha` (HU-158, EP-003); esta historia produce la necesidad declarada que hoy es «remota» por omisión. El país en la tarjeta es de **HU-153** (EP-003) y el país del profesional como filtro con más de un país publicado (RF-13.5.5) sigue la regla de opciones consecuentes de **HU-085**.

**Decisiones por delegación del sponsor (elegidas por el modelo, coherentes con el prototipo):**
- **La ubicación de la necesidad no filtra ni ordena perfiles**: decide qué se muestra (la ciudad) y viaja a la solicitud; la logística se cierra en la alineación (RF-13.5.6). Así lo dice el prototipo («quedó como ubicación de la necesidad: no filtra perfiles»).
- **Modalidad de la necesidad frente a la del profesional:** «Remoto» e «Híbrido» se comparan como deseables con las modalidades que acepta el profesional; **«Presencial 100%» no se compara** con nada (el banco no la registra, RF-13.5.2) y no produce línea de evidencia.
- **Ciudades por petición aditiva** (ADR-0004): `POST /api/v1/catalogo/ciudades` con los criterios completos, el servidor ejecuta el mismo motor y devuelve solo las de los resultados visibles (test de contrato «ciudades ⊆ resultados visibles»).

**Dependencia del envío:** el escenario de error valida antes de enviar la solicitud de **HU-198** (EP-005, lista).

**Fuente de diseño:** `docs/05-prototipo/pantallas/perfil-objetivo--ubicacion-obligatoria.html` y `solicitud-equipo--ubicacion-requerida.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.5 · RF-13.5.1 · RF-13.5.2 · RF-13.5.3 · RF-13.5.5.1 · RF-13.5.5.2 · RF-13.5.6 · D-18 (revisión 2026-09-18) · ADR-0004 (`/catalogo/ciudades`) · depende de HU-070 (misma épica) y HU-198 (EP-005) · relacionada con HU-153 y HU-158 (EP-003), HU-085 y HU-211

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el Perfil Objetivo (misma épica) y el botón de envío de HU-198 (EP-005, lista); la ficha ya condiciona la ciudad |
| N | Negociable | ✓ son fijos la obligatoriedad por modalidad, no prellenar con la cuenta, la ciudad solo en presencial o híbrido y solo sobre los resultados; los textos se negocian |
| V | Valiosa | ✓ el cliente con sede física recibe propuestas que pueden estar allí y Delivery sabe dónde se necesita |
| E | Estimable | ✓ M: dos campos condicionados, la regla de comparación de modalidad, la petición de ciudades con su test de contrato y la validación antes de enviar |
| S | Pequeña | ✓ M: cinco escenarios sobre una capacidad |
| T | Testeable | ✓ e2e con banco sembrado de 20 perfiles (ciudades distintas): campos obligatorios, ciudades visibles solo en los 12, respuesta del servidor inspeccionada y bloqueo del envío |
