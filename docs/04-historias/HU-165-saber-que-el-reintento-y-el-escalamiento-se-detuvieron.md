---
id: HU-165
titulo: "Saber que el registro en HubSpot dejó de correr"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-105]
---

# HU-165 — Saber que el registro en HubSpot dejó de correr

**Como** responsable técnico de la integración con HubSpot,
**quiero** enterarme cuando el trabajo que registra una solicitud en HubSpot se queda atascado en la cola, o cuando el worker deja de latir,
**para** saberlo antes de que una solicitud se quede solo en el portal sin que nadie lo sepa.

## Criterios de aceptación

### Happy path [portal] — un trabajo se queda atascado en la cola

**Dado** que una solicitud tiene su trabajo de HubSpot pendiente con la hora del intento ya vencida y el worker no lo ha tomado, según la tabla,
**cuando** la vigilancia revisa la cola,
**Entonces** el responsable técnico recibe o no un correo que nombra la solicitud y desde qué hora está atascada, según la tabla
**Y** el aviso no se repite en cada revisión mientras siga atascada

| Minutos con el intento vencido sin tomarse | Correo al responsable técnico |
|---|---|
| 10 | no |
| 11 | sí |

### Edge case [portal] — la bandeja lo dice

**Dado** que el worker lleva más de 10 minutos sin tomar trabajos de HubSpot vencidos,
**cuando** abro «Fallos con HubSpot» en el panel,
**Entonces** veo la franja «El registro en HubSpot no corre desde las HH:MM» y que ninguna solicitud se reintenta mientras siga así
**Y** el próximo intento de cada solicitud aparece «en espera, cuando el proceso vuelva», no con una hora que no se va a cumplir

### Error [portal] — el worker deja de latir y el correo tampoco sale

**Dado** que el worker está caído y con él la salida de correo,
**cuando** la comprobación de salud deja de ver una vuelta reciente del worker,
**Entonces** las alertas de DigitalOcean avisan al responsable técnico por su propio canal
**Y** el aviso llega aunque el portal no pueda enviar ningún correo

## Notas

Cubre **RF-9.6.2** («una cola que nadie procesa es otra forma de que la solicitud se quede solo en el portal»), con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02 (D55, D58; segunda ronda D75, D76).** **D58**: la historia **se construye dentro de EP-007** (queda resuelto E-14: no espera al bloque de operación de la release de producción) y el **monitor externo son las alertas de DigitalOcean App Platform**. Queda resuelta la pregunta del proveedor del monitor. **D55**: el escalamiento ya no corre en el portal, así que la tarea `escalar` sale de la vigilancia. Lo vigilado es el **trabajo `crear_negocio`** (atascado en cola; con **D76** ya no es un envío de formulario) y **el latido del worker**. La lectura diaria de HU-107 (D75) es una tarea programada más y entra en la misma vigilancia de tareas. Las demás tareas programadas (retención, colocados…) siguen en la misma vigilancia, con sus propias historias.

**Mecanismo propuesto (ADR-0009, enmienda):** el umbral de 10 minutos es el arrendamiento de un trabajo en curso (`locked_until`, 10 min): pasado ese tiempo, un trabajo vencido sin tomar ya no se explica por un intento en marcha. Es una propuesta técnica negociable; la tabla prueba los dos lados del límite. La revisión de la cola corre desde un componente web (la salud completa de ADR-0010), no desde el worker, para que el aviso salga aunque el worker esté parado y el correo siga vivo. El latido lo ve una comprobación de DigitalOcean sobre la salud, que responde 503 si `worker_ciclo` no avanza. **Por confirmar con Tecnología:** si con eso sobra `LATIDO_URL`.

**Pausa intencionada** (`WORKER_PAUSADO=1`, runbook de restauración de ADR-0010): el worker late pero no toma trabajos, así que el aviso de cola atascada salta. Se acepta: durante una restauración el aviso es correcto.

**Prototipo:** `integraciones-fallidas--proceso-detenido` (el texto pasa a «El registro en HubSpot no corre…»: **marcado para revisión de copy**).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.6.2 · §8.3 (Vigilancia) · D55, D58, D75, D76 (sponsor, 2026-10-02) · E-14 (resuelta por D58) · ADR-0009 (`vigilar`, `worker_ciclo`; enmiendas 2026-10-02 D52 y D76) · ADR-0010 (salud, alertas de App Platform) · depende de HU-105 · relacionada con HU-164

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: vigila la cola de HU-105; `worker_ciclo` y la salud completa ya existen |
| N | Negociable | ✓ fija que un trabajo atascado avisa una vez, que la bandeja lo dice y que el monitor está fuera del portal; el umbral de 10 min y el texto se negocian |
| V | Valiosa | ✓ una caída del worker deja de ser silenciosa y nadie descubre días después que nada llegó a HubSpot |
| E | Estimable | ✓ S: una consulta sobre la cola con aviso único, una franja en la bandeja y la configuración de una alerta de DigitalOcean sobre la salud. D58 cerró E-14 y el proveedor |
| S | Pequeña | ✓ S: una capacidad (detectar la cola parada) en tres escenarios |
| T | Testeable | ✓ con reloj simulado y trabajos vencidos hace 10 y 11 minutos, un doble de Mailgun y la salud respondiendo 503 se ven el correo, la franja y el disparo de la alerta (comprobado una vez en staging parando el worker) |
