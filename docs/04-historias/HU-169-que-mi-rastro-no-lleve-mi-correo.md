---
id: HU-169
titulo: "Que mi rastro en el portal no lleve mi correo y caduque"
epica: EP-008
prioridad: alta
complejidad: M
estado: lista
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-167]
---

# HU-169 — Que mi rastro en el portal no lleve mi correo y caduque

**Como** contacto de una cuenta cliente que entra al portal con su correo invitado,
**quiero** que lo que hago en el portal se guarde sin mi correo, se desligue de mí al año y se borre a los dos años,
**para** confiar en que Trycore mide el interés de mi empresa sin acumular para siempre un expediente de lo que miré.

## Criterios de aceptación

### Happy path — lo registrado no lleva mis datos de contacto

**Dado** que navegué el portal y abrí fichas,
**cuando** se revisa lo que quedó registrado de mi visita,
**Entonces** cada evento me identifica solo con un identificador interno, nunca con mi correo ni con mi teléfono
**Y** la copia semanal de la base que sale a Google Drive de Trycore no incluye los eventos

### Error — el navegador manda lo que no debe guardarse

**Dado** que llega un lote con un campo que el contrato no admite —un token, un correo, una cuenta— junto a eventos válidos,
**cuando** el servidor lo recibe,
**Entonces** ese campo se descarta, los eventos válidos se guardan
**Y** el registro técnico solo cuenta lo recibido y lo descartado, sin el contenido del lote, el token ni la dirección IP

### Edge case — el rastro caduca con el tiempo

**Dado** que tengo eventos con la antigüedad de la tabla,
**cuando** corre la tarea diaria de retención,
**Entonces** esos eventos y los informes de ese período quedan como dice la tabla

| Antigüedad de los eventos | Qué pasa con los eventos | Qué muestra un informe de ese período |
|---|---|---|
| 11 meses | siguen ligados a mi identificador interno | los conteos y a qué contacto corresponden |
| 13 meses | pasan a un seudónimo y dejan de estar ligados a mi identificador | los conteos, sin decir a qué contacto corresponden |
| 25 meses | se eliminan | que el período está fuera del plazo de retención, en lugar de ceros |

### Error — la tarea de retención deja de correr

**Dado** que la tarea de retención lleva más del doble de su intervalo sin ejecutarse,
**cuando** la vigilancia del proceso de trabajo diferido hace su revisión,
**Entonces** avisa al responsable técnico de que la retención no se está cumpliendo

## Notas

Cubre la parte de **privacidad de RF-7** frente a la **Ley 1581 de 2012** (§8, *Privacidad y datos personales*; PII de clientes: correo corporativo, identidad del contacto y telemetría atribuida). Es la condición para que la atribución por contacto de RF-7.3 sea defendible.

**Lo que ya está decidido y esta historia solo vuelve verificable:** retención de **24 meses con seudónimo a los 12** (sponsor, 2026-09-25, T-6 / CRN-10); eventos con `contacto_id` y **ninguna columna de correo**; registros técnicos sin cuerpos (ADR-0006, H40, V6-4); datos de `telemetria.eventos` **fuera del volcado semanal** (H13, ADR-0010); seudónimo con la sal `EVENTOS_SEUDONIMO_SAL`, que solo recibe el proceso de trabajo diferido (H24); borrado por partición (`DETACH` + `DROP`) con `mantener_eventos(sal)` desde la tarea `retencion_eventos`, vigilada como las demás (QA-13, V6-1).

**El texto de las consultas sin coincidencia** no vive en los eventos sino en `operacion.consultas_sin_coincidencia` (ADR-0004, H43), con su propio enmascarado de correos, teléfonos y nombres del inventario y la misma retención. Su exposición en Medición la cubre HU-172.

**Resuelto por el sponsor (D65, 2026-10-02): solo aviso de privacidad, sin casilla.** El contacto no autoriza la telemetría atribuida con una casilla: basta informarla en el **aviso de privacidad** enlazado en la puerta de acceso. Ver el aviso es una capacidad propia del cliente en la puerta y vive en **HU-187** (EP-008), que también dice qué plazos de esta historia debe declarar el aviso.

**La supresión sale a HU-193 (D89, sponsor, 2026-10-02).** La supresión a petición del titular antes de los 24 meses —el control del panel y la anonimización de sus eventos— es ahora **HU-193** «Atender una solicitud de supresión de un contacto» (EP-008). **Partición, no recorte**: las dos se construyen en EP-008. Esta historia queda con la retención (seudónimo a los 12 meses, borrado a los 24), la ausencia de correo en los eventos y el aviso si la tarea de retención se detiene. HU-193 reutiliza la tarea diaria `retencion_eventos` de esta historia.

**Revisión 2026-10-02.** Los dos edges de 12 y 24 meses se unieron en uno con tabla de ejemplos (11, 13 y 25 meses: a los dos lados de cada plazo) para dar cabida a la supresión; tras D89 la supresión salió a HU-193 y la tabla se conserva. Ningún caso se pierde: la historia queda en cuatro escenarios.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.3 · §8 Privacidad (Ley 1581) · §8.3 Respaldo · ADR-0006 (CRN-10, QA-5, QA-13, H13, H24, H40) · T-6 · D65 y D89 (sponsor, 2026-10-02) · relacionada con HU-187 (aviso de privacidad) y HU-193 (supresión, sale de esta historia por D89) · depende de HU-167

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: actúa sobre la tabla de HU-167; no depende de ninguna pantalla ni épica futura |
| N | Negociable | ✓ fija plazos (decididos por el sponsor), ausencia de correo y registros sin contenido; la forma del seudónimo y del aviso técnico es del equipo; la supresión se negocia en HU-193 |
| V | Valiosa | ✓ el contacto cliente tiene una garantía concreta sobre sus datos y Trycore cumple la temporalidad que exige la Ley 1581 |
| E | Estimable | ✓ M: validación del lote, tarea diaria con seudonimización y borrado por partición, exclusión del volcado y su vigilancia, todo diseñado en ADR-0006; la incertidumbre de la supresión salió con HU-193 |
| S | Pequeña | ✓ M: una capacidad (proteger y caducar el rastro) en cuatro escenarios, uno con tabla; la supresión a petición ya es su propia historia (HU-193) |
| T | Testeable | ✓ reloj simulado con eventos de 11, 13 y 25 meses, un lote con campos prohibidos, la salida del volcado y la tarea detenida dan resultados observables |
