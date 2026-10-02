---
id: flow-011-correo-curado-y-distribucion
epica: EP-011
historias_cubiertas: [HU-233, HU-229, HU-232, HU-113, HU-114, HU-115, HU-230, HU-231, HU-116, HU-117]
---

# Flow 011 — Correo curado y distribución

## Resumen

La fuente de todo el tráfico del portal. Actores: **Talento Humano** (administración de inventario, concede el permiso), **Mercadeo** (prepara las ediciones con el permiso «Envíos»), el **Panel** y **Comercial** (recibe el aviso de la cuenta que no entra). **El portal no compone, no programa ni envía el boletín** (decisión del sponsor del 2026-09-27, PRD v4.14, RF-18): el panel abre la edición curada de una cuenta, arma la selección, genera el enlace de cada destinatario y un bloque de contenido listo para copiar; el correo sale desde Gmail o HubSpot y el panel registra la salida. Condición de éxito: cada cuenta recibe una selección construida para su proyecto, con un enlace propio por destinatario, la cadencia se vigila y la falta de entradas por el enlace se lee como señal comercial.

## Diagrama

```mermaid
sequenceDiagram
  participant TH as Talento Humano
  participant M as Mercadeo
  participant P as Panel
  participant CO as Comercial

  %% HU-233
  TH->>P: Concede a una persona observadora el permiso «Envíos»
  %% HU-233
  P-->>TH: La lista de acceso muestra el rol y el permiso; la concesión queda en auditoría

  %% HU-233
  alt Se le quita el permiso con una selección abierta
    %% HU-233
    P-->>M: Su siguiente escritura en Envíos se rechaza explicando el permiso; sigue consultando
  end

  %% HU-233
  alt Un observador sin permiso escribe por una dirección directa
    %% HU-233
    P-->>M: Rechazo explicado, sin crear nada
  end

  %% HU-229
  M->>P: Crea la edición de una cuenta con proyecto, ejecutivo y destinatarios
  %% HU-229
  P-->>M: Edición en «borrador» bajo su mes, con dueña nominal y auditoría

  %% HU-229
  alt Ejecutivo fuera de @trycore.com o ya hay una edición sin enviar
    %% HU-229
    P-->>M: Rechaza y explica; ofrece abrir la edición pendiente
  end

  %% HU-229
  alt Prepara la siguiente desde la anterior
    %% HU-229
    P-->>M: Copia proyecto, ejecutivo y destinatarios, sin la selección
  end

  %% HU-232
  M->>P: Excluye a un contacto con su motivo
  %% HU-232
  P-->>M: Queda en la lista de excluidos, sin enlace ni bloque, también en las ediciones siguientes

  %% HU-232
  alt Excluir sin motivo
    %% HU-232
    P-->>M: Pide el motivo y no marca
  end

  %% HU-113
  M->>P: Guarda la selección y la razón contra el inventario del momento
  %% HU-113
  P-->>M: Edición «lista» con los perfiles en orden y su razón

  %% HU-113
  alt Perfil no publicado o selección sin razón
    %% HU-113
    P-->>M: No guarda y dice qué falta
  end

  %% HU-113
  alt Cuenta sin proyecto conocido o perfil ya propuesto sin reacción
    %% HU-113
    P-->>M: No inventa la razón; avisa del perfil repetido
  end

  %% HU-114
  M->>P: Genera enlaces y contenido
  %% HU-114
  P-->>M: Un enlace propio por destinatario, mostrado una sola vez; la base guarda solo su huella

  %% HU-114
  alt Un perfil cambió o a la edición le falta algo
    %% HU-114
    P-->>M: No genera y dice qué corregir
  end

  %% HU-114
  alt Perdió un enlace antes de pegarlo
    %% HU-114
    P-->>M: Lo regenera y revoca el anterior de ese destinatario
  end

  %% HU-115
  M->>P: Copia el bloque de un destinatario
  %% HU-115
  P-->>M: Texto con formato para Gmail o tabla destinatario–enlace para HubSpot, sin lista negra ni tarifas

  %% HU-115
  alt El inventario cambió después de generar el bloque
    %% HU-115
    P-->>M: Marca el bloque desactualizado y no deja copiarlo
  end

  %% HU-230
  M->>P: Registra la salida con fecha, herramienta y destinatarios
  %% HU-230
  P-->>M: Edición «enviada»; la cuenta cuenta como contactada en el trimestre (HU-171)

  %% HU-230
  alt Sin enlaces generados o fecha imposible
    %% HU-230
    P-->>M: Rechaza y explica
  end

  %% HU-230
  alt Salió solo a una parte o se registró por error
    %% HU-230
    P-->>M: Registra solo esos destinatarios; la anulación queda en auditoría
  end

  %% HU-231
  M->>P: Abre Envíos
  %% HU-231
  P-->>M: Cuándo vence la siguiente edición de cada cuenta, con su dueña nominal

  %% HU-231
  alt Se pasó la cadencia o hay enlaces que nadie registró como enviados
    %% HU-231
    P-->>M: Aviso interno a la dueña; la edición sin salida se señala
  end

  %% HU-116
  M->>P: Abre el seguimiento de una edición con salida registrada
  %% HU-116
  P-->>M: Entrada por el enlace, verificación del correo y solicitud por destinatario

  %% HU-116
  alt Apertura del correo
    %% HU-116
    P-->>M: «No la mide el portal», nunca un cero
  end

  %% HU-116
  alt Entra otro invitado del mismo enlace o entra sin sumar perfiles
    %% HU-116
    P-->>M: Atribuye la entrada con su propio contacto; señala que entró sin sumar
  end

  %% HU-117
  alt Tres ediciones con salida registrada sin ninguna entrada
    %% HU-117
    P->>CO: Aviso interno con el histórico; la cuenta queda marcada para revisión
  end

  %% HU-117
  alt Posible problema de entrega o ediciones sin salida registrada
    %% HU-117
    P-->>M: Se corrige el destinatario antes de escalar; sin salida no cuenta como envío
  end
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Conceder el permiso «Envíos» | HU-233 | AC-1 (happy) · AC-4 (edge, tabla de quién puede qué) |
| Quitar el permiso | HU-233 | AC-2 (edge) |
| Escritura sin permiso | HU-233 | AC-3 (error) |
| Abrir la edición | HU-229 | AC-1 (happy) |
| Ejecutivo externo / edición pendiente | HU-229 | AC-2 y AC-5 (error) |
| Preparar desde la anterior | HU-229 | AC-4 (edge) |
| Excluir un contacto | HU-232 | AC-1 (happy) · AC-3 (edge) |
| Excluir sin motivo | HU-232 | AC-2 (error) |
| Armar la selección | HU-113 | AC-1 (happy) |
| No publicado / sin razón | HU-113 | AC-2 y AC-3 (error) |
| Sin proyecto / ya propuesto | HU-113 | AC-4 y AC-5 (edge) |
| Generar enlaces | HU-114 | AC-1 (happy) |
| Perfil cambió / falta algo | HU-114 | AC-2 y AC-3 (error) |
| Enlace perdido | HU-114 | AC-4 (edge) |
| Copiar el bloque | HU-115 | AC-1 (happy) · AC-2 y AC-4 (edge) |
| Bloque desactualizado | HU-115 | AC-3 (error) |
| Registrar la salida | HU-230 | AC-1 (happy) |
| Sin enlaces / fecha imposible | HU-230 | AC-3 y AC-4 (error) |
| Salida parcial / anulación | HU-230 | AC-2 y AC-5 (edge) |
| Vencimiento de la cadencia | HU-231 | AC-1 (happy) |
| Aviso al pasarse / enlaces sin salida | HU-231 | AC-2 (edge) · AC-4 (error) |
| Seguimiento | HU-116 | AC-1 (happy) |
| Apertura no medida | HU-116 | AC-2 (error) |
| Otro invitado / entra sin sumar | HU-116 | AC-4 y AC-5 (edge) |
| Tres envíos sin entrar | HU-117 | AC-1 (happy) |
| Entrega / sin salida | HU-117 | AC-3 (error) · AC-4 (edge) |

## Notas

**Discovery 2026-10-02.** La épica pasa de 5 a 10 historias: nacen **HU-229** (abrir la edición), **HU-230** (registrar la salida, antes dentro de HU-115), **HU-231** (cadencia), **HU-232** (exclusión de un contacto, antes dentro de HU-115) y **HU-233** (permiso «Envíos»). **D129** (elegida por el modelo por delegación del sponsor): el permiso es por persona, como «Medición» (D74) y «Validar composiciones» (D99), y enmienda RF-8.1.2 en el PRD v4.18: el observador no escribe salvo con un permiso explícito por persona. Así Mercadeo prepara las ediciones sin el rol que escribe el inventario.

**Decisión del sponsor del 2026-09-27 (PRD v4.14).** Redactar el correo, programarlo, enviarlo, gestionar las bajas y medir la apertura pasan a Gmail o HubSpot; no es un recorte de alcance. El panel entrega la selección, el enlace de cada destinatario y el bloque para copiar, y mide lo que ocurre en el portal: entradas por enlace, verificación y solicitud. Mailgun queda solo para códigos de acceso y avisos internos.

**RF-18.4 es la regla que evita la decepción.** La curaduría se genera contra el inventario del momento en que se genera el contenido; si un perfil cambia después, el bloque se marca desactualizado y el enlace reevalúa cada perfil al abrirse (RF-19.2).

**HU-117 convierte una métrica en una acción comercial.** Una cuenta que no entra en tres envíos con salida registrada es una señal que se avisa al ejecutivo antes de preparar la siguiente edición; primero se descarta el problema de entrega.

**Relación con RF-19 (enlaces curados, HU-122 en EP-001).** La edición curada genera un enlace por destinatario para cada ciclo; el enlace curado es una emisión puntual de Talento Humano para una cuenta. Ambos los emite el panel con el mismo mecanismo de token opaco (ADR-0002). Ver `docs/10-specs/enlaces-curados.md`.

**AC no diagramados:** HU-114 AC-5 (enlace de una edición vencida), HU-115 AC-5, HU-116 AC-3, HU-117 AC-2 y AC-5, HU-229 AC-3, HU-231 AC-3 y AC-5, HU-232 AC-4 y AC-5.
