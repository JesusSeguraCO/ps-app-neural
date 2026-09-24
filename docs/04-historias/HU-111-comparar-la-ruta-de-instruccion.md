---
id: HU-111
titulo: "Comparar la ruta de instrucción con la de filtros"
epica: EP-008
prioridad: media
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-111 — Comparar la ruta de instrucción con la de filtros

**Como** responsable del producto,
**quiero** ver cómo se comporta cada ruta de entrada,
**para** decidir con datos si la maquinaria de búsqueda se gana su lugar.

## Criterios de aceptación

### Happy path

**Dado** que hubo sesiones por ambas rutas,
**cuando** abro el informe,
**Entonces** veo tiempo hasta el primer perfil, fichas abiertas y solicitudes por ruta
**Y** veo el uso de filtros después de una instrucción

### Error — una ruta sin datos suficientes

**Dado** que apenas hubo sesiones por una de ellas,
**cuando** reviso,
**Entonces** el informe lo advierte
**Y** no se presenta una comparación como concluyente cuando no lo es

### Edge case — la misma sesión usa las dos

**Dado** que alguien escribe una instrucción y luego filtra,
**cuando** se registra,
**Entonces** cuenta como ruta de instrucción con uso posterior de filtros
**Y** que es justamente la prueba de falsación de RF-14.2


## Notas

Cubre RF-7.1 y la regla de decisión de §14.7. Es la versión con datos reales de lo que las sesiones con clientes solo pueden insinuar con tres personas.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
