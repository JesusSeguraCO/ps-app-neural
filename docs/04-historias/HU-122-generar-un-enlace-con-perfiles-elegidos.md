---
id: HU-122
titulo: "Generar un enlace con exactamente los perfiles que elegí"
epica: EP-001
prioridad: alta
complejidad: S
estado: lista
fase: enlaces-curados
prd_version: 4.13
depende_de: [HU-123]
spec: docs/10-specs/enlaces-curados.md
---

# HU-122 — Generar un enlace con exactamente los perfiles que elegí

**Como** administradora del banco de talento,
**quiero** seleccionar perfiles de cualquier familia y generar un enlace para una cuenta,
**para** proponerle justo lo que pensamos para ella y no un catálogo que tenga que filtrar.

## Criterios de aceptación

### Happy path — selección heterogénea

**Dado** que entré al panel con mi correo inscrito como administradora de inventario
**Y** que seleccioné en el inventario un gerente, un desarrollador y un QA para una cuenta
**Y** que escribí la razón de la selección
**Y** que confirmé los correos invitados
**Cuando** genero el enlace
**Entonces** el enlace contiene exactamente esos tres perfiles
**Y** el enlace queda guardado como lista explícita de códigos de perfil, no como criterios de filtro
**Y** el campo de vigencia muestra 30 días por omisión y es editable
**Y** queda registrado con la cuenta, la razón, los correos invitados, quién lo generó y su vigencia

### Error — falta la razón de la selección

**Dado** que entré al panel como administradora de inventario
**Y** que elegí los perfiles y la cuenta pero no escribí la razón
**Cuando** intento generar el enlace
**Entonces** el sistema no emite el enlace
**Y** me explica que sin razón el cliente recibe un catálogo y no una curaduría

### Error — un perfil sin publicar

**Dado** que entré al panel como administradora de inventario
**Y** que uno de los perfiles seleccionados está en borrador
**Cuando** intento generar el enlace
**Entonces** el sistema me indica cuál perfil no está publicado
**Y** no emite el enlace

### Edge case — la cuenta tiene contacto en el CRM y sumo otro invitado

**Dado** que entré al panel como administradora de inventario
**Y** que la cuenta tiene un contacto en el CRM
**Cuando** preparo los correos invitados del enlace
**Entonces** el sistema me propone el correo del contacto
**Y** me deja añadir otro correo, como el del arquitecto de la cuenta

### Edge case — ningún correo invitado

**Dado** que entré al panel como administradora de inventario
**Y** que la cuenta no tiene contacto en el CRM y no añadí ningún correo invitado
**Cuando** intento generar el enlace
**Entonces** el sistema no emite el enlace
**Y** me indica que el enlace necesita al menos un correo invitado

## Notas

**Degradación si HubSpot no responde** (DoR de EP-001, 2026-09-28): si la lectura del contacto de la cuenta en HubSpot falla o excede su tiempo, la administradora escribe los invitados a mano y la generación del enlace no se bloquea (adaptador de solo lectura, timeout de ADR-0009). No cambia los criterios: es cómo se degrada «el sistema me propone el correo del contacto».

**Dividida el 2026-09-22.** La historia original tenía **seis escenarios** y dos happy paths con **actores distintos**: Talento Humano generando el enlace y el cliente abriéndolo. Cuando los happy paths cambian de actor, el corte natural está ahí. Lo que el cliente ve al abrir es ahora **HU-144**.

**La decisión de fondo:** el enlace lleva **la lista de códigos**, no filtros. Una selección heterogénea no se puede expresar con ningún filtro, y ese es el caso real de uso.

**Coordinación necesaria:** Talento Humano genera el enlace porque conoce la disponibilidad, pero la razón de la selección necesita el contexto del proyecto, que lo tiene el ejecutivo comercial. Sin ese insumo la razón se vuelve genérica y la curaduría deja de serlo.

**Ajustada el 2026-09-27** (corrección de discovery T-18, T-19): la precondición explicita el login del panel (**HU-123**, reasignada a EP-001 para que esta historia pueda construirse dentro de la caparazón) y el happy path fija la vigencia por omisión de **30 días** (T-5, ADR-0002). Los correos invitados son los únicos que podrán entrar con el enlace (D-4 revisada, acceso nominal); reenviarlo no da acceso.

**Ajuste de forma del 2026-09-27** (validación BDD): seleccionar, escribir la razón y confirmar los invitados pasan a ser el estado previo, y «generar» la única acción; el caso sin ningún correo invitado, que estaba mezclado con el del contacto del CRM, pasa a escenario propio. Sin cambio de alcance.

**Vigencia: fuente vigente.** La vigencia por omisión de 30 días, configurable, sigue RF-1.4 (PRD v4.13) y ADR-0002. El spec `docs/10-specs/enlaces-curados.md` (v4.4) todavía dice en su §5 que la vigencia queda «atada al ciclo del envío»: para la vigencia manda este criterio de aceptación hasta que el spec se actualice.

Cubre **RF-19.1**, **RF-19.3**, **RF-19.4**, **RF-19.5**, **RF-19.7**, **RF-1.2.7** y la vigencia de **RF-1.4**.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.13 · ADR-0002/0003 (UC-3) · depende de HU-123 · orden de construcción: HU-123 → HU-122 (sub-slices de EP-001 en ADR-0008: el login del panel antes de la generación del enlace) · habilita HU-144 · se relaciona con EP-011 (el correo es un vehículo para estos enlaces)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada (`depende_de: [HU-123]`): sin login del panel no hay quién genere ni registro de quién generó, así que se secuencia después de HU-123 dentro de EP-001 (cimiento antes que negocio); se construye y verifica con una sesión de panel sembrada |
| N | Negociable | ✓ fija el resultado (lista de perfiles, razón, invitados, vigencia, registro); la forma de la pantalla es negociable |
| V | Valiosa | ✓ es el mecanismo que hace existir la curaduría |
| E | Estimable | ✓ el objeto enlace y su registro están decididos (ADR-0002/0003); falta la cifra del equipo |
| S | Pequeña | ✓ tras la división |
| T | Testeable | ✓ cinco escenarios; cada impedimento (sin razón, sin invitado, perfil sin publicar) y el dato guardado (lista de códigos, vigencia, registro) son observables |
