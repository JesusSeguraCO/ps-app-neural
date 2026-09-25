---
id: HU-120
titulo: "Comparar perfiles sin perder la lista"
epica: EP-003
prioridad: alta
complejidad: M
estado: prototipado
fase: referencias-juicebox
prd_version: 4.1
---

# HU-120 — Comparar perfiles sin perder la lista

**Como** líder de proyecto revisando varios perfiles seguidos,
**quiero** abrir la ficha sobre los resultados y pasar al siguiente perfil sin volver atrás,
**para** comparar rápido sin perder dónde estaba.

## Criterios de aceptación

### Happy path — panel lateral con navegación

**Dado** que tengo una lista de resultados,
**cuando** abro un perfil,
**Entonces** la ficha se abre como panel lateral sobre la lista
**Y** puedo pasar al perfil anterior o siguiente sin cerrarla
**Y** veo en qué posición del conjunto estoy

### Happy path — sumar desde el panel

**Dado** que tengo la ficha abierta,
**cuando** sumo el perfil a mi equipo,
**Entonces** se suma sin cerrar el panel
**Y** puedo seguir revisando

### Error — primer o último perfil

**Dado** que estoy en el primero o en el último,
**cuando** miro la navegación,
**Entonces** la flecha correspondiente está deshabilitada
**Y** no se produce ningún salto inesperado

### Edge case — móvil

**Dado** que estoy en un teléfono,
**cuando** abro un perfil,
**Entonces** el panel ocupa la pantalla completa
**Y** conserva la navegación entre perfiles

## Notas

Tomado de Juicebox (evidencia A). Reemplaza la navegación a pantalla completa, que obligaba a ir y volver por cada perfil.

Cubre RF-13.11.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.1

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
