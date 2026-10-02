---
id: HU-119
titulo: "Saber por qué coincide cada perfil y por qué no"
epica: EP-003
prioridad: alta
complejidad: S
estado: draft
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

### Error — sin criterios activos

**Dado** que no tengo ningún criterio de búsqueda activo, por ejemplo en la selección del correo antes de ampliar la búsqueda,
**cuando** abro una ficha,
**Entonces** la ficha no muestra ningún bloque de evidencia, ni vacío ni con título
**Y** la tarjeta de ese perfil en la lista tampoco muestra ninguno
**Y** no aparece ninguna línea de coincidencia deducida de la selección

### Edge case — el perfil no tiene registrado el dato de un criterio

**Dado** que busqué con el criterio «Inglés» y un perfil publicado no tiene ningún idioma registrado,
**cuando** miro su tarjeta,
**Entonces** la línea de ese criterio aparece como no cumplida («– Sin idioma declarado: Inglés»), nunca como cumplida por omisión
**Y** el texto de la línea sale de los datos del perfil y de una plantilla fija, sin ninguna frase redactada ni inferida sobre la persona

## Notas

Cubre **RF-13.10**, **RF-13.10.1** (evidencia determinista, no redactada por un modelo) y **RF-13.10.2** (también lo no cumplido). Se apoya en **RF-16.1** (el modelo no redacta sobre perfiles) y en **RF-13.12.3** (sin porcentaje: la cifra honesta es el conteo).

Tomado de Juicebox, que muestra una línea de justificación por criterio (evidencia A). **La diferencia es una restricción nuestra, no un olvido.** Las justificaciones de Juicebox las redacta un modelo sobre una persona real. Eso choca con RF-16.1: Trycore responde por contrato por cada perfil publicado, y una afirmación inferida sobre alguien es un riesgo que no compensa. Mostrar también lo no cumplido es deliberado: un listado que solo enseña aciertos no ayuda a decidir, ayuda a vender.

**Refinada el 2026-10-02 (discovery de EP-003).** Los dos happy path (lo que cumple y lo que no) se funden en uno con datos concretos tomados del ejemplo del PRD. Un esquema con ejemplos cubre la tarjeta y el bloque «Frente a tu búsqueda» de la ficha. Ese bloque quedó pendiente en EP-003 cuando D47 de EP-006 montó la ficha del portal (`openspec/changes/archive/2026-10-01-administracion-del-inventario/design.md`). El dato ausente se resuelve como «no cumplido», que es lo que pedía la historia original y lo que ilustra el PRD («– Sin experiencia declarada en Seguros»). El diagrama de `docs/06-flows/EP-003` dice «ausente, no incumplido»: es una contradicción de redacción que la sesión principal debe alinear con esta historia.

**Fronteras con otras historias, para no duplicar:**
- El **conteo de deseables** («cumple 3 de 4 deseables», RF-13.9.3) y el orden por deseables son de **HU-118** (EP-009).
- La **misma evidencia en columnas** de la vista de tabla es de **HU-121** (EP-002, RF-13.12.2).
- «Lo más cercano», que dice qué criterio falla, es de **EP-010** (RF-14.3, D-14).
- Una opción añadida por el cliente que **no existe en el banco** no es criterio de emparejamiento (RF-13.7.3, EP-009). Por eso no produce línea de evidencia.

**Partida el 2026-10-02 por validación INVEST (falla I).** La historia original dependía del motor único de criterios (RF-13.8) y de HU-118, de **EP-009**, que aún no está construida. Se parte en dos, **sin recortar alcance** (complejidad M → S):
- **HU-119 (esta):** dibuja la evidencia ✓/– en la tarjeta y en la ficha **a partir de criterios ya resueltos**: recibe, por perfil, la lista de criterios activos con su resultado (cumple / no cumple) y el dato que lo sustenta, y la convierte en líneas con plantilla fija. No calcula nada. Se construye y verifica de punta a punta con criterios sembrados, sin esperar a EP-009.
- **HU-174:** conecta esa presentación con el motor único de criterios real cuando EP-009 exista, de modo que la evidencia, los resultados y los conteos salgan de la misma evaluación.

**Pregunta abierta para el sponsor:** ¿qué texto lleva cada tipo de criterio (rol, seniority, tecnología, sector, idioma, modalidad, país)? El PRD da dos ejemplos (sector con años y sector ausente). Las plantillas de los demás tipos son copy que Mercadeo debería aprobar.

## Trazabilidad

Épica madre: **EP-003** · PRD v4.17 · RF-13.10 · RF-16.1 · RF-13.12.3 · depende de HU-153 (tarjeta) · la integración con el motor RF-13.8 y HU-118 (EP-009) es de HU-174 · relacionada con HU-121 (EP-002), HU-076 (EP-010) y HU-120 (la ficha donde vive «Frente a tu búsqueda»)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: solo necesita la tarjeta de HU-153; consume criterios ya resueltos, así que se construye y prueba completa con criterios sembrados. La dependencia con EP-009 pasó a HU-174 |
| N | Negociable | ✓ son fijos el determinismo, mostrar lo no cumplido y no usar porcentajes; la forma de cada línea y su copy se pueden negociar |
| V | Valiosa | ✓ es la explicabilidad de la decisión de mayor impacto del portal: por qué aparece cada persona; con criterios sembrados ya se puede validar con el sponsor |
| E | Estimable | ✓ S: plantillas fijas por tipo de criterio sobre una entrada ya resuelta, dibujadas en dos superficies que ya existen (tarjeta y ficha). Queda abierto el copy por tipo, no la mecánica |
| S | Pequeña | ✓ S: una capacidad de presentación en dos superficies, con tres escenarios y sin lógica de evaluación |
| T | Testeable | ✓ perfiles y criterios sembrados producen líneas exactas comparables con texto fijo, y la ausencia del bloque sin criterios es observable |
