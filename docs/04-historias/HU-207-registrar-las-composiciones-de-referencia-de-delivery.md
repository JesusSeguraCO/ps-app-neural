---
id: HU-207
titulo: "Registrar las composiciones de referencia que entrega Delivery"
epica: EP-008
prioridad: media
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-151, HU-195]
---

# HU-207 — Registrar las composiciones de referencia que entrega Delivery

**Como** coordinadora de Servicio con el permiso «Validar composiciones» en el panel,
**quiero** registrar la composición real de cada uno de los tres tipos de proyecto que más entrega Trycore, con los roles que suele requerir y de cuántos proyectos entregados sale,
**para** que el portal muestre a los clientes la forma típica de su trabajo solo con datos que Delivery sostiene, y calle cuando no los hay.

## Criterios de aceptación

### Happy path — registrar una composición

**Dado** que tengo el permiso «Validar composiciones», estoy en el destino «Composiciones» del panel y no hay composiciones registradas
**Cuando** guardo el tipo de proyecto «Tipo A (ficticio)» con los roles Backend, Frontend, QA de automatización y Arquitectura de software, elegidos del catálogo de roles, y 4 proyectos entregados de origen
**Entonces** el panel muestra la composición registrada con sus 4 roles, «Sale de 4 proyectos entregados», mi nombre y la fecha
**Y** queda en la auditoría del panel con quién la registró y cuándo

### Error — composición sin proyectos entregados

**Dado** que tengo el permiso «Validar composiciones»
**Cuando** intento guardar una composición con 0 proyectos entregados de origen
**Entonces** el panel no la guarda y me dice que una composición de referencia tiene que salir de al menos un proyecto entregado
**Y** el portal no muestra ninguna composición para ese tipo

### Error — sin el permiso

**Dado** que entré al panel con el rol observador y sin el permiso «Validar composiciones»
**Cuando** abro directamente la dirección del destino «Composiciones»
**Entonces** el panel me dice que no tengo permiso para registrar composiciones
**Y** no veo el formulario ni puedo guardar, y el menú no me muestra el destino «Composiciones» (D106)

### Edge case — un cuarto tipo de proyecto

**Dado** que ya hay 3 tipos de proyecto con composición registrada
**Cuando** intento registrar un cuarto tipo
**Entonces** el panel no lo guarda y me dice que el alcance son los tres tipos de proyecto más frecuentes
**Y** las 3 composiciones registradas no cambian

### Edge case — corregir una composición

**Dado** que el «Tipo A (ficticio)» tiene registrados 4 roles
**Cuando** guardo la composición con un quinto rol, DevOps
**Entonces** el panel muestra los 5 roles con la fecha de la corrección
**Y** la auditoría conserva la versión anterior de 4 roles

## Notas

**Nace en este discovery (2026-10-02) porque no había historia que cargara el dato.** HU-084 muestra la composición de referencia (RF-14.7) y HU-195 registra que Delivery la validó para el disparador de §14.5; ninguna dice **cómo entra la composición al sistema**. Sin esta historia, HU-084 no tiene dato y siempre calla. **No es ampliación**: es la condición para construir HU-084 entera.

**D109 (sponsor, 2026-10-02) cierra P7: épica EP-008**, junto a HU-195, en el destino propio **«Composiciones»** del menú del panel (D106), visible solo con el permiso «Validar composiciones». Registrar la composición y validarla viven en la misma pantalla y con la misma persona.

Se apoya en **RF-14.7.0** (solo los tres tipos más frecuentes, D-19), **RF-14.7.1** (regla dura: composiciones de proyectos que Trycore entregó; si el dato no existe, no se muestra) y en el permiso por persona «Validar composiciones» de **D94 y D99** (lo concede un administrador en la lista nominal, HU-151/HU-190).

**Opción conservadora aplicada:** quien registra es quien valida (Coordinación de Servicio con el permiso de D94), porque quien sabe si una composición es real es Delivery (razón de D94). Los roles salen del catálogo de roles del panel, no de texto libre, para que HU-084 y HU-080 puedan compararlos con los roles del equipo. El nombre del tipo de proyecto y el detalle de los proyectos de origen son internos y **nunca salen al portal**; al portal solo llegan el tipo, los roles y el número de proyectos.

**Lo que sigue abierto (de HU-195):** cada cuánto se revalida una composición. No lo fija esta historia.

## Trazabilidad

Épica madre: **EP-008** (D109) · PRD v4.18 · RF-14.7.0 · RF-14.7.1 · D-19 · D94 · D99 · D106 · D109 · depende de HU-151 (lista nominal del panel) y HU-195 (permiso «Validar composiciones» y destino «Composiciones», misma épica) · habilita HU-084 (EP-009) y alimenta la tercera condición de §14.5 (HU-185)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: la lista nominal del panel ya existe (EP-006); el permiso «Validar composiciones» y el destino los crea HU-195, de la misma épica (D109), así que se secuencia detrás de ella dentro de EP-008 |
| N | Negociable | ✓ son fijos los tres tipos, el origen en proyectos entregados, los roles del catálogo y la auditoría; la forma del formulario y quién más puede registrar son negociables |
| V | Valiosa | ✓ sin ella HU-084 nunca tiene dato; con ella la forma del trabajo que ve el cliente es real o no existe |
| E | Estimable | ✓ M: una tabla nueva con su migración, una pantalla del panel con guarda de permiso, validaciones de tope y origen, auditoría y la lectura del portal |
| S | Pequeña | ✓ M: un registro con sus reglas en cinco escenarios |
| T | Testeable | ✓ e2e del panel con una persona sembrada con y sin el permiso: destino oculto sin permiso, alta, 0 proyectos rechazado, cuarto tipo rechazado, corrección auditada y lectura en BD de lo que el portal recibe |
