---
id: HU-117
titulo: "Reaccionar a una cuenta que no entra"
epica: EP-011
prioridad: media
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.14
---

# HU-117 — Reaccionar a una cuenta que no entra

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** ejecutivo comercial dueño de la cuenta,
**quiero** que me avisen cuando una de mis cuentas acumula tres envíos con salida registrada sin que nadie entre por su enlace,
**para** tratarlo como lo que es, una señal comercial, y no como un problema de correo.

## Criterios de aceptación

### Happy path

**Dado** que una cuenta acumula tres ediciones con salida registrada sin ninguna entrada por sus enlaces,
**cuando** se evalúa,
**Entonces** recibo el aviso por correo interno con el histórico de las tres ediciones
**Y** la cuenta queda marcada para revisión antes de preparar la siguiente edición

### Error — posible problema de entrega

**Dado** que la herramienta de envío reportó rebote para el destinatario de la cuenta,
**cuando** quien distribuye lo registra en el panel,
**Entonces** esa edición deja de contar para la regla de tres envíos
**Y** se corrige el dato del destinatario antes de escalar comercialmente

### Edge case — entra pero nunca suma perfiles

**Dado** que el destinatario entra por su enlace y nunca suma perfiles a su equipo,
**cuando** se evalúa,
**Entonces** se trata distinto: el problema no es el canal sino la propuesta
**Y** la selección de esa cuenta queda señalada para revisión

### Edge case — ediciones sin salida registrada

**Dado** que la cuenta tiene ediciones con enlaces generados pero sin salida registrada,
**cuando** se evalúa,
**Entonces** esas ediciones no cuentan como envíos
**Y** el aviso no se dispara por ellas

## Notas

Cubre RF-18.6. **La regla pasa de «tres envíos sin abrir» a «tres envíos sin entrar»** por decisión del sponsor del 2026-09-27: la apertura la mide la herramienta de envío, no el portal (ya lo había resuelto T-10 el 2026-09-25 por la poca fiabilidad del píxel). El caso «abre pero nunca entra» solo se puede leer en HubSpot cuando el envío salió desde allí. El tercer escenario es el más informativo que el portal puede medir: quien entra y no suma perfiles está diciendo que la selección no le habla.

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
