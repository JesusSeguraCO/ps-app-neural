---
id: HU-160
titulo: "Ver el requerimiento como propiedades del negocio"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-102]
---

# HU-160 — Ver el requerimiento como propiedades del negocio

**Como** ejecutivo comercial dueño de una cuenta,
**quiero** que el negocio traiga en propiedades propias los perfiles, roles, sector, fecha de inicio, duración, modalidad, campaña y correo de origen de la solicitud,
**para** filtrar, priorizar e informar mis negocios sin abrir cada uno ni copiar datos de un texto libre.

## Criterios de aceptación

### Happy path — solicitud completa

**Dado** que un cliente envió una solicitud con perfiles seleccionados, sector, momento de incorporación, duración y modalidad, desde un enlace de una edición curada,
**cuando** el portal crea el negocio,
**Entonces** el negocio muestra en propiedades separadas los códigos de los perfiles solicitados, los roles, el sector, la fecha de inicio deseada, la duración, la modalidad, la campaña y el correo de origen
**Y** cada valor es el que el cliente envió, sin reescribirlo

### Error — HubSpot rechaza el valor de una propiedad

**Dado** que una propiedad de opciones en HubSpot no admite el valor que trae la solicitud, por ejemplo una modalidad que no existe entre sus opciones,
**cuando** el portal intenta crear el negocio,
**Entonces** no se crea un negocio con esa propiedad vacía o cambiada
**Y** la solicitud queda en la bandeja de fallos con el nombre de la propiedad y el valor rechazado
**Y** el responsable técnico recibe el aviso inmediato

### Edge case — datos opcionales que el cliente no diligenció

**Dado** que un cliente envió una solicitud sin sector y desde un enlace que no viene de una edición curada,
**cuando** el portal crea el negocio,
**Entonces** el negocio se crea igual
**Y** las propiedades de sector y campaña quedan vacías, sin valores inventados como «N/A»
**Y** el resto de propiedades lleva su valor

## Notas

Cubre **RF-9.3**. Es también la base de **O4** (≥ 85 % de solicitudes con sector, fecha de inicio y duración): con propiedades vacías de verdad, el porcentaje se cuenta en HubSpot sin interpretar texto.

**Momento de incorporación → fecha de inicio deseada.** El formulario (RF-5.1) pregunta por bandas cerradas (inmediata, corto plazo, mediano plazo), no por una fecha. Pregunta abierta: ¿la propiedad guarda la banda tal cual o una fecha calculada? Supuesto conservador: la banda tal cual, sin inventar una fecha.

**Campaña y correo de origen.** Vienen de la atribución de la sesión (RF-7.3): la edición curada y el envío que originó la entrada (EP-011, HU-114). Un enlace generado a mano desde el panel (HU-122, EP-001) no tiene edición, así que la campaña queda vacía. Pregunta abierta: ¿«correo de origen» es el correo del destinatario del envío o el identificador de la edición? **Opción conservadora que usan los escenarios:** se escribe el valor que trae la atribución de la sesión tal cual, sin reescribirlo; ningún escenario depende de cuál de los dos sea.

**Nombres internos y tipos de las propiedades** (texto, opciones, fecha): no los fija el PRD; los crea Mercadeo como administrador de HubSpot con Dirección Comercial (§10.1). Pregunta abierta al sponsor (esquema de propiedades). **Opción conservadora que usan los escenarios:** el portal no crea ni cambia propiedades en HubSpot; usa los nombres que le den por configuración y, si una no existe o no admite el valor, la solicitud va a la bandeja (escenario de error). La lista de opciones de modalidad, sector y duración debe coincidir con los catálogos del panel; si no coincide, aparece el error del segundo escenario.

**Sin tarifas** (D-9) y sin datos de la lista negra B.4: las propiedades llevan códigos y nombre y primer apellido de los perfiles, nada más.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.3 · O4 · RF-5.1, RF-7.3 · D-9 · ADR-0009 (subpaso `negocio`) · depende de HU-102 · relacionada con HU-114 (EP-011) y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: escribe propiedades en el negocio de HU-102; sin EP-011 se prueba con atribución sembrada |
| N | Negociable | ✓ fija la lista de RF-9.3, que nada se inventa y que un rechazo no se disimula; nombres, tipos y si la fecha es banda o fecha se negocian |
| V | Valiosa | ✓ el comercial trabaja el negocio con datos filtrables y O4 se mide sin leer textos |
| E | Estimable | ✗ hasta que se cierre el esquema de propiedades (nombres internos, tipos, banda o fecha, forma del correo de origen): con las opciones conservadoras es M, un mapeo de ocho propiedades con dos casos de valor ausente y un error ya tipificado |
| S | Pequeña | ✓ M: una capacidad (escribir el requerimiento en el negocio) en tres escenarios |
| T | Testeable | ✓ solicitudes completa, sin sector ni edición, y con una modalidad fuera de las opciones dan propiedades y rechazos observables en un doble de HubSpot |
