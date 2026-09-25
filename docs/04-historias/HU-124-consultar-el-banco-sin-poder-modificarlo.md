---
id: HU-124
titulo: "Consultar el banco sin poder modificarlo"
epica: EP-006
prioridad: media
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-124 — Consultar el banco sin poder modificarlo

**Como** analista de Mercadeo con rol observador,
**quiero** consultar el inventario, los enlaces, los colocados y la demanda sin poder escribir nada,
**para** armar la curaduría de una cuenta sin riesgo de alterar el banco por accidente.

## Criterios de aceptación

### Happy path — consulta completa

**Dado** que tengo rol observador,
**cuando** entro al panel,
**Entonces** veo inventario, enlaces generados, perfiles colocados, registro de demanda y cobertura
**Y** no veo ningún control de edición, publicación ni importación

### Error — intento de escritura por ruta directa

**Dado** que tengo rol observador,
**cuando** llego por una dirección de edición que alguien me pasó,
**Entonces** el panel rechaza la acción y explica que mi rol es de consulta
**Y** el intento queda en el registro de auditoría

### Edge case — necesito un cambio que no puedo hacer

**Dado** que veo un dato desactualizado,
**cuando** quiero corregirlo,
**Entonces** el panel me ofrece avisar a quien administra el inventario
**Y** no me deja en un callejón sin salida

## Notas

Cubre **RF-8.1.2**, rol *observador*. Es el rol de Mercadeo y Comercial.

**Por qué el observador no es un lujo.** Mercadeo arma la selección de perfiles de cada cuenta (HU-113) y necesita ver disponibilidad real. Darle permiso de escritura para que pueda mirar sería el camino corto y el error: quien arma correos no debería poder despublicar un perfil.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · D-22 · relacionada con HU-113

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-123 — el rol necesita identidad |
| N | Negociable | ✓ |
| V | Valiosa | ✓ habilita a Mercadeo sin exponer el banco a escritura |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
