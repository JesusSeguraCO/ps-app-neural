---
artefacto: especificacion-funcional
proyecto: portal-people-service
componente: Correo curado
prd_version: 4.0
version: 1.0
fecha: 2026-09-16
estado: especificado, no construido
epica: EP-011
---

# Especificación — Correo curado

## 0. Por qué esta especificación llega tarde y por qué importa

El PRD dedicó treinta y tantas versiones a especificar el portal. El correo —que es **la fuente de todo su tráfico**— vivía en una sola línea, como supuesto.

Es una asimetría peligrosa: especificamos con enorme detalle el destino sin haber escrito nada sobre el camino. **Si el correo no funciona, nada de lo demás importa.** Un portal excelente al que nadie entra es un portal que no existe.

## 1. Qué es

Un envío **construido por cuenta**, no un boletín con el mismo contenido para todos. Cada cuenta recibe una selección de perfiles elegida contra el proyecto que Trycore sabe que tiene en curso, con la razón de esa elección declarada.

**No es una campaña de marketing.** Es una propuesta comercial personalizada que usa el correo como vehículo. La diferencia se nota en el tono, en la frecuencia y en qué se hace cuando alguien no lo abre.

## 2. Quién lo arma y con qué criterio

| Pieza | Dueño | Insumo |
|---|---|---|
| Selección de perfiles por cuenta | Mercadeo, con criterio comercial | Proyecto en curso de la cuenta, aportado por el ejecutivo |
| Razón de la selección | Mercadeo | Por qué esos perfiles para ese proyecto |
| Conocimiento del proyecto de la cuenta | Ejecutivo comercial | Es el insumo que nadie más tiene |
| Disponibilidad real | Panel de Talento Humano | En el momento de armar el envío |

**Si nadie sabe en qué está trabajando la cuenta, no hay curaduría posible.** Ese es el punto de falla del mecanismo, y es humano, no técnico: depende de que el ejecutivo aporte el contexto.

## 3. La regla que evita la decepción

**La selección se arma contra el inventario del momento del envío, desde el panel.**

Una selección armada en una hoja aparte se degrada entre que se arma y que el cliente abre el correo. El cliente entra esperando cuatro perfiles y encuentra tres, o encuentra uno que ya no está disponible. Eso no es un detalle: es la primera impresión del producto.

Antes de enviar, el sistema verifica que cada perfil seleccionado siga publicado y disponible, y advierte de lo que cambió.

## 4. Estructura del envío

| Elemento | Contenido | Por qué |
|---|---|---|
| **Asunto** | Referido al proyecto de la cuenta, no al producto | «Tres perfiles para la modernización del core» pesa más que «Boletín de talento» |
| **Apertura** | Una línea que nombra el proyecto y la razón de la selección | Es lo que separa una propuesta de un envío masivo |
| **Perfiles** | Capacidad, competencias verificadas, disponibilidad. **Sin tarifas** (D-9) | Lo mismo que muestra la tarjeta del portal |
| **Llamado** | Un enlace al portal, no varios | Un solo destino |
| **Pie** | Contacto del ejecutivo de la cuenta y salida para dejar de recibirlo | Es una propuesta comercial, no una campaña |

**No se incluye:** fotografías, nombres completos sin consentimiento nominal, tarifas, ni promesas de disponibilidad que el banco no sostenga.

## 5. Enlace

Se genera **desde el envío**, con los tokens de personalización de la cuenta y del contacto. Nadie construye URLs a mano.

Lleva: cuenta, contacto, selección curada y contexto del proyecto. Su vigencia va atada al ciclo del envío: un enlace del boletín anterior ya no abre inventario, y quien lo intente encuentra la pantalla de renovación, no un error.

## 6. Cadencia y dueño

**Cadencia definida y dueño nominal.** Un canal sin cadencia no produce el hábito que O5 necesita, y un canal sin dueño no sale.

La cadencia es una decisión de Mercadeo. El criterio para elegirla: suficientemente frecuente para construir hábito, suficientemente espaciada para que la selección cambie de verdad entre un envío y otro. Enviar lo mismo dos veces destruye la credibilidad de la curaduría más rápido que no enviar.

## 7. Medición, y las tres conclusiones que hay que distinguir

Se registra apertura, clic y entrada al portal, atribuidos a cuenta y contacto.

| Lo que se observa | Qué significa | Qué se hace |
|---|---|---|
| **No llega** | Problema de entregabilidad | Se corrige el dato antes de sacar cualquier conclusión comercial |
| **Llega y no se abre** | Señal comercial, no técnica | Tres envíos sin apertura escalan al ejecutivo de la cuenta antes de seguir enviando |
| **Se abre y no se entra** | La selección no le habla | **Es el dato más informativo del mecanismo.** Se revisa el criterio de curaduría de esa cuenta, no el correo |
| **Se entra y no se solicita** | El problema está en el portal o en la oferta | Se mira en el embudo de EP-008 |

Confundir estos cuatro casos es el error más común de cualquier informe de correo, y lleva a corregir lo que no está roto.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| **El ejecutivo no aporta el contexto del proyecto** | Sin contexto no hay curaduría. El envío de esa cuenta se pospone antes que enviar una selección genérica disfrazada de personalizada |
| **La selección se repite entre envíos** | El sistema advierte si un perfil ya se propuso a esa cuenta y no hubo reacción |
| **El correo se lee como publicidad** | Tono de propuesta, un solo llamado, contacto nominal del ejecutivo en el pie |
| **La cuenta abre y nunca entra** | Es señal de que la selección no responde a su necesidad. Se revisa la curaduría, no el asunto del correo |

## 9. Dónde encaja

Formaliza **RF-18** del PRD. Épica **EP-011**. Historias **HU-113** a **HU-117**.

Depende de **HU-112** (atribución de sesiones al envío): sin esa atribución, nada de §7 se puede medir.
