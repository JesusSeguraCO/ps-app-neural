---
id: HU-080
titulo: "Ver qué le falta al equipo que estoy armando"
epica: EP-004
prioridad: media
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-203]
---

# HU-080 — Ver qué le falta al equipo que estoy armando

**Como** líder de proyecto que está seleccionando varios perfiles,
**quiero** que el portal me señale los roles ausentes en la composición que llevo,
**para** no descubrir en la sesión de alineación que me faltaba un rol clave del proyecto.

## Criterios de aceptación

### Happy path — vacío señalado en tono informativo

**Dado** que la regla de vacío validada por Delivery «2 o más perfiles de desarrollo y ninguno de pruebas» está en el portal
**Y** que mi equipo tiene 2 perfiles Backend y ninguno de QA
**Cuando** abro la vista «Mi equipo»
**Entonces** veo la observación «Tu equipo tiene 2 perfiles de desarrollo y ninguno de pruebas»
**Y** la observación no nombra perfiles concretos y no trae «Sumar», enlaces a resultados ni otros llamados a la acción

### Error — no se inventa un vacío

**Dado** que mi equipo tiene 1 perfil Backend y 1 de QA de automatización
**Y** que ninguna de las reglas de vacío validadas aplica a esa composición
**Cuando** abro la vista «Mi equipo»
**Entonces** no veo ninguna observación sobre la composición, ni genérica ni aproximada
**Y** el resumen del equipo se muestra completo, con sus 2 perfiles, «Roles cubiertos: 2» y el arranque del conjunto

### Edge case — el vacío deja de existir

**Dado** que en la vista «Mi equipo» veo la observación «Tu equipo tiene 2 perfiles de desarrollo y ninguno de pruebas»
**Cuando** quito uno de los 2 perfiles Backend
**Entonces** la observación desaparece, porque la regla ya no aplica a 1 perfil de desarrollo

### Edge case — el cliente sigue sin el rol señalado

**Dado** que en la vista «Mi equipo» veo la observación de vacío
**Cuando** toco «Continuar a la solicitud» sin sumar ningún perfil de pruebas
**Entonces** paso a la solicitud sin advertencia, confirmación ni paso adicional
**Y** la solicitud no lleva la observación (D115: no viaja a HubSpot en v1)

## Notas

Cubre **RF-14.6** («Mi equipo» lee vacíos de composición —dos backend y ningún QA— en tono informativo, nunca sugerente). El tono informativo es requisito y no estilo: en una relación de expansión de cuenta, sugerir roles no pedidos se lee como venta cruzada (el «en contra» de RF-14.6).

**Refinada el 2026-10-02 (discovery de EP-004).** AC con valores comprobables y el «Cuando» como una sola acción; el error habla de **reglas validadas** y no de «composición típica»; el edge «ignora la observación» se parte en dos —el vacío que desaparece al quitar y continuar sin fricción—.

**D115 (sponsor, 2026-10-02) cierra la pregunta P8.** Las reglas de vacío son **reglas fijas en código** (dominio, deterministas, contra los roles y familias del catálogo), **validadas por Delivery**; no hay pantalla del panel para administrarlas. Complejidad **S**. **La observación no viaja a HubSpot en v1**: sale el AC anterior «la observación queda registrada para la sesión de alineación», por decisión del sponsor (no lo decidió el modelo).

**Conjunto inicial de reglas.** La regla del happy path es la de RF-14.6 generalizada a familias («desarrollo» y «pruebas» del catálogo). El conjunto completo lo entrega Coordinación de Servicio como insumo del DoR de EP-004; una regla que Delivery no validó no se publica. Sin reglas aplicables, el portal calla (escenario de error).

**Perfiles no disponibles.** Un perfil pausado o archivado del equipo no cuenta para evaluar las reglas, igual que no cuenta en roles ni arranque (D114, HU-206). *Elegida por el modelo por delegación del sponsor.*

**Relación con HU-084 (EP-009 desde D108).** Cuando el cliente ve una composición de referencia (HU-084), la observación de vacío no se muestra, para no duplicar el aviso. Esa regla la implementa HU-084 al construirse en EP-009; esta historia no depende de ella. *Elegida por el modelo por delegación del sponsor.*

**Telemetría.** Que la observación se vio lo registra EP-008 con el contrato de eventos de ADR-0006; esta historia no lo construye.

## Trazabilidad

Épica madre: **EP-004** · PRD v4.18 · RF-14.6 · D114 · D115 (sponsor, 2026-10-02) · depende de HU-203 (vista «Mi equipo») · relacionada con HU-084 (EP-009, D108) y HU-206 (perfiles no disponibles) · RF-14.6 se suma a las capabilities de EP-004 en `epicas.md` (discovery 2026-10-02)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se dibuja en la vista de HU-203; las reglas son fijas en el dominio (D115) y no esperan a otra épica |
| N | Negociable | ✓ son fijos el tono informativo sin llamados a la acción, que sin regla validada no hay observación y que no viaja a HubSpot en v1; la redacción de la observación y el conjunto de reglas (con Delivery) se negocian |
| V | Valiosa | ✓ evita descubrir en la alineación que faltaba un rol, sin convertir el equipo en venta cruzada |
| E | Estimable | ✓ S (D115): una función de dominio que evalúa reglas fijas contra los roles del equipo y un bloque condicional en la vista existente |
| S | Pequeña | ✓ S: cuatro escenarios sobre una observación de la vista |
| T | Testeable | ✓ unitarios de la evaluación de reglas y e2e con equipos sembrados: observación con 2 Backend y 0 QA, silencio sin regla aplicable, desaparición al quitar y paso a la solicitud sin fricción ni observación en lo enviado |
