---
id: HU-119
titulo: "Saber por qué coincide cada perfil y por qué no"
epica: EP-003
prioridad: alta
complejidad: S
estado: lista
fase: referencias-juicebox
prd_version: 4.17
depende_de: [HU-153]
---

# HU-119 — Saber por qué coincide cada perfil y por qué no

**Como** líder de área que buscó perfiles con varios criterios para su proyecto,
**quiero** ver en cada perfil, criterio por criterio, cuáles cumple y cuáles no, con el dato del perfil que lo sustenta,
**para** decidir a quién mirar con calma sin abrir cada ficha ni fiarme de una puntuación que no puedo verificar.

## Criterios de aceptación

### Happy path — evidencia criterio por criterio, también lo que no cumple

**Esquema del escenario:** la evidencia se ve donde miro el perfil
**Dado** que busqué con los criterios «Banca» y «Seguros»
**Y** que un perfil publicado tiene 8 años declarados en Banca y ninguna experiencia declarada en Seguros
**Cuando** miro ese perfil en <lugar>
**Entonces** veo una línea por criterio activo, con el mismo texto y el mismo orden: «✓ Banca · 8 años declarados» y «– Sin experiencia declarada en Seguros»
**Y** las líneas que cumple se distinguen a simple vista de las que no
**Y** no veo ningún porcentaje ni puntaje de coincidencia

**Ejemplos:**

| lugar |
|---|
| su tarjeta en la lista de resultados |
| el bloque «Frente a tu búsqueda» de su ficha |

### Error — el criterio es de un tipo sin plantilla

**Esquema del escenario:** un tipo nuevo nunca deja la línea en blanco
**Dado** que busqué con el criterio «Disponibilidad inmediata», de un tipo que no tiene plantilla en la tabla de evidencia
**Y** que el criterio llega resuelto para un perfil publicado como <resultado>
**Cuando** miro su tarjeta
**Entonces** la línea de ese criterio dice exactamente «<linea>», en el mismo lugar y con la misma distinción visual que las demás
**Y** la línea nunca aparece en blanco ni se omite
**Y** queda un registro técnico que nombra el tipo de criterio sin plantilla, para que el equipo la añada

**Ejemplos:**

| resultado | linea |
|---|---|
| cumple | ✓ Cumple Disponibilidad inmediata |
| no cumple | – No cumple Disponibilidad inmediata |

### Edge case — sin criterios activos

**Esquema del escenario:** sin criterios no hay evidencia en ningún lugar
**Dado** que no tengo ningún criterio de búsqueda activo, por ejemplo en la selección del correo antes de ampliar la búsqueda,
**cuando** miro un perfil en <lugar>,
**Entonces** no aparece ningún bloque de evidencia, ni vacío ni con título
**Y** no aparece ninguna línea de coincidencia deducida de la selección

**Ejemplos:**

| lugar |
|---|
| su tarjeta en la lista de resultados |
| su ficha |

### Edge case — el perfil no tiene registrado el dato de un criterio

**Dado** que busqué con el criterio «Inglés» y un perfil publicado no tiene ningún idioma registrado,
**cuando** miro su tarjeta,
**Entonces** la línea de ese criterio aparece como no cumplida («– Sin idioma declarado: Inglés»), nunca como cumplida por omisión
**Y** el texto de la línea sale de los datos del perfil y de una plantilla fija, sin ninguna frase redactada ni inferida sobre la persona

### Edge case — cada tipo de criterio usa su plantilla fija

**Esquema del escenario:** la línea sale del dato del perfil y de la plantilla de su tipo
**Dado** que busqué con el criterio «<criterio>» de tipo <tipo>
**Y** que un perfil publicado tiene registrado <dato_del_perfil>
**Cuando** miro su tarjeta
**Entonces** la línea de ese criterio dice exactamente «<linea>»

**Ejemplos:**

