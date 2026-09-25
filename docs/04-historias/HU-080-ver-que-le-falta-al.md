---
id: HU-080
titulo: "Ver qué le falta al equipo que estoy armando"
epica: EP-004
prioridad: media
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-080 — Ver qué le falta al equipo que estoy armando

**Como** líder de proyecto que está seleccionando varios perfiles,
**quiero** que el portal me señale los roles ausentes en la composición que llevo,
**para** no descubrir en la sesión de alineación que me faltaba un rol clave del proyecto.

## Criterios de aceptación

### Happy path — vacío señalado en tono informativo

**Dado** que llevo dos perfiles de desarrollo y ninguno de pruebas,
**cuando** reviso mi equipo,
**Entonces** veo una observación que describe la composición actual y los roles ausentes
**Y** la observación no propone perfiles concretos ni incluye llamados a la acción de venta

### Error — composición sin patrón conocido

**Dado** que mi selección no corresponde a ninguna composición típica,
**cuando** reviso mi equipo,
**Entonces** no veo ninguna observación inventada
**Y** el resumen del equipo se muestra normalmente

### Edge case — el cliente ignora la observación

**Dado** que vi la observación de vacío y aun así envío la solicitud,
**cuando** envío,
**Entonces** la solicitud se procesa sin fricción adicional
**Y** la observación mostrada queda registrada para la sesión de alineación


## Notas

Cubre RF-14.6. El tono informativo es requisito y no estilo: en una relación de expansión de cuenta, sugerir roles no pedidos se lee como venta cruzada.



## Trazabilidad

Épica madre: **EP-004** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
