---
id: HU-093
titulo: "Entrar sin una selección previa y ser encuadrado"
epica: EP-001
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
depende_de: [HU-090]
---

# HU-093 — Entrar sin una selección previa y ser encuadrado

**Como** líder de área que entró por un enlace sin selección de perfiles,
**quiero** que el portal me oriente en lugar de mostrarme una lista de 23 perfiles,
**para** empezar por lo que necesito y no por lo que ustedes tienen.

## Criterios de aceptación

### Happy path — la pregunta de encuadre

**Dado** que tengo una sesión válida con mi correo invitado en un enlace que no trae selección
**Cuando** carga el portal
**Entonces** veo la pregunta de encuadre «¿Qué necesita tu proyecto?» antes del listado
**Y** veo como opciones los roles y las categorías del banco publicado

### Happy path — elijo una opción

**Dado** que veo la pregunta de encuadre con los roles y las categorías del banco publicado
**Cuando** elijo una opción de rol o de categoría
**Entonces** veo el banco filtrado por esa opción

### Alterno — sigo sin elegir

**Dado** que veo la pregunta de encuadre sin haber elegido una opción
**Cuando** sigo al banco sin responder
**Entonces** veo el banco completo, el mismo que abre «Ampliar la búsqueda» (RF-2.2)
**Y** no veo ningún mensaje ni pantalla de bloqueo

### Error — la opción elegida no tiene perfiles disponibles

**Dado** que veo la pregunta de encuadre
**Y** que ningún perfil publicado corresponde a una de sus opciones en este momento
**Cuando** elijo esa opción
**Entonces** veo que hoy no hay perfiles publicados para esa opción
**Y** veo las salidas del camino del cero: ampliar la búsqueda y pedir el perfil a medida (RF-14.3)

### Edge case — enlace sin contexto de proyecto

**Dado** que tengo una sesión válida en un enlace que identifica la cuenta pero no trae contexto de proyecto
**Cuando** carga el portal
**Entonces** veo un saludo con el nombre de la cuenta
**Y** no veo ningún nombre de proyecto ni motivo de selección en el encabezado

## Notas

Cubre **RF-1.3**, el recorrido secundario «aterrizaje sin conjunto curado» de §6.3 y, para las opciones del encuadre, las facetas Rol y Categoría de **RF-2.3**.

**Ajustada el 2026-09-27 a D-4 revisada** (corrección de discovery T-18, CRN-13). Antes el caso límite era «enlace sin cuenta» con saludo neutro: con acceso nominal todo enlace declara cuenta y correos invitados (RF-1.2.7, RF-19.4), así que un enlace sin cuenta no da acceso y ese caso lo cubre la puerta de HU-090. Se conserva la intención —el portal no inventa contexto— aplicada a lo que sí puede faltar: el proyecto.

**Dueño de cada vía del encuadre** (validación INVEST del 2026-09-27; sin recorte de alcance). El criterio anterior decía «puedo escribir una instrucción o entrar por familia de rol». Esas dos vías son capacidades de **EP-009** y ya tienen historia propia: escribir una instrucción es **HU-065** y arrancar desde sugerencias por familia de rol cuando no hay proyecto es **HU-066** (RF-12, RF-13.1). EP-009 no está en la ruta crítica de EP-001, así que esta historia se apoya solo en el banco completo de EP-001 (RF-2.2) y en los valores de Rol y Categoría del banco publicado (RF-2.3). La restricción por una sola opción que aplica el encuadre es la misma que ofrecerá la faceta «filtrar por rol y categoría» de EP-002: aquí se aplica sin el panel de facetas, y EP-002 la reemplaza por su faceta sin cambiar este criterio. El panel de facetas combinables sigue siendo alcance de EP-002. Cuando EP-009 se construya, la barra de instrucción y sus sugerencias entran en esta misma pantalla de encuadre con los criterios de HU-065 y HU-066; nada de lo que prometía el criterio anterior se pierde, cambia de dueño.

**Pregunta abierta** (propuesta para §12.3 del PRD): §6.3 describe el aterrizaje sin conjunto curado «desde la firma del comercial» y la reunión en vivo en la que el comercial «envía el enlace del estado actual». Con acceso nominal, esos enlaces también necesitan correos invitados. ¿Quién los declara y desde dónde —Talento Humano en el panel, como cualquier enlace, o el ejecutivo comercial—? ¿Existe un enlace sin selección, o todo enlace con invitados es un enlace curado de HU-122? Hasta que se decida, esta historia aplica a cualquier enlace sin selección que ya tenga invitados; no crea un tipo de enlace nuevo.

**Pruebas.** Se construye y verifica con una sesión sembrada en un enlace sin selección, sin esperar a HU-090 terminada.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.13 · §6.3 · RF-2.3 · depende de HU-090 · orden de construcción: después de HU-090 · relacionada con HU-065 y HU-066 (EP-009), dueñas de la vía de instrucción

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se secuencia después de la puerta de HU-090 y se verifica con sesión sembrada; ya no depende de EP-009, porque el encuadre usa solo roles y categorías del banco |
| N | Negociable | ✓ describe el resultado; la forma del encuadre y sus textos son negociables |
| V | Valiosa | ✓ evita que el cliente sin selección se pierda en el banco completo |
| E | Estimable | ✓ usa facetas ya definidas en RF-2.3; la pregunta abierta sobre el origen del enlace no cambia los criterios; falta la cifra del equipo |
| S | Pequeña | ✓ S: una pantalla de encuadre sobre facetas existentes, sin fabricar capacidades de EP-009 |
| T | Testeable | ✓ cinco escenarios con resultados observables en pantalla (pregunta, opciones, banco filtrado, salidas del cero, ausencia de proyecto en el encabezado) |
