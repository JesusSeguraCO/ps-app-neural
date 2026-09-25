---
id: HU-142
titulo: "Corregir solo las filas que fallaron"
epica: EP-006
prioridad: media
complejidad: S
estado: draft
fase: panel-crud
prd_version: 4.8
spec: docs/10-specs/importacion-masiva.md
---

# HU-142 — Corregir solo las filas que fallaron

**Como** administradora del banco de talento,
**quiero** descargar únicamente las filas con error, con su motivo y en el formato en que las mandé,
**para** corregir tres filas sin tener que reprocesar las cincuenta y siete que ya estaban bien.

## Criterios de aceptación

### Happy path — descargar solo lo que falló

**Dado** que tres de sesenta filas tienen error,
**cuando** estoy en el resultado de la importación,
**Entonces** puedo descargar solo esas tres con su motivo, en el formato en que llegaron
**Y** las cincuenta y siete buenas quedaron aplicadas

### Error — el archivo completo falló

**Dado** que ninguna fila pudo procesarse,
**cuando** descargo el archivo de errores,
**Entonces** recibo todas las filas con su motivo
**Y** el panel me dice si el problema fue del archivo entero y no de las filas

### Edge case — reimportar las corregidas

**Dado** que corregí las tres filas y las vuelvo a pegar,
**cuando** confirmo,
**Entonces** actualizan los perfiles que corresponden por código
**Y** no se duplica nada de lo que ya había entrado en la primera importación

## Notas

**Dividida de HU-086 el 2026-09-22.** Es el ciclo de corrección, que tiene valor por sí solo: sin él, tres filas malas obligan a rehacer el archivo entero.

**El edge case es el que hace segura la función.** Reimportar solo lo corregido depende de que el código siga siendo la llave de identidad (RF-8.15.2) y de que la importación sea idempotente. Sin eso, corregir produciría duplicados y la función haría más daño que bien.

Cubre **RF-8.15.10**.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-141

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-141 |
| N | Negociable | ✓ |
| V | Valiosa | ✓ evita rehacer archivos completos por errores puntuales |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
