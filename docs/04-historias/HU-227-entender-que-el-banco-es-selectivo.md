---
id: HU-227
titulo: "Entender que el banco es selectivo y no pequeño"
epica: EP-010
prioridad: media
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-075, HU-178]
---

# HU-227 — Entender que el banco es selectivo y no pequeño

**Como** líder de proyecto que llegó a un cero en un banco de decenas de perfiles,
**quiero** que la pantalla me diga cuántos perfiles publica Trycore y con qué estándar los elige,
**para** leer el «hoy no lo tenemos» como una selección exigente y no como un banco pobre en el que no vale la pena buscar.

## Criterios de aceptación

### Happy path — el tamaño del banco se dice como selectividad

**Dado** que el banco tiene 96 perfiles publicados, ninguno marcado como incompleto, y mi búsqueda llegó al cero,
**cuando** se muestra la pantalla de cero,
**Entonces** veo, junto al pedido a medida, una línea que presenta el tamaño del banco como selección: «Publicamos 96 perfiles: solo los que Trycore verificó con SARO, DISC y validaciones técnicas»
**Y** la cifra es la de perfiles publicados en ese momento

### Edge case — no se afirma lo que el banco no cumple

**Dado** que el banco tiene 96 perfiles publicados y el número de publicados marcados como incompletos de la tabla,
**cuando** se muestra la pantalla de cero,
**Entonces** la línea de selectividad dice lo que indica la tabla

| Publicados incompletos | Línea de selectividad |
|---|---|
| 0 | afirma que todos los publicados están verificados con SARO, DISC y validaciones técnicas |
| 2 | dice cuántos perfiles se publican y describe el estándar de Trycore, sin afirmar que todos lo cumplen |

### Error — el conteo no está disponible

**Dado** que el conteo de perfiles publicados o de incompletos no se pudo obtener,
**cuando** se muestra la pantalla de cero,
**Entonces** la línea describe el estándar de selección sin ninguna cifra
**Y** nunca muestra «0 perfiles» ni afirma que todos los publicados lo cumplen

## Notas

**Nace el 2026-10-02 en la discovery de EP-010** para cubrir **RF-14.4** (*la escasez se declara, no se disimula: el tamaño del banco se comunica como selectividad*), que no tenía historia; estaba en las historias anticipadas de la épica («entender que el banco es selectivo y no pobre»). No es alcance nuevo: es un RF de la épica sin dueño.

**Por qué en el cero.** Es donde el tamaño del banco se nota. La línea acompaña al pedido a medida: «no lo tenemos porque publicamos poco y bien; podemos buscarlo».

**Misma regla que el encabezado del estándar (D80, D97).** La afirmación «todos verificados» solo aparece cuando hay **0 publicados incompletos** (HU-178, EP-003); si el conteo falla, la versión descriptiva y sin cifra (D97). Así esta línea y el encabezado de HU-159 nunca se contradicen.

**Copy sujeto a redacción validada con Comercial** (RF-14.4: *declarar selectividad con decenas de perfiles puede sonar a excusa*). Se construye con la redacción del ejemplo y queda **marcada para revisión de copy** (D73); la revisión cambia el texto, no los criterios.

## Trazabilidad

Épica madre: **EP-010** · PRD v4.18 · RF-14.4 · RF-14.3 · D73, D80 y D97 (sponsor, 2026-10-02) · depende de HU-075 (pantalla de cero) y HU-178 (conteo de incompletos, EP-003) · relacionada con HU-159 (encabezado del estándar)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: se monta en la pantalla de cero de HU-075 y lee el conteo de incompletos de HU-178 (EP-003, en construcción); sin HU-178 se prueba con el conteo sembrado |
| N | Negociable | ✓ fija que la cifra es real, que no se afirma lo que el banco no cumple y que sin conteo no hay cifra; la redacción es negociable y se valida con Comercial |
| V | Valiosa | ✓ evita que el cero se lea como un banco pobre y sostiene la propuesta de valor de la curaduría (O2) |
| E | Estimable | ✓ S: una línea con dos conteos ya existentes y la regla de D80 |
| S | Pequeña | ✓ S: una línea en tres escenarios |
| T | Testeable | ✓ banco sembrado con 96 publicados y 0 o 2 incompletos, y un conteo forzado a fallar, dan textos observables |
