---
id: HU-130
titulo: "Publicar un perfil sin esperar el reporte detallado de validación"
epica: EP-006
prioridad: alta
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
---

# HU-130 — Publicar un perfil sin esperar el reporte detallado de validación

**Como** administradora de inventario de Talento Humano,
**quiero** publicar un perfil con el enunciado que se deriva de su rol, sin esperar a redactar el reporte completo,
**para** que el banco no se quede vacío mientras alguien encuentra tiempo de escribir evidencia.

## Criterios de aceptación

### Happy path — publicación con Nivel 0

**Dado** que un perfil cumple sus condiciones de publicación y no tiene reporte detallado de validación,
**cuando** lo publico,
**Entonces** se publica con el enunciado de Nivel 0, derivado de su familia de rol sin intervención mía
**Y** la ficha no muestra un bloque vacío ni promete un detalle que no existe

### Error — la familia no tiene modalidades de prueba registradas

**Dado** que la familia del rol no tiene ninguna modalidad de prueba en el catálogo,
**cuando** intento publicar,
**Entonces** el panel lo impide y me manda a registrar la modalidad
**Y** explica que sin ella ningún perfil de esa familia puede publicarse

### Edge case — el detalle llega después

**Dado** que un perfil está publicado con Nivel 0,
**cuando** registro y guardo su reporte detallado de validación,
**Entonces** la ficha se enriquece sin republicar el perfil
**Y** el cliente que la abra ve la evidencia por criterio

## Notas

Cubre **RF-8.10** y los **tres niveles progresivos del Anexo B.9**.

**Este requisito existe para proteger a O5 de sí mismo.** Si publicar exigiera el reporte completo de las tres validaciones, el cuello de botella de la redacción se convertiría en cuello de botella del inventario, y un banco vacío no sostiene ningún objetivo. La publicación nunca se bloquea por falta de detalle; se bloquea por falta de consentimiento (HU-128) y por falta de modalidad en la familia (RF-8.16.4).

**En qué se apoya el edge case.** El reporte detallado llega a un perfil publicado por la edición de **HU-126** (que declara el efecto de cara al cliente al guardar), a partir de la evidencia adjunta en **HU-131** o del borrador que proponen **HU-140** (plantilla de la modalidad) y **HU-149** (fecha y resultado por patrones). Esta historia fija solo que ese enriquecimiento no exige republicar.

**Revisión INVEST 2026-09-30:** el registro del reporte pasa del Dado al Cuando (el Dado queda como estado: perfil publicado con Nivel 0) y se declara el apoyo en HU-126 y HU-131/HU-140/HU-149 para el edge case.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.10 · RF-8.16.4 · Anexo B.9 · se apoya en HU-126 (editar publicado) y HU-131/HU-140/HU-149 (origen del reporte detallado)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ el happy path y el error se construyen solos sobre el catálogo de familias y modalidades; el edge case se apoya en la edición de HU-126 y en la evidencia de HU-131/HU-140/HU-149, que no bloquean los otros dos escenarios |
| N | Negociable | ✓ el principio es fijo (RF-8.10); el texto del enunciado de Nivel 0 sale del catálogo y es administrable |
| V | Valiosa | ✓ desbloquea el llenado del banco, que es la condición de D-3 |
| E | Estimable | ✓ la ficha elige el nivel según existan datos; la guarda de modalidad es una comprobación sobre la dependencia familia → modalidades del catálogo (RF-8.16.4) |
| S | Pequeña | ✓ S: una regla de presentación y una guarda de publicación |
| T | Testeable | ✓ enunciado de Nivel 0 visible, publicación impedida con motivo, y ficha enriquecida sin cambio de estado |
