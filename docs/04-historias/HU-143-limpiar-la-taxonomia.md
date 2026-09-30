---
id: HU-143
titulo: "Retirar y fusionar valores sin romper los perfiles que los usan"
epica: EP-006
prioridad: media
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-089]
---

# HU-143 — Retirar y fusionar valores sin romper los perfiles que los usan

**Como** administradora de inventario de Talento Humano,
**quiero** sacar de circulación un valor obsoleto y unir los duplicados que ya entraron,
**para** limpiar la taxonomía sin dejar fichas sin el dato que explicaba cómo se validó un perfil.

## Criterios de aceptación

### Happy path — desactivar un valor en uso

**Dado** que una modalidad de prueba aparece en las fichas de varios perfiles publicados y ya no queremos ofrecerla,
**cuando** la desactivo,
**Entonces** el panel me advierte cuántas fichas dependen de ella
**Y** deja de poder elegirse en perfiles nuevos
**Y** las fichas que ya la tienen conservan su texto
**Y** no existe ninguna opción de borrarla

### Happy path — ver el impacto de una fusión antes de confirmarla

**Dado** que el catálogo tiene «Figma» y «Fgima» y ambos están en uso,
**cuando** elijo fusionar «Fgima» en «Figma»,
**Entonces** veo cuántos perfiles pasarán al valor destino
**Y** nada cambia en los perfiles ni en el catálogo hasta que confirme

### Happy path — confirmar la fusión

**Dado** que estoy viendo el impacto de fusionar «Fgima» en «Figma»,
**cuando** confirmo la fusión,
**Entonces** todos los perfiles que usaban «Fgima» pasan a «Figma»
**Y** «Fgima» desaparece del catálogo

### Error — fusión imposible

**Dado** que elijo como origen y destino el mismo valor, o dos valores de catálogos distintos,
**cuando** intento fusionarlos,
**Entonces** el panel rechaza la fusión y me dice el motivo
**Y** ningún perfil ni catálogo cambia

### Edge case — dos valores que no son el mismo

**Dado** que estoy viendo el impacto de fusionar dos valores y noto que representan cosas distintas,
**cuando** cancelo la fusión,
**Entonces** ambos valores siguen en el catálogo
**Y** ningún perfil cambia

## Notas

**Dividida de HU-089 el 2026-09-22.** Crear valores y limpiar la taxonomía son momentos distintos: el primero ocurre cada semana al editar perfiles, el segundo cada varios meses cuando alguien nota el desorden.

**No existe la acción de borrar, y es a propósito** (RF-8.16.5). Borrar una modalidad que cinco perfiles referencian dejaría sus fichas sin el texto que explica cómo se validaron. Desactivar impide elegirla en adelante y conserva lo publicado.

**La fusión es la única forma de deshacer un error de tecleo.** Sin ella, cualquier duplicado que haya entrado es permanente, y el filtro del cliente queda partido en dos para siempre.

Cubre **RF-8.16.5** y **RF-8.16.6**.

**Revisión INVEST 2026-09-30:** rol unificado («administradora de inventario de Talento Humano»); la fusión se separa en «veo el impacto antes» y «confirmo»; el antiguo «Error — no son el mismo» pasa a edge (cancelar desde la vista de impacto); se añade el error real (origen igual a destino o catálogos distintos → rechazo con motivo); el antiguo edge de la modalidad publicada se integra en el happy de desactivar para mantener cinco escenarios sin perder su Then (fichas conservan el texto y advertencia de cuántas dependen); se declara `depende_de: [HU-089]`.

## Trazabilidad

Épica madre: **EP-006** · PRD v4.8 · RF-8.16.5 · RF-8.16.6 · depende de HU-089

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | depende de HU-089 (declarada): sin catálogo no hay qué limpiar |
| N | Negociable | ✓ la prohibición de borrar la fija RF-8.16.5; cómo se presenta el impacto y el texto de los motivos es negociable |
| V | Valiosa | ✓ es la única forma de revertir un error de tecleo en la taxonomía |
| E | Estimable | ✓ desactivar es una marca sobre el valor; fusionar es un conteo previo y una reasignación en bloque dentro de un catálogo; falta la cifra del equipo |
| S | Pequeña | ✓ M: dos operaciones de catálogo sobre la misma pantalla |
| T | Testeable | ✓ con un catálogo sembrado («Figma»/«Fgima», una modalidad usada por perfiles publicados) cada escenario da un conteo y un estado del catálogo observables |
