---
id: flow-007-integracion-con-hubspot
epica: EP-007
historias_cubiertas: [HU-102, HU-103, HU-104, HU-105, HU-106, HU-107]
---

# Flow 007 — Integración con HubSpot

## Resumen

De la solicitud enviada al negocio en el pipeline, sin duplicar empresas ni perder solicitudes. Actores: el **Portal**, **HubSpot** y el **Comercial** dueño de la cuenta. Condición de éxito: la oportunidad llega atribuida, nadie tiene que vigilar el pipeline y ninguna falla es silenciosa.

## Diagrama

```mermaid
sequenceDiagram
  participant P as Portal
  participant H as HubSpot
  participant CO as Comercial

  %% HU-104
  P->>H: Resuelve la empresa por dominio antes de crear nada
  %% HU-104
  H-->>P: Devuelve la empresa existente en vez de crear una nueva

  %% HU-104
  alt Contacto nuevo en empresa conocida
    %% HU-104
    H-->>P: Crea el contacto y lo asocia a la empresa existente
  end

  %% HU-104
  alt Dominio de correo distinto al de la cuenta
    %% HU-104
    H-->>P: Marca para revisión en vez de crear una empresa duplicada
  end

  %% HU-102
  P->>H: Crea el negocio en el pipeline propio de la línea
  %% HU-102
  H-->>P: Negocio creado en la etapa de entrada

  %% HU-102
  alt La cuenta ya tiene un negocio abierto
    %% HU-102
    H-->>P: Crea uno nuevo y lo asocia como relacionado
  end

  %% HU-102
  alt Etapa de entrada y pronóstico
    %% HU-102
    H-->>P: La etapa de entrada queda excluida del pronóstico comercial
  end

  %% HU-106
  P->>H: Escribe la propiedad de origen
  %% HU-106
  H-->>CO: Distingue lo que entra por el portal de lo que entra por gestión

  %% HU-106
  alt Origen sin definir
    %% HU-106
    H-->>CO: Bloquea el registro antes que dejar el origen vacío
  end

  %% HU-106
  alt Solicitud dirigida desde el camino del cero
    %% HU-106
    H-->>CO: Origen propio, distinto de la solicitud con perfiles
  end

  %% HU-103
  H->>CO: Notifica al dueño de la cuenta
  %% HU-103
  CO-->>H: Abre el negocio sin vigilar el pipeline

  %% HU-103
  alt Nadie abre el negocio
    %% HU-103
    H->>CO: Escala al superior tras el plazo definido
  end

  %% HU-103
  alt Sigue sin moverse
    %% HU-103
    H->>CO: Segundo escalamiento, la solicitud no se queda quieta
  end

  %% HU-105
  alt La creación en HubSpot falla
    %% HU-105
    P->>P: Encola y reintenta sin perder la solicitud
  end

  %% HU-105
  alt El reintento también falla
    %% HU-105
    P->>CO: Alerta con los datos completos para carga manual
  end

  %% HU-105
  alt El negocio se creó pero la respuesta se perdió
    %% HU-105
    P->>H: Verifica por idempotencia antes de reintentar
  end

  %% HU-107
  CO->>H: Agenda la alineación con su enlace de la herramienta de reuniones
  %% HU-107
  H-->>CO: Llena engagements_last_meeting_booked del contacto (D92)
  %% HU-107
  P->>H: Lectura diaria del worker sobre los contactos de solicitudes sin «agendada el»
  %% HU-107
  H-->>P: Devuelve la fecha; el portal guarda «agendada el» y calcula O3 en días hábiles T-4

  %% HU-107
  alt Envío y agendamiento en días distintos, con fin de semana o festivo
    %% HU-107
    P->>P: Cuenta días hábiles cruzados, enteros (mismo día = 0; el festivo no cuenta)
  end

  %% HU-107
  alt Se reagenda con la herramienta de reuniones
    %% HU-107
    H-->>P: Devuelve una fecha posterior; el portal conserva la primera y O3 no cambia
  end

  %% HU-107
  alt Fecha vacía o anterior al envío (agendado por fuera o reunión previa)
    %% HU-107
    P->>P: La solicitud figura «sin alineación agendada», con sus días desde el envío
  end

  %% HU-107
  alt HubSpot no responde a la lectura diaria
    %% HU-107
    P->>P: Conserva las fechas guardadas, marca la lectura fallida y reintenta; si no completa en el día, avisa al responsable técnico
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Resolver empresa por dominio | HU-104 | AC-1 (happy) |
| Contacto nuevo en empresa conocida | HU-104 | AC-2 (error) |
| Dominio distinto | HU-104 | AC-3 (edge) |
| Crear el negocio | HU-102 | AC-1 (happy) |
| Negocio abierto previo | HU-102 | AC-2 (error) |
| Etapa de entrada y pronóstico | HU-102 | AC-3 (edge) |
| Propiedad de origen | HU-106 | AC-1 (happy) |
| Origen sin definir | HU-106 | AC-2 (error) |
| Solicitud dirigida | HU-106 | AC-3 (edge) |
| Notificación al dueño | HU-103 | AC-1 (happy) |
| Nadie abre | HU-103 | AC-2 (error) |
| Sigue sin moverse | HU-103 | AC-3 (edge) |
| Cola de reintento | HU-105 | AC-1 (happy) |
| Reintento fallido | HU-105 | AC-2 (error) |
| Respuesta perdida | HU-105 | AC-3 (edge) |
| Lectura diaria de la fecha de agendado | HU-107 | AC-1 (happy) |
| Días hábiles cruzados, sin fracción (D91) | HU-107 | AC-2 (edge, esquema) |
| Reagendamiento conserva la primera fecha | HU-107 | AC-3 (edge) |
| Sin agendamiento medible | HU-107 | AC-4 (edge) |
| HubSpot no responde a la lectura diaria | HU-107 | AC-5 (error) |

## Notas

**Esta épica quedó desbloqueada el 2026-09-15.** D-6 y D-7 se cerraron en el PRD v3.0: negocio en pipeline propio de la línea con propiedad de origen, y negocio nuevo asociado como relacionado cuando la cuenta ya tiene uno abierto. `epicas.md` la seguía marcando como bloqueada hasta la v4.0 de ese documento.

**HU-105 acompaña obligatoriamente a HU-102.** Sin cola de reintento el modo de falla es silencioso: la oportunidad se pierde y el cliente cree que lo ignoraron.

**HU-107 es el único registro del tramo de O3.** Al usar las etapas del pipeline comercial vigente (D-21), la alineación no tiene etapa propia y la fecha de agendado es lo único que la mide. **Alineado con HU-107 el 2026-10-02 (D91, D92):** la fecha ya no la escribe Coordinación de Servicio ni la marca el workflow; es `engagements_last_meeting_booked` del contacto, que llena la herramienta de reuniones de HubSpot, y la lee a diario el worker del portal. Lo agendado fuera de la herramienta no se mide (riesgo aceptado).
