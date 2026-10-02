---
id: HU-098
titulo: "Saber qué pasa después de enviar"
epica: EP-005
prioridad: alta
complejidad: S
estado: draft
fase: cierre-de-huecos
prd_version: 4.0
---

# HU-098 — Saber qué pasa después de enviar

**Como** líder de proyecto que acaba de enviar la solicitud,
**quiero** entender cuál es el paso siguiente y en cuánto tiempo,
**para** no quedarme esperando sin saber si alguien la recibió.

## Criterios de aceptación

### Happy path

**Dado** que envío la solicitud,
**cuando** llego a la confirmación,
**Entonces** veo que el paso siguiente es una sesión de alineación con Delivery
**Y** veo el plazo de 10 días hábiles y desde cuándo corre
**Y** veo un resumen de lo que envié

### Error — falla la integración con el CRM

**Dado** que la creación del negocio falla,
**cuando** se procesa el envío,
**Entonces** recibo la confirmación igual
**Y** la solicitud entra en cola de reintento y se alerta internamente

### Edge case — segunda solicitud parecida

**Dado** que ya envié una solicitud similar hace días,
**cuando** envío otra,
**Entonces** el portal me muestra que hay una en curso y su fecha
**Y** puedo añadir contexto en lugar de duplicarla

### Edge case — doble clic en «Enviar»

**Dado** que diligencié la solicitud y toqué «Enviar»,
**cuando** vuelvo a tocar «Enviar» antes de llegar a la confirmación, o el navegador repite el envío,
**Entonces** el botón queda bloqueado desde el primer toque y muestra que se está enviando
**Y** el portal guarda una sola solicitud con un solo identificador SOL y encola un solo trabajo hacia HubSpot
**Y** llego a la misma confirmación, sin aviso de error


## Notas

Cubre RF-5.4, RF-5.5 y RF-9.6. La confirmación nunca se comunica como reserva ni contratación: es la resolución de §2.4.

**Revisión 2026-10-02 (D76, sponsor).** El doble envío **se corta en origen**: el botón se bloquea al primer toque y cada formulario lleva una **clave única por envío**, que la tabla de solicitudes guarda con restricción de unicidad. Un segundo POST con la misma clave devuelve la solicitud ya guardada (misma confirmación), sin insertar otra ni encolar otro trabajo; el trabajo hacia HubSpot conserva su `clave_idempotencia` única (ADR-0009). Es la primera de las dos defensas de D76; la segunda es el «Id solicitud People Service» de valor único en HubSpot (HU-102, HU-105). Esto es distinto del «segunda solicitud parecida» de días después, que es la excepción de D-7 con ventana de 7 días (HU-180).

**Error de CRM (escenario 2).** Con D76 la «creación del negocio» vuelve a ser literal: el worker crea contacto y negocio por la API; el reintento y la alerta son HU-105.

## Trazabilidad

Épica madre: **EP-005** · PRD v4.0 · RF-5.4, RF-5.5, RF-9.6 · D-7 · D76 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76: clave única por envío) · relacionada con HU-102, HU-105 y HU-180 (EP-007)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el beneficio es visible para quien la ejecuta |
| E | Estimable | ✓ S para el doble clic (bloqueo del botón y clave única con restricción en la base); el resto de la confirmación sigue por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ los criterios describen resultados observables; el doble clic se prueba con dos POST seguidos con la misma clave (una fila, un trabajo) y un e2e de doble toque |
