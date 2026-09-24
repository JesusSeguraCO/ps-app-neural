---
id: HU-128
titulo: "Ser bloqueada si intento publicar sin consentimiento"
epica: EP-006
prioridad: alta
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-128 — Ser bloqueada si intento publicar sin consentimiento

**Como** administradora de inventario de Talento Humano,
**quiero** que el panel me impida publicar un perfil sin consentimiento registrado,
**para** que un descuido mío no ponga el nombre de un profesional frente a un cliente sin su autorización.

## Criterios de aceptación

### Happy path — el bloqueo actúa

**Dado** que un perfil no tiene consentimiento nominal registrado,
**cuando** intento publicarlo,
**Entonces** el panel lo impide y me dice exactamente qué falta
**Y** me ofrece ir a registrarlo

### Error — intento de saltarse el bloqueo por importación

**Dado** que un archivo de importación trae un campo de consentimiento,
**cuando** lo proceso,
**Entonces** el consentimiento no se concede y el perfil llega a borrador
**Y** el bloqueo se mantiene

### Edge case — publicación masiva

**Dado** que selecciono varios perfiles para publicar a la vez,
**cuando** alguno no tiene consentimiento,
**Entonces** se publican los que sí lo tienen
**Y** los demás quedan señalados con su motivo, sin abortar la operación completa

## Notas

Cubre **RF-8.4** desde el lado del bloqueo y **RF-8.15.7** desde el lado de la importación.

**Por qué es historia aparte de HU-127.** Registrar el consentimiento es un acto administrativo; el bloqueo es una garantía del sistema. Separarlas permite verificar la garantía sin depender de cómo se recoja el consentimiento, y deja el bloqueo como criterio de aceptación propio — que es lo que se va a auditar.

**El bloqueo es de los que RF-8.16.1 deja fuera de los catálogos paramétricos**: no es administrable, es lógica de producto.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-127

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-127 para tener qué verificar |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la garantía que protege al profesional y a Trycore |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
