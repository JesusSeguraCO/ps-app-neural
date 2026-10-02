---
id: HU-223
titulo: "Salir del cero que dejaron mis filtros sin adivinar qué deshacer"
epica: EP-002
prioridad: alta
complejidad: S
estado: lista
fase: refinamiento-y-descubrimiento
prd_version: 4.18
depende_de: [HU-219, HU-220, HU-147]
---

# HU-223 — Salir del cero que dejaron mis filtros sin adivinar qué deshacer

**Como** líder de área cuyos filtros dejaron el banco sin resultados,
**quiero** ver un solo aviso que me diga cuántos perfiles recupero quitando cada filtro, y quitarlo de un toque,
**para** salir del cero sin adivinar qué deshacer ni concluir que el banco no tiene nada para mi proyecto.

## Criterios de aceptación

### Happy path — el aviso dice qué filtro deja fuera a los perfiles

**Dado** que tengo marcados «Desarrollador móvil» en Rol y «Disponible ahora» en Disponibilidad, hay 6 perfiles móviles publicados y ninguno está disponible ahora,
**cuando** cargan los resultados,
**Entonces** veo un solo aviso: «Tus filtros dejan fuera los perfiles que sí tenemos»
**Y** cada filtro activo aparece con cuántos perfiles vería si lo quito: «Disponibilidad: Disponible ahora · quitarlo muestra 6» y «Rol: Desarrollador móvil · quitarlo muestra 0»
**Y** no veo tarjetas vacías ni ningún espacio que no sea un perfil

### Happy path — quitar el filtro que recupera perfiles

**Dado** que veo el aviso del cero con «Disponibilidad: Disponible ahora · quitarlo muestra 6»,
**cuando** toco «Quitar» en ese filtro,
**Entonces** veo los 6 perfiles móviles
**Y** el aviso desaparece y la etiqueta «Desarrollador móvil» sigue activa

### Error — el valor no existe hoy en el banco publicado

**Dado** que abrí un enlace compartido con el rol «Arquitecto SAP» y hoy ningún perfil publicado tiene ese rol,
**cuando** cargan los resultados,
**Entonces** el aviso dice que hoy no hay perfiles publicados con el rol «Arquitecto SAP»
**Y** me ofrece quitar ese filtro de un toque

### Edge case — ningún filtro por sí solo recupera perfiles

**Dado** que tengo tres filtros activos y quitar cualquiera de ellos por separado sigue dejando cero,
**cuando** cargan los resultados,
**Entonces** el aviso dice que ninguno de los filtros por sí solo recupera perfiles
**Y** me ofrece «Quitar todos los filtros», que me devuelve «Todo el banco» con sus 23 perfiles

### Edge case — el aviso nunca culpa al banco por algo que sí tiene

**Dado** que mis filtros dejan cero pero el banco tiene 23 perfiles publicados,
**cuando** leo el aviso,
**Entonces** el aviso no dice que el banco esté vacío ni que no tengamos perfiles
**Y** veo también la salida para hablar con Trycore sobre lo que necesito, con el contacto de Trycore vigente (HU-147)

## Notas

Cubre **RF-2.8** («Estado sin resultados con salida activa», §6.4: *el estado vacío vende*) en el caso del **cero causado por facetas**. Toma de **RF-13.8.2** la regla de **un solo aviso** con los criterios removibles en un toque y el único aviso por campo: *el valor elegido no existe en el banco*.

**Cómo se llega al cero.** Las opciones en 0 se pueden marcar (HU-219, RF-13.7.2); también se llega abriendo un enlace compartido cuando el inventario cambió desde que se copió (HU-221), o filtrando sobre una instrucción (HU-074).

**Decisiones elegidas por el modelo por delegación del sponsor:**
- El número de cada filtro es **cuántos perfiles vería quitando solo ese filtro**, con el mismo cálculo que los contadores de HU-219 (RF-13.8: un solo motor).
- **Salidas activas que construye EP-002:** quitar un filtro con su número, quitar todos y el contacto de Trycore vigente que administra el panel (HU-147, EP-006, construida), el mismo que muestra la ficha (HU-157). Ninguna termina en un callejón.

**Frontera con EP-010 — pregunta abierta para el sponsor (posible diferimiento; no la decide el modelo).** §6.4 describe como salida del cero «Este perfil no está en el banco hoy. En 10 días hábiles podemos tenerlo» más la **solicitud de perfil a medida**. Esa solicitud, con su SLA hacia HubSpot, es **HU-077 (EP-010, RF-14.3)**, que depende de EP-009. El precedente de HU-093 (decisión del PO del 2026-09-28) fue cablear la salida «pedir a medida» en la pantalla cuando se construya EP-010. Aplicado aquí, el cero por facetas no tendría la salida «a medida» entre el cierre de EP-002 y el de EP-010. Opciones: (a) seguir el precedente de HU-093: EP-010 añade la salida a esta pantalla y esta historia no cambia; (b) adelantar a EP-002 la parte de HU-077 que no depende del Perfil Objetivo. Los criterios de esta historia valen igual con (a) o con (b); con (b) se añadiría un escenario. No se promete el plazo de 10 días hábiles en esta pantalla mientras la solicitud a medida no exista: prometer lo que no se puede pedir contradice RF-10.7 y la regla de no prometer lo inexistente.

**El cero con instrucción y Perfil Objetivo** (lo más cercano, el Perfil Objetivo a la vista, «de dónde sale el cero») es de **EP-010** (HU-075, HU-076). Esta historia no lo presupone.

**Medición.** El evento «cero mostrado» que ADR-0006 lista entre los eventos de falsación se emite aquí contra el contrato de HU-167, con el origen «filtros», cuando EP-008 lo incorpore (HU-167 deja el contrato versionado para añadirlo).

## Trazabilidad

Épica madre: **EP-002** · PRD v4.18 · RF-2.8 · §6.4 · RF-13.8 · RF-13.8.2 · RF-13.7.2 · RF-14.3 (frontera, EP-010) · ADR-0006 (evento de falsación «cero mostrado») · depende de HU-219, HU-220 y HU-147 (EP-006, contacto de Trycore vigente) · relacionada con HU-221, HU-074, HU-077 y HU-075 (EP-010) y HU-093 (precedente)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se apoya en los filtros y etiquetas de HU-219 y HU-220 (misma épica) y en el contacto vigente de HU-147 (EP-006, ya construida); no espera a EP-009 ni a EP-010 |
| N | Negociable | ✓ fija un solo aviso, el número por filtro, el aviso por valor inexistente y que el aviso no culpe al banco; los textos y la forma son negociables; la salida «a medida» queda como pregunta abierta sin cambiar estos criterios |
| V | Valiosa | ✓ el cliente sale del cero en un toque y no concluye que no hay nada cuando sí hay algo |
| E | Estimable | ✓ S: un recálculo por filtro con el mismo motor de HU-219 y una pantalla de aviso |
| S | Pequeña | ✓ S: cinco escenarios de una sola pantalla |
| T | Testeable | ✓ un banco sembrado con 6 perfiles móviles no disponibles, un rol inexistente y tres filtros incompatibles dan avisos y números exactos |
