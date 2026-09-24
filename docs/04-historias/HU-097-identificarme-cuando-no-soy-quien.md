---
id: HU-097
titulo: "Identificarme cuando no soy quien recibió el correo"
epica: EP-005
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-097 — Identificarme cuando no soy quien recibió el correo

**Como** arquitecto al que le reenviaron el enlace y que va a enviar la solicitud,
**quiero** poner mis datos en lugar de los del contacto original,
**para** que Trycore me busque a mí y no a quien me reenvió el correo.

## Criterios de aceptación

### Happy path

**Dado** que llego al formulario desde un enlace reenviado,
**cuando** diligencio mis datos,
**Entonces** la solicitud viaja con mi nombre, cargo y correo
**Y** la cuenta sigue siendo la misma

### Error — correo personal

**Dado** que escribo un correo que no es corporativo,
**cuando** intento enviar,
**Entonces** el portal me lo advierte
**Y** puedo continuar si insisto, y queda registrado

### Edge case — contacto desconocido en empresa conocida

**Dado** que mi correo no existe en el CRM,
**cuando** se envía la solicitud,
**Entonces** se crea el contacto y se asocia a la empresa existente
**Y** nunca se crea una empresa duplicada


## Notas

Cubre RF-5.2, RF-5.6 y RF-9.2. El último escenario es consecuencia directa de que el enlace sea reenviable (D-4).

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
