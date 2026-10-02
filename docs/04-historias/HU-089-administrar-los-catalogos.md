---
id: HU-089
titulo: "Crear valores de catálogo sin duplicar los que ya existen"
epica: EP-006
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.8
---

# HU-089 — Crear valores de catálogo sin duplicar los que ya existen

**Como** administradora de inventario de Talento Humano,
**quiero** crear roles, tecnologías y sectores desde un catálogo que me avise si ya existe algo parecido,
**para** que el banco crezca sin llenarse de duplicados que rompan los filtros del cliente.

## Criterios de aceptación

### Happy path — rol nuevo en una familia con modalidades de prueba

**Dado** que necesito publicar un Diseñador UX/UI Banking, ese rol no existe y su familia tiene modalidades de prueba registradas,
**cuando** creo el rol en el catálogo eligiendo esa familia,
**Entonces** el rol queda disponible en el editor de perfiles
**Y** el formulario de rol tiene la familia como campo obligatorio

### Happy path — seleccionar en vez de escribir

**Dado** que estoy editando las tecnologías de un perfil,
**cuando** escribo «Fig» en el campo,
**Entonces** el panel me ofrece para elegir los valores del catálogo que coinciden, como «Figma»
**Y** el campo no acepta guardar texto libre
**Y** crear un valor nuevo aparece como una acción aparte de las coincidencias

### Error — valor parecido a uno existente

**Dado** que el catálogo ya tiene «Figma»,
**cuando** intento crear la tecnología «Fgima»,
**Entonces** el panel me muestra «Figma» como valor parecido y me deja usarlo en un toque
**Y** crear «Fgima» exige que confirme que es un valor distinto

### Error — valor idéntico salvo mayúsculas

**Dado** que el catálogo ya tiene «Figma»,
**cuando** intento crear «figma»,
**Entonces** el panel impide crearlo
**Y** me indica que ya existe como «Figma»

### Edge case — rol nuevo en una familia sin modalidades de prueba

**Dado** que la familia que elijo para un rol nuevo no tiene modalidades de prueba registradas,
**cuando** creo el rol,
**Entonces** el rol queda creado
**Y** el panel me advierte que ningún perfil de esa familia se podrá publicar hasta registrar una modalidad

## Notas

**Dividida el 2026-09-22.** La historia original tenía **seis escenarios** y mezclaba cuatro capacidades: crear, detectar parecidos, desactivar y fusionar. Su propia tabla INVEST proponía el corte —*«selección en vez de texto libre primero, fusión de duplicados después»*—. La limpieza de la taxonomía es ahora **HU-143**.

**El problema que resuelve:** con texto libre, la taxonomía se construye por tecleo. Tres formas de escribir Figma son tres tecnologías distintas y contaminan los filtros del cliente de forma permanente.

**La dependencia que el panel encadena:** un rol exige familia, y la familia determina las modalidades de prueba disponibles. Crear un rol de una familia sin modalidades produce perfiles que no se pueden publicar, y eso hay que saberlo **al crear el rol**, no al intentar publicar.

**Lo que deliberadamente no se declara:** la relación entre rol y tecnologías. Emerge de los perfiles reales y el panel del cliente la calcula sola (RF-8.16.7). Declararla a mano sería trabajo doble que se desactualiza.

Cubre **RF-8.16.2**, **RF-8.16.3**, **RF-8.16.4** y **RF-8.16.8**.

**Revisión INVEST 2026-09-30:** rol unificado; reorganizada en cinco escenarios sin Entonces condicionales: rol en familia con modalidades (happy), selección del catálogo (happy), parecido «Fgima» (error), idéntico salvo mayúsculas (error) y familia sin modalidades (edge, antes escondido como «si…» dentro del happy); tabla INVEST razonada.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · consumida por HU-125 · habilita HU-143

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ no depende de otra historia de la épica: los catálogos existen como tablas y esta historia les pone la administración encima. HU-125 y HU-143 dependen de ella, no al revés |
| N | Negociable | ✓ fija que no hay texto libre y que el parecido se avisa; el umbral de parecido y la forma del aviso quedan abiertos |
| V | Valiosa | ✓ protege la calidad de los filtros, que es lo que el cliente usa |
| E | Estimable | ✓ M: las tablas de catálogo (familias, roles, tecnologías, sectores, modalidades) existen desde la migración 0005; falta la pantalla de alta, la normalización de mayúsculas y acentos y la distancia de edición, deterministas y sobre catálogos de decenas de valores |
| S | Pequeña | ✓ cinco escenarios de una capacidad (crear sin duplicar); retirar y fusionar están en HU-143 |
| T | Testeable | ✓ cada caso tiene un valor de entrada concreto («Fig», «Fgima», «figma») y un resultado observable |
