---
id: HU-114
titulo: "Generar el enlace de cada destinatario sin construirlo a mano"
epica: EP-011
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-113]
---

# HU-114 — Generar el enlace de cada destinatario sin construirlo a mano

> **Decisión de negocio 2026-09-27 (sponsor):** el boletín se confecciona y envía desde Gmail o HubSpot; el portal entrega la selección curada, el enlace de cada destinatario y el bloque de contenido para copiar (PRD v4.14, RF-18).

**Como** integrante de Mercadeo que prepara la edición curada de una cuenta,
**quiero** que el panel genere desde la edición el enlace propio de cada destinatario,
**para** no equivocarme copiando parámetros para veinte cuentas y que cada entrada quede atribuida a quien la hizo.

## Criterios de aceptación

### Happy path — un enlace propio por destinatario

**Dado** que la edición de Bancolombia está «lista» con PS-0098, PS-0142 y PS-0088 publicados, su razón y los destinatarios Juliana Restrepo y Mauricio Cárdenas,
**cuando** toco «Generar enlaces y contenido»,
**Entonces** cada destinatario recibe un enlace propio, ligado a la cuenta, a su correo invitado y a esta edición, y ninguno se construye a mano
**Y** cada enlace se muestra completo una sola vez, junto a su bloque para copiar (HU-115)
**Y** los enlaces tienen la vigencia que fijé al generarlos, 30 días por omisión
**Y** la base guarda solo la huella de cada enlace, nunca el enlace en claro

### Error — un perfil cambió desde que lo elegí

**Dado** que después de guardar la selección de Bancolombia PS-0142 pasó a pausado,
**cuando** toco «Generar enlaces y contenido»,
**Entonces** el panel no genera ningún enlace y me dice que PS-0142 está pausado
**Y** me ofrece reemplazarlo o quitarlo de la selección

### Error — a la edición le falta algo para salir

**Dado** que la edición de Bancolombia tiene perfiles publicados pero le falta lo que dice la tabla,
**cuando** toco «Generar enlaces y contenido»,
**Entonces** no se genera ningún enlace y el panel dice el motivo de la tabla

| Le falta | Motivo |
|---|---|
| la razón de la selección | sin razón el cliente recibe un catálogo y no una curaduría |
| al menos un destinatario no excluido | añade al menos un destinatario que pueda recibir la edición |

### Edge case — perdí un enlace antes de pegarlo

**Dado** que generé los enlaces de la edición de Bancolombia, cerré la pantalla sin copiar el de Mauricio y ahora su fila dice «Generado hoy a las 10:42 · ya no se muestra»,
**cuando** regenero el enlace de Mauricio,
**Entonces** veo una sola vez su enlace nuevo con su bloque
**Y** el enlace anterior de Mauricio queda revocado: quien lo abra ve la pantalla de enlace revocado, que explica cómo pedir uno nuevo (RF-19.6), no inventario ni un error

### Edge case — el enlace de una edición vencida

**Dado** que la vigencia de los enlaces de la edición de septiembre de Bancolombia terminó,
**cuando** Juliana abre su enlace de septiembre,
**Entonces** ve la pantalla de renovación (HU-092), no inventario ni un error

## Notas

Cubre **RF-1.6**, **RF-18.2** y **RF-18.2.1**. El enlace es el **token opaco por destinatario** de ADR-0002 (`enlace_tokens`, con `envio_id` = la edición e `invitado_id` = el destinatario; tabla ya construida en EP-001): solo se guarda su huella, por eso se muestra al generarse y se regenera si se pierde. Una fuga de la base no entrega enlaces que abran. Al abrirse, el enlace reevalúa el estado de cada perfil (RF-19.2, HU-144, ya construida).

**Refinamiento 2026-10-02 (discovery de EP-011).**
- **El error «destinatario sin cuenta asociada» se reemplaza.** Con la edición por cuenta de HU-229 (sin lectura de HubSpot) todo destinatario pertenece a la cuenta de su edición por construcción; el caso del prototipo («Asócialo a Bancolombia en HubSpot») ya no puede darse. Se conserva la intención —no se genera un enlace sin contexto— en el error de la tabla.
- **El error «un perfil cambia antes de generar» viene de HU-113**, porque se detecta aquí.
- **Enlaces y contenido se generan juntos**: el bloque para copiar lleva el enlace del destinatario (RF-18.7), que solo se puede mostrar al generarlo.

**Elegida por el modelo por delegación del sponsor (2026-10-02) — vigencia.** La spec decía «atada al ciclo de la edición»; HU-122 ya fijó que manda **RF-1.4: 30 días por omisión, editable**, que coincide con la cadencia mensual por omisión (HU-231). La edición siguiente **no revoca** los enlaces de la anterior: el cliente que armó un equipo con ellos no lo pierde (RF-4.5). Vencidos, llevan a la renovación (RF-1.4, HU-092).

**Sin casilla «demo».** Las ediciones se envían a clientes reales (HU-188, nota).

**Excluidos.** A un contacto excluido (HU-232) no se le genera enlace.

## Trazabilidad

Épica madre: **EP-011** · PRD v4.18 · RF-1.6 · RF-18.2 · RF-18.2.1 · RF-1.4 · RF-19.2 · RF-19.4 · RF-19.6 · ADR-0002 (token opaco, H9) · ADR-0009 (UC-16) · prototipo `selecciones-curadas--enlace-perdido`, `enlaces-y-contenido--enlace-no-visible` · depende de HU-113 · relacionada con HU-092, HU-115, HU-122, HU-188 y HU-232

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita la selección de HU-113; la tabla de tokens, la reevaluación al abrir y la renovación ya existen (EP-001) |
| N | Negociable | ✓ fija un enlace por destinatario, mostrado una vez, guardado como huella, regenerable con revocación, las guardas y la vigencia por omisión; la presentación es negociable |
| V | Valiosa | ✓ elimina el error de construir URLs a mano y hace posible atribuir cada entrada a su destinatario y a su edición |
| E | Estimable | ✓ M: emisión de tokens por destinatario sobre el modelo existente, verificación del inventario al generar, regeneración con revocación y las dos guardas |
| S | Pequeña | ✓ M: una capacidad (generar los enlaces) en cinco escenarios |
| T | Testeable | ✓ una edición lista, un perfil pausado tras la selección, ediciones sin razón o sin destinatarios, un enlace regenerado y un enlace con la vigencia vencida dan enlaces, huellas, rechazos y pantallas observables |
