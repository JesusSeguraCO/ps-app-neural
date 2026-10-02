---
id: HU-106
titulo: "Distinguir lo que entra por el portal de lo que entra por gestión"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-102]
---

# HU-106 — Distinguir lo que entra por el portal de lo que entra por gestión

**Como** directora de Mercadeo que mide el rendimiento de la línea,
**quiero** que todo negocio creado desde el portal lleve su origen marcado en HubSpot,
**para** comparar el portal contra los negocios que entran por gestión comercial en lugar de suponer que funciona.

## Criterios de aceptación

### Happy path — solicitud con perfiles del banco

**Dado** que un cliente envió una solicitud con perfiles seleccionados del banco,
**cuando** el portal crea el negocio,
**Entonces** el negocio lleva la propiedad de origen con el valor de solicitud desde el portal con perfiles
**Y** en HubSpot ese negocio se puede filtrar por origen y separar de los creados a mano

### Error — la propiedad de origen no existe en HubSpot

**Dado** que en HubSpot no existe la propiedad de origen o no admite el valor del portal,
**cuando** el portal intenta crear el negocio,
**Entonces** no se crea un negocio sin origen
**Y** la solicitud queda pendiente, en la bandeja de fallos, con el motivo «propiedad de origen no configurada»
**Y** el responsable técnico recibe el aviso inmediato

### Edge case — solicitud de perfil a medida desde el camino del cero

**Dado** que el cliente envió una solicitud de perfil a medida, sin perfiles seleccionados del banco,
**cuando** el portal crea el negocio,
**Entonces** el origen tiene el valor de solicitud desde el portal a medida, distinto del de solicitud con perfiles
**Y** los dos valores cuentan como origen portal al comparar contra la gestión comercial

## Notas

Cubre **RF-9.1.1**. Sin esta propiedad el pipeline propio (D-6) impide comparar el portal con los demás orígenes, que es el KPI «tasa de cierre de oportunidades originadas en el portal» de §11.

**Negocios creados a mano sin origen.** La versión anterior pedía que el informe los mostrara como «no especificado». Ese informe se arma en HubSpot y la regla depende de cómo lo configure Comercial: es configuración de HubSpot, no comportamiento del portal. Lo que sí garantiza el portal es que **ningún negocio suyo nace sin origen** (escenario de error).

**Valores de la propiedad: pregunta abierta al sponsor.** El PRD fija que existe la propiedad, no su nombre interno ni sus valores. Supuesto de los escenarios: dos valores del portal (con perfiles y a medida) frente a los de gestión comercial que defina Comercial.

**Solicitud a medida.** Nace en HU-077 (EP-010) y HU-100 (EP-005). Si esas historias no están construidas, el escenario se prueba con una solicitud a medida sembrada.

**Error permanente.** Un error de configuración no se arregla reintentando: va a la bandeja con aviso inmediato y se reintenta cuando alguien lo corrige (HU-166, HU-164).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.1.1 · D-6 · §11 (KPI de tasa de cierre por origen) · depende de HU-102 · relacionada con HU-077 (EP-010), HU-166 y HU-164

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: escribe una propiedad en el negocio de HU-102 |
| N | Negociable | ✓ fija que nada del portal nace sin origen y que con perfiles y a medida se distinguen; el nombre y los valores de la propiedad se negocian con Comercial |
| V | Valiosa | ✓ sin origen no hay forma de saber si el portal produce negocios que cierran |
| E | Estimable | ✓ S: una propiedad con dos valores y un error de configuración ya tipificado |
| S | Pequeña | ✓ S: tres escenarios sobre una sola propiedad |
| T | Testeable | ✓ solicitudes con perfiles y a medida, y un doble de HubSpot sin la propiedad, dan valores y rechazos observables |
