---
id: HU-125
titulo: "Crear un perfil eligiendo del catálogo"
epica: EP-006
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-089]
---

# HU-125 — Crear un perfil eligiendo del catálogo

**Como** administradora de inventario de Talento Humano,
**quiero** crear un perfil eligiendo rol, tecnologías y sector de un catálogo en lugar de escribirlos,
**para** que el banco no termine con «Figma», «figma» y «Fgima» como tres tecnologías distintas.

## Criterios de aceptación

### Happy path — perfil nuevo en borrador

**Dado** que estoy creando un perfil nuevo en el panel con rol de administradora,
**cuando** lo guardo con sus atributos del modelo de datos,
**Entonces** el perfil queda en estado *borrador*
**Y** rol, tecnologías y sector quedan como valores del catálogo, no como texto libre
**Y** el perfil no es visible en el portal

### Error — familia sin modalidades de prueba

**Dado** que el rol que necesito pertenece a una familia sin modalidades de prueba registradas,
**cuando** lo selecciono en el editor del perfil,
**Entonces** el panel me advierte en ese momento que ningún perfil de esa familia podrá publicarse
**Y** me ofrece ir a registrar la modalidad antes de seguir

### Error — campos obligatorios incompletos

**Dado** que dejé sin llenar un atributo obligatorio del modelo,
**cuando** guardo el perfil,
**Entonces** el perfil se guarda igual como borrador
**Y** el panel señala qué falta para poder publicarlo

### Edge case — el valor que necesito no está en el catálogo

**Dado** que el rol que necesito no existe en el catálogo,
**cuando** lo escribo en el campo de rol,
**Entonces** el panel me muestra los valores parecidos antes de dejarme crear uno nuevo
**Y** crear queda disponible después de haber visto la alternativa

## Notas

Cubre **RF-8.2**, **RF-8.16.2**, **RF-8.16.3** y **RF-8.16.4**.

**El borrador es el estado de llegada, siempre.** Un perfil nuevo no nace publicado ni puede nacerlo: RF-8.4 exige consentimiento nominal registrado antes de publicar, y ese registro es un acto aparte (HU-127).

**La detección de parecidos vive en HU-089** (catálogos). Aquí solo se consume desde el editor: por eso el edge case describe el comportamiento y no la mecánica.

**Revisión INVEST 2026-09-30:** el error de familia deja de repetir la acción en Dado y Cuando (Dado = el rol pertenece a una familia sin modalidades; Cuando = lo selecciono); Dado y Cuando de los demás escenarios pasan a estado y acción únicos; `depende_de: [HU-089]`; tabla INVEST razonada.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · depende de HU-089 · habilita HU-127

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: consume el catálogo y la detección de parecidos de HU-089, no los construye; se construye después de ella |
| N | Negociable | ✓ fija que todo nace en borrador y que no hay texto libre; la disposición del editor queda abierta |
| V | Valiosa | ✓ es la puerta de entrada del inventario |
| E | Estimable | ✓ M: `inventario.perfiles` y sus relaciones con rol, tecnología y sector existen desde la migración 0005; falta el editor del panel con selectores sobre los catálogos y la lista de faltantes para publicar, que sale del modelo de datos del Anexo B del PRD |
| S | Pequeña | ✓ cuatro escenarios de una capacidad (crear en borrador) |
| T | Testeable | ✓ estado resultante, valores del catálogo y ausencia en el portal se comprueban tras guardar |
