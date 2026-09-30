---
id: HU-129
titulo: "Previsualizar la ficha exactamente como la verá el cliente"
epica: EP-006
prioridad: alta
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.8
---

# HU-129 — Previsualizar la ficha exactamente como la verá el cliente

**Como** administradora de inventario de Talento Humano,
**quiero** ver la ficha tal como la verá el cliente antes de publicarla,
**para** no descubrir en producción que un campo quedó vacío o que un texto se lee distinto de lo que pensé.

## Criterios de aceptación

### Happy path — vista previa fiel

**Dado** que tengo un perfil listo para publicar,
**cuando** abro la vista previa,
**Entonces** veo la ficha exactamente como la verá el cliente
**Y** veo la disponibilidad como banda de arranque, no como fecha
**Y** veo el país, y la ciudad solo si la necesidad fuera presencial o híbrida

### Error — falta un dato que la publicación exige

**Dado** que al perfil le falta un atributo obligatorio del modelo,
**cuando** abro la vista previa,
**Entonces** el bloque que depende de ese atributo aparece marcado como incompleto y nombra el dato que falta
**Y** el panel me dice que el perfil no puede publicarse hasta completarlo

### Edge case — bloque opcional sin datos

**Dado** que un bloque opcional de la ficha no tiene datos, por ejemplo el reporte detallado de validación,
**cuando** abro la vista previa,
**Entonces** la ficha se muestra sin ese bloque, sin título ni hueco vacío, igual que la publicará el portal
**Y** el panel me indica que ese bloque es opcional y que su ausencia no impide publicar

### Edge case — previsualizar un perfil ya publicado

**Dado** que tengo cambios sin guardar sobre un perfil publicado,
**cuando** abro la vista previa,
**Entonces** veo la ficha con el cambio aplicado, tal como la verá el cliente si lo guardo
**Y** el portal sigue mostrando la versión vigente hasta que guarde

## Notas

Cubre **RF-8.7**. Se apoya en **RF-3.13** (banda de disponibilidad) y en la revisión de **D-18** (ciudad condicionada a la modalidad).

**La fidelidad es el requisito, no el detalle.** Una vista previa aproximada es peor que ninguna: crea confianza en algo que no se verificó. Por eso los escenarios verifican equivalencia con lo que el portal publica, incluidas las reglas de presentación que no viven en el dato — la banda y la ciudad condicionada.

**Solo vista previa fiel, sin comparación** (decisión del sponsor D3, 2026-09-30). La vista previa muestra la ficha con el cambio aplicado; no hay vista lado a lado del borrador frente a lo publicado. El antes/después por campo lo da **HU-126** al guardar.

**El bloque opcional vacío no se dibuja.** Es la misma regla que HU-130 fija para el Nivel 0: la ficha no muestra un bloque vacío ni promete un detalle que no existe.

**Revisión INVEST 2026-09-30:** se aplica D3 (se quita la promesa de comparar con lo que el cliente ve ahora); el escenario del bloque vacío, que no decía qué se veía, se parte en dos con resultado concreto: el atributo obligatorio que falta se marca en su bloque e impide publicar, y el bloque opcional vacío no se muestra y no impide publicar.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.7 · RF-3.13 · D-18 revisada · D3 del sponsor (2026-09-30) · relacionada con HU-126 (antes/después al guardar), HU-125 (atributos obligatorios) y HU-130 (Nivel 0)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ usa la ficha que ya dibuja el portal y los atributos obligatorios del modelo; no espera a otra historia de la épica |
| N | Negociable | ✓ la fidelidad es fija; dónde se abre la vista previa y cómo se marca el bloque incompleto son negociables |
| V | Valiosa | ✓ evita publicar fichas rotas |
| E | Estimable | ✓ reutiliza el componente de ficha del portal alimentado con el perfil en edición, más la marca de obligatorio/opcional por bloque; sin comparación que construir tras D3 |
| S | Pequeña | ✓ S: una vista con cuatro comportamientos definidos |
| T | Testeable | ✓ la equivalencia con la ficha publicada es verificable por captura, y cada escenario dice qué se ve y si bloquea |
