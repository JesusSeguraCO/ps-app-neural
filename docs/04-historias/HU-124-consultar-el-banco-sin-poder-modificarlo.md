---
id: HU-124
titulo: "Consultar el banco sin poder modificarlo"
epica: EP-006
prioridad: media
complejidad: S
estado: lista
fase: panel-crud
prd_version: 4.15
depende_de: [HU-123]
---

# HU-124 — Consultar el banco sin poder modificarlo

**Como** analista de Mercadeo con rol observador,
**quiero** consultar el inventario, los enlaces de acceso y los colocados sin poder escribir nada,
**para** armar la curaduría de una cuenta sin riesgo de alterar el banco por accidente.

## Criterios de aceptación

### Happy path — consulta completa

**Dado** que tengo rol observador,
**cuando** entro al panel,
**Entonces** veo el inventario, los enlaces de acceso generados y los perfiles colocados
**Y** no veo ningún control de edición, publicación ni importación

### Error — intento de escritura por ruta directa

**Dado** que tengo rol observador,
**cuando** llego por una dirección de edición que alguien me pasó,
**Entonces** el panel rechaza la acción y explica que mi rol es de consulta
**Y** el intento queda en el registro de auditoría

### Edge case — necesito un cambio que no puedo hacer

**Dado** que tengo rol observador y veo un dato desactualizado en un perfil,
**cuando** intento editarlo,
**Entonces** el panel me explica que mi rol es de consulta
**Y** me ofrece un botón para avisar a quien administra el inventario, con el perfil ya identificado en el aviso

## Notas

Cubre **RF-8.1.2**, rol *observador*. Es el rol de Mercadeo y Comercial.

**Por qué el observador no es un lujo.** Mercadeo arma la selección de perfiles de cada cuenta (HU-113) y necesita ver disponibilidad real. Darle permiso de escritura para que pueda mirar sería el camino corto y el error: quien arma correos no debería poder despublicar un perfil.

**Lo que ya existe.** HU-123 (entrar al panel) está construida en EP-001, junto con la matriz rol × acción y el rol observador como mínimo técnico. Esta historia extiende esa matriz a las acciones de EP-006 y añade el aviso.

**Revisión DoR 2026-09-30: aplicada D14** (sponsor; bloqueo B6 del DoR). El happy path se limita a los destinos que existen en EP-006: inventario, enlaces de acceso y colocados. **El registro de demanda y la cobertura se añaden a la consulta del observador cuando llegue EP-010**, que es donde se construyen; RF-8.1.2 los sigue listando como alcance del rol y no se recortan. Con esto I y T se cumplen dentro de EP-006.

**Revisión INVEST 2026-09-30:** el borde pasa de «quiero corregirlo» a una acción («intento editarlo») con resultado observable (botón para avisar con el perfil identificado); `depende_de: [HU-123]`, ya satisfecha; tabla INVEST razonada. El actor sigue siendo el observador: el rol unificado de la épica aplica a la administradora.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.15 · RF-8.1.2 · D-22 · D14 (sponsor, 2026-09-30) · depende de HU-123 (construida en EP-001) · relacionada con HU-113

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ su única dependencia, HU-123, ya está construida en EP-001; tras D14 no exige pantallas de EP-010 (demanda y cobertura) |
| N | Negociable | ✓ fija que el observador no escribe y que no queda sin salida; el canal del aviso queda abierto |
| V | Valiosa | ✓ habilita a Mercadeo sin exponer el banco a escritura |
| E | Estimable | ✓ S: la matriz rol × acción ya existe (`packages/dominio/src/acceso/permisos.ts`) y rechaza por rol; el trabajo es registrar ahí cada acción nueva de EP-006, ocultar sus controles, auditar el rechazo y el botón de aviso. Queda por decidir en el diseño si el aviso sale por correo (Mailgun, ya usado en EP-001) o como aviso dentro del panel; ninguna de las dos opciones cambia el tamaño |
| S | Pequeña | ✓ tres escenarios de una capacidad |
| T | Testeable | ✓ los tres destinos de EP-006 se comprueban con sesión de observador; recorrer las rutas de escritura con sesión de observador da un rechazo y un evento de auditoría por cada una |
