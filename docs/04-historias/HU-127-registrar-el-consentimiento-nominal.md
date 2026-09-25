---
id: HU-127
titulo: "Registrar el consentimiento nominal del profesional"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-127 — Registrar el consentimiento nominal del profesional

**Como** administradora de inventario de Talento Humano,
**quiero** registrar que el profesional autorizó publicar su nombre junto con su trayectoria y sus clientes,
**para** que el banco tenga respaldo de cada perfil nominal que se muestra a una cuenta.

## Criterios de aceptación

### Happy path — consentimiento nominal y explícito

**Dado** que el profesional autorizó publicar nombre y primer apellido junto con trayectoria y clientes nombrados, ante cuentas cliente y de forma continua,
**cuando** registro ese consentimiento en su perfil,
**Entonces** el perfil queda habilitado para pasar a *publicado*
**Y** queda registrado quién lo registró y cuándo

### Error — consentimiento anterior para publicación anonimizada

**Dado** que el profesional consintió cuando el banco se publicaba sin nombres,
**cuando** intento usar ese consentimiento para el perfil nominal,
**Entonces** el panel lo rechaza y explica que ese consentimiento no cubre este uso
**Y** exige recogerlo de nuevo

### Error — consentimiento revocado

**Dado** que un profesional revoca su consentimiento,
**cuando** lo registro,
**Entonces** el perfil sale de *publicado* de inmediato
**Y** el portal deja de mostrarlo sin dejar un hueco sin explicar

### Edge case — consentimiento parcial

**Dado** que el profesional autoriza su trayectoria pero no que se nombren sus clientes,
**cuando** lo registro,
**Entonces** el perfil puede publicarse con la experiencia despersonalizada
**Y** los clientes nombrados no aparecen en su ficha

## Notas

Cubre **RF-8.4**. Es consecuencia directa de la **reversión de D-1** (2026-09-10): al publicarse nombre y primer apellido, el consentimiento pasó de genérico a **nominal y explícito**.

**El consentimiento recogido antes no sirve.** El PRD es explícito: el consentimiento para una publicación anonimizada no cubre la publicación nominal. Esto significa trabajo real de Talento Humano sobre el banco existente antes de salir a producción, y se cruza con **D-3** — 25 perfiles publicados como umbral, cada uno con consentimiento nominal recogido de nuevo.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · D-1 revertida · condiciona D-3

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ describe el registro, no el medio de recolección |
| V | Valiosa | ✓ es el respaldo legal de todo el producto |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
