---
id: flow-004-armado-de-equipo
epica: EP-004
historias_cubiertas: [HU-080, HU-084, HU-192]
---

# Flow 004 — Armado de equipo

## Resumen

Cómo el cliente suma y quita perfiles de «Mi equipo» con su indicador, y lo que el portal aporta mientras compone. Actor principal: el **Cliente**. Condición de éxito: el cliente arma su equipo en el servidor, ve en todo momento cuántos lleva y ve qué le falta a la composición sin que el portal le imponga una forma.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal

  %% HU-192
  C->>P: Toca «Sumar al equipo» en la tarjeta de un perfil
  %% HU-192
  P-->>C: El indicador «Mi equipo» sube y la tarjeta ofrece «Quitar del equipo»; el conteo sigue al recargar o cambiar de pantalla
  %% HU-192
  C->>P: Toca «Quitar del equipo»
  %% HU-192
  P-->>C: El indicador baja y el perfil sigue en la lista

  %% HU-192
  alt El servidor no puede guardar el equipo
    %% HU-192
    P-->>C: Dice que no se pudo y no cambia el indicador ni el estado de la tarjeta
  end

  %% HU-192
  alt Suma en el banco y vuelve a la selección
    %% HU-192
    P-->>C: El perfil sumado sigue en el equipo aunque no esté en la selección
  end

  %% HU-192
  alt Otro invitado del mismo enlace
    %% HU-192
    P-->>C: Cada invitado arma y ve solo su propio equipo
  end

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
| Sumar al equipo | HU-192 | AC-1 (happy) |
| Quitar del equipo | HU-192 | AC-2 (alterno) |
| Fallo al guardar | HU-192 | AC-3 (error) |
| Banco y vuelta a la selección | HU-192 | AC-4 (edge) |
| Equipos aislados entre invitados | HU-192 | AC-5 (edge) |
| Forma de referencia | HU-084 | AC-1 (happy) |
| Tipo sin composición registrada | HU-084 | AC-2 (error) |
| Vacío señalado | HU-080 | AC-1 (happy) |
| Composición sin patrón | HU-080 | AC-2 (error) |
| Observación ignorada | HU-080 | AC-3 (edge) |
| Referencia descartada | HU-084 | AC-3 (edge) |
| Selección completa | HU-084 | AC-4 (edge) |

## Notas

**El núcleo de la épica ya tiene historia (D88, 2026-10-02).** Sumar y quitar perfiles de «Mi equipo» con su indicador es **HU-192**, de la que depende HU-175 (sumar o quitar desde la ficha, EP-003). Siguen sin historia redactada, dentro de RF-4: la vista de resumen (RF-4.3), el comparador de hasta 3 (RF-4.4) y recuperar el equipo al volver o en otro dispositivo (RF-4.1.2, RF-4.5), que incluye el criterio recibido de EP-001 «ante perfiles archivados, continuar desde Mi equipo». Ver §Deuda de mapa en `docs/02-user-story-map/`.

**D-19 cerró el 2026-09-21: solo los tres tipos de proyecto más frecuentes.** Delivery entrega esas tres composiciones reales; fuera de ellas el portal calla, que es exactamente el ramal de AC-2. La historia queda libre con una dependencia de insumo —una sesión de trabajo con Delivery—, no de decisión. La regla dura se mantiene: composición real o ninguna.
