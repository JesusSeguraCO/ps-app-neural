---
id: HU-102
titulo: "Recibir la oportunidad en mi pipeline"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: []
---

# HU-102 — Recibir la oportunidad en mi pipeline

**Como** ejecutivo comercial dueño de una cuenta,
**quiero** que cada solicitud enviada desde el portal aparezca como un negocio en el pipeline de People Service de HubSpot,
**para** trabajarla donde trabajo todo lo demás y no en una bandeja aparte del portal.

## Criterios de aceptación

### Happy path — la solicitud se convierte en negocio

**Dado** que un cliente envió una solicitud desde el portal y la cuenta no tiene negocios abiertos en HubSpot,
**cuando** el portal la procesa,
**Entonces** en HubSpot existe un negocio en el pipeline People Service, en su etapa de entrada
**Y** el negocio lleva el identificador de la solicitud del portal (SOL-AAAA-NNNN)
**Y** la solicitud queda en el portal como «enviada a HubSpot» con el enlace a ese negocio

### Error — HubSpot no garantiza que el identificador de solicitud sea único

**Dado** que en HubSpot la propiedad del identificador de solicitud no existe o no está declarada de valor único,
**cuando** el portal intenta procesar una solicitud,
**Entonces** no se crea ningún negocio
**Y** el responsable técnico de la integración recibe un correo que nombra la propiedad que falta
**Y** la solicitud sigue guardada como pendiente y se envía cuando la propiedad quede bien configurada

### Edge case — la cuenta ya tiene un negocio abierto

**Dado** que la empresa de la solicitud tiene un negocio abierto en HubSpot,
**cuando** el portal procesa la solicitud,
**Entonces** se crea un negocio nuevo en el pipeline People Service
**Y** el negocio nuevo queda asociado como relacionado al abierto
**Y** el negocio abierto no cambia ninguna de sus propiedades

### Edge case — la cuenta solo tiene negocios cerrados

**Dado** que la empresa de la solicitud solo tiene negocios cerrados, ganados o perdidos, en HubSpot,
**cuando** el portal procesa la solicitud,
**Entonces** se crea un negocio nuevo en el pipeline People Service
**Y** no se asocia como relacionado a ninguno de los cerrados

## Notas

Cubre **RF-9.1** y la parte de **D-7** de **RF-9.2** (negocio nuevo relacionado, nunca actualizar el abierto, porque eso borraría la atribución de origen). Contacto y empresa sin duplicar: HU-104. Propiedades del requerimiento: HU-160. Origen: HU-106. Propietario y aviso: HU-103.

**Etapa de entrada y pronóstico (D-21).** El pipeline People Service usa las mismas etapas que el pipeline comercial vigente, con la etapa de entrada excluida del pronóstico. Crear y mantener el pipeline, sus etapas y esa exclusión es configuración de HubSpot a cargo de Dirección Comercial y Mercadeo (§10.1), no comportamiento del portal; por eso no es escenario. Si la etapa no existe, el error es de configuración y lo trata HU-166.

**El identificador único hace imposible el duplicado** (ADR-0009, R-21): un segundo intento de crear el mismo negocio choca en HubSpot y el portal reutiliza el existente (HU-105). Por eso, si la propiedad no es única, el portal prefiere no crear nada antes que arriesgar duplicados.

**«Abierto»** = negocio de la empresa que no está en una etapa cerrada (ganado o perdido). El PRD no dice si cuentan los negocios abiertos de otros pipelines o solo los de People Service: pregunta abierta al sponsor; los escenarios valen para cualquiera de las dos respuestas.

**Disparador.** El evento es la solicitud guardada por el portal (EP-005, RF-5; también la solicitud a medida de HU-077, EP-010). Esta historia no se puede demostrar de punta a punta sin la solicitud de EP-005.

**Pendiente de decisión (E-6 del backlog arquitectónico, sponsor 2026-09-28):** se planteó que la solicitud llegue a HubSpot por formulario más un workflow de HubSpot que «crea el lead». El PRD v4.17 sigue pidiendo un **negocio** con asociaciones, relacionado y propietario (RF-9), y ADR-0009 lo hace por la API. Esta historia sigue el PRD; si el sponsor confirma formulario más workflow, hay que reescribirla.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.1, RF-9.2 (D-7) · D-6, D-7, D-21 · ADR-0009 (subpaso `negocio`, `ps_solicitud_id`) · prototipo: sin pantalla (comportamiento de CRM)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita una solicitud guardada (EP-005); se prueba con una solicitud sembrada y un doble de HubSpot sin esperar a contacto, propiedades ni aviso |
| N | Negociable | ✓ fija el pipeline, la etapa de entrada, el identificador único y la regla de D-7; el mecanismo (API o formulario, E-6) y la forma del enlace en el portal se negocian |
| V | Valiosa | ✓ el comercial recibe la oportunidad en su herramienta, con la atribución intacta aunque la cuenta ya tenga un negocio |
| E | Estimable | ✓ M: crear un negocio, comprobar la propiedad única y relacionar con el abierto; el algoritmo está en ADR-0009 |
| S | Pequeña | ✓ M: una capacidad (convertir la solicitud en negocio) en cuatro escenarios |
| T | Testeable | ✓ contra un portal de pruebas de HubSpot o un doble: cuenta sin negocios, con uno abierto, solo con cerrados y con la propiedad mal configurada dan resultados observables en HubSpot y en el portal |
