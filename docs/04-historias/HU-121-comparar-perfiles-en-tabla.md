---
id: HU-121
titulo: "Comparar muchos perfiles por el mismo criterio"
epica: EP-002
prioridad: alta
complejidad: S
estado: lista
fase: referencias-juicebox
prd_version: 4.18
depende_de: [HU-219, HU-119]
---

# HU-121 — Comparar muchos perfiles por el mismo criterio

**Como** líder de proyecto con varios perfiles candidatos en sus resultados,
**quiero** ver los resultados como tabla, con una columna por criterio activo,
**para** comparar leyendo columnas en lugar de abrir tarjeta por tarjeta.

## Criterios de aceptación

### Happy path — conmutar a la vista de tabla

**Esquema del escenario:** la tabla compara por columnas sin arrastrar la página
**Dado** que en «Todo el banco» tengo activos los criterios «Java» en Tecnología y «Banca» en Sector, con 8 perfiles en los resultados, y estoy en un <dispositivo>,
**cuando** cambio de «Tarjetas» a «Tabla»,
**Entonces** veo una fila por perfil y las columnas base —perfil, disponibilidad, modalidad y país— más una columna «Java» y una columna «Banca»
**Y** cada celda de criterio muestra ✓ o – y, al pasar el cursor o tocarla, la línea de evidencia del perfil con el texto de HU-119 («✓ Banca · 8 años declarados»)
**Y** no veo ningún porcentaje de coincidencia ni columnas de empresa actual o de enlace al perfil público del profesional
**Y** <desplazamiento>

**Ejemplos:**

| dispositivo | desplazamiento |
|---|---|
| computador | veo todas las columnas sin desplazar la página de lado |
| teléfono | las columnas que no caben se desplazan dentro de la tabla, sin que la página se desplace de lado |

### Error — la tabla no se dibuja vacía

**Dado** que estoy en la vista de tabla y mis filtros dejan cero perfiles,
**cuando** cargan los resultados,
**Entonces** veo el aviso del cero con sus salidas (HU-223)
**Y** no veo una tabla con encabezados y ninguna fila

### Edge case — sin criterios activos

**Dado** que estoy en «Todo el banco» sin ningún filtro ni criterio activo,
**cuando** cambio a la vista de tabla,
**Entonces** veo solo las columnas base —perfil, disponibilidad, modalidad y país—, sin columnas de criterio vacías
**Y** no aparece la columna de conteo de deseables

### Edge case — abrir un perfil desde la tabla y volver

**Esquema del escenario:** la ficha recorre la tabla en su orden
**Dado** que tengo la tabla de 5 perfiles a la vista en un <dispositivo>,
**cuando** toco la fila del tercer perfil,
**Entonces** se abre su ficha <espacio>, con «3 de 5» en el orden de la tabla
**Y** al cerrarla vuelvo a la tabla, en la vista de tabla y con los mismos criterios

**Ejemplos:**

| dispositivo | espacio |
|---|---|
| computador | en el panel lateral, con la tabla visible detrás |
| teléfono | a pantalla completa, con anterior y siguiente |

## Notas

Cubre **RF-13.12** completo: dos vistas (RF-13.12.1), una columna por criterio con ✓/– y el dato al pasar el cursor (RF-13.12.2), sin porcentaje (RF-13.12.3), sin columnas de empresa ni de enlaces (RF-13.12.5) y desplazamiento dentro del contenedor (RF-13.12.6, M-6 de §8.1). Abre la ficha con el panel lateral de **RF-13.11**, ya construido (HU-120, D47).

Tomado de Juicebox, que ofrece vista clásica y vista de tabla (evidencia A). **Las tarjetas** sirven para evaluar un perfil a la vez; **la tabla** sirve para comparar muchos por el mismo criterio. Ninguna sustituye a la otra. **Dos diferencias deliberadas con el referente:** «cumple 3 de 4» en lugar de «Match 100 %», y sin columnas de empresa actual ni de enlace al perfil público (contradicen no exponer contacto ni empleador identificable). **Lo que la tabla habilita y la grilla no** es la selección múltiple (RF-13.12.4), el motivo principal para tenerla: vive en **HU-250**, que se monta sobre esta tabla.

