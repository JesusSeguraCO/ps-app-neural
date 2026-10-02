---
id: HU-190
titulo: "Conceder o quitar el permiso de Medición a una persona del panel"
epica: EP-008
prioridad: alta
complejidad: S
estado: lista
fase: telemetria-y-medicion
prd_version: 4.18
depende_de: [HU-151]
---

# HU-190 — Conceder o quitar el permiso de Medición a una persona del panel

**Como** administradora de inventario de Talento Humano, que mantiene la lista de acceso al panel,
**quiero** conceder o quitar a cada persona inscrita el permiso «Medición», sin cambiar su rol,
**para** que el tablero y las lecturas de Medición los vea quien responde por ellos, y solo esa persona, aunque comparta rol con quien no debe verlos.

## Criterios de aceptación

### Happy path — concedo el permiso a una persona inscrita

**Dado** que entré al panel como administradora de inventario y `analista.mercadeo@trycore.com` está inscrito con el rol observador y sin el permiso «Medición»,
**cuando** le concedo el permiso «Medición» en la lista de acceso,
**Entonces** la lista muestra ese correo con el rol observador y el permiso «Medición»
**Y** en su siguiente petición al panel el destino Medición del menú aparece habilitado para esa persona
**Y** la concesión queda en el registro de auditoría con quién la hizo, a quién y cuándo

### Happy path — quito el permiso a quien tiene Medición abierta

**Dado** que entré al panel como administradora de inventario y una persona con el permiso «Medición» tiene abierto el tablero de Medición,
**cuando** le quito el permiso,
**Entonces** en su siguiente petición a Medición no recibe ninguna cifra y el panel le explica que Medición la consultan las personas con el permiso «Medición» y que lo concede un administrador
**Y** su sesión sigue abierta para el resto del panel, con el mismo rol
**Y** la retirada queda en el registro de auditoría con quién la hizo, a quién y cuándo

### Error — quien no es administrador intenta conceder el permiso

**Dado** que entré al panel como observador con el permiso «Medición»,
**cuando** envío por una dirección directa la concesión del permiso «Medición» a otro correo,
**Entonces** el panel la rechaza y me explica que solo un administrador cambia los permisos de la lista de acceso
**Y** la lista de acceso queda igual
**Y** el intento queda en el registro de auditoría

### Edge case — el permiso no depende del rol

**Dado** que una persona inscrita está en la situación de la tabla,
**cuando** abre Medición,
**Entonces** el resultado es el que dice la tabla

| Rol | Permiso «Medición» | Al abrir Medición |
|---|---|---|
| administrador de inventario | no | no ve cifras; el panel le explica cómo se obtiene el permiso |
| observador | sí | ve el tablero y las lecturas de Medición, sin poder escribir nada |
| administrador de inventario que pasa a observador | sí, antes del cambio | conserva el permiso y sigue viendo Medición |

### Edge case — inscribir un correo nuevo no da el permiso

**Dado** que entré al panel como administradora de inventario y el correo `direccion.general@trycore.com` no está inscrito,
**cuando** lo inscribo con el rol observador sin marcar el permiso «Medición»,
**Entonces** el correo aparece en la lista sin el permiso «Medición»
**Y** al entrar al panel ve el destino Medición deshabilitado, con la explicación de cómo se obtiene el permiso

## Notas

Cubre la enmienda **v4.18 de RF-8.1.2** (permiso «Medición» por persona) sobre la lista nominal de **RF-8.1.5**, y la **enmienda 2026-10-02 (D74) de ADR-0006**, que deja de dar los informes de telemetría al «rol observador o superior».

**Nace el 2026-10-02 por D74** (sponsor, segunda ronda), que **corrige D67**. D67 decía *quién* ve Medición por área (administradores, Mercadeo, Comercial y Dirección General; Talento Humano y la observadora no), y con los dos roles del panel no se podía expresar: Talento Humano **es** administrador y Mercadeo y Comercial **son** observadores (riesgo que dejó escrito HU-171). D74 lo resuelve con un **permiso «Medición» por persona en la lista nominal, independiente del rol**: el rol sigue diciendo qué puede escribir (RF-8.1.2), y el permiso, si ve Medición.

