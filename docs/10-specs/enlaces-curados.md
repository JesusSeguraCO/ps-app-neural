---
artefacto: especificacion-funcional
proyecto: portal-people-service
componente: Enlaces curados
prd_version: 4.4
version: 1.0
fecha: 2026-09-16
estado: construido en el prototipo Mid-Fi
epica: EP-001
dueno: Talento Humano
---

# Especificación — Enlaces curados

## 1. Qué resuelve

Talento Humano selecciona un conjunto de perfiles para una cuenta concreta y genera un enlace. El cliente lo abre y ve exactamente esa selección, con la razón por la que se armó.

## 2. La distinción que gobierna todo el diseño: lista, no filtro

Una URL puede llevar dos cosas distintas y no son intercambiables.

| | **Filtros en la URL** | **Lista de códigos en la URL** |
|---|---|---|
| Qué expresa | Los criterios | Los perfiles exactos |
| Al abrirse | Se recalcula | Se resuelve perfil por perfil |
| Ventaja | Siempre al día | **Expresa cualquier conjunto** |
| Límite | **No puede expresar un conjunto heterogéneo** | Queda congelada |

**El caso real es una lista.** Talento Humano quiere enviar un gerente, un desarrollador y un QA. **No existe ningún filtro que devuelva exactamente esos tres**: cualquiera que los incluya a los tres incluye a muchos más.

Por eso el enlace lleva la lista de códigos. La fragilidad de la lista se resuelve en §4, no renunciando a ella.

## 3. Quién lo genera

**Talento Humano.** Es quien conoce la disponibilidad real y quien administra el inventario, y la selección se arma desde el mismo panel donde se ve esa disponibilidad.

*Nota de coordinación:* el contexto del proyecto de la cuenta lo tiene el ejecutivo comercial. Talento Humano genera el enlace, pero **la razón de la selección necesita ese insumo**. Sin él, la razón se vuelve genérica y la curaduría deja de serlo.

## 4. Reevaluación al abrir — la regla que evita el hueco

Un enlace generado hoy se abre dentro de días o semanas. En ese lapso un perfil puede colocarse, pausarse o archivarse.

**Al abrirse, el portal reevalúa el estado de cada código.** Nunca se omite un perfil en silencio: el cliente lo ve con su estado real.

| Estado al abrir | Qué ve el cliente |
|---|---|
| Publicado y disponible | Tarjeta normal |
| Publicado, disponibilidad posterior | Tarjeta con su fecha de liberación |
| Pausado por colocación | Aparte, con *«Colocado en otro proyecto. Se libera el 31 de octubre»* |
| Pausado por otro motivo | Aparte, con el motivo |
| Archivado o inexistente | Aparte, con *«Ya no forma parte del banco»* |

**Un hueco silencioso se lee como desorden; un cambio explicado se lee como control.** Es la misma diferencia entre que falte un perfil y que se explique por qué falta.

## 5. Qué exige el generador antes de emitir

| Requisito | Por qué |
|---|---|
| **Al menos un perfil** | Obvio, pero hay que impedirlo |
| **Una cuenta destinataria** | Un enlace sin cuenta no tiene contexto ni atribución posible |
| **Correos invitados** | Solo esos correos reciben el código de acceso; un correo fuera de la lista no entra, aunque sea de la misma empresa (RF-1.2.7). Se propone el contacto del envío en el CRM; quien genera lo confirma o añade a otras personas |
| **Una razón de la selección** | **Es lo que separa una curaduría de un catálogo.** Sin razón, el cliente recibe una lista |
| **Todos los perfiles publicados** | No se puede enviar lo que no está publicado |
| **Una vigencia** | Atada al ciclo del envío |

## 6. El enlace es un objeto con vida propia

Cada enlace registra: token, cuenta, correos invitados (y las invitaciones aprobadas después, RF-1.2.10), razón, perfiles incluidos, quién lo generó, cuándo, vigencia, aperturas y si fue revocado.

**Sin ese registro, cuando un cliente diga «ustedes me mostraron a Fulano», nadie podría verificarlo.** Y sin las aperturas, el análisis de EP-011 —quién abrió, quién entró— no tiene de dónde salir.

**Revocar** desactiva el enlace sin borrar su historia. El cliente que lo abra encuentra una pantalla que le dice cómo pedir uno nuevo, no un error.

## 7. Consecuencia para el Perfil Objetivo

Si la selección mezcla familias, **el Perfil Objetivo arranca vacío**.

No hay un rol común entre un gerente, un desarrollador y un QA, y deducir uno sería inventar. El panel se llena solo si el cliente después escribe una instrucción. Hasta entonces, la selección se presenta por sí misma.

## 8. Volumen

Para una selección de decenas, la lista cabe en la URL. Por encima de eso, el enlace debe llevar **un token corto que resuelva la lista del lado del servidor**, no los códigos en la dirección. En el prototipo van en la URL para que el mecanismo se pueda ver.

## 9. Dónde encaja

Formaliza **RF-19** del PRD. Épica **EP-001**. Historia **HU-122**.

Se relaciona con **RF-18** (correo curado): el correo es un vehículo para estos enlaces, pero un enlace curado también puede enviarse suelto por el ejecutivo comercial, fuera de la cadencia del boletín.
