---
id: HU-086
titulo: "Pegar mi hoja de cálculo y ver qué va a pasar"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.8
spec: docs/10-specs/importacion-masiva.md
depende_de: [HU-088]
---

# HU-086 — Pegar mi hoja de cálculo y ver qué va a pasar

**Como** administradora de inventario de Talento Humano,
**quiero** pegar mi hoja de cálculo y ver exactamente qué cambiaría antes de confirmar,
**para** revisar decenas de perfiles de una vez sin miedo a romper algo.

## Criterios de aceptación

### Happy path — pegar desde la hoja de cálculo

**Dado** que copié de Excel un bloque de celdas con una columna de código y otra de disponibilidad,
**cuando** lo pego en el asistente,
**Entonces** el sistema reconoce que es un formato tabular sin que yo se lo diga
**Y** propone el emparejamiento de cada columna con un campo del perfil, o «no importar», y me deja corregirlo

### Happy path — la vista previa al terminar de procesar

**Dado** que pegué la exportación del banco (HU-088) con la disponibilidad de dos perfiles cambiada y el resto sin tocar,
**cuando** el sistema termina de procesarla,
**Entonces** veo cada fila como tarjeta colapsada agrupada en nuevos, actualizados, archivados, sin cambios, omitidos y con error, con su conteo
**Y** los dos perfiles editados aparecen en actualizados y todos los demás en «sin cambios»
**Y** puedo desmarcar cualquier tarjeta para excluirla
**Y** nada se ha modificado todavía en el banco

### Happy path — abrir un perfil actualizado

**Dado** que la vista previa muestra un perfil en el grupo de actualizados,
**cuando** abro su tarjeta,
**Entonces** veo **solo los campos que cambian**, con valor anterior y nuevo enfrentados
**Y** los campos que no cambian no aparecen

### Error — dos filas con el mismo código

**Dado** que mi hoja repite un código en dos filas,
**cuando** el sistema termina de procesarla,
**Entonces** ambas filas aparecen en el grupo con error, con el código duplicado como motivo
**Y** ninguna de las dos se aplica
**Y** la importación no procede hasta que resuelva el duplicado

### Edge case — valores que no existen en el banco

**Dado** que una fila trae una tecnología o un rol que hoy no existe en el banco,
**cuando** el sistema termina de procesar la hoja,
**Entonces** ese valor aparece destacado en la vista previa como nuevo en la taxonomía
**Y** veo el valor exacto y cuántas veces se repite en la hoja
**Y** la vista previa no se bloquea por ello

## Notas

**Dividida el 2026-09-22.** La historia original tenía **ocho escenarios**, y `METODOLOGIA.md` §4 usa el tope de cinco como detector de tamaño: más de cinco significa que la historia es muy grande. Su propia tabla INVEST ya proponía el corte —*«pegar y vista previa primero»*—. Se partió en tres: **HU-086** (pegar y previsualizar), **HU-141** (confirmar con el modo correcto) y **HU-142** (corregir solo lo que falló).

**La premisa que corrige esta historia:** quien importa no tiene un JSON, tiene una hoja de cálculo. El camino principal es pegar celdas; el JSON es el camino de máquina.

**Nada se modifica aquí.** Esta historia termina en la vista previa. Confirmar es HU-141, y esa separación es justamente lo que hace verificable la promesa de RF-8.15.5.

**Consume el formato que fija HU-088** (D2, sponsor 2026-09-30: exportar primero). Por eso la prueba de ida y vuelta —pegar la exportación y que lo no tocado caiga en «sin cambios»— vive en el segundo escenario de esta historia: es aquí donde existe el importador que la ejecuta.

Cubre **RF-8.15.1**, **RF-8.15.2**, **RF-8.15.5** y **RF-8.15.6**. Especificación completa en `docs/10-specs/importacion-masiva.md`.

**Revisión INVEST 2026-09-30:** rol unificado; «guardar el emparejamiento como plantilla» sale a **HU-148** (D2, partición, no recorte); vista previa separada en «termina de procesar» y «abro la tarjeta»; el duplicado ya no se aplica ni deja proceder; el valor nuevo muestra valor exacto y repeticiones; la ida y vuelta con la exportación pasa aquí desde HU-088; `depende_de: [HU-088]` y tabla INVEST razonada.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · depende de HU-088 (formato de la hoja, D2) · habilita HU-141 y HU-148

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: consume el formato de columnas que fija HU-088 y se construye después de ella (D2). No necesita HU-141: termina en la vista previa, sin escribir |
| N | Negociable | ✓ fija qué se ve y que nada se modifica; cómo se detecta el formato y se propone el emparejamiento queda abierto al diseño |
| V | Valiosa | ✓ la administradora ve el impacto de una hoja completa sin riesgo, aunque confirmar llegue en HU-141 |
| E | Estimable | ✓ M: lectura del pegado tabular (celdas separadas por tabulador) y de JSON, emparejamiento por nombre contra el formato de HU-088 y diferencia campo a campo contra `inventario.perfiles` (tabla existente desde la migración 0005), todo en lectura. Sin servicio externo; la spec §6 pasos 1–3 detalla el comportamiento |
| S | Pequeña | ✓ cinco escenarios de una sola capacidad (pegar y previsualizar); plantillas de emparejamiento en HU-148, confirmar en HU-141, corregir fallos en HU-142 |
| T | Testeable | ✓ cada Entonces es observable; «nada se modifica» se comprueba comparando el banco antes y después, y la ida y vuelta da un resultado exacto (solo los dos perfiles editados en actualizados) |
