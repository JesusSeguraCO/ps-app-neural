---
id: HU-222
titulo: "Ordenar los resultados por relevancia, disponibilidad o seniority"
epica: EP-002
prioridad: media
complejidad: S
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-219]
---

# HU-222 — Ordenar los resultados por relevancia, disponibilidad o seniority

**Como** líder de área que revisa el banco filtrado,
**quiero** elegir si los resultados se ordenan por relevancia, por disponibilidad más próxima o por seniority, y ver qué orden se está aplicando,
**para** ver primero a los perfiles que más pesan en la decisión que estoy tomando.

## Criterios de aceptación

### Happy path — ordenar por disponibilidad más próxima

**Dado** que veo 9 perfiles con las bandas «Disponible ahora», «En una semana», «En un mes» y «Por confirmar»,
**cuando** elijo el orden «Disponibilidad más próxima»,
**Entonces** los perfiles aparecen de la banda más cercana a la más lejana, con los «Por confirmar» al final
**Y** sobre los resultados se lee el orden aplicado: «Primero quienes están disponibles antes»

### Happy path — ordenar por seniority

**Dado** que veo perfiles con seniority «Junior», «Semi senior», «Senior» y «Líder técnico»,
**cuando** elijo el orden «Seniority»,
**Entonces** aparecen primero los «Líder técnico», luego «Senior», luego «Semi senior» y al final «Junior»
**Y** sobre los resultados se lee «Primero los de mayor seniority»

### Error — un perfil sin seniority reconocida

**Dado** que un perfil publicado no tiene seniority registrada y otro tiene un valor fuera de los cuatro niveles conocidos,
**cuando** ordeno por «Seniority»,
**Entonces** los dos aparecen después de todos los perfiles con un nivel conocido
**Y** nunca aparecen como los de mayor seniority

### Edge case — relevancia por omisión, dicha con palabras

**Dado** que entré a «Todo el banco» sin elegir orden y no hay criterios deseables activos,
**cuando** miro los resultados,
**Entonces** el orden seleccionado es «Relevancia»
**Y** sobre los resultados se lee qué hace hoy la relevancia: «Primero quienes están disponibles antes»

### Edge case — los empates siempre en el mismo orden

**Dado** que tres perfiles tienen la misma banda «Disponible ahora»,
**Y** que ordené por «Disponibilidad más próxima»,
**cuando** recargo la página,
**Entonces** esos tres aparecen en el mismo orden relativo que antes, por código PS de menor a mayor
**Y** es el mismo orden que ve quien abre el enlace compartido de esa búsqueda (HU-221)

## Notas

Cubre **RF-2.7** («Ordenamiento: relevancia (default) · disponibilidad más próxima · seniority»). La explicación del orden aplicado responde a la regla de explicabilidad del dominio: el cliente debe poder decir por qué un perfil sale antes que otro.

**Decisiones elegidas por el modelo por delegación del sponsor** (deterministas y explicables; revisables en el PR):
- **Relevancia sin deseables = disponibilidad más próxima.** Con solo filtros, todos los resultados cumplen lo mismo: no hay nada más relevante que quién puede empezar antes. Cuando EP-009 traiga los criterios deseables, la relevancia pasa a ser **cuántos deseables cumple** (RF-13.9.3, HU-118) y la disponibilidad queda como desempate. Esta historia no presupone EP-009; HU-118 cambia el texto del orden cuando hay deseables.
- **Seniority de mayor a menor**, con el orden de los cuatro valores del inventario: Líder técnico › Senior › Semi senior › Junior. Un valor sin nivel conocido va al final, nunca arriba.
- **Desempate estable por código PS ascendente**, el mismo en cada carga: un orden que cambia al recargar no se puede compartir (RF-2.5) ni explicar.
- **«Por confirmar» al final** al ordenar por disponibilidad: no es una banda más lejana, es una banda que no se afirma (RF-3.13.3).

**El orden es estado de búsqueda**: viaja en la URL (HU-221) y gobierna el recorrido de fichas de HU-120, que ya recorre anterior/siguiente en el orden de la lista (se re-verifica en e2e con el orden elegido).

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-2.7 · RF-3.13 · RF-13.9.3 (relevancia con deseables, HU-118) · depende de HU-219 · relacionada con HU-221 (orden en la URL), HU-120 (recorrido en el orden de la lista) y HU-118

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: ordena los resultados de HU-219, de la misma épica; no espera a EP-009 |
| N | Negociable | ✓ fija los tres órdenes, la relevancia sin deseables, el sentido de seniority y el desempate estable; los textos del orden son negociables |
| V | Valiosa | ✓ el cliente ve primero quién puede empezar antes o quién tiene más seniority, y sabe por qué |
| E | Estimable | ✓ S: tres comparadores puros sobre campos que el catálogo ya publica (banda y seniority) y un selector |
| S | Pequeña | ✓ S: cinco escenarios de una sola capacidad |
| T | Testeable | ✓ perfiles sembrados con bandas y seniorities conocidas, uno sin seniority y tres empatados dan órdenes exactos y repetibles |
