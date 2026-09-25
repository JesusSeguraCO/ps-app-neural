---
id: HU-130
titulo: "Publicar un perfil sin esperar el reporte detallado de validación"
epica: EP-006
prioridad: alta
complejidad: S
estado: draft
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

**Dado** que publiqué con Nivel 0 y más tarde registro el reporte detallado,
**cuando** lo guardo,
**Entonces** la ficha se enriquece sin republicar el perfil
**Y** el cliente que la abra ve la evidencia por criterio

## Notas

Cubre **RF-8.10** y los **tres niveles progresivos del Anexo B.9**.

**Este requisito existe para proteger a O5 de sí mismo.** Si publicar exigiera el reporte completo de las tres validaciones, el cuello de botella de la redacción se convertiría en cuello de botella del inventario, y un banco vacío no sostiene ningún objetivo. La publicación nunca se bloquea por falta de detalle; se bloquea por falta de consentimiento (HU-128) y por falta de modalidad en la familia (RF-8.16.4).

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · Anexo B.9

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ |
| N | Negociable | ✓ |
| V | Valiosa | ✓ desbloquea el llenado del banco, que es la condición de D-3 |
| E | Estimable | por confirmar con Tecnología |
| S | Pequeña | ✓ |
| T | Testeable | ✓ |
