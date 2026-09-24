---
id: HU-092
titulo: "Recuperar el acceso cuando el enlace venció"
epica: EP-001
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-092 — Recuperar el acceso cuando el enlace venció

**Como** líder de área que guardó el correo y lo abre semanas después,
**quiero** obtener un enlace nuevo sin tener que escribirle a nadie y esperar,
**para** no perder la intención justo cuando por fin tuve tiempo de mirar.

## Criterios de aceptación

### Happy path

**Dado** que mi enlace expiró,
**cuando** lo abro,
**Entonces** veo una explicación en lenguaje llano de por qué expiró
**Y** puedo pedir uno nuevo desde ahí mismo

### Error — solicito varias veces seguidas

**Dado** que pido un enlace nuevo dos veces en pocos minutos,
**cuando** envío la segunda,
**Entonces** el portal no genera enlaces en cadena
**Y** me indica que el primero ya va en camino

### Edge case — la cuenta ya no está activa

**Dado** que mi cuenta dejó de tener perfiles contratados,
**cuando** pido un enlace nuevo,
**Entonces** la solicitud llega al ejecutivo comercial en lugar de generarse sola


## Notas

Cubre RF-1.4. La vigencia del enlace va atada al ciclo del correo.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.0

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
