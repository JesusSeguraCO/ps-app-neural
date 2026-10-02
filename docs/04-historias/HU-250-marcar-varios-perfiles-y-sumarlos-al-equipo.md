---
id: HU-250
titulo: "Marcar varios perfiles en la tabla y sumarlos a mi equipo de una vez"
epica: EP-002
prioridad: alta
complejidad: S
estado: lista
fase: referencias-juicebox
prd_version: 4.18
depende_de: [HU-121, HU-192]
---

# HU-250 — Marcar varios perfiles en la tabla y sumarlos a mi equipo de una vez

**Como** líder de proyecto que comparó en la tabla a varios candidatos,
**quiero** marcar los que me sirven y sumarlos a mi equipo con una sola acción,
**para** armar el equipo sin ir perfil por perfil.

## Criterios de aceptación

### Happy path — marcar varios perfiles y sumarlos de una vez

**Dado** que veo la tabla con 8 perfiles, PS-0142 ya está en mi equipo y tengo marcados PS-0142, PS-0115 y PS-0187,
**cuando** toco «Sumar 3 al equipo»,
**Entonces** PS-0115 y PS-0187 quedan en mi equipo, PS-0142 no se duplica, y «Mi equipo» pasa de 1 a 3
**Y** la selección de la tabla se limpia
**Y** quedan registrados los eventos «perfil sumado» de los dos perfiles que entraron

### Error — uno de los marcados dejó de estar publicado

**Dado** que tengo marcados PS-0115 y PS-0187 en la tabla y Talento Humano pausó PS-0187 después de que lo marqué,
**cuando** toco «Sumar 2 al equipo»,
**Entonces** PS-0115 queda en mi equipo
**Y** veo un aviso que nombra a PS-0187 y dice que ya no está disponible para sumar, sin mensaje genérico
**Y** PS-0187 no queda en mi equipo

### Edge case — sin nada marcado no hay acción en grupo

**Dado** que veo la tabla con 8 perfiles y no tengo ninguno marcado,
**cuando** miro la tabla,
**Entonces** no veo el botón «Sumar al equipo» ni ninguna acción en grupo

### Edge case — cambiar los filtros con perfiles marcados

**Dado** que tengo marcados PS-0115 y PS-0187 y PS-0187 deja de cumplir un filtro que voy a añadir,
**cuando** marco ese filtro en el panel de facetas,
**Entonces** PS-0187 sale de los resultados y de la selección
**Y** el botón pasa a decir «Sumar 1 al equipo»

## Notas

Cubre **RF-13.12.4** («la tabla habilita seleccionar varios perfiles y sumarlos al equipo de una vez, cosa que la grilla no permite y que es el motivo principal para tener tabla»).

**Nace el 2026-10-02 de la partición de HU-121** por validación INVEST independiente (fallaba la S). **Partición, no recorte**: las dos se construyen en EP-002. HU-121 conserva la vista de tabla; esta historia, la selección múltiple y la suma en grupo.

**Decisiones elegidas por el modelo por delegación del sponsor:**
- **Una sola operación** (`PATCH /api/v1/equipo` con `agregar`, ADR-0004 H33): idempotente, sin duplicar los que ya estaban; un perfil no publicable vuelve como 422 con su código y la interfaz lo nombra (convención de EP-006: ninguna pantalla muda ante un rechazo).
- **La selección vive solo en la pantalla**: no es estado de búsqueda ni viaja en el enlace (HU-221); se limpia tras sumar y pierde los perfiles que salen de los resultados.

**Fronteras:** sumar y quitar uno a uno y el contador de «Mi equipo» son de **HU-192** (EP-004, `lista`), que esta historia reutiliza; el **comparador** que D112 abre desde la acción en grupo de esta selección es de **HU-204** (EP-004).

**Identificador:** se toma HU-250, fuera del rango HU-219–HU-226 asignado a EP-002, porque HU-227 en adelante los están usando en paralelo EP-009, EP-010 y EP-011. La consolidación puede renumerar.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-13.12.4 · ADR-0004 (H33) · D112 · nace de la partición de HU-121 (2026-10-02) · depende de HU-121 (la tabla) y HU-192 (EP-004, sumar al equipo) · relacionada con HU-204 y HU-221

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: la tabla de HU-121 (misma épica) y la operación de equipo de HU-192 (EP-004, `lista`); se secuencia después de ambas |
| N | Negociable | ✓ fijos: una sola operación sin duplicados y el aviso que nombra al perfil rechazado; la forma de marcar y del botón son negociables |
| V | Valiosa | ✓ es el motivo principal de la tabla según el PRD: armar el equipo en un paso |
| E | Estimable | ✓ S: casillas por fila, un botón con contador y un `PATCH` que ya define ADR-0004 |
| S | Pequeña | ✓ S: una capacidad en cuatro escenarios |
| T | Testeable | ✓ e2e con perfiles sembrados: suma con uno ya en el equipo, un perfil pausado entre marcar y sumar, sin selección y con un filtro que saca a un marcado |
