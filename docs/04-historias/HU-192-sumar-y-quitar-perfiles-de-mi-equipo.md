---
id: HU-192
titulo: "Sumar y quitar perfiles de Mi equipo"
epica: EP-004
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.18
---

# HU-192 — Sumar y quitar perfiles de Mi equipo

**Como** líder de proyecto invitado que recorre la selección de su correo y el banco de perfiles,
**quiero** sumar a «Mi equipo» los perfiles que me interesan, quitarlos cuando cambio de opinión y ver en todo momento cuántos llevo,
**para** ir armando el equipo que voy a pedir mientras exploro, sin anotarlo aparte ni perderlo al cambiar de pantalla.

## Criterios de aceptación

### Happy path — sumar un perfil desde la lista

**Dado** que entré con mi correo invitado y mi equipo tiene 2 perfiles
**Y** que estoy en la selección de mi correo, frente a la tarjeta de un perfil que no está en mi equipo
**Cuando** toco «Sumar al equipo» en su tarjeta
**Entonces** el indicador «Mi equipo» pasa a 3
**Y** la tarjeta dice que el perfil ya está en mi equipo y ofrece «Quitar del equipo»
**Y** al recargar la página o pasar a otra pantalla del portal, el indicador sigue en 3

### Alterno — quitar un perfil del equipo

**Dado** que mi equipo tiene 3 perfiles y estoy frente a la tarjeta de uno de ellos
**Cuando** toco «Quitar del equipo» en su tarjeta
**Entonces** el indicador «Mi equipo» pasa a 2
**Y** la tarjeta vuelve a ofrecer «Sumar al equipo»
**Y** el perfil sigue en la lista; quitarlo del equipo no lo oculta

### Error — no se puede guardar el cambio

**Esquema del escenario:** un fallo no se presenta como éxito
**Dado** que estoy frente a la tarjeta de un perfil que <situacion> y el servidor no puede guardar mi equipo en este momento
**Cuando** toco «<accion>»
**Entonces** el portal me dice que no se pudo guardar el cambio y que lo intente de nuevo
**Y** el indicador «Mi equipo» no cambia y la tarjeta sigue mostrando el perfil como <estado_previo>

**Ejemplos:**

| situacion | accion | estado_previo |
|---|---|---|
| no está en mi equipo | Sumar al equipo | fuera de mi equipo |
| está en mi equipo | Quitar del equipo | en mi equipo |

### Edge case — lo que sumo en el banco sigue al volver a la selección

**Dado** que amplié la búsqueda al banco completo con 1 perfil en mi equipo
**Y** que en el banco sumé otro perfil, que no está en la selección de mi correo
**Cuando** vuelvo a la selección de mi correo
**Entonces** el indicador «Mi equipo» dice 2
**Y** el perfil sumado en el banco sigue en mi equipo aunque no aparezca en la selección

### Edge case — cada invitado arma su propio equipo

**Dado** que un colega y yo entramos con nuestros correos invitados por el mismo enlace
**Y** que mi equipo tiene 2 perfiles y el de mi colega está vacío
**Cuando** mi colega suma a su equipo uno de los perfiles que yo tengo en el mío
**Entonces** el indicador de mi colega dice 1
**Y** mi equipo sigue con mis mismos 2 perfiles y mi indicador dice 2
**Y** ninguno de los dos ve, edita ni puede quitar los perfiles del equipo del otro

## Notas

Cubre **RF-4.1** (sumar y quitar perfiles a una selección guardada en el servidor por invitado, ligada al correo verificado y al enlace), **RF-4.1.1** (cada invitado ve solo el suyo) y **RF-4.2** (indicador siempre visible con el conteo, en cualquier pantalla). Es el núcleo de EP-004, que hasta hoy solo tenía redactadas las observaciones sobre la composición (HU-080 y HU-084).

**Nace el 2026-10-02 por D88** (sponsor): se redacta ya la historia de EP-004 «sumar y quitar perfiles de Mi equipo» con su indicador, porque HU-175 (sumar o quitar desde la ficha, EP-003) depende de ella. Paga la deuda de mapa que señalaban `docs/03-backlog/epicas.md` (criterios recibidos de EP-001) y `docs/06-flows/EP-004`.

