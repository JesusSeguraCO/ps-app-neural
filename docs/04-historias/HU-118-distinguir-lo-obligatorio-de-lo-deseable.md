---
id: HU-118
titulo: "Distinguir lo que no puedo negociar de lo que sería bueno tener"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: referencias-juicebox
prd_version: 4.18
depende_de: [HU-209]
---

# HU-118 — Distinguir lo que no puedo negociar de lo que sería bueno tener

**Como** líder de proyecto que está afinando lo que necesita,
**quiero** marcar cada criterio como obligatorio o deseable,
**para** que un requisito deseable ordene los resultados en lugar de dejarme sin ninguno.

## Criterios de aceptación

### Happy path — por omisión solo el rol es obligatorio

**Dado** que el banco tiene 12 perfiles de Desarrollador Frontend, 5 de ellos con experiencia declarada en Banca
**Cuando** envío «frontend con react para banca»
**Entonces** «Desarrollador Frontend» queda obligatorio y «React» y «Banca» quedan deseables
**Y** veo los 12 perfiles, ordenados por cuántos de los 2 deseables cumple cada uno, y cada tarjeta dice «cumple N de 2 deseables»

### Happy path — endurecer un criterio

**Dado** que tengo «Desarrollador Frontend» obligatorio, «Banca» deseable y 12 perfiles
**Cuando** marco «Banca» como obligatorio
**Entonces** quedan los 5 perfiles con Banca y el panel dice «5 perfiles cumplen lo obligatorio»
**Y** las tarjetas ya no cuentan «Banca» entre los deseables

### Error — ningún perfil cumple los obligatorios

**Dado** que tengo «Desarrollador Frontend» y «Banca» obligatorios con 5 perfiles, ninguno Líder técnico
**Y** que el banco tiene 2 Desarrolladores Frontend Líder técnico sin Banca y 1 Líder técnico con Banca de otro rol
**Cuando** marco «Líder técnico» como obligatorio
**Entonces** no veo ningún perfil como coincidencia y el panel dice «Ningún perfil cumple los 3 obligatorios»
**Y** el panel ofrece pasar cada obligatorio a deseable con cuántos perfiles quedarían: «Seniority · 5», «Sector · 2» y «Rol · 1»

### Edge case — nada obligatorio

**Dado** que el banco tiene 38 perfiles publicados y tengo «React» y «Banca» como deseables
**Cuando** paso «Desarrollador Frontend» de obligatorio a deseable
**Entonces** veo los 38 perfiles ordenados por cuántos de los 3 deseables cumple cada uno
**Y** no veo una lista vacía

## Notas

Cubre **RF-13.9** (obligatorio reduce, deseable ordena), **RF-13.9.1**, **RF-13.9.2** (por omisión solo el rol es obligatorio), **RF-13.9.3** (orden por deseables cumplidos y «cumple N de M deseables» en la tarjeta) y **RF-13.9.4** en su parte de EP-009 (el cero se activa solo cuando ningún perfil cumple los obligatorios). Tomado de Juicebox, que separa filtros de criterios (evidencia A): Juicebox ordena 1.200 resultados; nosotros necesitamos no quedar en cero con un banco de decenas.

**Refinada el 2026-10-02 (discovery de EP-009)**, de `prototipado` a `lista`. Valores comprobables con un banco sembrado. El antiguo «veo quién falla exactamente un obligatorio, indicando cuál» se reparte sin perderse: con coincidencias directas, la sección «Relacionados» es **HU-210**; sin ellas, «lo más cercano» de la pantalla del cero es **EP-010** (HU-076, RF-14.3). El aviso único con etiquetas removibles es **HU-209**; aquí queda la oferta de pasar a deseable con su conteo, que es lo propio de esta historia (prototipo `perfil-objetivo--combinacion-vacia`).

**Decisión por delegación del sponsor (elegida por el modelo):** el conteo «quedarían N» de cada obligatorio es el número de perfiles que cumplen los demás obligatorios; lo calcula el mismo motor. La evidencia ✓/– de cada criterio en tarjeta y ficha la dibuja HU-119 (EP-003) y la conecta al motor HU-174.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.9 · RF-13.9.1 · RF-13.9.2 · RF-13.9.3 · RF-13.9.4 · ADR-0004 (motor único) · depende de HU-209 (misma épica) · habilita HU-174 y HU-071 · relacionada con HU-210, HU-119 (EP-003) y HU-076 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada del motor (HU-209, misma épica) |
| N | Negociable | ✓ son fijos el efecto de cada marca, el valor por omisión, el orden por deseables y el conteo sin porcentajes; el control visual se negocia |
| V | Valiosa | ✓ el cliente endurece solo lo que no negocia y no se queda sin resultados por un deseable |
| E | Estimable | ✓ M: la marca por criterio en el estado, el orden y los conteos de `evaluar()` y la oferta de pasar a deseable |
| S | Pequeña | ✓ M: cuatro escenarios |
| T | Testeable | ✓ unitarios del motor y e2e con 38 perfiles sembrados: conteos y orden exactos en cada paso |
