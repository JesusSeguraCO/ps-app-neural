---
id: HU-081
titulo: "Distinguir un perfil de otro por sus competencias verificadas"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
fase: fase-2-rediseno
prd_version: 4.17
reemplaza_a: HU-079
depende_de: [HU-153]
---

# HU-081 — Distinguir un perfil de otro por sus competencias verificadas

**Como** líder de área que recorre varias tarjetas de perfiles para su proyecto,
**quiero** ver en cada tarjeta las tres competencias del Sello Personal que Trycore verificó de esa persona,
**para** distinguir un perfil de otro por cómo trabaja y no solo por su cargo y su lista de tecnologías.

## Criterios de aceptación

### Happy path — competencias como elemento diferenciador

**Dado** que la lista que tengo delante incluye dos perfiles publicados con Sello Personal distinto,
**cuando** recorro sus tarjetas,
**Entonces** cada tarjeta muestra las tres competencias del Sello Personal de su perfil
**Y** las competencias aparecen marcadas como verificadas por Trycore
**Y** ninguna tarjeta muestra una insignia, un estado ni un puntaje por dimensión Neural-Grid

### Edge case — perfil publicado sin Sello Personal (opcional por D63)

**Dado** que un perfil publicado no tiene ninguna competencia del Sello Personal registrada,
**cuando** aparece su tarjeta en la lista,
**Entonces** la tarjeta se muestra sin el bloque de competencias, sin título ni hueco vacío
**Y** no aparece ningún texto de relleno ni ninguna competencia que no esté registrada

### Error — el Sello Personal del perfil llega fuera de contrato

**Esquema del escenario:** un sello mal formado no se dibuja a medias
**Dado** que el Sello Personal registrado de un perfil publicado <defecto>
**Cuando** aparece su tarjeta en la lista
**Entonces** la tarjeta se muestra sin el bloque de competencias, igual que un perfil sin Sello Personal
**Y** no aparece ninguna competencia suelta, recortada ni un texto de error técnico
**Y** el resto de la lista se muestra normalmente
**Y** el servidor registra el perfil con el sello fuera de contrato para que Talento Humano lo corrija

**Ejemplos:**

| defecto |
|---|
| tiene cuatro competencias en vez de hasta tres |
| tiene una competencia vacía o solo con espacios |

### Edge case — dos perfiles con las mismas tres competencias

**Dado** que dos perfiles publicados comparten exactamente las mismas tres competencias,
**cuando** aparecen juntos en la lista,
**Entonces** cada tarjeta muestra sus competencias igual que cualquier otra
**Y** ninguna tarjeta muestra una señal que sugiera que los dos perfiles son equivalentes o intercambiables

## Notas

Cubre **RF-14.1** (la tarjeta lidera con identidad y capacidad, y diferencia con las tres competencias), **RF-14.0** (origen del dato: el portal solo muestra lo que Talento Humano produce), la regla 4 de **B.6** y, en la tarjeta, la prohibición de **RF-3.8** (sin insignia ni indicador por dimensión).

Reemplaza a **HU-079**, descartada al cerrarse D-15. El logro cuantificado no existe en el banco entregado por Talento Humano, su extracción tiene costo operativo recurrente y es autoreportado por naturaleza. Las competencias del Sello Personal cumplen lo que el logro prometía sin esos problemas: las produce Trycore, no el candidato, y son lo único de las tres validaciones que varía entre perfiles.

**Refinada el 2026-10-02 (discovery de EP-003).** Cambios:
- El escenario de error decía que el panel impide publicar un perfil sin Sello Personal. Eso es una regla del panel (EP-006), y EP-006 ya se construyó con el Sello Personal **opcional** (columna `sello_personal` de hasta tres valores; la ficha lo omite si no hay: `opcionalesVacios`). Bajo la regla de no inventar decisiones, el error pasa al lado del cliente con la opción más conservadora: la tarjeta omite el bloque sin hueco, igual que el diagrama de `docs/06-flows/EP-003`. Que publicar exija el Sello Personal quedó como pregunta abierta, que cerró D63 (abajo).
- El happy path ya no dice «difieren entre un perfil y otro», porque eso depende de los datos y no del portal. Ahora el «Dado» fija dos perfiles con sellos distintos.
- La prohibición de RF-3.8 (sin insignia por dimensión) entra como resultado observable.

**Ya construido:** la ficha muestra el Sello Personal en el bloque «Verificado por Trycore» (`packages/ui/src/FichaPerfil.tsx`, D47 de EP-006). Falta la **tarjeta**, que hoy no lo muestra (`apps/portal/src/seleccion/TarjetaPerfil.tsx`). El contrato del catálogo (`@ps/contratos/catalogo`) tendrá que exponer el sello a la tarjeta.

**D63 (sponsor, 2026-10-02) cierra la pregunta abierta:** las **tres validaciones de entrada** (seguridad SARO, técnica y la evaluación DISC) son obligatorias para publicar, pero el **Sello Personal sigue opcional**. El escenario se mantiene (reetiquetado edge en la validación del 2026-10-02, abajo): un perfil publicado sin Sello Personal es un caso válido y permanente, no un dato heredado, y la tarjeta omite el bloque sin hueco. No hay cambio en EP-006 por esta historia. La guarda de las tres validaciones es de HU-176 y HU-178, y HU-178 fija que la falta de Sello Personal no marca un perfil como incompleto.

**Validación 2026-10-02 (validador independiente).** El escenario «perfil sin Sello Personal» no era un error: por D63 es un caso válido y permanente. Se reetiqueta **edge** y se añade un **error real**: un sello fuera del contrato del catálogo (más de tres competencias o una vacía) no se dibuja a medias; la tarjeta se comporta como sin sello y el servidor lo registra para corrección. Que el contrato estricto (`@ps/contratos/catalogo`, como el de la ficha) rechace el sello y no la tarjeta entera es la opción conservadora: un dato mal cargado no debe sacar al perfil de la lista. Cuatro escenarios.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-14.0 · RF-14.1 · RF-3.8 · B.6 · D63 · validación 2026-10-02 · reemplaza a HU-079 · depende de HU-153 (la tarjeta en la que vive el bloque) · relacionada con HU-119 y HU-118 (compiten por la misma atención en la tarjeta, RF-3.8)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: el bloque vive en la tarjeta de HU-153 y usa un dato que ya existe en el modelo (`sello_personal`); no depende de la búsqueda de EP-009 |
| N | Negociable | ✓ son fijos el contenido (las tres competencias, como verificadas), la ausencia de insignias que el Sello Personal es opcional (D63), con el bloque omitido sin hueco, y que un sello fuera de contrato no se dibuja a medias; la posición en la tarjeta y la forma visual se pueden negociar |
| V | Valiosa | ✓ es el único discriminador verificado del banco: sin él, las tarjetas solo se diferencian por lo que declara la persona |
| E | Estimable | ✓ S: exponer un campo existente en el contrato del catálogo y dibujarlo en la tarjeta, con la regla de omitir el bloque vacío que ya usa la ficha |
| S | Pequeña | ✓ S: un bloque de la tarjeta con cuatro comportamientos (mostrar, omitir sin sello, omitir con sello fuera de contrato, iguales sin equivalencia) |
| T | Testeable | ✓ con perfiles sembrados (sellos distintos, sello vacío, sello con cuatro competencias o una vacía, y sellos iguales) se observa en pantalla qué muestra cada tarjeta y en el registro del servidor el sello rechazado |
