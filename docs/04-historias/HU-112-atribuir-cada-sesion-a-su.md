---
id: HU-112
titulo: "Atribuir cada sesión a su envío de correo"
epica: EP-008
prioridad: alta
complejidad: M
estado: draft
fase: cierre-de-huecos
prd_version: 4.17
depende_de: [HU-167, HU-168]
---

# HU-112 — Atribuir cada sesión a su envío de correo

**Como** integrante de Mercadeo que prepara las ediciones curadas de cada cuenta,
**quiero** que cada visita al portal quede atribuida a la cuenta, al contacto y a la edición curada de la que vino,
**para** atribuir los resultados al correo y no a la casualidad.

## Criterios de aceptación

### Happy path — entrada por el enlace de su edición

**Dado** que un destinatario está en la pantalla de su código, a la que llegó con el enlace que se generó para él en una edición curada,
**cuando** verifica su código,
**Entonces** su visita queda atribuida a la cuenta, a su contacto y a esa edición
**Y** la atribución queda marcada como directa

### Error — la visita no llega por una edición

**Dado** que un contacto está en la pantalla de su código, a la que llegó con un enlace que no pertenece a ninguna edición,
**cuando** verifica su código,
**Entonces** su visita hereda la última edición por la que ese contacto entró antes, marcada como heredada, si esa entrada está dentro de la ventana configurada
**Y** si nunca entró por una edición, la visita queda como directa sin edición, sin inventarle una de origen

### Edge case — entra otro invitado del mismo enlace

**Dado** que un enlace de una edición tiene varios invitados y uno distinto del destinatario está en la pantalla de su código, a la que llegó con ese enlace,
**cuando** verifica su código,
**Entonces** su visita se atribuye a la misma edición
**Y** queda con su propio contacto, distinto del destinatario original

### Edge case — el reparto de la atribución está a la vista

**Dado** que en el período hubo visitas con atribución directa, heredada y sin edición,
**cuando** abro Medición,
**Entonces** veo cuántas visitas hay de cada tipo
**Y** sé qué parte del crédito del correo viene de la regla de herencia

## Notas

Cubre **RF-7.3** (*atribución de cada sesión a la cuenta, al contacto y al envío de correo que la originó*) y la base de **RF-18.6**. Sin esto, el seguimiento de EP-011 (HU-116) y el acierto de HU-109 no pueden existir. Regla en **ADR-0006** (`ResolverAtribucion`, último toque): se calcula **una vez al abrir la sesión** y se guarda en ella; los eventos la heredan (HU-167).

**«Envío» es la edición curada.** Desde la decisión del sponsor del 2026-09-27 (RF-18) el portal no envía el boletín: el envío es la **edición curada** del panel y su token por destinatario (`enlace_tokens.envio_id`, columna que ya existe; las ediciones las crea EP-011, HU-114). Con acceso nominal (D-4) toda visita entra con un token, así que «sin parámetros» significa un enlace que no es de una edición —por ejemplo uno generado desde la selección del panel (HU-122)—.

**Cambio respecto de la redacción anterior.** El error decía «entrada sin parámetros → origen directo». ADR-0006 (aceptada) decidió la herencia del último envío para no castigar al cliente que vuelve por otro enlace; la redacción se alinea con ella y hace visible el reparto (último edge) para que la regla se pueda revisar sin reescribir eventos.

**La solicitud toma su atribución de la sesión** (§8, *Trazabilidad*: cuenta, contacto, sesión, conjunto curado y correo de origen). Ese vínculo lo escribe EP-005 al crear la solicitud; esta historia deja la atribución resuelta en la sesión para que la tome.

**Revisión G/W/T 2026-10-02 (validador independiente).** Los Given del happy path, del error y del primer edge describían una acción («entra con ese enlace», «lo abre uno distinto»); ahora describen el estado (el invitado ya está en la pantalla de su código, con el enlace por el que llegó) y el When queda con una sola acción: verificar el código. El alcance no cambia.

**Complejidad:** sube de S (backlog) a M por la regla de herencia con ventana y el reparto visible. Ajustar el backlog si el sponsor lo aprueba.

**Abierto para el sponsor:** la **ventana de herencia** (ADR-0006 propone 90 días, *a validar por negocio*) y si la herencia se aplica o toda visita sin edición debe quedar como directa. Con herencia amplia, la meta de ≥ 99 % de visitas atribuidas (QA-21) se cumple «por construcción» y deja de medir algo real.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.3 · RF-18.2 · RF-18.6 · §8 Trazabilidad · ADR-0006 (`ResolverAtribucion`, QA-21) · ADR-0002 · base de HU-109 y HU-116 · depende de HU-167 y HU-168

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: usa la sesión de EP-001 y la captura de HU-167 y HU-168; el token con edición ya tiene columna, así que se prueba sin esperar a EP-011 |
| N | Negociable | ✓ fija las tres atribuciones y su reparto visible; la ventana de herencia queda abierta |
| V | Valiosa | ✓ es lo que permite decir qué edición produjo qué resultado; sin esto el correo curado no se puede evaluar |
| E | Estimable | ✓ M: resolución al abrir la sesión, búsqueda del último envío del contacto con ventana, guardado en la sesión y un conteo de reparto |
| S | Pequeña | ✓ M: una regla en cuatro escenarios, cada uno con una sola acción (verificar el código o abrir Medición) |
| T | Testeable | ✓ cada When es una acción única y cada Given un estado reproducible; tokens fijados de edición, de cuenta con entrada previa, de cuenta sin entrada previa y de un segundo invitado dan atribuciones y reparto observables |
