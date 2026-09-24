---
id: HU-103
titulo: "Enterarme de una solicitud sin tener que vigilar el pipeline"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-103 — Enterarme de una solicitud sin tener que vigilar el pipeline

**Como** ejecutivo comercial con varias cuentas a cargo,
**quiero** que me avisen por mi canal de trabajo diario cuando llega una solicitud, con lo necesario para decidir,
**para** no descubrir tres días después que un cliente pidió algo.

## Criterios de aceptación

### Happy path

**Dado** que llega una solicitud de mi cuenta,
**cuando** se procesa,
**Entonces** recibo la notificación en el canal de trabajo del equipo, no solo por correo
**Y** trae cuenta, quién solicita, qué pidió, cuándo lo necesita y el enlace al negocio
**Y** puedo decidir sin abrir el CRM

### Error — nadie abre el negocio

**Dado** que pasan 4 horas hábiles sin que nadie lo abra,
**cuando** se evalúa,
**Entonces** la notificación se reenvía a la dirección comercial

### Edge case — sigue sin moverse

**Dado** que pasan 24 horas hábiles sin cambio de etapa,
**cuando** se evalúa,
**Entonces** se escala a Dirección General
**Y** el tiempo entre notificación y primera apertura queda registrado


## Notas

Cubre RF-9.7. **Con pipeline propio, esta notificación es el único mecanismo que evita que una solicitud exista y nadie la vea.** Un punto único de falla sin escalamiento no es un mecanismo, es una esperanza.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
