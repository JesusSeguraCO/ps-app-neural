---
id: HU-094
titulo: "Volver a la selección después de explorar"
epica: EP-001
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
depende_de: [HU-090, HU-091]
---

# HU-094 — Volver a la selección después de explorar

**Como** líder de proyecto que amplió la búsqueda al banco completo,
**quiero** volver a la selección que me armaron en un solo toque,
**para** no perder el trabajo de curaduría por haber explorado.

## Criterios de aceptación

### Happy path

**Dado** que tengo una sesión válida en un enlace con selección
**Y** que amplié la búsqueda al banco completo
**Y** que mi «Mi equipo» tiene perfiles guardados
**Cuando** toco «Volver a la selección»
**Entonces** veo los perfiles del enlace con su razón declarada
**Y** mi «Mi equipo» conserva exactamente los perfiles que tenía antes de volver

### Error — perfiles de la selección archivados

**Dado** que tengo una sesión válida en un enlace con selección
**Y** que amplié la búsqueda al banco completo
**Y** que los perfiles de la selección se archivaron mientras exploraba
**Cuando** toco «Volver a la selección»
**Entonces** veo cada perfil archivado en la selección con la etiqueta de su estado
**Y** veo la opción de ampliar la búsqueda al banco completo

### Edge case — nunca hubo selección

**Dado** que tengo una sesión válida en un enlace sin selección
**Cuando** abro el banco completo
**Entonces** no veo la opción «Volver a la selección»

## Notas

Cubre **RF-2.2**. Es la resolución de la tensión entre curaduría y descubrimiento de §2.5.

**Ajustada el 2026-09-27** (corrección de discovery T-18): el caso de error ya no «explica y oculta» la selección; por **RF-19.2** el portal nunca omite un perfil en silencio. «Mi equipo» vive en el servidor por invitado (T-1), así que lo que se conserva al volver también se conserva si la persona cambia de dispositivo; esa continuidad la prueba la historia de «Mi equipo» (EP-004), no esta.

**Ajustada el 2026-09-28 (DoR de EP-001, decisión del PO: reformular sin recortar).** Esta historia afirma solo lo que construye EP-001: volver a la selección no altera el «Mi equipo» del invitado, verificado con un equipo sembrado. Sumar perfiles mientras se explora y «continuar desde lo que llevo en Mi equipo» son comportamiento de «Mi equipo» y pasan a EP-004 (ver «Criterios recibidos de EP-001» en `docs/03-backlog/epicas.md`).

**Dueña única del retorno** (validación INVEST del 2026-09-27): esta es la única historia que tiene el criterio observable de «volver a la selección». HU-144 muestra la opción de ampliar la búsqueda y remite aquí para el retorno.

**Orden de construcción y pruebas:** HU-090 → HU-091 o HU-144 (la que se construya primero; ambas muestran la selección) → HU-094. Para no esperar a que HU-091/HU-144 estén cerradas de punta a punta, HU-094 se construye y verifica con una **sesión y una selección sembradas** en fixtures de prueba.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.13 · §2.5 · T-1 · depende de HU-090 y de HU-091 o HU-144 (la vista de la selección) · orden de construcción: HU-090 → HU-091/HU-144 → HU-094

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se secuencia después de la puerta (HU-090) y de la vista de la selección (HU-091 o HU-144); el retorno se construye y verifica solo con una selección sembrada |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el cliente explora sin miedo a perder la curaduría |
| E | Estimable | ✓ la selección vive en el enlace y el equipo en el servidor (ADR-0003/0004); falta la cifra del equipo |
| S | Pequeña | ✓ S: una sola interacción (volver) y la presencia o ausencia de su opción |
| T | Testeable | ✓ tres escenarios con resultados observables (perfiles del enlace, equipo conservado, etiqueta de archivado, ausencia de la opción) |
