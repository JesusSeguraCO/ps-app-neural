---
id: HU-104
titulo: "Que no se me duplique la empresa en el CRM"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-102]
---

# HU-104 — Que no se me duplique la empresa en el CRM

> **Historia de configuración en HubSpot.** Responsable: **Mercadeo/RevOps**. Verificación: **prueba en el sandbox o el portal real de HubSpot con datos ficticios**. La asociación de la empresa por dominio, y su creación si no existe, son **funciones nativas de HubSpot** que dispara el workflow (D53, D79); el portal no crea ni asocia empresas. Su única parte son los dos escenarios **[portal]**: el **upsert del contacto por correo** que hace el worker (D76, HU-102), que se prueba con la suite del portal.

**Como** responsable de Mercadeo que administra HubSpot,
**quiero** que cada negocio del portal quede asociado al contacto y a la empresa que ya existen, y que nunca se cree un contacto ni una empresa repetidos,
**para** no tener que fusionar registros a mano ni perder el historial de la cuenta.

## Criterios de aceptación

### Happy path [portal] — el contacto ya existe

**Dado** que quien envió la solicitud ya existe en HubSpot como contacto con su correo verificado,
**cuando** el worker procesa la solicitud,
**Entonces** el contacto se actualiza por ese correo (upsert) y el negocio queda asociado a él
**Y** en HubSpot no aparece ningún contacto nuevo
**Y** el worker solo escribe los campos que el portal conoce y no vacía los demás

### Happy path [HubSpot] — persona nueva en una empresa conocida

**Dado** que el worker creó el contacto de una persona nueva y ya existe una empresa con el dominio de su correo,
**cuando** el workflow procesa el negocio nuevo,
**Entonces** el contacto y el negocio quedan asociados a esa empresa
**Y** no se crea ninguna empresa

### Edge case [HubSpot] — ninguna empresa tiene ese dominio

**Dado** que el correo corporativo de quien solicita tiene un dominio que ninguna empresa de HubSpot tiene,
**cuando** el workflow procesa el negocio nuevo,
**Entonces** HubSpot crea una sola empresa a partir del dominio y la asocia al contacto y al negocio
**Y** una segunda solicitud con el mismo dominio usa esa empresa y no crea otra

### Edge case [HubSpot] — la empresa no se puede identificar con certeza

**Dado** que el correo de quien solicita es de un dominio genérico o hay más de una empresa con su dominio,
**cuando** el workflow procesa el negocio nuevo,
**Entonces** el negocio queda asociado al contacto, sin empresa elegida al azar
**Y** no se crea ninguna empresa
**Y** la notificación del negocio dice «empresa por confirmar», con el nombre de la cuenta del enlace

### Edge case [portal] — dos solicitudes del mismo contacto nuevo casi a la vez

**Dado** que el contacto no existía y el worker procesa dos solicitudes con su correo con segundos de diferencia,
**cuando** las dos hacen el upsert del contacto,
**Entonces** en HubSpot queda un solo contacto con ese correo
**Y** cada solicitud tiene su propio negocio asociado a ese contacto

## Notas

Cubre **RF-9.2** en su parte de contacto y empresa: «nunca se duplican registros» y «jamás se crea una empresa duplicada». La parte de D-7 (negocio relacionado) está en HU-102.

**Revisión 2026-10-02 (D53; segunda ronda D76, D79).** **D76**: el contacto ya no lo crea un formulario sino **el worker, por la API, con upsert por `email`** (la propiedad única nativa del contacto), con los campos que el portal conoce (correo verificado, D-4; nombre, apellido y cargo, HU-097). Si dos upserts chocan, HubSpot responde con conflicto y el worker reutiliza el contacto existente (HU-166, clase Conflicto). **D53**: la empresa la asocia **HubSpot por el dominio del correo**; el portal no escribe `company` ni llama a la API de empresas (los scopes de D76 no la incluyen). **D79**: si ninguna empresa tiene ese dominio, **HubSpot la crea** (función nativa «crear y asociar empresas con contactos»); no es un duplicado, así que respeta RF-9.2. Contexto del sponsor: al portal solo entran clientes **invitados nominalmente**, así que es un caso de borde. Queda resuelta la pregunta para Mercadeo de la versión anterior.

**Asociar la empresa al negocio.** La asociación nativa por dominio llega al **contacto**; que el negocio quede asociado a la misma empresa lo hace el workflow (acción de asociación). **Por verificar en la prueba de capacidades D84:** el orden en el tiempo (que la empresa ya esté asociada al contacto cuando el workflow procesa el negocio) y qué hace HubSpot cuando hay **más de una empresa** con el mismo dominio. El escenario exige que no elija una al azar; si la función nativa lo hace, el workflow debe detectarlo y marcar «empresa por confirmar».

**Revisión de validación 2026-10-02.** El happy [portal] se reescribe con una sola acción («el worker procesa la solicitud»); el upsert pasa al Entonces. La E queda **pendiente de D84** hasta que la prueba de capacidades confirme el orden de la asociación y el caso de varias empresas con el mismo dominio; la historia no pasa a `lista` sin ese resultado.

**Quién confirma la empresa** cuando queda por confirmar: el propietario o la administradora de HubSpot la asocia a mano. Supuesto conservador.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.2 · D-4 · D52 (sustituida en parte), D53, D54, D76, D79, D84 (sponsor, 2026-10-02) · E-7 (resuelta por D53) · ADR-0009 (enmienda D76) · depende de HU-102 · relacionada con HU-097 (EP-005), HU-103 y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: asocia el negocio que crea HU-102; no depende del aviso, el requerimiento ni la bandeja |
| N | Negociable | ✓ fija que nunca se crea un contacto ni una empresa repetidos y que el caso dudoso se marca; la redacción de la marca se configura |
| V | Valiosa | ✓ el CRM no se ensucia con registros repetidos y la oportunidad queda en la ficha de la cuenta correcta |
| E | Estimable | ⚠ S, **pendiente D84**: ajustes nativos de HubSpot más una acción de asociación y una rama del workflow; en el portal, el upsert por correo que ya hace HU-102. D79 cerró el caso del dominio nuevo, pero la prueba de capacidades D84 (solo lectura + lista de verificación de Mercadeo/RevOps) aún debe confirmar el orden de la asociación por dominio frente al workflow y qué hace HubSpot con varias empresas del mismo dominio; si la función nativa elige una, la rama del workflow crece |
| S | Pequeña | ✓ S: una capacidad (asociar sin duplicar) en cinco escenarios cortos |
| T | Testeable | ✓ con un doble de la API, upserts de un contacto existente y dos casi simultáneos dan un solo contacto; en HubSpot, negocios ficticios de un dominio conocido, uno sin empresa y uno genérico dan asociaciones observables |
