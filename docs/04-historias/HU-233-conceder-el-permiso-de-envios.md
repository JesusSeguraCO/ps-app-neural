---
id: HU-233
titulo: "Conceder o quitar el permiso «Envíos»"
epica: EP-011
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: []
---

# HU-233 — Conceder o quitar el permiso «Envíos»

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** administradora de inventario que mantiene la lista nominal de acceso del panel,
**quiero** conceder o quitar a una persona inscrita el permiso «Envíos»,
**para** que Mercadeo prepare, genere y registre las ediciones curadas sin tener el rol que escribe el inventario.

## Criterios de aceptación

### Happy path — concedo el permiso a Mercadeo

**Dado** que entré al panel como administradora de inventario y `paula.giraldo@trycore.com` está inscrita con el rol observador y sin el permiso «Envíos»,
**cuando** le concedo el permiso «Envíos» en la lista de acceso,
**Entonces** la lista muestra ese correo con el rol observador y el permiso «Envíos»
**Y** en su siguiente petición al panel ve Envíos con las acciones para crear ediciones, armar la selección, generar enlaces y registrar la salida
**Y** la concesión queda en el registro de auditoría con quién la hizo, a quién y cuándo

### Edge case — quito el permiso a quien prepara una edición

**Dado** que entré al panel como administradora de inventario y una persona con el permiso «Envíos» tiene abierta la selección de una edición,
**cuando** le quito el permiso,
**Entonces** en su siguiente petición de escritura en Envíos el panel la rechaza y le explica que preparar ediciones exige el permiso «Envíos», que concede un administrador
**Y** su sesión sigue abierta y puede seguir consultando Envíos sin escribir
**Y** la retirada queda en auditoría

### Error — un observador sin permiso intenta escribir

**Dado** que entré al panel como observador sin el permiso «Envíos»,
**cuando** envío por una dirección directa la creación de una edición,
**Entonces** el panel la rechaza y me explica que preparar ediciones exige el permiso «Envíos» y quién lo concede, en lugar de un error genérico
**Y** no se crea ninguna edición

### Edge case — qué puede hacer cada quien en Envíos

**Dado** que una persona inscrita está en la situación de la tabla,
**cuando** abre Envíos,
**Entonces** ve en Envíos las ediciones, el seguimiento y las acciones de escritura que dice la tabla

| Rol | Permiso «Envíos» | En Envíos |
|---|---|---|
| administrador de inventario | indiferente | consulta y escribe |
| observador | sí | consulta y escribe |
| observador | no | consulta ediciones y seguimiento, sin acciones de escritura |

## Notas

**Nace el 2026-10-02 en la discovery de EP-011.** El PRD tiene dos frases que se cruzan: **P7 — Mercadeo** *«arma en el panel la selección curada por cuenta, genera el enlace de cada destinatario y el bloque de contenido»* (RF-18, EP-011), y **RF-8.1.2** da a Mercadeo el rol **observador**, que *«no escribe nada»*. Sin resolverlo, la épica no se puede usar como está escrita.

**Elegida por el modelo por delegación del sponsor (2026-10-02):** se aplica el mismo patrón que el sponsor ya eligió dos veces —el permiso **«Medición»** (D74, HU-190) y **«Validar composiciones»** (D99, HU-195)—: un **permiso por persona en la lista nominal, independiente del rol**, que abre la escritura en **Envíos** y nada más. Alternativas descartadas: dar a Mercadeo el rol de administrador de inventario (le abriría escribir el inventario, contra RF-8.1.2) o que solo Talento Humano prepare las ediciones (contradice P7 y la épica). **Pasa a `lista` (2026-10-02, D129).** La revisión INVEST externa la dejó en `draft` solo porque contradecía el texto vigente de **RF-8.1.2** («el observador no escribe nada»). **D129** (elegida por el modelo por delegación del sponsor) enmienda RF-8.1.2 en el PRD v4.18: el observador no escribe salvo con un permiso explícito por persona, como «Medición» (D74) y «Validar composiciones» (D99). Revisión estricta posterior: INVEST 6/6, cuatro escenarios G/W/T con un solo When cada uno (happy, error y dos edge), frontmatter completo.

**Observadores.** RF-8.1.2 deja que el observador consulte enlaces; por coherencia consulta Envíos y su seguimiento sin escribir. El seguimiento (HU-116) no es Medición: no exige el permiso «Medición».

**Se construye junto con HU-229** en el mismo tramo: el permiso abre las acciones que HU-229 a HU-232 describen. Mismo mecanismo de comprobación en servidor que el permiso «Medición» (ADR-0006, enmienda D74): la regla es de la aplicación del panel, no un rol nuevo de PostgreSQL.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · P7 (§5.2) · RF-8.1.2 · RF-8.1.5 · RF-18 · D74 y D99 (sponsor, 2026-10-02, patrón) · **D129** (enmienda de RF-8.1.2, 2026-10-02) · ADR-0006 (enmienda D74) · convención del proyecto «ninguna pantalla queda muda ante un rechazo» · relacionada con HU-190 y HU-195 · la usan HU-229, HU-113, HU-114, HU-230, HU-231 y HU-232

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ la lista nominal y su auditoría ya existen (EP-006, HU-151); se construye en el mismo tramo que HU-229, que provee las acciones que el permiso abre |
| N | Negociable | ✓ fija un permiso por persona, independiente del rol, que solo abre escribir en Envíos, con auditoría y rechazo explicado; el nombre y su ubicación en la lista son negociables |
| V | Valiosa | ✓ sin él Mercadeo, dueña del canal, no puede preparar las ediciones, o habría que darle permisos sobre el inventario |
| E | Estimable | ✓ S: una columna en la lista de acceso, la comprobación en las rutas de Envíos y la auditoría, calcado de HU-190 |
| S | Pequeña | ✓ S: una capacidad (el permiso) en cuatro escenarios |
| T | Testeable | ✓ sesiones de administrador y de observador con y sin el permiso, una retirada con la selección abierta y un POST directo sin permiso dan accesos, rechazos y auditoría observables |