**Criterios recibidos de EP-001 que absorbe** (`docs/03-backlog/epicas.md`, 2026-09-28): sumar perfiles mientras se explora el banco completo y conservarlos al volver a la selección (antes en HU-094, happy) → edge «lo que sumo en el banco sigue»; el colega invitado suma y quita en su propio «Mi equipo» (antes en HU-095, happy) → edge «cada invitado arma su propio equipo». El tercero —ante perfiles de la selección archivados, ofrecer continuar desde lo que se lleva en «Mi equipo» (antes en HU-094, error)— **no** entra aquí: es recuperar y continuar el equipo, y va con la historia de recuperación de EP-004 (RF-4.1.2, RF-4.5), que sigue sin redactar.

**Qué existe ya (EP-001):** el «Mi equipo» mínimo por invitado y enlace en el servidor (`identidad.equipos` y `identidad.equipo_perfiles`, migración 0010; `packages/infra/src/postgres/equipo.ts`), vacío al primer ingreso, aislado entre invitados y sin cambios al volver a la selección. El rol `ps_portal` **no tiene INSERT** en `equipo_perfiles`: esta historia le da escritura acotada a su propio equipo. El indicador ya se dibuja en el marco del portal (`apps/portal/src/marco/MarcoPortal.tsx`) con su conteo, pero **deshabilitado**; esta historia lo hace reflejar sumar y quitar al momento.

**Fronteras con otras historias, para no duplicar:**
- **HU-175** (EP-003) pone las mismas dos acciones en la ficha, sin cerrarla; usa esta capacidad.
- **HU-080** y **HU-084** observan la composición del equipo; no suman ni quitan.
- La **vista de resumen** a la que lleva el indicador (RF-4.3), el **comparador** (RF-4.4) y **recuperar el equipo en otro dispositivo o al volver** (RF-4.1.2, RF-4.5) son otras historias de EP-004, aún sin redactar. Aquí el indicador muestra el conteo; adónde lleva al tocarlo es de RF-4.3.
- Que el equipo **viaje completo a la solicitud** (RF-4.1.3, RF-5.3) es de EP-005.
- La selección múltiple para sumar varios a la vez desde la vista de tabla es de **HU-121** (EP-002).

**Sin tope de perfiles por equipo**: el PRD no fija uno y esta historia no lo inventa.

## Trazabilidad

Épica madre: **EP-004** · PRD v4.18 · RF-4.1 · RF-4.1.1 · RF-4.2 · D88 (sponsor, 2026-10-02) · absorbe criterios recibidos de EP-001 (HU-094 happy, HU-095 happy) · se apoya en el «Mi equipo» mínimo de EP-001 · habilita HU-175 (EP-003) · relacionada con HU-080 y HU-084 (observaciones sobre la composición) y HU-121 (EP-002)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ se apoya en el «Mi equipo» mínimo y en el marco del portal que EP-001 ya construyó; no espera a ninguna otra historia de EP-004 |
| N | Negociable | ✓ son fijos que el equipo vive en el servidor por invitado y enlace, que sumar y quitar se reflejan al momento en un indicador visible en todas las pantallas y que un fallo no se presenta como éxito; el texto de las acciones, la forma del indicador y su ubicación se pueden negociar |
| V | Valiosa | ✓ es la palanca directa de la métrica de EP-004 (1,8 perfiles o más por solicitud): sin sumar y quitar no hay equipo que pedir |
| E | Estimable | ✓ M: dar escritura acotada a `ps_portal` sobre su propio equipo, dos acciones en la tarjeta con su estado, actualizar el indicador existente y probar el aislamiento entre invitados; el modelo de datos ya existe |
| S | Pequeña | ✓ M: una capacidad (sumar y quitar con conteo) en cinco escenarios; resumen, comparador y recuperación quedan en otras historias |
| T | Testeable | ✓ e2e con dos invitados sembrados del mismo enlace: indicador de 2 a 3 y de 3 a 2, conteo que persiste al recargar y al cambiar de pantalla, fallo simulado del servidor en las dos acciones sin cambio de indicador, perfil sumado en el banco presente al volver a la selección y equipos aislados entre invitados |
