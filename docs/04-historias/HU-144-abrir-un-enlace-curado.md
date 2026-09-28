---
id: HU-144
titulo: "Abrir el enlace y encontrar la selección que me armaron"
epica: EP-001
prioridad: alta
complejidad: S
estado: lista
fase: enlaces-curados
prd_version: 4.13
depende_de: [HU-090, HU-122]
spec: docs/10-specs/enlaces-curados.md
---

# HU-144 — Abrir el enlace y encontrar la selección que me armaron

**Como** líder de área que recibió un enlace curado,
**quiero** abrirlo y ver los perfiles que eligieron para mí con su razón,
**para** entender en un vistazo por qué me proponen a estas personas y no a otras.

## Criterios de aceptación

### Happy path — la selección con su razón

**Dado** que tengo un enlace curado vigente con perfiles de familias distintas
**Y** que mi correo está en su lista de invitados y ya superé la puerta con él
**Cuando** abro el enlace
**Entonces** veo los perfiles seleccionados con la razón de la selección
**Y** no veo ningún rol ni criterio deducido de la selección aplicado como filtro
**Y** veo la opción de ampliar la búsqueda al banco completo

### Error — enlace revocado o alterado

**Esquema del escenario:** enlace que ya no abre

**Dado** que tengo la dirección de un enlace curado que <condicion>
**Cuando** abro esa dirección
**Entonces** veo una pantalla que explica, sin lenguaje técnico, cómo pedir un enlace nuevo
**Y** no veo un error crudo, ni la puerta de acceso, ni el inventario

**Ejemplos:**

| condicion |
|---|
| fue revocado |
| fue alterado en su dirección |

### Error — la revocación corta una sesión abierta

**Dado** que tengo una sesión abierta en un enlace curado
**Y** que Talento Humano revocó ese enlace
**Cuando** intento ver un perfil de la selección
**Entonces** veo la pantalla de enlace revocado
**Y** ya no veo ningún perfil de la selección

### Edge case — un perfil cambió entre generar y abrir

**Dado** que tengo una sesión válida en un enlace curado
**Y** que uno de sus perfiles se colocó en otro proyecto después de generarse el enlace
**Cuando** abro el enlace
**Entonces** veo los demás perfiles de la selección con toda su información
**Y** veo el perfil colocado aparte, con la etiqueta de su estado real y la fecha en que se libera
**Y** no veo ninguna posición de la selección vacía sin una nota que explique el estado del perfil

### Edge case — un buscador rastrea el portal

**Dado** que existe la dirección de un enlace curado o de cualquier otra página del portal
**Cuando** un motor de búsqueda la solicita
**Entonces** la respuesta lleva la indicación `noindex, nofollow` en cabecera y en la página
**Y** la exclusión de rastreadores del portal cubre esa dirección
**Y** la respuesta servida sin sesión no contiene nombres de profesionales

## Notas

- El retorno a la selección después de ampliar la búsqueda lo prueba HU-094.

**Dividida de HU-122 el 2026-09-22.** El actor es otro —el cliente, no Talento Humano— y eso hacía que la historia original tuviera dos happy paths incompatibles en una sola.

**La fragilidad de la lista se resuelve sin renunciar a ella.** El portal reevalúa cada código al abrirse (RF-19.2): un hueco silencioso se lee como desorden; un cambio explicado se lee como control. Por eso el caso del perfil que cambió es el criterio que más pesa.

**El panel arranca vacío a propósito.** Si la selección mezcla familias —un gerente y un QA— no hay rol común, y deducir uno sería inventar (RF-19.7).

**Ajustada el 2026-09-27** (corrección de discovery T-18, CRN-13): la precondición incluye entrar con el correo invitado (D-4 revisada; la puerta es HU-090). Desde HU-090 se trajeron dos criterios de la versión 4.0 sin recortar nada: el enlace alterado, que comparte pantalla con el revocado, y la exclusión de buscadores (RF-1.5). La revocación surte efecto aunque haya una sesión abierta, porque la sesión está acotada al enlace (ADR-0002).

**Ajuste de forma del 2026-09-27** (validación INVEST/BDD): cada «Dado» describe un estado y cada «Cuando» una acción; la sesión abierta que deja de servir al revocarse el enlace pasa a escenario propio (quinto escenario); el revocado y el alterado comparten un esquema con ejemplos; el retorno a la selección queda solo en HU-094, que es su dueña. **Exclusión de buscadores en todo el portal:** RF-1.5 pide `noindex`, `nofollow` y exclusión de rastreadores en todo el portal, no solo en el enlace curado; este escenario la cubre para todas las páginas y es su única historia dueña, por eso no se acota al enlace.

**Orden de construcción y pruebas:** HU-090 (la puerta) y HU-122 (el enlace emitido) → HU-144. Para no esperar a que ambas estén cerradas de punta a punta, HU-144 se construye y verifica con **enlaces curados sembrados directamente en la base de datos de prueba** (vigentes, revocados, alterados y con perfiles colocados) y una sesión sembrada; la demostración integrada generar → abrir se hace al cerrar la épica.

Cubre **RF-19.2**, **RF-19.6**, **RF-19.7**, **RF-1.4** (revocación) y **RF-1.5**.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.13 · ADR-0002 (UC-1, UC-3) · depende de HU-122 y HU-090 · orden de construcción: HU-090 y HU-122 → HU-144

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: sin enlace emitido (HU-122) no hay qué abrir y sin la puerta (HU-090) no se entra, así que se secuencia después de ambas; se construye y verifica sola con enlaces sembrados en la base de datos de prueba |
| N | Negociable | ✓ describe el resultado; la forma de mostrar los perfiles que cambiaron es negociable |
| V | Valiosa | ✓ el beneficio es del cliente y es visible en el primer segundo |
| E | Estimable | ✓ reevaluación al abrir y estados de enlace decididos (ADR-0002/0003); falta la cifra del equipo |
| S | Pequeña | ✓ |
| T | Testeable | ✓ cinco escenarios; enlaces sembrados vigentes, revocados, alterados y con perfiles colocados; cabeceras de exclusión comprobables en la respuesta |
