---
id: HU-195
titulo: "Registrar la validación de Delivery de las composiciones de referencia"
epica: EP-008
prioridad: media
complejidad: S
estado: lista
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-151, HU-190]
---

# HU-195 — Registrar la validación de Delivery de las composiciones de referencia

**Como** coordinadora de Servicio (Delivery), inscrita en el panel con el rol observador y el permiso «Validar composiciones»,
**quiero** registrar en el panel que validé al menos tres composiciones de referencia contra proyectos que Trycore entregó, con la fecha de la validación,
**para** que la tercera condición del disparador de §14.5 conste con mi nombre y Mercadeo no tenga que preguntarme si ya se cumplió.

## Criterios de aceptación

### Happy path — registro la validación de tres composiciones

**Dado** que entré al panel con mi correo inscrito `coordinacion.servicio@trycore.com`, que tiene el permiso «Validar composiciones», y en el formulario de validación marqué tres composiciones de referencia, cada una con el proyecto entregado que la respalda, y la fecha 20 oct 2026,
**cuando** guardo la validación,
**Entonces** el panel muestra la validación como vigente, con la fecha 20 oct 2026, mi nombre y las tres composiciones con su proyecto
**Y** la validación queda en el registro de auditoría con quién la hizo y cuándo
**Y** la condición de Delivery de §14.5 queda registrada como «validada por Delivery», con esa fecha y mi nombre, que es lo que lee HU-185

### Error — quien no tiene el permiso «Validar composiciones»

**Esquema del escenario:** solo el permiso propio permite registrar
**Dado** que entré al panel como <persona>, sin el permiso «Validar composiciones»,
**cuando** envío una validación de composiciones por una dirección directa,
**Entonces** el panel no guarda nada
**Y** me explica que la validación la registra Coordinación de Servicio con el permiso «Validar composiciones», que concede un administrador del panel, en lugar de una pantalla vacía o un error genérico
**Y** el intento rechazado queda en el registro de auditoría

**Ejemplos:**

| persona |
|---|
| administradora de inventario con el permiso «Medición» |
| observador de Mercadeo con el permiso «Medición» |

### Edge case — la validación no llega a tres composiciones respaldadas

**Esquema del escenario:** sin tres composiciones respaldadas no hay validación
**Dado** que tengo el permiso «Validar composiciones» y en el formulario de validación marqué <composiciones>,
**cuando** guardo la validación,
**Entonces** el panel no la guarda y me dice que §14.5 pide al menos tres composiciones, cada una respaldada por un proyecto entregado
**Y** la condición de Delivery sigue como estaba antes

**Ejemplos:**

| composiciones |
|---|
| solo dos composiciones, cada una con su proyecto entregado |
| tres composiciones, una de ellas sin proyecto entregado |

### Edge case — renuevo una validación que ya existe

**Dado** que tengo el permiso «Validar composiciones» y ya hay una validación vigente del 20 oct 2026,
**cuando** guardo una validación nueva con fecha 15 ene 2027 y tres composiciones,
**Entonces** la nueva queda como vigente, con su fecha, mi nombre y sus composiciones
**Y** la del 20 oct 2026 sigue visible en el historial de validaciones, sin borrarse

## Notas

Cubre la **tercera condición del disparador de §14.5** (enmienda v4.18, D95): Delivery valida al menos 3 composiciones reales de proyectos entregados (D-19) y las sostiene actualizadas. Se apoya en **RF-14.7.1** (las composiciones se construyen sobre proyectos que Trycore entregó, no sobre lo que conviene vender) y en la lista nominal del panel (**RF-8.1.5**).

**Nace el 2026-10-02 por D94** (sponsor, tercera ronda). La validación de Delivery se registraba en HU-185, por un administrador con el permiso «Medición» que copiaba lo que Delivery le confirmaba (D74). D94: la registra **Coordinación de Servicio** directamente, con un permiso propio **«Validar composiciones»**, en una historia propia. **Partición, no recorte**: HU-185 queda con la lectura de Mercadeo y todo el registro (formulario, auditoría, negación) vive aquí.

**El permiso «Validar composiciones» da escritura sin el rol administrador.** Es una excepción explícita a la regla de HU-190 (el permiso da lectura, el rol da escritura), decidida por D94 porque quien sabe si una composición es real es Delivery, no Talento Humano. El permiso solo abre este registro: no abre Medición ni ninguna otra escritura del panel.

**Resuelto por el sponsor (2026-10-02, D99).** El permiso «Validar composiciones» se concede **por persona, como el permiso «Medición»** (HU-190): lo concede y lo quita **un administrador desde la lista de acceso**, independiente del rol, con auditoría y corte en la siguiente petición. Coordinación de Servicio entra a la lista nominal con el **rol observador** más este permiso. La mecánica de concesión es la de HU-190 (que lo anota en sus Notas); no hace falta una historia de concesión aparte.

**Propuestas del modelo, negociables (no son decisiones del sponsor):**
- El registro vive en una pantalla del panel «Validación de composiciones», que el permiso abre aunque la persona no tenga el permiso «Medición».
- Las composiciones se eligen de las composiciones de referencia del portal (RF-14.7, tres tipos de proyecto por D-19) y el proyecto entregado se escribe como texto libre interno, que nunca sale al portal.

**Lo que sigue abierto:** cada cuánto se revalida («las sostiene actualizadas», §14.5). El edge de renovar guarda el historial, pero no fija un vencimiento. Propuesta: lo decide Delivery con el sponsor.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.18 · §14.5 (enmienda v4.18, D95) · D-19 · RF-14.7.1 · RF-8.1.5 · D94, D95 y D99 (sponsor, 2026-10-02, tercera ronda) · sale de HU-185 (partición, no recorte) · depende de HU-151 (lista de acceso al panel) y HU-190 (permisos por persona; D99: misma mecánica de concesión) · la lee HU-185

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: la lista de acceso de HU-151 y el mecanismo de permisos por persona de HU-190; no necesita la lectura de HU-185 para probarse, que solo consume el registro |
| N | Negociable | ✓ son fijos quién registra (Coordinación de Servicio, rol observador con «Validar composiciones», D94), que el permiso se conceda por persona como «Medición» (D99), el mínimo de tres composiciones con su proyecto entregado, la auditoría y que nada se borre al renovar; la pantalla y cada cuánto se revalida se negocian |
| V | Valiosa | ✓ la tercera condición de §14.5 deja de depender de que alguien le pregunte a Delivery y queda con fecha y responsable |
| E | Estimable | ✓ S: un formulario con tres o más composiciones y su proyecto, una guarda de permiso, auditoría e historial |
| S | Pequeña | ✓ S: un registro en cuatro escenarios |
| T | Testeable | ✓ sesiones sembradas con y sin el permiso, validaciones de dos y de tres composiciones, una sin proyecto y una renovación dan registros, rechazos, mensajes y entradas de auditoría observables |
