---
artefacto: especificacion-funcional
proyecto: portal-people-service
componente: Correo curado
prd_version: 4.14
version: 2.0
fecha: 2026-09-27
estado: especificado, no construido
epica: EP-011
---

# Especificación — Correo curado

> **Decisión de negocio 2026-09-27 (sponsor):** «el boletín se envía desde Gmail o HubSpot, pero es una
> confección externa; lo que la aplicación les dará es la información curada y el link principalmente».
>
> **Qué cambia en esta versión 2.0:** el portal **no compone, no programa y no envía** el boletín. El
> panel arma la selección curada, genera el enlace de cada destinatario y un bloque de contenido listo
> para copiar, y registra cuándo salió. Redactar el correo, programarlo, enviarlo, gestionar las bajas y
> medir la apertura **pasan a Gmail o HubSpot por decisión del sponsor**. No es un recorte de alcance:
> esas piezas las hace otra herramienta. Mailgun queda para códigos de acceso y avisos internos, no para
> el boletín.

## 0. Por qué esta especificación llega tarde y por qué importa

El PRD dedicó treinta y tantas versiones a especificar el portal. El correo —que es **la fuente de todo su tráfico**— vivía en una sola línea, como supuesto.

Es una asimetría peligrosa: especificamos con enorme detalle el destino sin haber escrito nada sobre el camino. **Si el correo no funciona, nada de lo demás importa.** Un portal excelente al que nadie entra es un portal que no existe. Que el correo salga desde Gmail o HubSpot no cambia eso: cambia qué pieza pone el portal.

## 1. Qué es

Un envío **construido por cuenta**, no un boletín con el mismo contenido para todos. Cada cuenta recibe una selección de perfiles elegida contra el proyecto que Trycore sabe que tiene en curso, con la razón de esa elección declarada.

**No es una campaña de marketing.** Es una propuesta comercial personalizada que usa el correo como vehículo. La diferencia se nota en el tono, en la frecuencia y en qué se hace cuando alguien no entra.

**Reparto de responsabilidades desde el 2026-09-27:**

| Lo pone el portal (panel) | Lo pone la herramienta de envío (Gmail o HubSpot) |
|---|---|
| Selección curada contra el inventario del momento, con su razón | Redacción final del correo y su diseño |
| Enlace curado por destinatario (token opaco, ADR-0002) | Programación y envío |
| Bloque de contenido listo para copiar | Pie con el contacto del ejecutivo y la salida para dejar de recibir |
| Registro de la salida (fecha y herramienta) y vigilancia de la cadencia | Bajas y rebotes |
| Medición de entrada, verificación y solicitud por destinatario | Apertura del correo (solo HubSpot la mide) |
| Exclusión manual de contactos, con motivo | — |

«Envío» o **edición curada** es, en el portal, la unidad que se prepara en el panel para una cuenta: selección, destinatarios, enlaces, bloque y salida registrada.

## 2. Quién lo arma y con qué criterio

| Pieza | Dueño | Insumo |
|---|---|---|
| Selección de perfiles por cuenta | Mercadeo o Talento Humano, con criterio comercial | Proyecto en curso de la cuenta, aportado por el ejecutivo |
| Razón de la selección | Mercadeo | Por qué esos perfiles para ese proyecto |
| Conocimiento del proyecto de la cuenta | Ejecutivo comercial | Es el insumo que nadie más tiene |
| Disponibilidad real | Panel de Talento Humano | En el momento de generar el contenido |
| Envío del correo y registro de la salida | Dueño nominal de la edición | Gmail o HubSpot |

**Si nadie sabe en qué está trabajando la cuenta, no hay curaduría posible.** Ese es el punto de falla del mecanismo, y es humano, no técnico: depende de que el ejecutivo aporte el contexto. Sin contexto, la edición queda en borrador hasta que llegue o hasta que alguien elija de forma explícita un encuadre genérico.

## 3. La regla que evita la decepción

**La selección se arma contra el inventario del momento, desde el panel.**

Una selección armada en una hoja aparte se degrada entre que se arma y que el cliente abre el correo. El cliente entra esperando cuatro perfiles y encuentra tres, o encuentra uno que ya no está disponible. Eso no es un detalle: es la primera impresión del producto.

Antes de generar enlaces y bloque, el panel verifica que cada perfil seleccionado siga publicado y disponible, y advierte de lo que cambió. Si un perfil cambia **después** de generar el bloque, el bloque queda marcado como **desactualizado** y no se puede copiar hasta regenerarlo. El enlace no necesita regenerarse: reevalúa el estado de cada perfil al abrirse (RF-19.2).

## 4. El bloque de contenido para copiar

Por destinatario, el panel genera un bloque que se pega en el cuerpo del correo:

| Elemento | Contenido | Por qué |
|---|---|---|
| **Asunto sugerido** | Referido al proyecto de la cuenta, no al producto | «Tres perfiles para la modernización del core» pesa más que «Boletín de talento» |
| **Apertura** | Una línea que nombra el proyecto y la razón de la selección | Es lo que separa una propuesta de un envío masivo |
| **Perfiles** | Capacidad, competencias verificadas, disponibilidad. **Sin tarifas** (D-9) | Lo mismo que muestra la tarjeta del portal |
| **Llamado** | Un solo enlace: el del destinatario | Un solo destino, y cada entrada atribuida a quien la hizo |

