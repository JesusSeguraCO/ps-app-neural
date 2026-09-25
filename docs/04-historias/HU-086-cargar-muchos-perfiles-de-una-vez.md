---
id: HU-086
titulo: "Pegar mi hoja de cálculo y ver qué va a pasar"
epica: EP-006
prioridad: media
complejidad: M
estado: prototipado
fase: fase-2-rediseno
prd_version: 4.8
spec: docs/10-specs/importacion-masiva.md
---

# HU-086 — Pegar mi hoja de cálculo y ver qué va a pasar

**Como** administradora del banco de talento,
**quiero** pegar mi hoja de cálculo y ver exactamente qué cambiaría antes de confirmar,
**para** revisar decenas de perfiles de una vez sin miedo a romper algo.

## Criterios de aceptación

### Happy path — pegar desde la hoja de cálculo

**Dado** que copié un bloque de celdas de Excel con una columna de código y otra de disponibilidad,
**cuando** lo pego en el asistente,
**Entonces** el sistema reconoce que es un formato tabular sin que yo se lo diga
**Y** empareja las columnas con los campos del perfil y me deja corregir el emparejamiento
**Y** puedo guardar ese emparejamiento como plantilla para la próxima vez

### Happy path — vista previa antes de tocar nada

**Dado** que el archivo se procesó,
**cuando** llego a la vista previa,
**Entonces** veo cada fila como tarjeta colapsada agrupada en nuevos, actualizados, archivados, sin cambios, omitidos y con error, con su conteo
**Y** al abrir un actualizado veo **solo los campos que cambian**, con valor anterior y nuevo
**Y** puedo desmarcar cualquier tarjeta para excluirla
**Y** nada se ha modificado todavía en el banco

### Error — dos filas con el mismo código

**Dado** que mi archivo repite un código en dos filas,
**cuando** el sistema lo procesa,
**Entonces** ambas filas se marcan como error
**Y** no se aplica ninguna regla de precedencia por su cuenta

### Edge case — valores que no existen en el banco

**Dado** que una fila trae una tecnología o un rol que hoy no existe,
**cuando** reviso la vista previa,
**Entonces** ese valor aparece destacado como nuevo en la taxonomía
**Y** puedo detectar de un vistazo si fue un error de digitación

## Notas

**Dividida el 2026-09-22.** La historia original tenía **ocho escenarios**, y `METODOLOGIA.md` §4 usa el tope de cinco como detector de tamaño: más de cinco significa que la historia es muy grande. Su propia tabla INVEST ya proponía el corte —*«pegar y vista previa primero»*—. Se partió en tres: **HU-086** (pegar y previsualizar), **HU-141** (confirmar con el modo correcto) y **HU-142** (corregir solo lo que falló).

**La premisa que corrige esta historia:** quien importa no tiene un JSON, tiene una hoja de cálculo. El camino principal es pegar celdas; el JSON es el camino de máquina.

**Nada se modifica aquí.** Esta historia termina en la vista previa. Confirmar es HU-141, y esa separación es justamente lo que hace verificable la promesa de RF-8.15.5.

Cubre **RF-8.15.1**, **RF-8.15.5** y **RF-8.15.6**. Especificación completa en `docs/10-specs/importacion-masiva.md`.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-088 · habilita HU-141

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ la vista previa vale aunque se confirme después |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ |
