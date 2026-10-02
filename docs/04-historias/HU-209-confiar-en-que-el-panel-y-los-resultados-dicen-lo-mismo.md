---
id: HU-209
titulo: "Confiar en que el panel y los resultados dicen lo mismo"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-065]
---

# HU-209 — Confiar en que el panel y los resultados dicen lo mismo

**Como** líder de área que ajusta el Perfil Objetivo,
**quiero** que el número de perfiles que me da el panel sea siempre el que veo en los resultados, y que un solo aviso me diga qué soltar cuando no queda nadie,
**para** confiar en el panel y no perseguir avisos que se contradicen con lo que veo.

## Criterios de aceptación

### Happy path — el contador es el número de resultados

**Dado** que tengo «Desarrollador Frontend» obligatorio con 12 perfiles y «React» y «TypeScript» deseables
**Cuando** marco «Senior» como obligatorio
**Entonces** el panel dice «7 perfiles cumplen lo obligatorio»
**Y** la lista muestra exactamente 7 perfiles, tanto en la vista de tarjetas como en la de tabla

### Happy path — en tecnologías basta con alguna

**Dado** que de 12 perfiles de Desarrollador Frontend, 3 tienen Angular, 2 tienen Vue.js y ninguno tiene ambas, y ya marqué «Angular» como tecnología obligatoria (3 perfiles)
**Cuando** marco también «Vue.js» como obligatoria
**Entonces** el panel y la lista muestran 5 perfiles, no 0
**Y** el campo de tecnologías dice «Basta con que tenga alguna»

### Error — la combinación queda vacía y hay un solo aviso

**Dado** que tengo «Desarrollador Frontend», «React» y «Banca» obligatorios con 2 perfiles
**Cuando** marco «Líder técnico» como obligatorio
**Entonces** veo un único aviso, «Ningún perfil cumple los 4 obligatorios», con los 4 criterios como etiquetas que se quitan con un toque
**Y** ningún campo del panel muestra un aviso propio, el contador dice 0 y no hay tarjetas

### Edge case — el único aviso por campo es el valor que no existe

**Dado** que tengo «Desarrollador Frontend» obligatorio con 12 perfiles
**Cuando** añado la tecnología «Web Components», que no está en el banco
**Entonces** el único aviso de campo es «Web Components no está en el banco»
**Y** el contador y la lista siguen en 12

### Edge case — nada aplicado sin verse en el panel

**Dado** que envié «frontend react»
**Cuando** abro el Perfil Objetivo
**Entonces** «React» aparece marcado en tecnologías con «Lo escribiste: "react"» y «Desarrollador Frontend» marcado en la familia de rol
**Y** el panel no aplica ningún criterio que no esté visible en sus campos

## Notas

Cubre **RF-13.8** (un solo motor de criterios: el panel es el filtro, los resultados son lo que pasa el filtro, y el contador y el número de resultados son siempre el mismo número), **RF-13.8.1** (dentro de tecnologías vale cualquiera, no todas, y el campo lo declara), **RF-13.8.2** (un solo aviso a nivel de panel con los criterios activos como etiquetas removibles; el aviso por campo se reduce a «el valor no existe en el banco») y **RF-13.7.4** (el panel muestra en todo momento cuántos perfiles quedan). El quinto escenario responde al origen documentado de RF-13.8: criterios preseleccionados por la interpretación sin que el cliente lo notara.

**Nace el 2026-10-02 (discovery de EP-009)** porque el motor único no tenía historia propia: HU-174 conecta la evidencia al motor y HU-118 define obligatorio y deseable, pero ninguna verificaba que el contador del panel y los resultados no se contradicen. Absorbe el antiguo error «combinación sin ningún perfil» de HU-085.

**Cómo se construye (ADR-0004, negociable):** una función pura `evaluar(catalogo, criterios)` en `packages/motor` que devuelve resultados, conteos por opción, evidencia y cercanos; el panel, las tarjetas y la tabla leen esa misma salida. La prueba de rendimiento V4-1 comprueba en cada interacción que contador = resultados.

**Frontera con EP-002 y EP-010:** el cálculo base de facetas con contador por opción y «cualquiera» dentro de una faceta lo construye **HU-219** (EP-002) en el mismo `packages/motor`; esta historia lo extiende al Perfil Objetivo con obligatorio y deseable y con el aviso único, sin un segundo cálculo (si EP-009 se construye antes, HU-219 reutiliza este). La vista de tabla es de HU-121 (EP-002) y aquí solo se exige que muestre el mismo número; la pantalla del cero (lo más cercano, solicitud a medida) es de EP-010. Este aviso es el del panel.

**Fuente de diseño:** `docs/05-prototipo/pantallas/perfil-objetivo--combinacion-vacia.html` y `perfil-objetivo.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.8 · RF-13.8.1 · RF-13.8.2 · RF-13.7.4 · ADR-0004 (motor único, V4-1) · depende de HU-065 (intérprete, misma épica) · habilita HU-118, HU-085, HU-069, HU-070, HU-174 y HU-210 · relacionada con HU-219 y HU-121 (EP-002) y HU-075 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada del intérprete (misma épica); es la base del resto del panel |
| N | Negociable | ✓ son fijos el mismo número en panel y resultados, el «cualquiera» en tecnologías y el aviso único; textos y disposición se negocian |
| V | Valiosa | ✓ el cliente confía en el panel; sin esto el panel dice cero mientras la pantalla muestra perfiles (el defecto que originó RF-13.8) |
| E | Estimable | ✓ M: `evaluar()` como función pura con pruebas de propiedades (contador = resultados) y el aviso único en el panel |
| S | Pequeña | ✓ M: cinco escenarios sobre el motor y su aviso |
| T | Testeable | ✓ pruebas de propiedades del motor con bancos generados y e2e con banco sembrado: conteos exactos en tarjetas y tabla, aviso único y criterios visibles |
