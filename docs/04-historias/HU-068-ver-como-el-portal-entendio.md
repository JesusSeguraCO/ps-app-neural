---
id: HU-068
titulo: "Ver cómo el portal entendió lo que pedí"
epica: EP-009
prioridad: alta
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-065]
---

# HU-068 — Ver cómo el portal entendió lo que pedí

**Como** líder de área que acaba de escribir una instrucción,
**quiero** ver la lectura que el portal hizo de mi instrucción antes de mirar los resultados, más detallada cuando el portal no está seguro,
**para** saber si los resultados son raros porque el banco no tiene lo que busco o porque me entendieron mal.

## Criterios de aceptación

### Happy path — lectura compacta cuando todo se reconoció

**Dado** que el léxico traduce «desarrollador java» a rol Desarrollador Backend y tecnología Java
**Cuando** envío «desarrollador java senior»
**Entonces** antes del primer resultado veo la lectura en una sola línea de etiquetas: «Desarrollador Backend · obligatorio», «Java · deseable» y «Senior · deseable»
**Y** cada etiqueta dice de qué palabra salió al tocarla («Lo escribiste: "java"»)

### Edge case — lectura completa cuando la confianza es baja

**Dado** que el catálogo tiene Desarrollador Backend y Java, y «fintec» no existe ni en el catálogo ni en el léxico
**Cuando** envío «bakend con javva y fintec»
**Entonces** veo la lectura destacada «Revisa cómo entendimos tu instrucción», no compacta
**Y** veo «Desarrollador Backend — lo entendimos de "bakend"», «Java — lo entendimos de "javva"» y «No reconocimos: "fintec"»
**Y** veo la invitación «Corrige lo que no sea lo que pides»

### Edge case — una palabra no reconocida obliga a la lectura completa

**Dado** que el léxico traduce «desarrollador backend» y «java», reconoce «senior» y no tiene «blockchain»
**Cuando** envío «desarrollador backend java senior blockchain»
**Entonces** la lectura se muestra completa aunque las otras cuatro palabras se reconocieron exactas
**Y** veo «No reconocimos: "blockchain"»

### Error — la instrucción no deja ver ningún rol

**Dado** que el catálogo tiene la tecnología Kafka y la instrucción no nombra ningún rol
**Cuando** envío «alguien que sepa Kafka»
**Entonces** la lectura se muestra completa con «Kafka · deseable» y «No identificamos un rol: elige uno o busca solo por tecnología»
**Y** los resultados muestran todo el banco ordenado con quienes tienen Kafka primero, sin ninguna lista vacía

## Notas

Cubre **RF-12.3** (la interpretación es visible antes del resultado: completa bajo umbral, compacta por encima) y **RF-2.6.2** (el portal muestra qué rol y qué tecnologías entendió, para que el usuario corrija en vez de adivinar). Corregir sobre la lectura es **HU-069**; la lectura del requerimiento pegado usa la misma regla (HU-067).

**Decisiones por delegación del sponsor (elegidas por el modelo, opción recomendada de T-32 y ADR-0004):**
- **Confianza determinista** (ADR-0004, H35): promedio sobre las palabras significativas (sin palabras vacías) con peso 1 por coincidencia exacta o patrón, 0,7 por corrección a distancia 1, 0,4 a distancia 2 y 0 si no se reconoce. En el segundo escenario: (0,7 + 0,7 + 0) / 3 = 0,47.
- **Umbral 0,8, configurable** (T-32, opción (a)): por encima, compacta; por debajo, completa. **Además siempre completa** si hay una palabra no reconocida, un valor descartado o degradación del servicio externo (R-66). El umbral se revisa obligatoriamente al cerrar la prueba previa T-23; un umbral mal calibrado solo cambia la forma de mostrar, nunca los resultados.
- **Sin rol reconocido no se inventa un rol**: nada queda obligatorio y el motor ordena todo el banco por los deseables (RF-13.9, HU-118).

**Fuente de diseño:** `docs/05-prototipo/pantallas/perfil-objetivo.html` (etiquetas con «Lo escribiste») y `perfil-objetivo--baja-confianza.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-12.3 · RF-2.6.2 · T-32 (umbral, propuesta por defecto elegida por delegación) · R-66 · ADR-0004 (confianza, V4-6) · depende de HU-065 (intérprete, misma épica) · relacionada con HU-069, HU-067 y HU-118

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: dibuja la salida del intérprete de HU-065 (misma épica) |
| N | Negociable | ✓ son fijos que la lectura va antes del resultado, que muestra el origen de cada criterio y la regla de cuándo es completa; la forma visual y el valor del umbral se negocian |
| V | Valiosa | ✓ el cliente distingue «no lo tienen» de «no me entendieron» y corrige |
| E | Estimable | ✓ S: la fórmula es una función pura con el peso por origen que el intérprete ya entrega, más dos formas de pintar la lectura |
| S | Pequeña | ✓ S: cuatro escenarios sobre un componente |
| T | Testeable | ✓ unitarios de la confianza (añadir una palabra no reconocida nunca la sube) y e2e de las dos formas con instrucciones fijas |
