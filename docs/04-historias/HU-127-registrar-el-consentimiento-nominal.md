---
id: HU-127
titulo: "Registrar el consentimiento nominal del profesional"
epica: EP-006
prioridad: alta
complejidad: M
estado: lista
fase: panel-crud
prd_version: 4.8
depende_de: [HU-125]
---

# HU-127 — Registrar el consentimiento nominal del profesional

**Como** administradora de inventario de Talento Humano,
**quiero** registrar que el profesional autorizó publicar su nombre junto con su trayectoria y sus clientes,
**para** que el banco tenga respaldo de cada perfil nominal que se muestra a una cuenta.

## Criterios de aceptación

### Happy path — consentimiento nominal y explícito

**Dado** que el profesional autorizó publicar nombre y primer apellido junto con trayectoria y clientes nombrados, ante cuentas cliente y de forma continua,
**cuando** registro ese consentimiento en su perfil,
**Entonces** el perfil queda habilitado para pasar a *publicado*
**Y** queda registrado quién lo registró y cuándo

### Error — consentimiento anterior para publicación anonimizada

**Dado** que el único consentimiento del profesional es de cuando el banco se publicaba sin nombres,
**cuando** intento registrarlo como consentimiento nominal,
**Entonces** el panel lo rechaza y explica que ese consentimiento no cubre este uso
**Y** me indica que hay que recogerlo de nuevo

### Error — consentimiento revocado

**Dado** que el perfil está publicado y el profesional comunicó que revoca su consentimiento,
**cuando** registro la revocación,
**Entonces** el perfil sale de *publicado* de inmediato
**Y** un enlace curado que lo incluía, al abrirse, muestra que el perfil dejó de estar disponible en lugar de omitirlo (RF-19.2)

### Edge case — consentimiento parcial

**Dado** que el profesional autoriza su trayectoria pero no que se nombren sus clientes,
**cuando** registro ese consentimiento,
**Entonces** el perfil puede publicarse con la experiencia despersonalizada
**Y** los clientes nombrados no aparecen en su ficha

## Notas

Cubre **RF-8.4**. Es consecuencia directa de la **reversión de D-1** (2026-09-10): al publicarse nombre y primer apellido, el consentimiento pasó de genérico a **nominal y explícito**.

**El consentimiento recogido antes no sirve.** El PRD es explícito: el consentimiento para una publicación anonimizada no cubre la publicación nominal. Esto significa trabajo real de Talento Humano sobre el banco existente antes de salir a producción, y se cruza con **D-3** — 25 perfiles publicados como umbral, cada uno con consentimiento nominal recogido de nuevo.

**Nota operativa (D-3):** antes de producción, Talento Humano vuelve a recoger el consentimiento nominal de cada perfil del banco existente. Es trabajo fuera del software, pero sin él no hay perfiles publicables el día de salida.

**Revisión INVEST 2026-09-30:** el revocado se ancla a RF-19.2 (el enlace curado explica que el perfil dejó de estar disponible) y su Dado pasa a estado; el error anonimizado pasa a una acción concreta; añadida la nota operativa de D-3; `depende_de: [HU-125]`; tabla INVEST razonada.

## Trazabilidad

> OpenSpec change: administracion-del-inventario

Épica madre: **EP-006** · PRD v4.8 · D-1 revertida · condiciona D-3 · depende de HU-125 · habilita HU-128 · RF-19.2

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: el consentimiento se registra sobre un perfil que ya existe (HU-125); se construye después |
| N | Negociable | ✓ describe el registro, no el medio de recolección |
| V | Valiosa | ✓ es el respaldo legal de todo el producto |
| E | Estimable | ✓ M: la tabla `inventario.consentimientos` existe desde la migración 0005; falta el registro en el panel con alcance (nominal, parcial, revocado), el efecto sobre el estado del perfil y la ficha sin clientes nombrados. La reevaluación del enlace al abrirse (RF-19.2) ya la construyó HU-144 en EP-001 (`packages/dominio/src/enlaces/seleccion.ts`); aquí solo se verifica que la respeta |
| S | Pequeña | ✓ cuatro escenarios de una capacidad; el bloqueo de publicar sin consentimiento está en HU-128 |
| T | Testeable | ✓ el estado del perfil, la ficha y el enlace abierto tras cada registro son observables |
