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

**Como** arquitecto invitado al enlace que va a enviar la solicitud,
**quiero** poner mis datos en lugar de los del contacto original,
**para** que Trycore me busque a mí y no al contacto principal del envío.

## Criterios de aceptación

### Happy path

**Dado** que entré con mi correo invitado y no soy el contacto principal del envío,
**cuando** diligencio mis datos,
**Entonces** la solicitud viaja con mi nombre, mi cargo y el correo con el que entré
**Y** la cuenta sigue siendo la misma

### Error — intento cambiar el correo

**Dado** que en el formulario escribo un correo distinto del que verifiqué al entrar,
**cuando** intento enviar,
**Entonces** la solicitud usa el correo verificado
**Y** el portal me explica que el correo es el de mi invitación

### Edge case — contacto desconocido en empresa conocida

**Dado** que mi correo no existe en el CRM,
**cuando** se envía la solicitud,
**Entonces** se crea el contacto y se asocia a la empresa existente
**Y** nunca se crea una empresa duplicada


## Notas

Cubre RF-5.2, RF-5.6 y RF-9.2. Con acceso nominal (D-4 revisada el 2026-09-25) el correo de quien solicita siempre es uno invitado y verificado; el último escenario sigue vigente porque un invitado puede no existir aún en el CRM.

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
