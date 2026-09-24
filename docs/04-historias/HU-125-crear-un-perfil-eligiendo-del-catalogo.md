---
id: HU-125
titulo: "Crear un perfil eligiendo del catálogo"
epica: EP-006
prioridad: alta
complejidad: M
estado: draft
fase: panel-crud
prd_version: 4.8
---

# HU-125 — Crear un perfil eligiendo del catálogo

**Como** administradora de inventario de Talento Humano,
**quiero** crear un perfil eligiendo rol, tecnologías y sector de un catálogo en lugar de escribirlos,
**para** que el banco no termine con «Figma», «figma» y «Fgima» como tres tecnologías distintas.

## Criterios de aceptación

### Happy path — perfil nuevo en borrador

**Dado** que tengo rol de administradora,
**cuando** creo un perfil con sus atributos del modelo de datos,
**Entonces** el perfil queda en estado *borrador*
**Y** rol, tecnologías y sector se eligieron del catálogo, no se escribieron libres
**Y** el perfil no es visible en el portal

### Error — familia sin modalidades de prueba

**Dado** que elijo un rol cuya familia no tiene modalidades de prueba registradas,
**cuando** lo selecciono,
**Entonces** el panel me advierte en ese momento que ningún perfil de esa familia podrá publicarse
**Y** me ofrece ir a registrar la modalidad antes de seguir

### Error — campos obligatorios incompletos

**Dado** que dejo sin llenar un atributo obligatorio del modelo,
**cuando** intento guardar,
**Entonces** el perfil se guarda igual como borrador
**Y** el panel señala qué falta para poder publicarlo

### Edge case — el valor que necesito no está en el catálogo

**Dado** que el rol que necesito no existe,
**cuando** lo escribo,
**Entonces** el panel me muestra los valores parecidos antes de dejarme crear uno nuevo
**Y** crear queda disponible después de haber visto la alternativa

## Notas

Cubre **RF-8.2**, **RF-8.16.2**, **RF-8.16.3** y **RF-8.16.4**.

**El borrador es el estado de llegada, siempre.** Un perfil nuevo no nace publicado ni puede nacerlo: RF-8.4 exige consentimiento nominal registrado antes de publicar, y ese registro es un acto aparte (HU-127).

**La detección de parecidos vive en HU-089** (catálogos). Aquí solo se consume desde el editor: por eso el edge case describe el comportamiento y no la mecánica.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · relacionada con HU-089

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | consume el catálogo de HU-089, no lo construye |
| N | Negociable | ✓ |
| V | Valiosa | ✓ es la puerta de entrada del inventario |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
