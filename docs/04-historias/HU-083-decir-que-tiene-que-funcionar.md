---
id: HU-083
titulo: "Decir qué tiene que estar funcionando cuando el proyecto termine"
epica: EP-009
prioridad: alta
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-070, HU-207, HU-209]
---

# HU-083 — Decir qué tiene que estar funcionando cuando el proyecto termine

**Como** líder de proyecto cuya meta no es contratar a alguien sino entregar algo,
**quiero** describir el resultado que mi proyecto tiene que alcanzar, antes que el rol que creo necesitar, y decir si se parece a algún tipo de proyecto que Trycore ya entrega,
**para** que Trycore entienda mi problema y no solo mi pedido.

## Criterios de aceptación

### Happy path — el reto encabeza la especificación

**Dado** que Delivery registró composiciones para «Tipo A (ficticio)», «Tipo B (ficticio)» y «Tipo C (ficticio)» (HU-207)
**Cuando** abro el Perfil Objetivo
**Entonces** el primer campo pregunta «¿Qué tiene que quedar funcionando al terminar el proyecto?», marcado «Opcional» y antes de la familia de rol
**Y** debajo veo «¿Tu proyecto se parece a alguno de estos?» con «Tipo A (ficticio)», «Tipo B (ficticio)», «Tipo C (ficticio)» y «Ninguno de estos»

### Happy path — escribir el reto no cambia los resultados

**Dado** que 12 perfiles cumplen lo obligatorio
**Cuando** escribo en el reto «El portal transaccional de personas en producción (ficticio)»
**Entonces** siguen los mismos 12 perfiles en el mismo orden
**Y** junto al campo leo «No filtra perfiles; viaja con tu solicitud»

### Edge case — elegir el tipo de proyecto

**Dado** que veo la pregunta «¿Tu proyecto se parece a alguno de estos?»
**Cuando** elijo «Tipo A (ficticio)»
**Entonces** «Tipo A (ficticio)» queda como el tipo de proyecto de mi reto en el Perfil Objetivo
**Y** los resultados no cambian

### Error — no hay composiciones registradas

**Dado** que Delivery no ha registrado ninguna composición de referencia
**Cuando** abro el Perfil Objetivo
**Entonces** veo el campo del reto pero no la pregunta «¿Tu proyecto se parece a alguno de estos?»
**Y** no se ofrece ningún tipo genérico ni aproximado en su lugar

### Edge case — el reto sigue a la vista cuando no queda ningún perfil

**Dado** que declaré el reto «El portal transaccional de personas en producción (ficticio)» y quedan 2 perfiles que cumplen lo obligatorio, ninguno Líder técnico
**Cuando** marco «Líder técnico» como obligatorio
**Entonces** el aviso del panel (HU-209) muestra «Para: El portal transaccional de personas en producción (ficticio)» junto a los criterios activos

## Notas

Cubre **RF-13.6** (el reto, no el rol: el Perfil Objetivo abre con qué tiene que estar funcionando cuando el proyecto termine; es opcional y quien solo quiere un perfil lo deja vacío sin que el flujo cambie). El reto viaja con la solicitud, o la marca «sin reto declarado», en **HU-211**; al registro de demanda, en EP-010.

**Refinada el 2026-10-02 (discovery de EP-009): cierra el bloqueo de HU-084.** Faltaba fijar **cómo el reto declarado se asigna a uno de los tres tipos de proyecto** que registra HU-207.

**Decisiones por delegación del sponsor (elegidas por el modelo, opción conservadora):**
- **La asignación reto → tipo la hace el cliente**, con una pregunta cerrada y opcional bajo el reto que ofrece solo los tipos con composición registrada más «Ninguno de estos». Ni el modelo ni una regla de palabras clave clasifican el texto del cliente: D-24 limita el modelo a dos usos, y RF-14.7.2 dice que quien nombra la meta es el cliente.
- **El nombre del tipo de proyecto es público**; lo interno de HU-207 es el detalle de los proyectos de origen. *Alineado con EP-008 (2026-10-02):* la nota de HU-207 se corrigió para tratar el nombre como público; Delivery lo registra sabiendo que lo verá el cliente. No cambia ningún escenario de esta historia.
- **El reto vacío no añade ningún paso**: no hay aviso ni recordatorio al enviar (RF-13.6, «el flujo no cambia»).

**Lo que pasa a EP-010 y por qué.** La versión anterior decía que en el cero el cliente vería «los perfiles del banco que sí aportan a ese reto». Mostrar perfiles por el reto choca con **RF-14.7.2** (la forma del trabajo «nunca propone perfiles concretos») y elegirlos exigiría inferir qué aporta cada persona. Lo que se ve en el cero (Perfil Objetivo a la vista, lo más cercano y la solicitud a medida, RF-14.3) es de **EP-010** (HU-075, HU-076, HU-077); esta historia garantiza que el reto está a la vista en el aviso del panel. **No es recorte**: la capacidad «no tenemos ese perfil, pero…» la sirve EP-010 con «lo más cercano».

**Línea de release.** HU-084, que se apoya en el tipo, está bajo la línea de v1.1 del mapa (ubicación, no recorte).

**Fuente de diseño:** `docs/05-prototipo/pantallas/perfil-objetivo.html` (campo del reto con «No filtra perfiles; viaja con tu solicitud», borrador). La pregunta del tipo no está en el prototipo y se añade en la misma sección.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.6 · RF-14.7.0 · RF-14.7.2 · D-19 · D-24 · D108 · depende de HU-070 (misma épica) y HU-207 (EP-008, composiciones registradas) · habilita HU-084 · relacionada con HU-209, HU-211 y HU-075 (EP-010)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el Perfil Objetivo (misma épica) y las composiciones de HU-207 (EP-008, lista); sin composiciones, el reto funciona solo |
| N | Negociable | ✓ son fijos que el reto va primero, es opcional, no filtra y que el tipo lo elige el cliente entre los registrados; la redacción se negocia |
| V | Valiosa | ✓ Delivery recibe el resultado esperado y no solo el rol, y el cliente habla de su problema |
| E | Estimable | ✓ S: un campo de texto, una pregunta cerrada que lee los tipos registrados y su lugar en el aviso del panel |
| S | Pequeña | ✓ S: cinco escenarios sobre un bloque del panel |
| T | Testeable | ✓ e2e con y sin composiciones sembradas: orden de campos, resultados idénticos antes y después del reto, tipo guardado y reto visible en el aviso de cero |
