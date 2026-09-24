---
id: HU-096
titulo: "Revisar mi equipo antes de pedirlo"
epica: EP-005
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.7
---

# HU-096 — Revisar mi equipo antes de pedirlo

**Como** líder de proyecto que seleccionó varios perfiles,
**quiero** ver el conjunto completo con sus roles y en cuánto tiempo puede arrancar,
**para** saber qué estoy pidiendo antes de pedirlo.

## Criterios de aceptación

### Happy path

**Dado** que tengo varios perfiles seleccionados,
**cuando** abro mi equipo,
**Entonces** veo cada perfil con su banda de disponibilidad
**Y** veo los roles cubiertos
**Y** veo en cuánto tiempo el conjunto completo podría estar operando, que es la banda del perfil más lejano

### Error — un perfil dejó de estar disponible

**Dado** que uno de los seleccionados se pausó,
**cuando** abro mi equipo,
**Entonces** ese perfil aparece señalado
**Y** puedo quitarlo o continuar sabiendo que cambió

### Edge case — equipo vacío

**Dado** que quité todos los perfiles,
**cuando** abro mi equipo,
**Entonces** veo una salida clara hacia los resultados
**Y** no veo una pantalla en blanco


## Notas

Cubre RF-4.3 y RF-4.5. La fecha del conjunto es la del perfil más tardío: es cuándo puede arrancar el equipo completo, no cuándo arranca el primero.

## Trazabilidad

Épica madre: **EP-005** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
