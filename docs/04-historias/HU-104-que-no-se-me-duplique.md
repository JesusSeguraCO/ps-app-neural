---
id: HU-104
titulo: "Que no se me duplique la empresa en el CRM"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-102]
---

# HU-104 — Que no se me duplique la empresa en el CRM

**Como** responsable de Mercadeo que administra HubSpot,
**quiero** que cada negocio del portal quede asociado al contacto y a la empresa que ya existen, y que nunca se cree una empresa repetida,
**para** no tener que fusionar registros a mano ni perder el historial de la cuenta.

## Criterios de aceptación

### Happy path — contacto y empresa ya existen

**Dado** que quien envió la solicitud ya existe en HubSpot como contacto asociado a la empresa de su cuenta,
**cuando** el portal procesa la solicitud,
**Entonces** el negocio queda asociado a ese contacto y a esa empresa
**Y** en HubSpot no aparece ningún contacto ni empresa nuevos

### Error — persona nueva en una empresa conocida

**Dado** que quien envió la solicitud no existe en HubSpot y su empresa sí,
**cuando** el portal procesa la solicitud,
**Entonces** se crea el contacto con el nombre, el cargo y el correo verificado de quien solicita, asociado a la empresa existente
**Y** el negocio queda asociado a ese contacto y a esa empresa
**Y** no se crea ninguna empresa

### Edge case — la empresa no se puede identificar con certeza

**Dado** que quien envió la solicitud no existe en HubSpot y ninguna empresa, o más de una, corresponde a su cuenta,
**cuando** el portal procesa la solicitud,
**Entonces** se crea el contacto y el negocio queda asociado a él, sin empresa
**Y** no se crea ninguna empresa
**Y** el aviso al propietario y la solicitud en el portal dicen «empresa por confirmar», con el nombre de la cuenta del enlace

### Edge case — el contacto aparece en HubSpot mientras se procesa

**Dado** que el contacto no existía cuando empezó el proceso y alguien lo creó en HubSpot antes de que el portal lo cree,
**cuando** el portal intenta crear el contacto,
**Entonces** usa el contacto existente
**Y** en HubSpot queda un solo contacto con ese correo

## Notas

Cubre **RF-9.2** en su parte de contacto y empresa: «nunca se duplican registros» y «jamás se crea una empresa duplicada». La parte de D-7 (negocio relacionado) está en HU-102. El correo que viaja es el verificado al entrar (D-4, HU-097); el contacto se busca por ese correo.

**Cómo se identifica la empresa: pregunta abierta al sponsor (E-7 del backlog arquitectónico).** ADR-0009 resolvía la empresa con el identificador de HubSpot guardado en la cuenta del enlace. Desde el 2026-09-28 la generación del enlace no lee HubSpot (HU-122) y el enlace solo guarda el **nombre** de la cuenta (`cuenta_ref` opcional). Opciones: (a) la empresa a la que HubSpot ya asocia el contacto, y para un contacto nuevo el dominio de su correo; (b) pedir el identificador de la empresa al generar el enlace; (c) que lo resuelva un workflow de HubSpot (E-6). Los escenarios se escribieron de forma conservadora y valen para (a) y (b): **el portal nunca crea empresas**, y si la empresa no se puede resolver con certeza el negocio no se pierde, queda con el contacto y se marca para revisión.

**Dominio distinto del de la empresa.** La versión anterior decía «se usa la cuenta del enlace». Ya no se puede: el enlace no guarda la empresa de HubSpot. Ese caso, por ejemplo un consultor externo invitado por la cuenta, cae en el escenario «empresa por confirmar».

**Quién confirma la empresa** cuando queda por confirmar: el PRD no lo dice. Supuesto conservador: el propietario o el administrador de HubSpot la asocia a mano. Pregunta abierta.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.2 · D-4 · E-7 (backlog arquitectónico) · ADR-0009 (subpaso `asociaciones`) · depende de HU-102 · relacionada con HU-097 (EP-005)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: asocia el negocio que crea HU-102; no depende del aviso, las propiedades ni la bandeja |
| N | Negociable | ✓ fija que nunca se crea una empresa ni un contacto repetido y que el caso dudoso se marca; la forma de identificar la empresa (E-7) se negocia |
| V | Valiosa | ✓ el CRM no se ensucia con empresas repetidas y la oportunidad queda en la ficha de la cuenta correcta |
| E | Estimable | ✗ hasta que se cierre E-7: con (a) es buscar por correo y dominio; con (b) se añade un campo al generar el enlace (EP-001) |
| S | Pequeña | ✓ M: una capacidad (asociar sin duplicar) en cuatro escenarios |
| T | Testeable | ✓ un doble de HubSpot con contacto existente, contacto nuevo con empresa, empresa ausente o repetida y un contacto creado durante el proceso da resultados observables en los registros de HubSpot |
