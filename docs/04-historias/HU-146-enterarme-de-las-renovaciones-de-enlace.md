---
id: HU-146
titulo: "Enterarme de cada enlace nuevo que piden los clientes"
epica: EP-001
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
depende_de: [HU-123, HU-092]
---

# HU-146 — Enterarme de cada enlace nuevo que piden los clientes

**Como** administradora de inventario de Talento Humano,
**quiero** enterarme por correo y ver en el panel cada vez que alguien pide un enlace nuevo porque el suyo venció,
**para** saber qué cuentas volvieron a mirar la selección y revocar a tiempo el acceso de quien ya no debería tenerlo.

## Criterios de aceptación

### Happy path — un invitado pide un enlace nuevo

**Dado** que entré al panel con mi correo inscrito
**Y** que una persona invitada a un enlace vencido pidió un enlace nuevo, el sistema se lo envió a su buzón y avisó por correo a Talento Humano
**Cuando** abro la bandeja de renovaciones
**Entonces** veo esa petición con la cuenta, el proyecto, el correo de quien la pidió, cuándo la pidió y el enlace vencido
**Y** la veo marcada «Enlace nuevo enviado», con el código del enlace nuevo
**Y** el correo que recibió Talento Humano lleva esos mismos datos

### Error — quien pide no estaba invitado

**Dado** que entré al panel con mi correo inscrito
**Y** que alguien cuyo correo no está en la lista de invitados pidió un enlace nuevo desde un enlace vencido y el sistema avisó por correo a Talento Humano
**Cuando** abro la bandeja de renovaciones
**Entonces** veo esa petición marcada «No estaba invitado · no se envió enlace», con el correo que escribió
**Y** el correo que recibió Talento Humano dice que no estaba invitado y que no se le envió nada

### Error — el enlace nuevo no se pudo entregar

**Dado** que entré al panel con mi correo inscrito
**Y** que el correo con el enlace nuevo de una persona invitada no se pudo entregar
**Cuando** abro la bandeja de renovaciones
**Entonces** veo esa petición marcada «No se pudo enviar el enlace nuevo»

### Edge case — la misma persona pide otra vez durante la espera

**Dado** que entré al panel con mi correo inscrito
**Y** que una persona invitada pidió un enlace nuevo y volvió a pedirlo con el mismo correo mientras la ventana de espera seguía activa
**Cuando** abro la bandeja de renovaciones
**Entonces** veo una sola petición para ese enlace y ese correo
**Y** Talento Humano recibió un solo correo por ella

### Edge case — corto el acceso de quien pidió

**Dado** que entré al panel con mi correo inscrito como administradora de inventario
**Y** que en la bandeja hay una petición con «Enlace nuevo enviado»
**Cuando** revoco el enlace nuevo desde esa petición, con un motivo opcional
**Entonces** la petición muestra «Enlace revocado»
**Y** quien lo tenga abierto pierde el acceso en su siguiente petición
**Y** queda un registro en la auditoría del panel con quién revocó, cuándo, qué enlace y el motivo

## Notas

Cubre **RF-1.4** (el lado de Talento Humano). **Nace el 2026-09-29 por decisión del sponsor:** la renovación de un enlace vencido deja de consultar HubSpot para decidir (HU-092) y, a cambio, **toda** petición de enlace nuevo alerta a Talento Humano por correo y queda en una bandeja del panel. El razonamiento del sponsor: el enlace está asociado al correo del cliente; si esa persona ya no trabaja allí o la cuenta dejó de ser cliente, el enlace caducó y su petición de uno nuevo es la alerta.

**Dividida de HU-092 por actor**, como HU-145 de HU-095: HU-092 es lo que ve el cliente (pedir y recibir el enlace, con respuesta neutra); esta es lo que ve Talento Humano.

**También se avisa de quien no estaba invitado** (decisión del sponsor, 2026-09-29): el cliente recibe la misma respuesta neutra de HU-092 y no se le envía nada, pero Talento Humano se entera, porque suele ser un colega al que conviene invitar (HU-095) o un reenvío fuera de la empresa. Esto obliga a **guardar el correo que escribió quien pide, esté invitado o no**. Hasta ahora se guardaba solo su huella (HMAC), precisamente para no retener el correo de alguien que puede no estar invitado. Es un dato personal nuevo (Ley 1581): lo que diga la revisión de seguridad del Release Gate sobre su finalidad y su plazo de conservación queda abierto (abajo).

**Revocar reutiliza la revocación del panel** (tarea 4.4 del change, `POST /api/v1/enlaces/{codigo}/revocar`, auditada según ADR-0002/0003): la bandeja no abre una superficie nueva; la acción vive en la fila (validación INVEST del 2026-09-29).

**Canal:** el correo sale por el mismo canal de avisos a Talento Humano (`notificar`, ADR-0006/0009) hacia el buzón de Talento Humano; la bandeja lee las peticiones registradas, no una tabla nueva de avisos.

**Preguntas abiertas** (no bloquean los criterios):
- ¿Cuánto tiempo se conservan las peticiones de quien no estaba invitado? Propuesta: el mismo plazo de purga de los códigos de acceso (ADR-0002); se decide en la revisión de seguridad de la release.
- ¿Se quiere además un aviso al propietario comercial de la cuenta? Hoy no: la cuenta no está enlazada con HubSpot (ver E-6/E-7 del backlog de arquitectura).

## Trazabilidad

Épica madre: **EP-001** · PRD v4.13 · RF-1.4 · ADR-0002 (renovación y respuesta neutra) · ADR-0006/0009 (`notificar` a Talento Humano) · depende de HU-123 (login del panel) y HU-092 (la petición) · orden de construcción: HU-092 → HU-146

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se secuencia después del login del panel (HU-123) y de la petición (HU-092); revocar reutiliza la acción del panel ya construida (tarea 4.4); se verifica sola con una sesión de panel y peticiones sembradas |
| N | Negociable | ✓ fija qué se sabe y dónde (correo y bandeja con cuenta, correo de quien pide, cuándo y resultado); textos, columnas y orden son negociables |
| V | Valiosa | ✓ sin el aviso, quitar la consulta a HubSpot dejaría la renovación sin control humano; además da la señal comercial de qué cuentas volvieron |
| E | Estimable | ✓ la petición, la ventana de espera, el canal de avisos y la revocación auditada ya existen; faltan el correo guardado, el resultado de entrega y la pantalla |
| S | Pequeña | ✓ S: un actor (Talento Humano), una lista, un correo y una acción (revocar) que reutiliza la revocación ya construida del panel |
| T | Testeable | ✓ cada escenario deja un resultado observable en la bandeja y en el buzón de Talento Humano (doble de correo en CI) |
