---
id: HU-081
titulo: "Distinguir un perfil de otro por sus competencias verificadas"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 2.1
reemplaza_a: HU-079
---

# HU-081 — Distinguir un perfil de otro por sus competencias verificadas

**Como** líder de área comparando varios perfiles en la lista de resultados,
**quiero** ver en cada tarjeta las tres competencias que Trycore verificó de esa persona,
**para** distinguir un perfil de otro por cómo trabaja y no solo por su cargo y su lista de tecnologías.

## Criterios de aceptación

### Happy path — competencias como elemento diferenciador

**Dado** que estoy viendo los resultados de una búsqueda,
**cuando** miro cualquier tarjeta,
**Entonces** veo las tres competencias del Sello Personal de ese perfil
**Y** veo que están marcadas como verificadas por Trycore
**Y** veo que difieren entre un perfil y otro de la lista

### Error — perfil sin Sello Personal registrado

**Dado** que un perfil no tiene sus tres competencias cargadas,
**cuando** Talento Humano intenta publicarlo,
**Entonces** el panel impide la publicación
**Y** indica que el Sello Personal es obligatorio por ser condición de entrada del banco

### Edge case — dos perfiles con las mismas tres competencias

**Dado** que dos perfiles comparten exactamente las mismas competencias,
**cuando** aparecen juntos en los resultados,
**Entonces** la tarjeta se apoya en los demás elementos diferenciadores —seniority, sector, stack y disponibilidad—
**Y** no se muestra ninguna señal que sugiera que son perfiles equivalentes

## Notas

Reemplaza a **HU-079**, descartada al cerrarse D-15. El logro cuantificado no existe en el banco entregado por Talento Humano, su extracción tiene costo operativo recurrente y es autoreportado por naturaleza.

Las competencias del Sello Personal cumplen lo que el logro prometía sin ninguno de sus problemas: existen para el 100% de los perfiles porque el DISC es condición de entrada, las produce Trycore y no el candidato, no añaden mantenimiento, y son lo único de las tres validaciones que varía entre perfiles.

Cubre RF-14.0 y RF-14.1.

## Trazabilidad

Épica madre: **EP-003** · PRD v2.1 · Reemplaza HU-079

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia de la Fase 2 |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | ✓ usa un campo que ya existe en el modelo de datos |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