**Formatos de copia:** texto con formato para pegar en Gmail (un correo por destinatario) y **tabla destinatario–enlace** para combinar en HubSpot como propiedad del contacto. El pie (contacto del ejecutivo y salida para dejar de recibir) lo pone la herramienta de envío.

**No se incluye:** fotografías, datos de la lista negra B.4, tarifas, ni promesas de disponibilidad que el banco no sostenga.

## 5. Enlace

Se genera **desde la edición en el panel**: un token opaco por destinatario (modelo único de ADR-0002), ligado a la cuenta, al correo invitado y a la edición. Nadie construye URLs a mano.

- **Se ve al generarse.** El token solo se guarda como huella; el enlace completo se muestra y se copia en ese momento. Si se pierde antes de pegarlo, se **regenera** y el anterior de ese destinatario queda revocado.
- **Destinatario sin cuenta:** se excluye y se reporta; no se genera un enlace sin contexto.
- **Vigencia atada al ciclo de la edición:** un enlace de una edición anterior ya no abre inventario, y quien lo intente encuentra la pantalla de renovación, no un error.
- **Reenviar el enlace no da acceso** (RF-1.2): solo entran los correos invitados.

## 6. Cadencia, dueño y registro de la salida

**Cadencia definida y dueño nominal.** Un canal sin cadencia no produce el hábito que O5 necesita, y un canal sin dueño no sale.

Como el correo sale de Gmail o HubSpot, el portal no sabe que salió hasta que alguien lo dice. Por eso el dueño **registra la salida** en el panel (fecha y herramienta). Con ese registro:

- la edición cuenta como envío para la regla de §7;
- el panel muestra cuándo vence la siguiente edición de la cuenta y avisa al dueño por **correo interno** (Mailgun, aviso interno) cuando se pasa.

La cadencia es una decisión de Mercadeo. El criterio para elegirla: suficientemente frecuente para construir hábito, suficientemente espaciada para que la selección cambie de verdad entre una edición y otra. Enviar lo mismo dos veces destruye la credibilidad de la curaduría más rápido que no enviar.

**Exclusión manual.** El portal no gestiona bajas: la fuente es la herramienta de envío. Quien arma la edición puede marcar a un contacto como excluido, con motivo; a un excluido no se le genera enlace ni bloque hasta que alguien retire la marca.

## 7. Medición, y las conclusiones que hay que distinguir

El portal mide **lo que ocurre en el portal**: entrada por el enlace del destinatario (`enlace_abierto`), verificación del correo (`verificacion_ok`) y solicitud, atribuidas a cuenta, contacto y edición (ADR-0006). **La apertura del correo no la mide el portal**: la mide HubSpot si se envió desde allí; en Gmail no existe. El informe lo dice en lugar de mostrar cero.

| Lo que se observa | Dónde se ve | Qué significa | Qué se hace |
|---|---|---|---|
| **No llega** (rebote) | Gmail o HubSpot | Problema de entregabilidad | Quien distribuye lo registra en el panel; esa edición no cuenta para la regla y se corrige el dato antes de sacar conclusiones comerciales |
| **Llega y no se abre** | Solo HubSpot | Señal comercial, no técnica | Se lee en HubSpot; el portal no lo sabe |
| **Se abre y no se entra** | HubSpot + portal | La selección no le habla | Solo se puede leer si el envío salió por HubSpot; se revisa el criterio de curaduría de esa cuenta |
| **Tres envíos con salida registrada sin entrada** | Portal | Señal comercial | Aviso al ejecutivo con el histórico y cuenta marcada para revisión antes de preparar la siguiente edición |
| **Se entra y no se suman perfiles** | Portal | La propuesta no responde a la necesidad | Se revisa la selección de esa cuenta |
| **Se entra y no se solicita** | Portal | El problema está en el portal o en la oferta | Se mira en el embudo de EP-008 |

Una edición **sin salida registrada** no cuenta como envío y aparece como tal, no como «sin entradas». Confundir estos casos es el error más común de cualquier informe de correo, y lleva a corregir lo que no está roto.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| **El ejecutivo no aporta el contexto del proyecto** | Sin contexto no hay curaduría. La edición de esa cuenta queda en borrador antes que enviar una selección genérica disfrazada de personalizada |
| **La selección se repite entre envíos** | El panel advierte si un perfil ya se propuso a esa cuenta y nadie entró a verlo |
| **Nadie registra la salida** | Sin registro no hay conteo de envíos ni vigilancia de cadencia. El panel muestra las ediciones con enlaces generados y sin salida registrada, y el dueño recibe el aviso de cadencia vencida |
| **El bloque se copia desactualizado** | Un bloque cuyo inventario cambió no se puede copiar hasta regenerarlo |
| **El enlace se pierde antes de pegarlo** | Se regenera; el anterior queda revocado |
| **El correo se lee como publicidad** | Tono de propuesta, un solo llamado, contacto nominal del ejecutivo en el pie que pone la herramienta de envío |
| **La cuenta entra y nunca suma perfiles** | Es señal de que la selección no responde a su necesidad. Se revisa la curaduría, no el asunto del correo |

## 9. Dónde encaja

Formaliza **RF-18** del PRD (v4.14). Épica **EP-011**. Historias **HU-113** a **HU-117**. Arquitectura: ADR-0009 (sin boletín por Mailgun), ADR-0006 (medición por entradas), ADR-0002 (token por destinatario).

Depende de **HU-112** (atribución de sesiones a la edición): sin esa atribución, nada de §7 se puede medir.
