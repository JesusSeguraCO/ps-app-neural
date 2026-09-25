---
id: HU-093
titulo: "Entrar sin una selección previa y ser encuadrado"
epica: EP-001
prioridad: media
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-093 — Entrar sin una selección previa y ser encuadrado

**Como** líder de área que llegó por un enlace compartido en una reunión, sin selección,
**quiero** que el portal me oriente en lugar de mostrarme una lista de 23 perfiles,
**para** empezar por lo que necesito y no por lo que ustedes tienen.

## Criterios de aceptación

### Happy path

**Dado** que entro sin parámetros de selección,
**cuando** carga el portal,
**Entonces** veo una pregunta de encuadre antes del listado
**Y** puedo escribir una instrucción o entrar por familia de rol

### Error — no elijo nada

**Dado** que ignoro el encuadre,
**cuando** sigo adelante,
**Entonces** accedo al banco completo con filtros disponibles
**Y** no quedo bloqueado

### Edge case — enlace sin cuenta

**Dado** que el enlace no identifica ninguna cuenta,
**cuando** entro,
**Entonces** el portal no inventa un nombre de cuenta ni un proyecto
**Y** el saludo es neutro


## Notas

Cubre RF-1.3 y el recorrido secundario de §6.3.

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