| tipo | criterio | dato_del_perfil | linea |
|---|---|---|---|
| rol | Desarrollador backend | el rol «Desarrollador backend» | ✓ Rol: Desarrollador backend |
| seniority | Senior | la seniority «Semi-senior» | – Seniority registrada: Semi-senior |
| tecnología | Java | Java en su stack | ✓ Java en su stack declarado |
| modalidad | Remoto | ninguna modalidad | – Sin modalidad declarada: Remoto |
| país | Colombia | el país «México» | – País registrado: México |

## Notas

Cubre **RF-13.10**, **RF-13.10.1** (evidencia determinista, no redactada por un modelo) y **RF-13.10.2** (también lo no cumplido). Se apoya en **RF-16.1** (el modelo no redacta sobre perfiles) y en **RF-13.12.3** (sin porcentaje: la cifra honesta es el conteo).

Tomado de Juicebox, que muestra una línea de justificación por criterio (evidencia A). **La diferencia es una restricción nuestra, no un olvido.** Las justificaciones de Juicebox las redacta un modelo sobre una persona real. Eso choca con RF-16.1: Trycore responde por contrato por cada perfil publicado, y una afirmación inferida sobre alguien es un riesgo que no compensa. Mostrar también lo no cumplido es deliberado: un listado que solo enseña aciertos no ayuda a decidir, ayuda a vender.

**Refinada el 2026-10-02 (discovery de EP-003).** Los dos happy path (lo que cumple y lo que no) se funden en uno con datos concretos tomados del ejemplo del PRD. Un esquema con ejemplos cubre la tarjeta y el bloque «Frente a tu búsqueda» de la ficha. Ese bloque quedó pendiente en EP-003 cuando D47 de EP-006 montó la ficha del portal (`openspec/changes/archive/2026-10-01-administracion-del-inventario/design.md`). El dato ausente se resuelve como «no cumplido», que es lo que pedía la historia original y lo que ilustra el PRD («– Sin experiencia declarada en Seguros»). El diagrama de `docs/06-flows/EP-003` decía «ausente, no incumplido»; se alineó con esta historia el 2026-10-02 y ahora dice «no cumplido, nunca cumplido por omisión».

**Fronteras con otras historias, para no duplicar:**
- El **conteo de deseables** («cumple 3 de 4 deseables», RF-13.9.3) y el orden por deseables son de **HU-118** (EP-009).
- La **misma evidencia en columnas** de la vista de tabla es de **HU-121** (EP-002, RF-13.12.2).
- «Lo más cercano», que dice qué criterio falla, es de **EP-010** (RF-14.3, D-14).
- Una opción añadida por el cliente que **no existe en el banco** no es criterio de emparejamiento (RF-13.7.3, EP-009). Por eso no produce línea de evidencia.

**Partida el 2026-10-02 por validación INVEST (falla I).** La historia original dependía del motor único de criterios (RF-13.8) y de HU-118, de **EP-009**, que aún no está construida. Se parte en dos, **sin recortar alcance** (complejidad M → S):
- **HU-119 (esta):** dibuja la evidencia ✓/– en la tarjeta y en la ficha **a partir de criterios ya resueltos**: recibe, por perfil, la lista de criterios activos con su resultado (cumple / no cumple) y el dato que lo sustenta, y la convierte en líneas con plantilla fija. No calcula nada. Se construye y verifica de punta a punta con criterios sembrados, sin esperar a EP-009.
- **HU-174:** conecta esa presentación con el motor único de criterios real cuando EP-009 exista, de modo que la evidencia, los resultados y los conteos salgan de la misma evaluación. **Por D87 (sponsor, 2026-10-02) HU-174 pasó a EP-009**, junto al motor y HU-118; EP-003 ya no depende de EP-009.

**Plantilla de evidencia por tipo de criterio (validación 2026-10-02, opción conservadora; marcada para revisión de copy con Mercadeo, D73).** Cierra la pregunta abierta sobre el texto de cada tipo. Regla común: la línea solo nombra el valor del criterio y el dato registrado del perfil, sin adjetivos, sin inferencias y sin afirmar más de lo que dice el inventario (RF-3.4, RF-16.1). Tres formas por tipo: cumple, no cumple con dato distinto, y sin dato (que es no cumplido, nunca cumplido por omisión).

