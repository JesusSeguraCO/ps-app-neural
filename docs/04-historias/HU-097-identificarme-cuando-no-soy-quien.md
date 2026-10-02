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

**Revisión 2026-10-02 (D76, D79).** El contacto lo crea o actualiza el worker por la API con upsert por el correo verificado, con el nombre, el apellido y el cargo de esta historia; la empresa la asocia HubSpot por el dominio, y la crea si no existe (D79). Detalle en HU-104 (EP-007).

## Trazabilidad

Épica madre: **EP-005** · PRD v4.0 · D76, D79 (sponsor, 2026-10-02) · relacionada con HU-102 y HU-104 (EP-007)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
