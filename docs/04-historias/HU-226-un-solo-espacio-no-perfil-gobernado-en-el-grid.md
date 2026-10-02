---
id: HU-226
titulo: "Que entre los resultados haya como máximo un espacio que no es un perfil, y solo donde no estorba"
epica: EP-002
prioridad: media
complejidad: S
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-219]
---

# HU-226 — Que entre los resultados haya como máximo un espacio que no es un perfil, y solo donde no estorba

**Como** Dirección de Mercadeo, responsable de producto del portal,
**quiero** que cualquier tarjeta que no sea un perfil ocupe un único espacio gobernado del grid —en posición fija, nunca en la selección curada y nunca con pocos resultados—,
**para** poder preguntar a las cuentas desde el banco sin que el cliente lo sienta como inventario publicitario ni crea que el banco está vacío.

## Criterios de aceptación

### Happy path — el espacio ocupa una posición fija y no cuenta como perfil

**Dado** que estoy en «Todo el banco», en la vista de tarjetas, con 12 perfiles en los resultados y un espacio no-perfil activo,
**cuando** cargan los resultados,
**Entonces** veo el espacio no-perfil en el séptimo lugar del grid, después de la sexta tarjeta de perfil, con el mismo tamaño que una tarjeta de perfil
**Y** el número de resultados sigue diciendo 12 perfiles

### Edge case — el umbral de ocho resultados, y el cero

**Esquema del escenario:** por debajo de ocho resultados no hay espacio no-perfil
**Dado** que estoy en «Todo el banco», en la vista de tarjetas, con un espacio no-perfil activo y <n> perfiles en los resultados,
**cuando** cargan los resultados,
**Entonces** <resultado>

**Ejemplos:**

| n | resultado |
|---|---|
| 0 | veo el aviso del cero (HU-223) y ningún espacio no-perfil en lugar de los perfiles que faltan |
| 7 | no aparece ningún espacio no-perfil |
| 8 | aparece el espacio no-perfil en el séptimo lugar, con un perfil después |

### Edge case — lugares donde nunca aparece

**Esquema del escenario:** la selección curada y las vistas de comparación quedan libres
**Dado** que hay un espacio no-perfil activo y estoy en <lugar> con 10 perfiles,
**cuando** cargan los perfiles,
**Entonces** no aparece ningún espacio no-perfil

**Ejemplos:**

| lugar |
|---|
| la selección curada de mi enlace |
| la vista de tabla de «Todo el banco» |
| la pregunta de encuadre de un enlace sin selección |

### Edge case — dos espacios no-perfil activos a la vez

**Dado** que hay dos tipos de espacio no-perfil activos y estoy en «Todo el banco» con 20 perfiles en la vista de tarjetas,
**cuando** cargan los resultados,
**Entonces** veo uno solo, el de mayor prioridad, en el séptimo lugar
**Y** el otro no aparece en ningún otro lugar del grid

### Error — el contenido del espacio no-perfil no se puede cargar

**Dado** que estoy en «Todo el banco» con 12 perfiles y el contenido del espacio no-perfil activo no se puede obtener en este momento,
**cuando** cargan los resultados,
**Entonces** veo los 12 perfiles seguidos, sin hueco ni tarjeta vacía en el séptimo lugar
**Y** no veo ningún mensaje de error sobre el espacio no-perfil

## Notas

Cubre **RF-11.1** (el espacio no-perfil es **un tipo de tarjeta con reglas propias**, reutilizable, no un caso especial del sondeo), **RF-11.2** (excepción gobernada, nunca inventario publicitario; todo espacio no-perfil hereda RF-10.2 a RF-10.6) y, para cualquier espacio no-perfil, **RF-10.1** (mismo espacio y peso que un perfil), **RF-10.2** (nunca en el conjunto curado, solo en el descubrimiento tras ampliar) y **RF-10.3** (nunca con menos de 8 resultados visibles, **D-12**). Hoy el único espacio no-perfil es el sondeo (HU-019); RF-11.1 nombra como reutilizaciones futuras la tarjeta «no encontramos ese rol, ¿lo buscamos para ti?» y las células de V2-4, que **no** son alcance de esta historia.

**Decisiones elegidas por el modelo por delegación del sponsor:**
- **«Resultados visibles» = perfiles en los resultados actuales**, no los que caben en pantalla. Con 8 o más aparece; con 7 o menos, no (tabla del edge).
- **Posición fija: el séptimo lugar**, después de la sexta tarjeta. Nunca en la primera fila (no compite con el primer perfil que se mira) y siempre con al menos un perfil después cuando hay 8.
- **Uno como máximo por grid**, elegido por una prioridad fija declarada en el tipo. Un grid con varios espacios no-perfil «destruye la utilidad de la herramienta» (RF-11.2).
- **No es una fila de la tabla, no es una ficha y no cuenta en ningún número**: ni en el total, ni en «N de M» del recorrido de fichas (anterior/siguiente lo saltan; se prueba en e2e con HU-120), ni en la selección múltiple. Sin eso, un conteo honesto (RF-14.4) dejaría de serlo.
- **Si su contenido falla, el espacio desaparece sin hueco**: un fallo de algo que no es un perfil nunca degrada la lista de perfiles.
- Las reglas de frecuencia y descarte (RF-10.4) y de apariencia (RF-10.5, RF-10.6) se aplican a cada tipo; para el sondeo las fijan HU-019 y HU-020.

**Pruebas.** El segundo tipo del edge se registra solo en las pruebas, con prioridad menor: valida la regla de gobierno sin inventar una tarjeta de producto. Las demás reglas se prueban en e2e con el sondeo.

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-11.1 · RF-11.2 · RF-10.1 · RF-10.2 · RF-10.3 · D-12 · RF-14.4 · §2.5 · depende de HU-219 (grid del banco y su número de resultados) · relacionada con HU-019, HU-020, HU-121 (la tabla no lo muestra), HU-120 (recorrido de fichas) y HU-223

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se monta sobre el grid de resultados de HU-219; no depende del sondeo, que es su primer usuario (HU-019 depende de esta) |
| N | Negociable | ✓ fijos: uno como máximo, nunca en la selección, umbral de 8 (D-12), fuera de todo número; la posición concreta y la prioridad son negociables |
| V | Valiosa | ✓ protege la utilidad y la credibilidad del grid y habilita preguntar a las cuentas sin abaratar el producto |
| E | Estimable | ✓ S: una regla de colocación pura sobre la lista de resultados y un tipo de tarjeta con prioridad |
| S | Pequeña | ✓ S: cinco escenarios de una sola regla de colocación |
| T | Testeable | ✓ resultados sembrados con 0, 7, 8, 12 y 20 perfiles, un segundo tipo de prueba, un fallo simulado del contenido, la selección curada y la tabla dan colocaciones exactas |
