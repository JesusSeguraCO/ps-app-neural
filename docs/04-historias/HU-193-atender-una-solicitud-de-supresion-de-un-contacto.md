---
id: HU-193
titulo: "Atender una solicitud de supresión de un contacto"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-169, HU-190]
---

# HU-193 — Atender una solicitud de supresión de un contacto

**Como** administradora del panel con el permiso «Medición», que atiende las solicitudes de habeas data que llegan por el canal del aviso de privacidad,
**quiero** registrar en el panel la supresión que pidió un contacto cliente y ver cuándo quedó aplicada a su rastro en el portal,
**para** cumplirle al titular lo que exige la Ley 1581 sin esperar a los plazos de retención y sin romper las cifras de los meses ya cerrados.

## Criterios de aceptación

### Happy path — registro la supresión de un contacto

**Dado** que entré al panel con el rol administrador y el permiso «Medición», y el contacto `compras@cliente-ficticio.co`, que tiene eventos registrados en el portal, pidió la supresión por el canal del aviso de privacidad,
**cuando** registro la supresión de ese correo en el panel,
**Entonces** la supresión aparece como «pendiente», con la fecha y quién la registró
**Y** lo guardado de la supresión identifica al contacto por su identificador interno, sin el correo
**Y** el alta queda en el registro de auditoría con quién la hizo y cuándo

### Happy path — la supresión se aplica en la siguiente corrida

**Dado** que hay una supresión pendiente de un contacto con eventos de 3 meses y eventos de 14 meses ya pasados a seudónimo,
**cuando** corre la tarea diaria de retención,
**Entonces** todos sus eventos, también los que ya estaban en seudónimo, quedan sin contacto ni seudónimo, de forma irreversible
**Y** los informes de esos meses conservan sus conteos, pero ya no dicen a qué contacto corresponden
**Y** la supresión aparece como «aplicada», con la fecha de la corrida

### Error — quien no puede registrar la supresión

**Dado** que entré al panel como observador con el permiso «Medición», o como administrador sin ese permiso,
**cuando** intento registrar una supresión, desde el control o con su dirección,
**Entonces** el panel no la registra
**Y** me explica que la supresión la registra un administrador con el permiso «Medición», en lugar de un error genérico

### Edge case — el correo no tiene rastro en el portal

**Dado** que entré al panel con el rol administrador y el permiso «Medición», y el correo que pidió la supresión no corresponde a ningún contacto con eventos,
**cuando** registro la supresión de ese correo,
**Entonces** el panel me dice que el portal no tiene rastro de ese correo y que no hay nada que suprimir en él
**Y** no queda ninguna supresión pendiente

### Edge case — lo que la supresión no alcanza

**Dado** que la supresión de un contacto aparece como «aplicada»,
**cuando** abro su detalle en el panel,
**Entonces** el panel dice que la supresión cubrió el rastro de ese contacto en el portal
**Y** dice que no alcanza su contacto en HubSpot ni su correo en la lista nominal del enlace de su cuenta, que se atienden aparte

## Notas

Cubre la **supresión a petición del titular** frente a la **Ley 1581 de 2012** (§8, *Privacidad y datos personales*; PII de clientes: correo corporativo, identidad del contacto y telemetría atribuida), complementaria a los plazos de retención de HU-169.

**Nace el 2026-10-02 por D89** (sponsor, segunda ronda): la supresión **se confirma** como historia propia de EP-008 y **sale de HU-169**. **Partición, no recorte**: las dos se construyen en EP-008. HU-169 conserva la retención (seudónimo a los 12 meses, borrado a los 24) y esta historia toma el control del panel y la anonimización a petición.

**Mecanismo (opción conservadora que ya estaba en HU-169, ahora confirmada por D89).** Al registrar la supresión, la siguiente corrida de la tarea diaria `retencion_eventos` (HU-169) **anonimiza** todos los eventos del contacto —sin `contacto_id` ni seudónimo, irreversible— y los conteos se conservan. Un dato anónimo ya no es dato personal (Ley 1581), así que la supresión se cumple sin borrar filas que sostienen meses cerrados. Para alcanzar los eventos ya seudonimizados, la tarea recalcula el seudónimo del contacto con la sal `EVENTOS_SEUDONIMO_SAL`, que solo recibe el proceso de trabajo diferido (H24). El correo se escribe en el control solo para buscar al contacto; el servidor lo traduce a `contacto_id` y **el correo no se guarda en la solicitud de supresión** (happy path).

**Quién la ejecuta.** Un **administrador del panel con el permiso «Medición»**. Es una escritura sobre la telemetría, el dato de Medición, y la regla de HU-190 es que **el permiso da lectura y el rol da escritura**: hacen falta los dos (error). El canal por el que el titular pide la supresión es el que declara el aviso de privacidad (HU-187); la historia empieza cuando la petición ya llegó.

**Lo que la supresión no alcanza (dicho en la pantalla, último edge).** El **contacto en HubSpot** (lo administra Mercadeo/RevOps en el CRM) y el **correo en la lista nominal** del enlace de su cuenta (EP-001), que sigue siendo necesario mientras la persona conserve el acceso. Si la supresión debe alcanzarlos lo decide el sponsor con Jurídico; mientras tanto el panel lo declara para que nadie dé la petición por atendida entera.

**Las consultas sin coincidencia** (`operacion.consultas_sin_coincidencia`) no llevan `contacto_id` y pasan por su propio enmascarado (ADR-0004, H43); no entran en esta supresión.

**Abierto:** el plazo legal de respuesta al titular y quién le confirma la supresión fuera del portal (propuesta: quien atiende el canal del aviso, con la fecha de «aplicada»).

## Trazabilidad

Épica madre: **EP-008** · PRD v4.18 · RF-7.3 · §8 Privacidad (Ley 1581) · ADR-0006 (CRN-10, QA-13, H24) · ADR-0004 (H43) · D74 y D89 (sponsor, 2026-10-02) · sale de HU-169 · depende de HU-169 (tarea `retencion_eventos`) y HU-190 (permiso «Medición») · relacionada con HU-187 (aviso de privacidad) y HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: la tarea de retención de HU-169 y el permiso de HU-190; no depende de HubSpot ni de la lista nominal, que declara fuera de alcance |
| N | Negociable | ✓ fija la anonimización irreversible que conserva conteos, quién la registra (rol administrador + permiso «Medición»), que el correo no se guarda y que el alcance se declara; la forma del control y del detalle es del equipo |
| V | Valiosa | ✓ el titular obtiene su supresión sin esperar a los 24 meses y Trycore la cumple sin romper los informes cerrados |
| E | Estimable | ✓ S: un control y un detalle en el panel, una tabla de supresiones, un paso más en la tarea diaria de HU-169 y la guarda de rol y permiso que ya existe |
| S | Pequeña | ✓ S: una capacidad (atender una supresión) en cinco escenarios |
| T | Testeable | ✓ eventos fijados de 3 y 14 meses de un contacto, una supresión registrada y una corrida de la tarea dan anonimización, conteos y estados observables; sesiones de observador y de administrador sin permiso y un correo sin rastro dan negaciones y mensajes observables |
