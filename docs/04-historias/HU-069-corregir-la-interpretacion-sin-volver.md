---
id: HU-069
titulo: "Corregir la interpretación sin volver a escribir"
epica: EP-009
prioridad: alta
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-068, HU-209]
---

# HU-069 — Corregir la interpretación sin volver a escribir

**Como** líder de área que ve que el portal entendió mal un criterio,
**quiero** quitar o cambiar un criterio interpretado directamente sobre la lectura,
**para** ajustar la búsqueda sin reformular toda la frase desde cero.

## Criterios de aceptación

### Happy path — quitar un criterio mal interpretado

**Dado** que la lectura de «desarrollador móvil para banca» muestra «Desarrollador Móvil · obligatorio» y «Banca · deseable», con 11 perfiles
**Cuando** toco la equis de «Banca»
**Entonces** la etiqueta desaparece de la lectura y del Perfil Objetivo
**Y** siguen 11 perfiles, y ninguna tarjeta muestra una línea de evidencia de Banca
**Y** se registra `perfil_objetivo_editado` con tipo `quitado` y clase `sector`, sin el valor

### Happy path — cambiar un criterio

**Dado** que la lectura muestra «Senior · deseable»
**Cuando** cambio «Senior» por «Semi-senior» desde la propia etiqueta
**Entonces** la lectura muestra «Semi-senior · deseable» y los resultados se reordenan por ese criterio
**Y** el texto que escribí en la barra no cambia

### Error — quito el único criterio

**Dado** que la lectura solo tiene «Desarrollador Backend · obligatorio» y el banco tiene 38 perfiles publicados
**Cuando** toco la equis de «Desarrollador Backend»
**Entonces** veo el rótulo «Todo el banco» con los 38 perfiles, no una pantalla vacía
**Y** mi texto sigue en la barra

### Edge case — deshacer la corrección que dejó cero

**Dado** que acabo de marcar «Banca» como obligatorio y ya no queda ningún perfil
**Cuando** toco «Deshacer»
**Entonces** «Banca» vuelve a ser deseable y vuelven los 11 perfiles en el orden anterior

## Notas

Cubre **RF-12.3** (corregir sobre la lectura) y **RF-13.3** (el Perfil Objetivo es editable de forma continua): la lectura y el Perfil Objetivo son la misma especificación vista de dos formas, y corregir una actualiza la otra.

**Refinada el 2026-10-02 (discovery de EP-009).** El antiguo «corrección que deja cero → camino del cero» se ajusta: el aviso único cuando no queda nadie es de **HU-209** (motor único) y la pantalla del cero es de **EP-010**; aquí queda lo propio de corregir, que es poder deshacer en un toque.

**Decisión por delegación del sponsor (elegida por el modelo):** «Deshacer» revierte **la última** corrección y se ofrece mientras no haya otra; no hay historial de varios pasos. Es lo mínimo que cumple «en un toque» sin añadir alcance.

**Medición:** `perfil_objetivo_editado` (ADR-0006) lleva solo el tipo de cambio y la clase de criterio, nunca el contenido, porque la especificación vive en el dispositivo (RF-13.4).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-12.3 · RF-13.3 · ADR-0006 (`perfil_objetivo_editado`) · depende de HU-068 (lectura) y HU-209 (motor y aviso único), misma épica · relacionada con HU-070

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas de la misma épica (lectura y motor) |
| N | Negociable | ✓ son fijos que se corrige sobre la lectura, que el texto escrito no se toca y el deshacer; el gesto de cambio se negocia |
| V | Valiosa | ✓ el cliente corrige un malentendido sin reescribir su instrucción |
| E | Estimable | ✓ S: quitar y cambiar un criterio en el estado de búsqueda (URL) y un deshacer de un paso |
| S | Pequeña | ✓ S: cuatro escenarios |
| T | Testeable | ✓ e2e con banco sembrado: conteos exactos tras quitar, cambiar, vaciar y deshacer, y carga del evento verificada |