| Tipo | Cumple | No cumple (dato distinto) | Sin dato |
|---|---|---|---|
| rol | ✓ Rol: {rol} | – Rol registrado: {rol del perfil} | – Sin rol declarado: {criterio} |
| seniority | ✓ Seniority: {seniority} | – Seniority registrada: {seniority del perfil} | – Sin seniority declarada: {criterio} |
| tecnología | ✓ {tecnología} en su stack declarado | – Sin {tecnología} en su stack declarado | (igual que no cumple) |
| sector | ✓ {sector} · {n} años declarados | – Sin experiencia declarada en {sector} | (igual que no cumple) |
| idioma | ✓ {idioma} registrado | – Sin idioma declarado: {idioma} | (igual que no cumple) |
| modalidad | ✓ Modalidad: {modalidad} | – Modalidad registrada: {modalidad del perfil} | – Sin modalidad declarada: {criterio} |
| país | ✓ País: {país} | – País registrado: {país del perfil} | – Sin país declarado: {criterio} |

**Tipo sin plantilla (D96, tercera ronda 2026-10-02).** Si llega un criterio de un tipo que no está en la tabla, la línea usa el **texto genérico** «✓ Cumple {criterio}» o «– No cumple {criterio}», nunca queda en blanco ni se omite, y se deja un **registro técnico** con el tipo para que el equipo añada su plantilla. Es el nuevo escenario de error; «sin criterios activos», que era el error, pasa a edge porque no es un fallo sino un estado legítimo. Cinco escenarios; sigue en S.

Sector e idioma salen de los ejemplos del PRD; los demás son propuesta del modelo con la misma forma. El nuevo escenario «cada tipo de criterio usa su plantilla» prueba los cinco tipos que el validador señaló (rol, seniority, tecnología, modalidad, país). Si Mercadeo cambia el copy, cambia la tabla y los ejemplos del escenario, no la mecánica.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-13.10 · RF-16.1 · RF-13.12.3 · RF-3.4 · D73 (copy) · D96 (tipo sin plantilla) · validación 2026-10-02 (plantilla por tipo) · depende de HU-153 (tarjeta) · la integración con el motor RF-13.8 y HU-118 (EP-009) es de HU-174 (EP-009 por D87) · relacionada con HU-121 (EP-002), HU-076 (EP-010) y HU-120 (la ficha donde vive «Frente a tu búsqueda»)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: solo necesita la tarjeta de HU-153; consume criterios ya resueltos, así que se construye y prueba completa con criterios sembrados. La dependencia con EP-009 pasó a HU-174, que D87 movió a EP-009 |
| N | Negociable | ✓ son fijos el determinismo, mostrar lo no cumplido, no usar porcentajes y que un tipo sin plantilla use el texto genérico y se registre (D96); la plantilla por tipo está fijada con opción conservadora y su copy se puede negociar con Mercadeo (marcado para revisión de copy) |
| V | Valiosa | ✓ es la explicabilidad de la decisión de mayor impacto del portal: por qué aparece cada persona; con criterios sembrados ya se puede validar con el sponsor |
| E | Estimable | ✓ S: plantillas fijas por tipo de criterio, con un texto genérico de respaldo, sobre una entrada ya resuelta, dibujadas en dos superficies que ya existen (tarjeta y ficha). La plantilla por tipo ya está fijada; solo su copy queda en revisión |
| S | Pequeña | ✓ S: una capacidad de presentación en dos superficies, con cinco escenarios y sin lógica de evaluación |
| T | Testeable | ✓ perfiles y criterios sembrados producen líneas exactas comparables con la plantilla de cada tipo (cinco ejemplos del esquema), un tipo sembrado sin plantilla produce las dos líneas genéricas y su registro, y la ausencia del bloque sin criterios es observable |
