---
id: flow-004-armado-de-equipo
epica: EP-004
historias_cubiertas: [HU-080, HU-084]
---

# Flow 004 — Armado de equipo

## Resumen

Lo que el portal aporta mientras el cliente compone su equipo. Actor principal: el **Cliente**. Condición de éxito: el cliente ve qué le falta a la composición sin que el portal le imponga una forma.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal

  %% HU-084
  C->>P: Declara el tipo de proyecto en su especificación
  %% HU-084
  P-->>C: Muestra la forma típica del trabajo, en tono informativo

  %% HU-084
  alt Tipo de proyecto sin composición registrada
    %% HU-084
    P-->>C: No muestra ninguna forma de referencia
  end

  %% HU-080
  C->>P: Suma perfiles a Mi equipo
  %% HU-080
  P-->>C: Señala el vacío de la composición en tono informativo

  %% HU-080
  alt Composición sin patrón conocido
    %% HU-080
    P-->>C: Calla en vez de inventar un patrón
  end

  %% HU-080
  alt El cliente ignora la observación
    %% HU-080
    P-->>C: No bloquea el envío ni repite el aviso
  end

  %% HU-084
  alt El cliente descarta la referencia
    %% HU-084
    P-->>C: La retira y no la vuelve a proponer en la sesión
  end

  %% HU-084
  alt Selección ya completa frente a la referencia
    %% HU-084
    P-->>C: Lo confirma sin proponer perfiles adicionales
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Forma de referencia | HU-084 | AC-1 (happy) |
| Tipo sin composición registrada | HU-084 | AC-2 (error) |
| Vacío señalado | HU-080 | AC-1 (happy) |
| Composición sin patrón | HU-080 | AC-2 (error) |
| Observación ignorada | HU-080 | AC-3 (edge) |
| Referencia descartada | HU-084 | AC-3 (edge) |
| Selección completa | HU-084 | AC-4 (edge) |

## Notas

**Este flow diagrama los adornos de la épica, no su núcleo.** Sumar un perfil, quitarlo, ver el contador desde cualquier pantalla y recuperar Mi equipo al volver —RF-4 completo, que es la capability declarada de EP-004— **no tienen historia escrita**. Las dos únicas historias redactadas son las observaciones que el portal hace sobre la composición.

Mientras eso siga así, este flow no cubre el recorrido de la épica: cubre lo que se le añadió encima. Ver §Deuda de mapa en `docs/02-user-story-map/`.

**D-19 cerró el 2026-09-21: solo los tres tipos de proyecto más frecuentes.** Delivery entrega esas tres composiciones reales; fuera de ellas el portal calla, que es exactamente el ramal de AC-2. La historia queda libre con una dependencia de insumo —una sesión de trabajo con Delivery—, no de decisión. La regla dura se mantiene: composición real o ninguna.
