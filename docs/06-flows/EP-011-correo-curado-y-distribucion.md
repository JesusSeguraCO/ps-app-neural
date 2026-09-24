---
id: flow-011-correo-curado-y-distribucion
epica: EP-011
historias_cubiertas: [HU-113, HU-114, HU-115, HU-116, HU-117]
---

# Flow 011 — Correo curado y distribución

## Resumen

La fuente de todo el tráfico del portal. Actor principal: **Mercadeo**, con Talento Humano como dueña de la disponibilidad. Condición de éxito: cada cuenta recibe una selección construida para su proyecto, con enlace generado desde el envío, y la falta de apertura se lee como señal comercial.

## Diagrama

```mermaid
sequenceDiagram
  participant M as Mercadeo
  participant P as Panel
  participant CO as Comercial

  %% HU-113
  M->>P: Arma la selección de perfiles de una cuenta desde el panel
  %% HU-113
  P-->>M: Muestra la disponibilidad real en ese momento

  %% HU-113
  alt Un perfil seleccionado cambia antes del envío
    %% HU-113
    P-->>M: Avisa antes de enviar, la curaduría se genera contra el inventario del momento
  end

  %% HU-113
  alt La cuenta no tiene proyecto conocido
    %% HU-113
    P-->>M: Exige la razón de la selección igual, no emite sin ella
  end

  %% HU-114
  M->>P: Genera el enlace de cada contacto
  %% HU-114
  P-->>M: Usa los tokens de personalización, nadie construye URLs a mano

  %% HU-114
  alt Contacto sin cuenta asociada
    %% HU-114
    P-->>M: No emite el enlace y señala el contacto
  end

  %% HU-114
  alt Vigencia
    %% HU-114
    P-->>M: Cada enlace nace con vigencia configurable y es revocable
  end

  %% HU-115
  M->>P: Programa y envía el boletín
  %% HU-115
  P-->>M: Envío programado con cadencia y dueño nominal

  %% HU-115
  alt Selección incompleta
    %% HU-115
    P-->>M: Bloquea el envío, no manda un correo sin perfiles
  end

  %% HU-115
  alt Cuenta que pidió no recibir
    %% HU-115
    P-->>M: La excluye del envío
  end

  %% HU-116
  P-->>M: Registra apertura, clic y entrada al portal por cuenta y contacto

  %% HU-116
  alt Envío sin datos de apertura
    %% HU-116
    P-->>M: Lo declara como dato ausente, no como cero aperturas
  end

  %% HU-116
  alt Entra sin abrir
    %% HU-116
    P-->>M: Registra la entrada igual, el enlace pudo llegar por reenvío
  end

  %% HU-117
  alt Una cuenta nunca abre en tres envíos
    %% HU-117
    P->>CO: Escala al ejecutivo de la cuenta antes de seguir enviando
  end

  %% HU-117
  alt Problema de entregabilidad
    %% HU-117
    P-->>M: Lo distingue del desinterés, no escala una señal falsa
  end

  %% HU-117
  alt Abre pero nunca entra
    %% HU-117
    P->>CO: Señal distinta, el correo llega y la propuesta no convence
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Armar la selección | HU-113 | AC-1 (happy) |
| Perfil cambiado antes del envío | HU-113 | AC-2 (error) |
| Cuenta sin proyecto conocido | HU-113 | AC-3 (edge) |
| Generar enlaces | HU-114 | AC-1 (happy) |
| Contacto sin cuenta | HU-114 | AC-2 (error) |
| Vigencia | HU-114 | AC-3 (edge) |
| Programar y enviar | HU-115 | AC-1 (happy) |
| Selección incompleta | HU-115 | AC-2 (error) |
| Cuenta que pidió no recibir | HU-115 | AC-3 (edge) |
| Apertura y entrada | HU-116 | AC-1 (happy) |
| Envío sin datos | HU-116 | AC-2 (error) |
| Entra sin abrir | HU-116 | AC-3 (edge) |
| Cuenta que nunca abre | HU-117 | AC-1 (happy) |
| Entregabilidad | HU-117 | AC-2 (error) |
| Abre y no entra | HU-117 | AC-3 (edge) |

## Notas

**Esta épica entró en el PRD v4.0** como cierre de hueco: el correo curado era la fuente de todo el tráfico y vivía en el PRD como supuesto. Especificación completa en `docs/10-specs/correo-curado.md`.

**RF-18.4 es la regla que evita la decepción.** La curaduría se genera contra el inventario del momento del envío. Una selección fija se degrada entre que se arma y que el cliente abre, y el cliente encuentra menos perfiles de los que le prometimos.

**HU-117 convierte una métrica en una acción comercial.** Una cuenta que nunca abre en tres envíos no es un fallo de entregabilidad: es una señal que se escala al ejecutivo antes de seguir enviando. Por eso AC-2 existe — hay que descartar primero el problema técnico.

**Relación con RF-19 (enlaces curados, HU-122 en EP-001).** El correo es distribución masiva programada; el enlace curado es una emisión puntual de Talento Humano para una cuenta. Comparten el mecanismo del enlace y no el disparador. Ver `docs/10-specs/enlaces-curados.md`.
