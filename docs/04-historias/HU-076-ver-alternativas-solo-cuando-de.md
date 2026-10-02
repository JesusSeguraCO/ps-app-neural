---
id: HU-076
titulo: "Ver alternativas solo cuando de verdad se parecen"
epica: EP-010
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-075, HU-118, HU-174]
---

# HU-076 — Ver alternativas solo cuando de verdad se parecen

**Como** líder de proyecto que no encontró lo que buscaba,
**quiero** que el portal me muestre perfiles cercanos únicamente si fallan un solo criterio obligatorio, y que me diga cuál,
**para** no perder la confianza en el banco por culpa de sugerencias que no tienen que ver con lo que pedí.

## Criterios de aceptación

### Happy path — lo más cercano dice qué falla

**Dado** que ningún perfil publicado cumple mis cinco obligatorios («Backend Java», «Senior», «Inglés B2», «Presencial», «Medellín») y PS-0142 los cumple todos menos «Presencial», porque acepta híbrido,
**cuando** se muestra la pantalla de cero,
**Entonces** veo a PS-0142 bajo «Lo más cercano · fallan exactamente un obligatorio»
**Y** su tarjeta dice «Falla Modalidad» y muestra criterio por criterio ✓ o – con el dato que lo sustenta, sin porcentajes
**Y** la visita registra el evento «cercanos mostrados» con el número de perfiles cercanos y los criterios que fallan (HU-167)

### Edge case — solo entra quien falla uno

**Dado** que tengo tres obligatorios y ningún perfil publicado cumple los tres,
**cuando** se muestra la pantalla de cero,
**Entonces** cada perfil aparece o no en «Lo más cercano» según la tabla

| Obligatorios que falla el perfil | ¿Aparece en «Lo más cercano»? |
|---|---|
| 1 | sí, con el criterio que falla |
| 2 | no |
| 3 | no |

### Error — no hay nada que de verdad se parezca

**Dado** que ningún perfil publicado cumple todos mis obligatorios y estoy en la situación de la tabla,
**cuando** se muestra la pantalla de cero,
**Entonces** no aparece ninguna sección de aproximaciones ni perfiles de relleno
**Y** la pantalla lleva directamente al pedido a medida (HU-077)
**Y** no se registra «cercanos mostrados»

| Situación |
|---|
| tengo tres obligatorios y ningún perfil falla exactamente uno |
| mi único obligatorio es el rol «Arquitectura de pagos» y ningún perfil publicado lo tiene |

### Edge case — muchos perfiles fallan uno solo

**Dado** que 7 perfiles publicados fallan exactamente un obligatorio,
**cuando** se muestra la pantalla de cero,
**Entonces** veo los 3 primeros, ordenados por cuántos deseables cumplen y, a igualdad, con el mismo desempate que usan los resultados del motor (HU-118)
**Y** veo «3 de 7 · Ver los otros 4», que al tocarlo muestra los otros cuatro en el mismo orden

## Notas

Cubre **RF-14.3** («lo más cercano») con la regla de **D-14** y **RF-13.9.4**: «lo más cercano» son los perfiles que **fallan exactamente un obligatorio**, y la tarjeta dice cuál. Verificable por el cliente y explicable por el comercial, cosa que un número calibrado nunca sería. La evidencia ✓/– por criterio es la determinista de **RF-13.10** (HU-174, motor único de EP-009); esta historia no redacta nada sobre el perfil (RF-16.1).

**Refinamiento 2026-10-02 (discovery de EP-010).** Los Given describen estado; se añaden la tabla del límite (falla 1 / 2 / 3), el evento «cercanos mostrados» que lee HU-170 y el orden de la lista.

**Elegidas por el modelo por delegación del sponsor (2026-10-02):**
- **Con un solo obligatorio no hay «lo más cercano».** Fallar el único obligatorio es no cumplir ninguno: todo el banco «fallaría uno» y la sección sería relleno, justo lo que el «en contra» de RF-14.3 llama peor que no mostrar nada. Misma lógica que HU-210 (EP-009) para los relacionados.
- **Cuántos se ven de entrada: 3**, con «Ver los otros N» (prototipo `cero-resultados--cercanos`). Es el tope del edge «muchos apenas por encima»; no oculta ninguno: todos se pueden ver.
- **Orden:** más deseables cumplidos primero (RF-13.9.3) y, a igualdad, el desempate del motor de resultados, para no inventar un segundo criterio de orden.

**«Sumar al equipo»** desde una tarjeta cercana es la capacidad de HU-192 (EP-004); aquí solo se muestra.

## Trazabilidad

Épica madre: **EP-010** · PRD v4.18 · RF-14.3 · RF-13.9.3 · RF-13.9.4 · RF-13.10 · D-14 · ADR-0006 (H32, `cercanos_mostrados`) · prototipo `cero-resultados--cercanos` · depende de HU-075, HU-118 y HU-174 (EP-009) · relacionada con HU-170, HU-192 y HU-210 (relacionados con coincidencias, EP-009)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se monta sobre la pantalla de cero de HU-075 y usa la evidencia del motor único de EP-009; no depende del pedido a medida |
| N | Negociable | ✓ fija la regla «falla exactamente un obligatorio», que la tarjeta diga cuál y que sin cercanos no haya relleno; el número inicial (3) y la presentación son negociables |
| V | Valiosa | ✓ ofrece una salida real dentro del banco sin dañar la confianza con parecidos falsos |
| E | Estimable | ✓ M: una consulta más al motor (perfiles que fallan uno), orden, corte a 3 con expansión y un evento |
| S | Pequeña | ✓ M: una sección de la pantalla en cuatro escenarios |
| T | Testeable | ✓ banco sembrado con perfiles que fallan 1, 2 y 3 obligatorios, sin ninguno que falle uno, con un solo obligatorio que nadie cumple y con 7 que fallan uno dan secciones, órdenes y eventos observables |
