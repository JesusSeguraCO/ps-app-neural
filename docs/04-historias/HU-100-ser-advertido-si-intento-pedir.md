---
id: HU-100
titulo: "Ser advertido si intento pedir sin haber elegido nada"
epica: EP-005
prioridad: media
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-100 — Ser advertido si intento pedir sin haber elegido nada

**Como** líder de área que llegó al formulario sin seleccionar perfiles,
**quiero** que el portal me lo diga antes de enviar,
**para** no mandar una solicitud vacía que obligue a una llamada para aclararla.

## Criterios de aceptación

### Happy path

**Dado** que no tengo perfiles seleccionados y tengo especificación,
**cuando** intento enviar,
**Entonces** el portal me ofrece enviarla como solicitud de perfil a medida
**Y** no me bloquea sin alternativa

### Error — sin perfiles y sin especificación

**Dado** que no tengo ni lo uno ni lo otro,
**cuando** intento enviar,
**Entonces** se me pide completar lo mínimo
**Y** se conserva lo que ya escribí

### Edge case — insisto

**Dado** que completo lo mínimo y envío igual,
**cuando** se procesa,
**Entonces** la solicitud se envía
**Y** queda marcada como especificación mínima para quien prepare la sesión


## Notas

Cubre RF-5.1 y RF-14.3.

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
