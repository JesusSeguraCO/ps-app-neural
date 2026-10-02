---
id: HU-110
titulo: "Ver qué filtros usan realmente los clientes"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-167]
---

# HU-110 — Ver qué filtros usan realmente los clientes

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** ver qué facetas y qué valores usan los clientes al refinar, y qué parte de las visitas aplica un filtro propio más allá del conjunto curado,
**para** retirar los filtros que nadie toca y saber si el refinamiento se usa como el PRD esperaba.

## Criterios de aceptación

### Happy path — uso por faceta y por valor

**Dado** que hubo visitas de clientes con filtros aplicados en el período,
**cuando** abro el uso de filtros,
**Entonces** veo cada faceta con cuántas visitas la usaron y qué valores eligieron
**Y** veo qué facetas no se usaron ni una vez

### Happy path — visitas que refinan por su cuenta

**Dado** que hubo visitas que llegaron por un enlace con conjunto curado,
**cuando** abro el uso de filtros,
**Entonces** veo qué proporción de esas visitas aplicó al menos un filtro propio más allá del conjunto curado, junto a la meta de EP-002 del 50 %

### Error — período sin uso de filtros

**Dado** que ninguna visita aplicó filtros en el período,
**cuando** abro el uso de filtros,
**Entonces** veo un mensaje que dice que no hubo uso de filtros en el período
**Y** el informe no presenta ceros como si fueran un hallazgo

### Edge case — filtros aplicados después de una instrucción

**Dado** que una visita escribió una instrucción y después filtró,
**cuando** reviso el uso de filtros,
**Entonces** ese uso aparece separado del de las visitas que solo filtraron
**Y** puedo leer qué facetas se tocan después de instruir

## Notas

Cubre la **primera mitad de RF-7.2** (*reporte de filtros más usados*) y la **métrica de éxito de EP-002** (*al menos el 50 % de las sesiones aplican un filtro propio más allá del conjunto curado*). La segunda mitad de RF-7.2 —búsquedas sin resultados— la cubren HU-172 (top 10 mensual) y HU-078 en EP-010 (registro de demanda, D-13). Vista `v_filtros_usados` de ADR-0006. Las visitas internas no cuentan (HU-167).

**Esta historia reemplazó el 2026-09-22 a una HU-110 anterior** que duplicaba a HU-078. En el mapa de historias la fila de HU-110 conserva todavía el título antiguo («Ver qué pidieron las cuentas y no teníamos ⚠ duplicada»); hay que actualizar el mapa.

**El edge es el que le da valor real.** RF-14.2 subordinó las facetas a la instrucción, y §14.7 fija la prueba que puede tumbar esa decisión. Saber **qué** filtros se usan después de instruir es más fino que saber cuántos: si lo que la gente toca es disponibilidad y no rol, la instrucción acierta en lo importante y falla en lo operativo, que es una conclusión distinta de «las facetas ganaron». La regla del 50 % de RF-14.2 la aplica HU-111.

**Fuente.** El evento «filtros aplicados» lo emite EP-002 desde sus pantallas (HU-074 ya pide registrar el filtro posterior a una instrucción); el orden respecto de la instrucción sale del contador de la visita (ADR-0006). Mientras EP-002 no emita, el informe dice «aún no se mide».

**Se distingue de HU-111**, que compara las dos rutas de entrada a nivel de conversión. Esta mira dentro del refinamiento.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.2 (primera mitad) · RF-14.2 · métrica de éxito de EP-002 · ADR-0006 (`v_filtros_usados`) · relacionada con HU-074, HU-078, HU-111 y HU-172 · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lectura sobre el contrato de HU-167; los datos reales llegan con EP-002 y hasta entonces lo declara. Ya no duplica a HU-078 |
| N | Negociable | ✓ describe la lectura y la meta de EP-002, no el formato del informe |
| V | Valiosa | ✓ permite retirar facetas muertas, mide la métrica de EP-002 y alimenta la lectura de la Fase 2 |
| E | Estimable | ✓ S: conteo por faceta y valor, una proporción por visita y una separación por orden respecto de la instrucción |
| S | Pequeña | ✓ S: una lectura en cuatro escenarios |
| T | Testeable | ✓ visitas fijadas que filtran, que no filtran, que solo navegan el conjunto curado y que filtran tras instruir dan conteos esperados |
