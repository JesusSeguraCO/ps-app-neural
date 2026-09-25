---
id: flow-001-acceso-y-aterrizaje-curado
epica: EP-001
historias_cubiertas: [HU-090, HU-091, HU-092, HU-093, HU-094, HU-095, HU-122, HU-144]
---

# Flow 001 — Acceso y aterrizaje curado

## Resumen

Del clic en el correo al conjunto curado a la vista. Actor principal: el **Cliente** —líder de área o de proyecto que recibió el correo—. Condición de éxito: entra sin registro, supera la verificación de dominio y ve los mismos perfiles del correo con su razón declarada.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal
  participant TH as Talento Humano

  %% HU-122
  TH->>P: Genera enlace con lista de códigos y razón declarada
  %% HU-122
  P-->>TH: Enlace emitido con vigencia y registro

  %% HU-090
  C->>P: Abre el enlace del correo
  %% HU-090
  P-->>C: Pide correo corporativo y envía código de un uso
  %% HU-090
  C->>P: Introduce el código
  %% HU-090
  P-->>C: Entra sin usuario ni contraseña, saluda por cuenta

  %% HU-091
  P-->>C: Muestra el conjunto curado con su razón, sin pasos intermedios

  %% HU-144
  C->>P: Abre un enlace curado
  %% HU-144
  P-->>C: Muestra la selección con su razón y el panel de especificación vacío

  %% HU-144
  alt Un perfil cambió entre generar y abrir
    %% HU-144
    P-->>C: Reevalúa cada código y muestra el estado real, nunca omite en silencio
  end

  %% HU-144
  alt Enlace curado revocado
    %% HU-144
    P-->>C: Explica cómo pedir uno nuevo, no muestra inventario ni error
  end

  %% HU-091
  alt Un perfil de la selección ya no está disponible
    %% HU-091
    P-->>C: Muestra los demás e indica el cambio de disponibilidad
  end

  %% HU-090
  alt Enlace manipulado
    %% HU-090
    P-->>C: No muestra inventario y ofrece solicitar uno nuevo
  end

  %% HU-092
  alt Enlace vencido o revocado
    %% HU-092
    C->>P: Solicita renovación
    %% HU-092
    P-->>C: Pantalla de renovación con contacto, nunca error crudo
  end

  %% HU-093
  alt Enlace sin parámetros de curaduría
    %% HU-093
    P-->>C: Encuadra el estándar antes del primer resultado
  end

  %% HU-094
  C->>P: Amplía la búsqueda al banco completo
  %% HU-094
  C->>P: Vuelve a la selección en un clic
  %% HU-094
  P-->>C: Restituye el conjunto curado con su razón

  %% HU-095
  C->>P: Pide invitar a un colega
  %% HU-095
  P-->>C: Talento Humano aprueba y el colega entra con su correo y código

  %% HU-095
  alt El enlace llega a alguien no invitado
    %% HU-095
    P-->>C: Un correo no invitado no recibe código ni ve perfiles
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Generar enlace curado | HU-122 | AC-1 (happy) · AC-2 y AC-3 (error) |
| Abrir el enlace curado | HU-144 | AC-1 (happy) |
| Abrir, verificar y entrar | HU-090 | AC-1 (happy) |
| Ver el conjunto curado | HU-091 | AC-1 (happy) |
| Perfil cambiado desde el envío | HU-144 | AC-3 (edge) |
| Perfil no disponible en la selección | HU-091 | AC-2 (error) |
| Enlace manipulado | HU-090 | AC-2 (error) |
| Enlace vencido o revocado | HU-092 | AC-1 (happy) · HU-144 AC-2 (error) |
| Aterrizaje sin curaduría | HU-093 | AC-1 (happy) |
| Ampliar y volver | HU-094 | AC-1 (happy) |
| Invitar a un colega | HU-095 | AC-1 (happy) |
| Colega sin invitación | HU-095 | AC-2 (error) |

## Notas

**El acceso es nominal (D-4 revisada el 2026-09-25).** Solo entran los correos invitados en el enlace. Reenviarlo no da acceso: la segunda opinión de un colega pasa por una invitación que aprueba Talento Humano (HU-095, RF-1.2.10). *Antes*, la verificación por dominio permitía el reenvío interno libre.

**HU-122 se dividió el 2026-09-22.** Tenía seis escenarios y dos happy paths con **actores distintos** — Talento Humano generando el enlace y el cliente abriéndolo. Cuando los happy paths cambian de actor, el corte está ahí: lo que el cliente ve al abrir es ahora **HU-144**.

**AC no representados en el diagrama.** HU-090 AC-3 (exclusión de rastreadores), HU-092 AC-2 y AC-3, HU-093 AC-2 y AC-3, HU-094 AC-2 y AC-3, HU-095 AC-2: son reglas de estado o de contenido sin arco de navegación propio. Viven en los AC de su historia.
