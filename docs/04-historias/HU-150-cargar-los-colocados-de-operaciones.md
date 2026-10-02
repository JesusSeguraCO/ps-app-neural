---
id: HU-150
titulo: "Cargar la información de colocados de Operaciones"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.15
depende_de: [HU-137]
---

# HU-150 — Cargar la información de colocados de Operaciones

**Como** administradora de inventario de Talento Humano,
**quiero** cargar en la pestaña de colocados el archivo JSON o CSV con la información de colocados que me entrega Operaciones,
**para** que la pestaña refleje también las asignaciones que no registré en el panel y sepa desde qué fecha es ese dato.

## Criterios de aceptación

### Happy path — carga de un archivo de Operaciones

**Dado** que Operaciones me entregó un archivo JSON o CSV con código del perfil (PS-XXXX), cliente, fecha de inicio y fecha de liberación de colocados que no están registrados en el panel, y una columna adicional de observaciones,
**cuando** lo cargo en la pestaña de colocados,
**Entonces** esos colocados aparecen en la pestaña marcados como procedentes de la carga de Operaciones
**Y** la pestaña muestra como fecha de corte el momento de esa carga
**Y** el panel me informa que la columna de observaciones se ignoró

### Error — filas con errores de formato

**Dado** que tengo un archivo de Operaciones con filas válidas y filas con errores de formato,
**cuando** lo cargo,
**Entonces** se aplican solo las filas válidas
**Y** cada fila con error se muestra con su número y el motivo, sin aplicarse

### Error — la carga de Operaciones está desincronizada

**Dado** que la última carga de Operaciones se hizo hace *N* días y no ha habido otra,
**cuando** abro la pestaña de colocados,
**Entonces** el aviso «dato desincronizado» junto a la fecha de corte aparece según la tabla
**Y** los colocados de esa carga siguen visibles, sin ocultarse, con o sin aviso

| Días desde la última carga (*N*) | Aviso «dato desincronizado» |
|---|---|
| 7 | no aparece |
| 8 | aparece |

### Edge case — una fila difiere de un colocado registrado en el panel

**Dado** que un perfil está registrado en el panel como colocado con una fecha de liberación y el archivo de Operaciones trae para ese mismo código otra fecha de liberación,
**cuando** cargo el archivo,
**Entonces** el colocado del panel conserva sus datos y la fila no lo pisa
**Y** la fila queda señalada como «diferencia con Operaciones», con los dos valores a la vista, para que yo decida si la acepto

### Edge case — el archivo no es JSON ni CSV

**Dado** que tengo un archivo de Operaciones que no es JSON ni CSV,
**cuando** lo cargo,
**Entonces** el panel lo rechaza entero y me dice que admite JSON o CSV
**Y** la pestaña conserva los colocados y la fecha de corte de la carga anterior

## Notas

Cubre **RF-8.13.1** en su parte de carga de Operaciones (enmienda v4.15: D8 y D12) y las decisiones **D12, D15 y D16** del sponsor.

**Nace el 2026-09-30 por D12** (sponsor, tras el DoR de EP-006; bloqueo B5): la carga de Operaciones sale de HU-137 a esta historia. **Partición, no recorte**: las dos se construyen en EP-006. HU-137 conserva el registro en el panel, que sigue siendo la fuente (D8).

**Declarar la antigüedad del dato no es un detalle técnico.** RF-8.13.1 lo dice sin rodeos: duplicar una fuente de verdad sin declararlo es cómo un dato desactualizado termina sosteniendo una decisión. Por eso la fecha de corte y el aviso «dato desincronizado» son criterio de aceptación y no una nota al pie. El umbral es de D12: **más de 7 días** sin una carga nueva; con exactamente 7 días el aviso todavía no aparece; los dos lados del límite (7 y 8 días) están en la tabla del escenario de desincronizado.

**Sin integración automática en v1** (D8): la carga es un acto de Talento Humano con el archivo que entrega Operaciones; no hay conexión con el sistema de asignación (§8.3).

**Revisión DoR 2026-09-30: aplicadas D15 y D16** (sponsor, mismo día). D16: la fecha de corte es **el momento de la carga**, no una fecha escrita en el archivo; las columnas mínimas son código del perfil (PS-XXXX), cliente, fecha de inicio y fecha de liberación, y cualquier otra columna se ignora y se informa (happy path). D15: si una fila difiere de un colocado ya registrado en el panel, **gana el panel**; la fila no lo pisa y queda señalada como «diferencia con Operaciones» para que Talento Humano decida si la acepta (nuevo edge). El límite de 7 días se prueba con una tabla de ejemplos (7 → sin aviso, 8 → aviso) dentro del escenario de desincronizado, sin pasar de cinco escenarios.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.15 · RF-8.13.1 · D8, D12, D15 y D16 (sponsor, 2026-09-30) · sale de HU-137 · depende de HU-137

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: la carga llena la pestaña de colocados que construye HU-137; no depende de la importación masiva de perfiles ni de ningún sistema externo |
| N | Negociable | ✓ fija formatos (JSON o CSV), columnas mínimas, fecha de corte en el momento de la carga, umbral de 7 días, filas malas sin aplicar y que gana el panel; la presentación del aviso y de la diferencia son negociables |
| V | Valiosa | ✓ la pestaña deja de depender de que Talento Humano registre a mano lo que Operaciones ya sabe, declara la edad de ese dato y señala las diferencias sin perder el registro del panel |
| E | Estimable | ✓ M: leer dos formatos con cuatro columnas fijas, validar por fila, marcar el origen, fechar la carga, calcular el aviso a los 7 días y señalar las diferencias con el panel; D15 y D16 cierran las dudas de columnas, corte y conflicto |
| S | Pequeña | ✓ M: una capacidad (cargar la información de Operaciones con su frescura) en cinco escenarios |
| T | Testeable | ✓ archivos de prueba JSON y CSV con filas buenas y malas, una columna de más, una fila que difiere del panel y un archivo de otro formato, y cargas fijadas a 7 y 8 días, dan resultados observables en la pestaña |
