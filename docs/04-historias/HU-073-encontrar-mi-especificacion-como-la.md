---
id: HU-073
titulo: "Encontrar mi especificación como la dejé"
epica: EP-009
prioridad: media
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 4.8
---

# HU-073 — Encontrar mi especificación como la dejé

**Como** líder de proyecto que vuelve al portal días después,
**quiero** recuperar el Perfil Objetivo que ya había ajustado,
**para** no repetir el trabajo de especificar cada vez que entro.

## Criterios de aceptación

### Happy path — recuperación

**Dado** que ajusté un Perfil Objetivo en una visita anterior,
**cuando** vuelvo a entrar desde el mismo dispositivo,
**Entonces** encuentro la especificación como la dejé
**Y** puedo partir de ella o empezar una nueva

### Error — el navegador no conserva el dato

**Dado** que vuelvo desde otro equipo, en modo privado o tras limpiar el almacenamiento,
**cuando** entro al portal,
**Entonces** arranco con una especificación en blanco
**Y** el portal no me promete una recuperación que no puede cumplir

### Edge case — otro invitado del mismo enlace

**Dado** que un colega invitado al mismo enlace entra al portal,
**cuando** él entra al portal desde su propio dispositivo,
**Entonces** arranca limpio y no ve la especificación que yo escribí
**Y** eso es el comportamiento correcto, no una carencia


## Notas

Cubre RF-13.4.

**D-16 cerrada el 2026-09-21: persistencia por dispositivo, no por cuenta.** La especificación queda en el navegador de quien la escribió. Resuelve el caso real —la misma persona que vuelve— y elimina la implicación ISO 27000, porque nada se guarda del lado del servidor contra una identidad que el portal no puede verificar. Se reabre cuando exista autenticación real por usuario.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.8

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | por confirmar con el equipo |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es externo y visible |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ cabe en un incremento |
| T | Testeable | ✓ los criterios describen resultados observables |
