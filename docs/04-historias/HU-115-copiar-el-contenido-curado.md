---
id: HU-115
titulo: "Copiar el contenido curado para enviarlo desde Gmail o HubSpot"
epica: EP-011
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.14
---

# HU-115 — Copiar el contenido curado para enviarlo desde Gmail o HubSpot

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** responsable de la distribución,
**quiero** recibir del panel el contenido curado de cada destinatario listo para pegar en Gmail o HubSpot, y registrar cuándo salió,
**para** enviar con la herramienta que ya uso sin reescribir la selección y sostener una cadencia que el portal pueda vigilar.

## Criterios de aceptación

### Happy path

**Dado** que la selección tiene razón declarada y los enlaces están generados,
**cuando** abro el contenido para copiar,
**Entonces** veo por destinatario un bloque con asunto sugerido, la línea de apertura con la razón, los perfiles con capacidad, competencias verificadas y disponibilidad, sin tarifas, y un solo enlace: el suyo
**Y** puedo copiarlo en texto con formato para Gmail o como tabla destinatario–enlace para combinar en HubSpot

### Error — selección sin razón

**Dado** que falta la razón de la selección de la cuenta,
**cuando** intento generar el contenido,
**Entonces** el panel lo señala
**Y** no genera un bloque sin explicación

### Error — el inventario cambió después de generar el bloque

**Dado** que un perfil del bloque cambió de estado después de generarlo,
**cuando** vuelvo al contenido para copiar,
**Entonces** el bloque aparece marcado como desactualizado y no se puede copiar
**Y** el panel me ofrece regenerarlo contra el inventario del momento

### Edge case — registrar la salida y la cadencia

**Dado** que ya envié el correo desde Gmail o HubSpot,
**cuando** registro la salida con fecha y herramienta,
**Entonces** la edición queda como enviada con su dueño nominal
**Y** el panel muestra cuándo vence la siguiente edición de esa cuenta y avisa por correo interno al dueño si se pasa

### Edge case — contacto excluido de la distribución

**Dado** que un contacto pidió no recibir más y alguien lo marcó como excluido, con motivo,
**cuando** genero enlaces y bloques de una edición nueva,
**Entonces** a ese contacto no se le genera ni enlace ni bloque y aparece en la lista de excluidos
**Y** la exclusión se mantiene en ediciones siguientes hasta que alguien la retire

## Notas

Cubre RF-18.5, RF-18.7 y RF-18.8. **Sustituye a «Programar y enviar el boletín»** (PRD v4.0): redactar el correo, programarlo, enviarlo y gestionar las bajas pasan a Gmail o HubSpot por decisión del sponsor del 2026-09-27; no es un recorte de alcance. El portal no envía el boletín ni lo pasa por Mailgun. La salida registrada es lo que permite contar envíos para RF-18.6. **Sin cadencia no hay hábito, y sin hábito no hay O5.**

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
