---
id: HU-148
titulo: "Reutilizar un emparejamiento de columnas guardado"
epica: EP-006
prioridad: media
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.14
spec: docs/10-specs/importacion-masiva.md
depende_de: [HU-086]
---

# HU-148 — Reutilizar un emparejamiento de columnas guardado

**Como** administradora de inventario de Talento Humano,
**quiero** guardar cómo emparejé las columnas de mi hoja y reutilizarlo en la próxima importación,
**para** no volver a emparejar a mano la misma hoja que importo todos los meses.

## Criterios de aceptación

### Happy path — guardar el emparejamiento

**Dado** que en el asistente corregí el emparejamiento de las columnas de mi hoja con los campos del perfil,
**cuando** lo guardo como plantilla con un nombre,
**Entonces** la plantilla aparece en la lista de emparejamientos guardados
**Y** conserva qué columna va a qué campo y cuáles quedaron en «no importar»

### Happy path — reutilizar el emparejamiento en la hoja del mes siguiente

**Dado** que tengo guardada la plantilla «Disponibilidad mensual» y pegué una hoja con los mismos encabezados,
**cuando** elijo esa plantilla en el paso de emparejamiento,
**Entonces** cada columna queda emparejada como la guardé
**Y** puedo corregir cualquier emparejamiento antes de pasar a la vista previa

### Error — a la hoja le falta una columna de la plantilla

**Dado** que la plantilla empareja una columna «Disponibilidad» que la hoja pegada no trae,
**cuando** aplico la plantilla,
**Entonces** el asistente me dice qué columnas de la plantilla faltan en la hoja
**Y** los campos que esas columnas alimentaban no se tocan en ningún perfil

### Edge case — la hoja trae una columna que la plantilla no conoce

**Dado** que la hoja pegada trae una columna nueva que no estaba cuando guardé la plantilla,
**cuando** aplico la plantilla,
**Entonces** las columnas conocidas se emparejan como la guardé
**Y** la columna nueva queda sin emparejar, se ignora y el asistente me lo informa

## Notas

**Nace el 2026-09-30 por D2** (sponsor): «guardar el emparejamiento de columnas como plantilla» salía como un Y dentro del primer escenario de HU-086, pero es otra capacidad —guardar, listar y aplicar plantillas— y hacía que HU-086 no fuera pequeña. Es una **partición, no un recorte**: el alcance sigue entero en EP-006.

**Por qué importa:** la misma persona importa el mismo formato todos los meses (spec §6, paso 2). Sin plantilla, cada mes repite el emparejamiento a mano, y un emparejamiento mal repetido es un campo equivocado en decenas de perfiles.

**Una columna sin emparejar no bloquea** (spec §6, paso 2): se ignora y se informa. Un campo sin columna tampoco se toca (RF-8.15.4: campo ausente no modifica nada).

Cubre el paso 2 de `docs/10-specs/importacion-masiva.md` (plantillas de mapeo) dentro de **RF-8.15**.

**Revisión INVEST 2026-09-30:** historia creada por partición de HU-086 (D2), con `depende_de: [HU-086]` y tabla INVEST razonada.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.14 · D2 · sale de HU-086 · depende de HU-086

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: guarda y aplica el emparejamiento que construye HU-086; se construye después de ella y no la bloquea |
| N | Negociable | ✓ fija que se guarda, se elige y se puede corregir; cómo se nombran y se listan las plantillas queda abierto |
| V | Valiosa | ✓ ahorra el emparejamiento manual en cada importación recurrente y evita repetirlo mal |
| E | Estimable | ✓ S: una tabla de plantillas (nombre y pares columna → campo) y aplicarla sobre el emparejamiento de HU-086 comparando encabezados. Sin servicio externo |
| S | Pequeña | ✓ cuatro escenarios de una capacidad (guardar y reutilizar un emparejamiento) |
| T | Testeable | ✓ cada escenario tiene una hoja y una plantilla concretas y un emparejamiento resultante que se compara columna a columna |