**Partida el 2026-10-02 por validación INVEST independiente (fallaba la S), sin recortar alcance.** La tabla de solo lectura (esta historia) y marcar varios para sumarlos de una vez (**HU-250**) son dos capacidades que se entregan y verifican por separado. Esta historia se queda con la vista, sus columnas y abrir la ficha; HU-250 lleva la suma en grupo, su error de perfil despublicado y la dependencia con EP-004. El error de esta historia pasa a ser la tabla ante un cero.

**Refinada el 2026-10-02 (discovery de EP-002), sin recortar alcance.** Los escenarios llevan datos concretos; la regla del teléfono pasa a un esquema con ejemplos; y «sin criterios», que es un estado legítimo, pasa a edge. Abrir la ficha desde la tabla se precisa por dispositivo. **El flujo `docs/06-flows/EP-002` dice que en pantalla estrecha «la tabla degrada a tarjetas»**; el PRD (RF-13.12.6) dice que se desplaza dentro de su contenedor. Gana el PRD; el flujo hay que alinearlo en la consolidación.

**Qué es un «criterio activo».** Hoy, los filtros de HU-219; cuando EP-009 exista, también los criterios de la instrucción y del Perfil Objetivo, con la misma evaluación (RF-13.8, HU-174). La **columna de conteo de deseables** («cumple 3 de 4 deseables») aparece solo cuando hay deseables, que trae HU-118 (EP-009). Con solo filtros, todas las celdas de criterio son ✓, porque un filtro acota: es correcto y no se disimula.

**Decisiones elegidas por el modelo por delegación del sponsor:**
- **T-30 (qué significa «la elección persiste en la sesión», ADR-0004):** la vista viaja en la URL (`vista=`, HU-221), que siempre manda; cuando la URL no la trae, se usa la última vista elegida **en esa pestaña** (`sessionStorage` versionado), la propuesta por omisión de ADR-0004. No se guarda en servidor.
- La tabla muestra **los mismos perfiles en el mismo orden** que las tarjetas (HU-222); el espacio no-perfil del grid no es una fila (HU-226); ante un cero se muestra el aviso de HU-223, nunca una tabla vacía.

**Fronteras:** las líneas de evidencia ✓/– y sus plantillas son de **HU-119** (EP-003); esta historia las dispone en columnas. La selección múltiple y la suma en grupo son de **HU-250**; sumar y quitar uno a uno, de **HU-192** (EP-004). El **comparador** de hasta tres perfiles, que D112 abre también desde la acción en grupo de la tabla, es de **HU-204** (EP-004) y se cablea sobre la selección de HU-250.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-13.12 (13.12.1–13.12.3, 13.12.5, 13.12.6; 13.12.4 en HU-250) · RF-13.11 · RF-13.10 · §8.1 M-6 · ADR-0004 (T-30) · D112 · depende de HU-219 (criterios activos) y HU-119 (EP-003, evidencia ✓/–) · partida en HU-250 (selección múltiple) · relacionada con HU-120, HU-118, HU-174, HU-204, HU-221, HU-222, HU-223 y HU-226

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: la evidencia de HU-119 (EP-003, `lista`, en construcción) y los criterios de HU-219 (misma épica). No depende de EP-004 ni de EP-009: con solo filtros la tabla funciona completa |
| N | Negociable | ✓ fija columnas por criterio, sin porcentaje ni columnas de empresa o enlaces, y desplazamiento en el contenedor; el diseño de la tabla y la persistencia por pestaña son negociables |
| V | Valiosa | ✓ comparar muchos perfiles por el mismo criterio leyendo columnas acorta la evaluación |
| E | Estimable | ✓ S: una vista nueva sobre resultados existentes que reutiliza la evidencia de HU-119 y el panel de ficha de HU-120 |
| S | Pequeña | ✓ S: una capacidad (la vista de tabla) en cuatro escenarios; la suma en grupo está en HU-250 |
| T | Testeable | ✓ e2e en computador y teléfono con perfiles sembrados: columnas y celdas exactas, tabla sin criterios, tabla ante un cero y apertura de ficha con «3 de 5» |
