---
id: HU-174
titulo: "Ver la evidencia de cada perfil calculada por el mismo motor que decide los resultados"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: referencias-juicebox
prd_version: 4.17
depende_de: [HU-118, HU-119]
---

# HU-174 — Ver la evidencia de cada perfil calculada por el mismo motor que decide los resultados

**Como** líder de área que buscó perfiles con criterios obligatorios y deseables para su proyecto,
**quiero** que las líneas ✓/– de cada perfil salgan de la misma evaluación que decidió que ese perfil aparece y cuántos deseables cumple,
**para** confiar en que lo que leo en la tarjeta y en la ficha es exactamente la razón por la que el portal me lo muestra, sin contradicciones entre la evidencia y el resultado.

## Criterios de aceptación

### Happy path — la evidencia coincide con la evaluación del motor

**Dado** que busqué con «Banca» como obligatorio y «Seguros» e «Inglés» como deseables
**Y** que un perfil publicado tiene 8 años declarados en Banca, ninguna experiencia declarada en Seguros e inglés registrado
**Cuando** abro su ficha desde los resultados
**Entonces** el bloque «Frente a tu búsqueda» muestra «✓ Banca · 8 años declarados», «– Sin experiencia declarada en Seguros» y «✓ Inglés»
**Y** esas líneas son las mismas, con el mismo texto y en el mismo orden, que muestra su tarjeta
**Y** el conteo de su tarjeta dice «cumple 1 de 2 deseables», en acuerdo con las líneas

### Error — un perfil que falla un obligatorio no aparece con evidencia de cumplir

**Dado** que busqué con «Banca» como obligatorio
**Y** que un perfil publicado no tiene experiencia declarada en Banca
**Cuando** reviso la lista de resultados
**Entonces** ese perfil no aparece entre los resultados
**Y** ningún perfil de la lista muestra «–» en un criterio obligatorio

### Edge case — una opción que no existe en el banco no produce línea

**Dado** que añadí como deseable la opción «Cobol» que no existe en el catálogo del banco, además del deseable «Seguros»
**Cuando** abro la ficha de un perfil de los resultados
**Entonces** el bloque «Frente a tu búsqueda» muestra la línea de «Seguros» y ninguna línea para «Cobol»
**Y** el conteo de deseables de su tarjeta se calcula sobre los mismos criterios que tienen línea

### Edge case — cambio un criterio y la evidencia se recalcula

**Dado** que tengo abierta la ficha de un perfil con «Inglés» como deseable y la línea «✓ Inglés»
**Cuando** quito el criterio «Inglés» de mi búsqueda
**Entonces** la línea de «Inglés» desaparece de su ficha y de su tarjeta
**Y** el conteo de deseables de su tarjeta se actualiza en la misma respuesta, sin que la evidencia y el conteo queden un momento en desacuerdo

## Notas

Cubre **RF-13.8** (un solo motor de criterios, capa determinista: lo que decide los resultados es lo que decide la evidencia y los conteos) aplicado a **RF-13.10**, junto con **RF-13.9.3** (el conteo de deseables lo produce HU-118) y **RF-13.7.3** (una opción añadida por el cliente que no existe en el banco no es criterio de emparejamiento).

**Nace el 2026-10-02 de la partición de HU-119 por validación INVEST (falla I).** **Partición, no recorte**. HU-119 dibuja la evidencia a partir de criterios ya resueltos (construible con criterios sembrados). Esta historia sustituye la entrada sembrada por la evaluación real del motor único de **EP-009** y verifica que evidencia, resultados y conteos no se contradicen. Ninguna lógica de evaluación vive en la tarjeta ni en la ficha.

**D87 (sponsor, 2026-10-02): se mueve a EP-009.** La historia vive ahora junto al motor único de criterios (RF-13.8) y a **HU-118**, de la que depende. **No es recorte: cambia de épica.** Así EP-003 queda sin dependencia de EP-009: HU-119 se construye y verifica en EP-003 con criterios sembrados, y esta historia la conecta al motor real dentro de EP-009.

**Secuencia:** dentro de EP-009, se construye **después de HU-118 y del motor (RF-13.8)**, y sobre la presentación que HU-119 ya dejó construida en EP-003. Está declarado en `depende_de` y no es un aplazamiento de alcance.

**El dato ausente es «no cumplido»**, como fija HU-119: el motor y la presentación deben coincidir en esa regla (un perfil sin idioma registrado falla «Inglés»; si «Inglés» es obligatorio, no aparece).

**Fronteras:** «lo más cercano», que dice qué criterio obligatorio falla, es de **EP-010** (RF-14.3, D-14); esta historia solo garantiza que en los resultados normales ningún obligatorio aparece como no cumplido. La vista de tabla con la misma evidencia en columnas es de **HU-121** (EP-002).

## Trazabilidad

Épica madre: **EP-009** (movida desde EP-003 por D87, 2026-10-02) · PRD v4.17 · RF-13.8 · RF-13.10 · RF-13.9.3 · RF-13.7.3 · D87 · nace de la partición de HU-119 (2026-10-02) · depende de HU-118 y el motor RF-13.8 (misma épica) y de HU-119 (presentación, EP-003) · relacionada con HU-121 (EP-002) y HU-076 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: dentro de EP-009 (D87) se secuencia detrás de HU-118 y del motor RF-13.8, sobre la presentación de HU-119 (EP-003); ninguna historia de EP-003 la espera |
| N | Negociable | ✓ es fijo que evidencia, resultados y conteos salen de una sola evaluación; cómo se transporta la evaluación a la vista se puede negociar |
| V | Valiosa | ✓ sin ella la explicabilidad podría contradecir el resultado, que es justo lo que destruye la confianza del cliente en por qué aparece cada persona |
| E | Estimable | ✓ M: conectar la salida del motor con la entrada que HU-119 ya consume y probar la coherencia en cuatro situaciones; el riesgo depende del contrato que publique EP-009 |
| S | Pequeña | ✓ M: una integración con cuatro escenarios, sin pantallas nuevas |
| T | Testeable | ✓ con el motor real y perfiles sembrados, las líneas, la presencia en resultados y los conteos se comparan entre sí en la pantalla y en la respuesta |
