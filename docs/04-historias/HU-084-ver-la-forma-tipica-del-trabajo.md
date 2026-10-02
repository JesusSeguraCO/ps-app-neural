---
id: HU-084
titulo: "Ver la forma típica del trabajo que estoy por emprender"
epica: EP-009
prioridad: media
complejidad: M
estado: draft
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-083, HU-203, HU-207]
---

# HU-084 — Ver la forma típica del trabajo que estoy por emprender

**Como** líder de proyecto que declaró un reto y seleccionó algunos perfiles,
**quiero** ver qué capacidades suelen requerir los proyectos como el mío y cuáles ya cubrí,
**para** no descubrir a mitad de camino que me faltaba una capacidad que era evidente para quien ya hizo esto antes.

## Criterios de aceptación

### Happy path — forma de referencia informativa

**Dado** que declaré un reto del «Tipo A (ficticio)», que tiene registrada una composición de Backend, Frontend, QA de automatización y Arquitectura de software, salida de 4 proyectos entregados
**Y** que mi equipo tiene un perfil Backend y uno de QA de automatización
**Cuando** abro la vista «Mi equipo»
**Entonces** veo que los proyectos como el mío suelen requerir esas 4 capacidades, con Backend y QA de automatización marcadas como cubiertas y Frontend y Arquitectura de software como no cubiertas
**Y** leo «Sale de 4 proyectos entregados por Trycore»
**Y** no veo perfiles propuestos, botones de sumar ni enlaces a resultados

### Error — tipo de proyecto sin composición registrada

**Dado** que declaré un reto que no corresponde a ninguno de los tipos con composición registrada
**Cuando** abro la vista «Mi equipo»
**Entonces** no veo ninguna composición de referencia
**Y** no se muestra una composición genérica ni aproximada en su lugar

### Edge case — el cliente descarta la referencia

**Dado** que en la vista «Mi equipo» veo la composición de referencia
**Cuando** la descarto
**Entonces** desaparece de la vista
**Y** no vuelve a aparecer al recargar, al volver a la vista ni al entrar desde otro dispositivo por el mismo enlace
**Y** puedo continuar a la solicitud sin ninguna advertencia

### Edge case — selección completa

**Dado** que declaré un reto del «Tipo A (ficticio)» y mi equipo cubre sus 4 capacidades
**Cuando** abro la vista «Mi equipo»
**Entonces** la referencia dice que mi selección cubre las capacidades que suelen requerir los proyectos como el mío
**Y** no propone nada más

### Edge case — con referencia visible no se repite la observación de vacío

**Dado** que declaré un reto del «Tipo A (ficticio)», mi equipo tiene 2 perfiles Backend y ninguno de QA, y la regla de vacío de HU-080 aplica
**Cuando** abro la vista «Mi equipo»
**Entonces** veo la composición de referencia con QA de automatización como no cubierta
**Y** no veo además la observación «Tu equipo tiene 2 perfiles de desarrollo y ninguno de pruebas»

## Notas

Cubre **RF-14.7** (composiciones de referencia), con **RF-14.7.0** (solo los tres tipos más frecuentes, D-19), **RF-14.7.1** (regla dura: composiciones de proyectos que Trycore entregó; si el dato no existe, no se muestra), **RF-14.7.2** (informativo, una sola vez, descartable; nunca propone perfiles ni llamados a la acción de venta) y **RF-14.7.3** (nunca bloquea, no insiste, no reaparece, no condiciona el envío). Es el primer peldaño verificable de la venta de células (V2-4).

**Refinada el 2026-10-02 (discovery de EP-004).** Valores comprobables con un tipo de proyecto **ficticio** (los nombres reales de los tres tipos los da Delivery y no se escriben aquí); se elimina la nota «Bloqueada por D-19» (D-19 cerró el 2026-09-21); el descarte **no reaparece** para ese invitado y ese enlace (letra de RF-14.7.2 y RF-14.7.3).

**D108 (sponsor, 2026-10-02): cambio de épica a EP-009**, junto a HU-083 (reto declarado), de la que depende. No es recorte: se construye entera con EP-009. La vista donde se dibuja (HU-203) es de EP-004 y las composiciones las registra HU-207 (EP-008, D109).

**Quinto escenario (no duplicar avisos).** Con la referencia visible, la observación de vacío de HU-080 no se muestra: la referencia ya dice qué falta. *Elegida por el modelo por delegación del sponsor* (pregunta P8 del discovery de EP-004).

**Por qué sigue en draft.** Depende de **HU-083** (EP-009, en draft): falta definir **cómo el reto declarado se asigna a uno de los tres tipos de proyecto** que registra HU-207. Sin esa regla, el «Dado» del happy path no es construible. Se refina en el discovery de EP-009; no es recorte ni diferimiento.

**Regla de tono (RF-14.7.2):** quien nombra la meta es el cliente. El portal le devuelve la forma del trabajo y él saca la conclusión. **Prueba que la falsea:** si la referencia no sube el promedio de perfiles por solicitud, o si sube el abandono en la pantalla de equipo, era venta cruzada disfrazada de ayuda y se retira (la lectura es HU-184, EP-008).

**Línea de release.** El mapa ubica esta historia bajo la línea de v1.1. Es ubicación, no recorte.

## Trazabilidad

Épica madre: **EP-009** (D108) · PRD v4.18 · RF-14.7 · RF-14.7.0 a RF-14.7.3 · D-19 · D108 · D109 · depende de HU-083 (EP-009, reto declarado), HU-203 (EP-004, vista «Mi equipo») y HU-207 (EP-008, composiciones registradas) · relacionada con HU-080 (EP-004) · su efecto lo mide HU-184 (EP-008) · RF-14.7 se suma a las capabilities de EP-009 en `epicas.md`

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✗ depende de HU-083 (misma épica desde D108, en draft) para asignar el reto a un tipo de proyecto; HU-203 y HU-207 están listas |
| N | Negociable | ✓ son fijos el origen real del dato, los tres tipos, el tono sin propuestas y el descarte que no reaparece; la presentación de la referencia es negociable |
| V | Valiosa | ✓ el cliente ve lo que suele hacer falta en proyectos como el suyo y decide él; es el primer peldaño de la venta de células |
| E | Estimable | ✓ M una vez definida la asignación reto → tipo: leer la composición del tipo, cruzar sus roles con los del equipo y guardar el descarte por invitado y enlace |
| S | Pequeña | ✓ M: cinco escenarios sobre un bloque de la vista |
| T | Testeable | ✓ e2e con una composición ficticia sembrada y un reto fijado: capacidades cubiertas y no cubiertas, silencio sin composición, descarte que no reaparece en otro contexto de navegador, selección completa y supresión de la observación de vacío |
