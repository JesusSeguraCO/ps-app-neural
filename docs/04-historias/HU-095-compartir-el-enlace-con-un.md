---
id: HU-095
titulo: "Pedir acceso para un colega"
epica: EP-001
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
depende_de: [HU-090]
---

# HU-095 — Pedir acceso para un colega

**Como** líder de área que quiere una segunda opinión de su arquitecto,
**quiero** pedir desde el portal que inviten a mi colega para que vea la misma selección que yo,
**para** decidir en equipo sin tener que explicarle todo por escrito.

## Criterios de aceptación

### Happy path — invitación aprobada

**Dado** que pedí desde el portal que invitaran a mi colega indicando su correo
**Y** que Talento Humano aprobó la petición
**Y** que mi colega tiene el enlace
**Cuando** mi colega completa el ingreso con su correo y el código que le llegó
**Entonces** mi colega ve la misma selección y el mismo contexto de cuenta que yo
**Y** el «Mi equipo» de mi colega empieza vacío
**Y** los perfiles guardados en mi «Mi equipo» no aparecen en el de mi colega

### Error — el colega abre el enlace sin estar invitado

**Dado** que le reenvié el enlace a mi colega sin pedir su invitación
**Cuando** mi colega pide el código con su correo en la puerta
**Entonces** mi colega ve el mensaje «Si tu correo está invitado, te llegó un código. Si no te llega, pídele a quien te compartió el enlace que solicite tu invitación»
**Y** no le llega ningún código
**Y** no ve ningún perfil

### Edge case — la petición sigue pendiente

**Dado** que pedí invitar a mi colega y Talento Humano aún no decide
**Cuando** vuelvo a entrar al portal
**Entonces** veo la petición con el correo de mi colega marcada como pendiente
**Y** mi colega sigue sin acceso hasta que se apruebe

### Edge case — Talento Humano rechaza la invitación

**Dado** que pedí invitar a una persona y Talento Humano rechazó la petición
**Cuando** vuelvo a entrar al portal
**Entonces** veo que la invitación no se aprobó y el contacto de Trycore a quien consultar
**Y** esa persona sigue sin acceso

## Notas

Cubre **RF-1.2.10** (el lado de quien pide), **RF-1.2.11** y, para el equipo del colega, **RF-4.1** según la resolución de T-1.

**Reescrita el 2026-09-25** tras la revisión de D-4 a acceso nominal: antes la historia era «Compartir el enlace con un colega» y dependía del reenvío libre dentro de la empresa, que ya no da acceso. La necesidad —la segunda opinión del arquitecto— se conserva por invitación aprobada.

**Ajustada el 2026-09-27 a T-1** (aprobado por el sponsor; backlog de arquitectura T-1, T-13, T-18): «Mi equipo» vive **en el servidor, por invitado**, ligado a su correo verificado y al enlace. Cada invitado ve solo el suyo, lo recupera en otro dispositivo y lo envía completo en su solicitud. Por eso el colega **no hereda** el equipo de quien lo invitó: comparte la selección curada y el contexto de la cuenta, no el borrador de otra persona. El Perfil Objetivo sigue guardándose por dispositivo (D-16), así que tampoco viaja entre invitados.

**Dividida por actor el 2026-09-27** (validación INVEST: la historia sumaba dos actores y dos superficies). Esta historia es el lado del cliente: pedir, ver la petición pendiente o rechazada y la entrada del colega aprobado. La pantalla del panel donde Talento Humano aprueba o rechaza —con el alta en la lista de invitados y el registro de auditoría— pasa a **HU-145**, con criterios propios. No se recorta nada: el alcance es el mismo, repartido en dos historias que se construyen una detrás de otra dentro de EP-001.

**Ajustada el 2026-09-28 (DoR de EP-001, decisión del PO: reformular sin recortar).** EP-001 garantiza que el colega entra con un «Mi equipo» propio, vacío y aislado del de quien lo invitó (verificado con equipos sembrados). Que el colega pueda sumar y quitar perfiles es comportamiento de «Mi equipo» y pasa a EP-004 (ver «Criterios recibidos de EP-001» en `docs/03-backlog/epicas.md`).

**Pruebas.** Se construye y verifica con sesiones sembradas y peticiones sembradas en estado pendiente, aprobada y rechazada, sin esperar a HU-145; la prueba integrada pedir → aprobar → entrar se hace al cerrar ambas.

**Pregunta abierta** (no bloquea los criterios; se resuelve con negocio): ¿cuánto tiempo puede quedar pendiente una petición antes de avisar a alguien más que a Talento Humano? Hoy el aviso es a Talento Humano (ADR-0006) y no hay plazo de escalamiento definido. La pregunta sobre si al rechazar se muestra el motivo vive en HU-145.

## Trazabilidad

> OpenSpec change: acceso-y-aterrizaje-curado

Épica madre: **EP-001** · PRD v4.13 · D-4 revisada · T-1 · ADR-0002 (UC-2) · ADR-0003/0004 (equipo por invitado) · depende de HU-090 · se completa con HU-145 (decisión en el panel) · orden de construcción: HU-090 → HU-095 → HU-145 (HU-145 necesita además HU-123)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: prerrequisito de DoR, HU-090 construida (sin la puerta nominal no hay cómo verificar al colega); se verifica sola con peticiones sembradas, sin esperar a HU-145 |
| N | Negociable | ✓ fija el resultado (sin aprobación no hay acceso; cada invitado con su propio equipo); textos y forma del aviso son negociables |
| V | Valiosa | ✓ conserva la segunda opinión del arquitecto sin convertir el enlace en una llave que abre a quien lo tenga |
| E | Estimable | ✓ el mecanismo está decidido (ADR-0002 UC-2: petición registrada, alta en la lista al aprobar); falta la cifra del equipo |
| S | Pequeña | ✓ S: un actor (el cliente) y una superficie (el portal), tras separar la decisión del panel en HU-145 |
| T | Testeable | ✓ pendiente, rechazada, aprobada y no invitado dan resultados observables; los dos equipos son independientes y comprobables |
