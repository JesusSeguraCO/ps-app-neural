---
id: HU-142
titulo: "Corregir solo las filas que fallaron"
epica: EP-006
prioridad: media
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
spec: docs/10-specs/importacion-masiva.md
depende_de: [HU-141]
---

# HU-142 — Corregir solo las filas que fallaron

**Como** administradora de inventario de Talento Humano,
**quiero** descargar únicamente las filas con error, con su motivo y en el formato en que las mandé,
**para** corregir tres filas sin tener que reprocesar las cincuenta y siete que ya estaban bien.

## Criterios de aceptación

### Happy path — descargar solo lo que falló

**Dado** que tres de sesenta filas tienen error y las cincuenta y siete buenas quedaron aplicadas,
**cuando** descargo el archivo de errores desde el resultado de la importación,
**Entonces** recibo solo esas tres filas con su motivo, en el formato en que llegaron
**Y** el archivo no incluye ninguna de las cincuenta y siete aplicadas

### Error — el archivo completo falló

**Dado** que ninguna fila pudo procesarse,
**cuando** descargo el archivo de errores,
**Entonces** recibo todas las filas con su motivo
**Y** el panel me dice si el problema fue del archivo entero y no de las filas

### Edge case — reimportar las corregidas

**Dado** que corregí las tres filas y las vuelvo a pegar,
**cuando** confirmo la importación,
**Entonces** actualizan los perfiles que corresponden por código
**Y** no se duplica nada de lo que ya había entrado en la primera importación

## Notas

**Dividida de HU-086 el 2026-09-22.** Es el ciclo de corrección, que tiene valor por sí solo: sin él, tres filas malas obligan a rehacer el archivo entero.

**El edge case es el que hace segura la función.** Reimportar solo lo corregido depende de que el código siga siendo la llave de identidad (RF-8.15.2) y de que la importación sea idempotente. Sin eso, corregir produciría duplicados y la función haría más daño que bien.

Cubre **RF-8.15.10**.

**Revisión INVEST 2026-09-30:** rol unificado («administradora de inventario de Talento Humano»); el When del happy pasa de un estado («estoy en el resultado») a una acción («descargo el archivo de errores») y lo aplicado pasa al Given; When del edge alineado a «confirmo la importación»; se declara `depende_de: [HU-141]`.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · spec `docs/10-specs/importacion-masiva.md` · depende de HU-141

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-141 (declarada): sin confirmación no hay resultado del que descargar errores |
| N | Negociable | ✓ el formato de origen lo fija RF-8.15.10; cómo se presenta el motivo por fila es negociable |
| V | Valiosa | ✓ evita rehacer archivos completos por errores puntuales |
| E | Estimable | ✓ filtra las filas con error ya calculadas por la confirmación y las serializa en el formato de entrada; la idempotencia la da la spec (§4.4); falta la cifra del equipo |
| S | Pequeña | ✓ S: una descarga y una reimportación que reutiliza HU-141 |
| T | Testeable | ✓ un archivo de sesenta filas con tres errores y uno totalmente inválido dan descargas comparables fila a fila; la reimportación se verifica contando perfiles antes y después |