**Toca la administración de usuarios de HU-151, ya construida en EP-006.** EP-006 **sigue cerrada**: este cambio se construye dentro de EP-008, sobre la lista de acceso, la guarda del rol y la auditoría que dejó HU-151. Se añade un campo a la inscripción, un control en la lista y la comprobación del permiso en las rutas de Medición; no cambian los criterios de HU-151.

**Qué guarda el permiso.** Todo el destino Medición: el tablero (HU-171) y las lecturas de HU-108 a HU-112, HU-167, HU-170, HU-172 a HU-173 y HU-184 a HU-186. La negación con explicación la prueba HU-171 una vez; aquí se prueba cómo se concede y se quita. **Escribir dentro de Medición** (encender el A/B de HU-186) exige además el rol administrador: el permiso da lectura, el rol da escritura.

**Corte en la siguiente petición**, como D17 para los cambios de rol (RF-8.1.6): no se espera a que caduque la jornada. A diferencia de la baja, quitar el permiso no corta la sesión entera, solo Medición.

**Propuestas del modelo, negociables (no son decisiones del sponsor):**
- Un correo nuevo entra **sin** el permiso salvo que se marque al inscribirlo (último edge): conceder datos de medición es un acto explícito.
- Al desplegar la enmienda, **nadie** tiene el permiso hasta que un administrador lo conceda; la lista inicial (quién de Mercadeo, Comercial y Dirección General lo recibe) la entrega el sponsor. No hay riesgo de quedarse sin nadie: conceder el permiso es del rol administrador, que no lo necesita para hacerlo.
- Dar de baja un correo y volver a inscribirlo no recupera el permiso anterior.

**Segundo permiso por persona: «Validar composiciones» (D99, sponsor 2026-10-02).** HU-195 usa la **misma mecánica** que esta historia para un segundo permiso, «Validar composiciones»: lo concede y lo quita un administrador desde la lista de acceso, independiente del rol, con auditoría y corte en la siguiente petición. Coordinación de Servicio entra como observadora más ese permiso. La lista de acceso muestra un control por permiso; los escenarios de esta historia se prueban con «Medición» y valen igual para el segundo. A diferencia de «Medición», «Validar composiciones» sí da una escritura (el registro de HU-195) sin el rol administrador, por excepción de D94, y no abre Medición.

**Dirección General** necesita estar inscrita en la lista nominal (rol observador) para ver Medición; hoy no consta que lo esté. Lo confirma el sponsor.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.18 · RF-8.1.2 (enmienda v4.18, D74) · RF-8.1.5 · RF-8.1.6 · RF-8.1.3 · ADR-0006 (enmienda 2026-10-02, D74) · D74 (corrige D67), D17 y D99 (segundo permiso, HU-195) · toca la lista de acceso de **HU-151 (EP-006, cerrada)** · depende de HU-151 · relacionada con HU-124 (matriz rol × acción), HU-171 (negación en Medición) y HU-186 (escritura en Medición)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se apoya en la lista, la guarda del rol y la auditoría que HU-151 y HU-124 ya construyeron; no espera a ninguna lectura de Medición (las protege a todas) |
| N | Negociable | ✓ son fijos que el permiso sea por persona e independiente del rol (D74), que se audite y que lo cambie solo un administrador; el valor por omisión al inscribir, la lista inicial y la presentación en la lista son negociables |
| V | Valiosa | ✓ sin ella la decisión de quién ve Medición no se puede aplicar con los dos roles actuales, y el tablero mensual o queda abierto a quien no debe o cerrado a Dirección General |
| E | Estimable | ✓ S: un campo booleano en la lista nominal (migración), un control en la pantalla de HU-151, la comprobación en las rutas de Medición y un evento de auditoría por cambio |
| S | Pequeña | ✓ S: una capacidad (conceder y quitar un permiso) en cinco escenarios, uno con tabla |
| T | Testeable | ✓ correos sembrados con cada combinación de rol y permiso, una sesión abierta en Medición a la que se le quita el permiso y un observador que envía la concesión por ruta directa dan menú, negaciones, lista y auditoría observables |
