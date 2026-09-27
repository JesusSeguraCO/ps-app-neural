---
id: HU-116
titulo: "Ver quién entró por su enlace"
epica: EP-011
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.14
---

# HU-116 — Ver quién entró por su enlace

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** responsable de la distribución,
**quiero** ver por cuenta y por destinatario quién entró por su enlace, quién verificó su correo y quién llegó a solicitar,
**para** saber si el problema está en el portal, en la oferta o antes de llegar al portal.

## Criterios de aceptación

### Happy path

**Dado** que una edición tiene la salida registrada,
**cuando** abro el seguimiento,
**Entonces** veo por cuenta y destinatario la entrada por el enlace, la verificación del correo y la solicitud
**Y** veo cuántas cuentas terminaron en solicitud

### Error — la apertura del correo no la mide el portal

**Dado** que el correo se envió desde Gmail o HubSpot,
**cuando** reviso el seguimiento,
**Entonces** la apertura aparece como «no la mide el portal», con la indicación de consultarla en HubSpot si se envió desde allí
**Y** nunca se muestra un cero que confunda ausencia de dato con ausencia de apertura

### Edge case — edición sin salida registrada

**Dado** que se generaron los enlaces pero nadie registró la salida,
**cuando** reviso el seguimiento,
**Entonces** la edición aparece como «sin salida registrada», no como una edición sin entradas
**Y** no cuenta para la regla de tres envíos

### Edge case — entra otro invitado del mismo enlace

**Dado** que entra un invitado del enlace de la cuenta que no recibió el correo de la edición,
**cuando** se registra su entrada,
**Entonces** la entrada se atribuye a la edición con su propio contacto
**Y** no se suma a la del destinatario original

## Notas

Cubre RF-18.6 y RF-7.3. **Sustituye a «Ver quién abrió y quién entró»** (PRD v4.0): la apertura del correo pasa a la herramienta de envío por decisión del sponsor del 2026-09-27 (HubSpot la mide; Gmail no). El segundo escenario evita la conclusión más común y más equivocada de todo informe de correo. Se apoya en HU-112 (atribución de sesiones a la edición).

## Trazabilidad

Épica madre: **EP-011** · PRD v4.14 · spec `docs/10-specs/correo-curado.md`

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables |
