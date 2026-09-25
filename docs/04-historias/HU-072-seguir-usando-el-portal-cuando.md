---
id: HU-072
titulo: "Seguir usando el portal cuando la interpretación falla"
epica: EP-009
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 2.0
---

# HU-072 — Seguir usando el portal cuando la interpretación falla

**Como** líder de área que entró a buscar un perfil con urgencia,
**quiero** obtener resultados aunque el servicio de interpretación no esté disponible,
**para** no quedarme sin poder usar el portal justo el día que lo necesito.

## Criterios de aceptación

### Happy path — degradación silenciosa

**Dado** que el servicio de interpretación no responde,
**cuando** envío una instrucción,
**Entonces** obtengo resultados resueltos con el léxico controlado
**Y** el portal indica que la lectura fue aproximada, sin lenguaje técnico

### Error — el léxico tampoco reconoce nada

**Dado** que el servicio falló y mi instrucción no tiene términos del léxico,
**cuando** envío,
**Entonces** veo el camino del cero con la opción de solicitar el perfil a medida
**Y** la consulta queda registrada como demanda

### Edge case — el servicio se restablece a mitad de sesión

**Dado** que estuve buscando en modo degradado,
**cuando** el servicio vuelve a estar disponible,
**Entonces** la siguiente búsqueda usa la interpretación completa
**Y** no se me pide recargar ni repetir lo que ya hice


## Notas

Cubre RF-16.1. La degradación no es un caso de error: es parte del contrato del modelo.



## Trazabilidad

Épica madre: **EP-009** · PRD v2.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
