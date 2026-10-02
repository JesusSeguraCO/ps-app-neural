---
id: HU-164
titulo: "Resolver desde el panel las solicitudes que HubSpot no confirmó"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-105]
---

# HU-164 — Resolver desde el panel las solicitudes que HubSpot no confirmó

**Como** administradora del panel de Talento Humano,
**quiero** ver en la bandeja de fallos las solicitudes que HubSpot no ha confirmado tras tres intentos, reintentarlas o enlazarlas al negocio que alguien creó a mano,
**para** saber en todo momento qué solicitudes no están en el CRM y sacarlas de ahí sin pedirle nada a Tecnología.

## Criterios de aceptación

### Happy path — ver qué está atascado y por qué

**Dado** que hay solicitudes con tres o más intentos fallidos,
**cuando** abro «Fallos con HubSpot» en el panel,
**Entonces** veo cada una con su código, cuenta, quién solicita, perfiles, el último error de HubSpot, cada intento con su hora y resultado, y la hora del próximo intento
**Y** veo cuántas hay en reintento inicial con uno o dos fallos, sin aviso
**Y** veo las que salieron de la bandeja en los últimos 7 días y cómo salieron

### Happy path — enlazar un negocio creado a mano

**Dado** que una solicitud de la bandeja ya tiene un negocio que alguien creó a mano en HubSpot,
**cuando** escribo el ID de ese negocio en «Ya lo creé en HubSpot…» y confirmo,
**Entonces** la solicitud queda enlazada a ese negocio y sale de la bandeja
**Y** su reintento se detiene sin crear otro negocio
**Y** queda registrado quién la enlazó y cuándo

### Error — el ID no existe en HubSpot

**Dado** que una solicitud está en la bandeja,
**cuando** escribo un ID de negocio que no existe en HubSpot y confirmo,
**Entonces** el panel no la enlaza y me dice que ese negocio no existe
**Y** la solicitud sigue en la bandeja con su reintento programado

### Edge case — reintentar ahora

**Dado** que una solicitud de la bandeja tiene su próximo intento dentro de 40 minutos y ya se corrigió la causa en HubSpot,
**cuando** toco «Reintentar ahora»,
**Entonces** el intento se hace en el minuto siguiente, sin esperar al programado
**Y** si HubSpot confirma, la solicitud sale de la bandeja como «HubSpot confirmó en el intento N»

## Notas

Cubre la **bandeja de fallos** que RF-9.6 pide como «alerta al responsable» y que ADR-0009 hace visible en el panel (decisión CRN-4: reintento sin fin más bandeja). Es la mitad visible de HU-105.

**Prototipo aprobado:** `integraciones-fallidas`, `--marcar-creado`, `--vacia` (Operación › Fallos, con contador en el menú). El destino «Fallos» ya está reservado en el menú del panel.

**Enlazar a mano** también sirve de salida para una solicitud que choca con un error permanente que nadie va a corregir pronto: alguien crea el negocio en HubSpot y lo enlaza. Al enlazar, el portal no reescribe ese negocio. **Pregunta abierta:** ¿el portal completa en el negocio enlazado lo que falte (propiedades, nota, origen) o lo deja como está? Supuesto de los escenarios: lo deja como está y solo detiene el reintento, porque reescribir un registro hecho a mano puede pisar datos.

**Quién actúa en la bandeja: pregunta abierta.** El prototipo la muestra a Talento Humano (administradora del panel) y el aviso técnico va a Tecnología. Falta decidir si el rol observador (Mercadeo, Comercial) la ve, y si puede enlazar o reintentar. Supuesto: solo el rol administrador actúa, como en el resto del panel (ADR-0002).

**Reintento detenido** (el proceso de trabajo diferido no corre): la franja de aviso de la bandeja es HU-165.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.6 · ADR-0009 (CRN-4, bandeja de fallos, permisos de `ps_panel` sobre `trabajos` y `trabajos_pasos`) · prototipo `integraciones-fallidas` · depende de HU-105 · relacionada con HU-165 y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: muestra y actúa sobre los fallos que produce HU-105 |
| N | Negociable | ✓ fija qué se ve, el enlace a mano con verificación del ID y el reintento inmediato; la disposición de la pantalla sigue al prototipo y se negocia |
| V | Valiosa | ✓ ninguna solicitud atascada es invisible y Talento Humano la saca sin pedir ayuda |
| E | Estimable | ✓ M: una pantalla del panel con dos acciones y una lectura de HubSpot para verificar el ID |
| S | Pequeña | ✓ M: una capacidad (resolver lo atascado) en cuatro escenarios |
| T | Testeable | ✓ con solicitudes sembradas en distintos estados y un doble de HubSpot con IDs existentes e inexistentes se observan la bandeja, los enlaces y los reintentos |
