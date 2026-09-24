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
  CO->>H: Registra la fecha de la sesión de alineación
  %% HU-107
  H-->>CO: Propiedad de fecha escrita, O3 queda medible

  %% HU-107
  alt Se agenda por fuera del portal
    %% HU-107
    CO->>H: La fecha se escribe igual, a mano
  end

  %% HU-107
  alt Se reagenda
    %% HU-107
    H-->>CO: Conserva la primera fecha y registra la nueva
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
| Fecha de alineación | HU-107 | AC-1 (happy) |
| Agendado por fuera | HU-107 | AC-2 (error) |
| Reagendamiento | HU-107 | AC-3 (edge) |

## Notas

**Esta épica quedó desbloqueada el 2026-09-15.** D-6 y D-7 se cerraron en el PRD v3.0: negocio en pipeline propio de la línea con propiedad de origen, y negocio nuevo asociado como relacionado cuando la cuenta ya tiene uno abierto. `epicas.md` la seguía marcando como bloqueada hasta la v4.0 de ese documento.

**HU-105 acompaña obligatoriamente a HU-102.** Sin cola de reintento el modo de falla es silencioso: la oportunidad se pierde y el cliente cree que lo ignoraron.

**HU-107 es el único registro del tramo de O3.** Al usar las etapas del pipeline comercial vigente (D-21), la alineación no tiene etapa propia y la propiedad de fecha de RF-9.1.3 es lo único que la mide.
