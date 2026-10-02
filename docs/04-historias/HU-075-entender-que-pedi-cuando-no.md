---
id: HU-075
titulo: "Entender qué pedí cuando no hay nada que mostrar"
epica: EP-010
prioridad: alta
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-085, HU-118, HU-167]
---

# HU-075 — Entender qué pedí cuando no hay nada que mostrar

**Como** líder de proyecto cuya búsqueda no arrojó coincidencias,
**quiero** ver mi especificación a la vista junto con la ausencia de resultados,
**para** saber que el portal entendió lo que necesito aunque hoy no lo tenga, y poder pedirlo.

## Criterios de aceptación

### Happy path — el cero con mi especificación a la vista

**Dado** que entré con mi correo invitado y mi Perfil Objetivo pide como obligatorios «Arquitectura de pagos», «Senior» e «ISO 20022», y ningún perfil publicado cumple los tres,
**cuando** se muestran los resultados,
**Entonces** veo «Ningún perfil cumple los 3 obligatorios» junto a mi Perfil Objetivo completo y editable, con cada criterio y su marca de obligatorio o deseable
**Y** veo la acción «Pedir el perfil a medida» con el plazo «Respuesta en 10 días hábiles · no compromete a nadie»
**Y** no veo una pantalla vacía ni un mensaje de error
**Y** la visita registra el evento «cero mostrado» con la ruta «perfil objetivo» y el número de obligatorios, sin el contenido de los criterios (HU-167)

### Error — falta rol o seniority para pedir a medida

**Dado** que llegué al cero con un Perfil Objetivo sin rol ni seniority («Power BI, SAS, presencial en Barranquilla») y escribí una nota en el pedido a medida,
**cuando** toco «Pedir el perfil a medida»,
**Entonces** el portal no envía la solicitud y me pide elegir el rol y la seniority, cada uno con su motivo («sin rol no sabemos a quién buscar»)
**Y** conserva la nota y los criterios que ya tenía

### Edge case — los deseables no llevan al cero

**Dado** que mi único obligatorio es el rol «Backend Java», que cumplen 4 perfiles publicados, y ninguno cumple el deseable «Sector Seguros»,
**cuando** se muestran los resultados,
**Entonces** veo los 4 perfiles, cada uno con «– Sector Seguros» en su evidencia
**Y** no veo la pantalla de cero ni se registra «cero mostrado»

## Notas

Cubre **RF-14.3** (Perfil Objetivo a la vista y salida hacia la solicitud dirigida con su SLA) y **RF-13.9.4** (el cero se activa solo cuando ningún perfil cumple los obligatorios). El error más caro de esta pantalla —pedirle a Trycore que reclute a alguien que ya está en el banco— lo evitan el último escenario (los deseables no producen el cero) y el cero por filtros de EP-002 (abajo).

**Refinamiento 2026-10-02 (discovery de EP-010).** Los Given pasan a describir estado y cada When queda con una sola acción. Se añaden: el evento «cero mostrado» que necesita la lectura de HU-170 (métrica de éxito de EP-010; carga del evento según ADR-0006, H32, sin contenido de criterios por RF-13.4) y el límite de RF-13.9.4 (último edge). El alcance no se recorta.

**Qué es de esta historia y qué no.** El panel del Perfil Objetivo y sus opciones son de EP-009 (HU-085, HU-118); el aviso único de RF-13.8.2 también. Esta historia es la pantalla del cero: lo que se ve cuando el motor devuelve cero, la distinción banco/filtro y la salida. El formulario y el envío del pedido a medida son de **HU-077**; lo más cercano, de **HU-076**; la declaración de selectividad, de **HU-227**.

**D130 (2026-10-02, elegida por el modelo): sin solicitud no hay especificación en el servidor.** Se mantienen PRD y ADR-0004 (RF-13.4.2 sobre RF-15.1): si el cliente ve el cero y no pide el perfil a medida, la especificación estructurada no sale del navegador; la demanda registra solo el texto enmascarado (HU-078). Solo la solicitud a medida (HU-077) lleva la especificación completa.

**El cero causado por un filtro es de EP-002 (deduplicación 2026-10-02).** La versión anterior tenía el edge «el cero se produce por un filtro y no por el banco». La discovery de EP-002, en paralelo, lo escribió entero en **HU-074** (filtro añadido sobre la instrucción: «la instrucción sí tiene 6 perfiles», quitarlo de un toque) y **HU-223** (cero solo por facetas, con cuántos recupera cada filtro). Se quita de aquí para no construirlo dos veces; **no es recorte**: vive completo en EP-002. Esta pantalla es la del cero que dejan **los obligatorios del Perfil Objetivo** (RF-13.9.4). La salida «a medida» desde el cero de HU-223 la cablea **HU-228** (precedente de HU-093).

**Copy** del prototipo (`docs/05-prototipo/pantallas/cero-resultados*.html`), **marcado para revisión de copy** (D73).

## Trazabilidad

Épica madre: **EP-010** · PRD v4.18 · RF-14.3 · RF-13.9.4 · ADR-0006 (H32, `cero_mostrado`) · D73 · D130 · prototipo `cero-resultados`, `--vaga` · depende de HU-085 y HU-118 (EP-009) y HU-167 (EP-008) · relacionada con HU-076, HU-077, HU-170 y HU-227 · el cero por filtros es de HU-074 y HU-223 (EP-002)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita el Perfil Objetivo y el motor de EP-009 (la épica depende de EP-009 en `epicas.md`) y el contrato de eventos de HU-167; no depende de HU-076 ni de HU-077, que se montan sobre esta pantalla |
| N | Negociable | ✓ fija que la especificación queda a la vista y editable, que el plazo y la acción se ven, los mínimos para pedir y que solo los obligatorios producen el cero; disposición y textos son negociables |
| V | Valiosa | ✓ el cliente que no encuentra sabe que fue entendido y tiene salida, en lugar de una pantalla vacía |
| E | Estimable | ✓ S: estado de cero sobre el motor de EP-009, validación de mínimos al pedir y un evento |
| S | Pequeña | ✓ S: una pantalla en tres escenarios |
| T | Testeable | ✓ banco sembrado sin perfiles que cumplan tres obligatorios, un Perfil Objetivo sin rol y un deseable que nadie cumple dan pantallas y eventos observables |
