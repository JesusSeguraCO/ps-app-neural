---
id: flow-002-refinamiento-y-descubrimiento
epica: EP-002
historias_cubiertas: [HU-219, HU-220, HU-074, HU-223, HU-222, HU-121, HU-250, HU-221, HU-226, HU-019, HU-020, HU-224, HU-225]
---

# Flow 002 — Refinamiento y descubrimiento del banco

## Resumen

Lo que el cliente hace **después** de que la instrucción devolvió resultados, o sobre el banco completo: facetas combinables con contadores, etiquetas de filtro activo, orden, vista de tabla con selección múltiple y estado compartible por URL; además, el sondeo de agentes autónomos y el único espacio no-perfil del grid. Actores: el **Cliente**, el **Portal**, **HubSpot** (votos del sondeo) y **Mercadeo** (lectura del umbral). Condición de éxito: el cliente acota o amplía el conjunto sin perder lo que la instrucción entendió, sale de un cero causado por sus filtros sin adivinar, compara muchos perfiles por el mismo criterio y puede compartir exactamente lo que ve.

## Diagrama

```mermaid
sequenceDiagram
  participant C as Cliente
  participant P as Portal
  participant H as HubSpot
  participant M as Mercadeo

  %% HU-219
  C->>P: Marca valores en dos facetas
  %% HU-219
  P-->>C: Acota por facetas distintas, suma dentro de una faceta y muestra cuántos perfiles deja cada opción

  %% HU-219
  alt Una opción no deja ningún perfil con lo ya marcado
    %% HU-219
    P-->>C: La opción muestra 0 y se puede marcar igual
  end

  %% HU-219
  alt Llega desde la pregunta de encuadre
    %% HU-219
    P-->>C: El filtro elegido aparece ya marcado
  end

  %% HU-220
  C->>P: Quita un filtro desde su etiqueta
  %% HU-220
  P-->>C: La etiqueta desaparece y los resultados se recalculan

  %% HU-220
  C->>P: Quita todos los filtros
  %% HU-220
  P-->>C: Sin filtros no hay barra de etiquetas

  %% HU-220
  alt Un valor activo ya no tiene perfiles publicados
    %% HU-220
    P-->>C: La etiqueta lo dice y se puede quitar
  end

  %% HU-074
  C->>P: Añade un filtro sobre el resultado de la instrucción
  %% HU-074
  P-->>C: Acota sin tocar la instrucción y lo dice en la etiqueta

  %% HU-074
  alt El filtro añadido deja cero
    %% HU-074
    P-->>C: La instrucción sí tiene perfiles; quitar el filtro de un toque
  end

  %% HU-074
  alt Filtrar sin instrucción previa
    %% HU-074
    P-->>C: Las facetas operan sobre el banco completo
  end

  %% HU-223
  C->>P: Combina filtros que dejan cero perfiles
  %% HU-223
  P-->>C: Dice qué filtro deja fuera a los perfiles y cuántos recupera cada uno

  %% HU-223
  C->>P: Quita el filtro que recupera perfiles
  %% HU-223
  P-->>C: Vuelven los perfiles

  %% HU-223
  alt Ningún filtro por sí solo recupera perfiles o el valor no existe hoy
    %% HU-223
    P-->>C: Lo dice sin culpar al banco y ofrece quitar todos o pedir a medida (HU-228)
  end

  %% HU-222
  C->>P: Ordena por disponibilidad más próxima o por seniority
  %% HU-222
  P-->>C: Reordena; los empates siempre en el mismo orden y los sin seniority al final

  %% HU-121
  C->>P: Conmuta de tarjetas a tabla
  %% HU-121
  P-->>C: Una columna por criterio activo; en teléfono las columnas que no caben se desplazan dentro de la tabla, sin desplazar la página de lado

  %% HU-121
  alt Sin criterios activos o cero perfiles
    %% HU-121
    P-->>C: La tabla muestra los atributos base o el aviso de cero, nunca vacía
  end

  %% HU-121
  C->>P: Abre un perfil desde la tabla
  %% HU-121
  P-->>C: La ficha recorre la tabla en su orden y vuelve a ella

  %% HU-250
  C->>P: Marca varios perfiles y pulsa sumar a Mi equipo
  %% HU-250
  P-->>C: Los suma de una vez y dice cuántos

  %% HU-250
  alt Uno de los marcados dejó de estar publicado
    %% HU-250
    P-->>C: Suma el resto y dice cuál no entró y por qué
  end

  %% HU-221
  C->>P: Copia el enlace de lo que ve
  %% HU-221
  P-->>C: Enlace con filtros, orden, vista, ámbito y ficha abierta

  %% HU-221
  alt Valores o parámetros desconocidos, o estado demasiado largo
    %% HU-221
    P-->>C: Ignora lo desconocido sin error; el estado largo viaja en un token ligado a la cuenta
  end

  %% HU-226
  P-->>C: Con 8 o más resultados, un solo espacio no-perfil en posición fija que no cuenta como perfil

  %% HU-019
  C->>P: Vota sí o pide más detalle en la pregunta de agentes autónomos
  %% HU-019
  P-->>C: Agradece y no vuelve a preguntar

  %% HU-019
  alt El voto no se pudo guardar
    %% HU-019
    P-->>C: Lo dice y deja reintentar
  end

  %% HU-020
  C->>P: Descarta la pregunta
  %% HU-020
  P-->>C: No vuelve en visitas siguientes, desde ningún dispositivo del invitado

  %% HU-224
  P->>H: Envía el voto atribuido a la cuenta y al contacto, sin duplicar en reintentos
  %% HU-224
  alt HubSpot no responde
    %% HU-224
    P->>P: El voto queda en cola; el cliente no ve el fallo
  end

  %% HU-225
  M->>P: Abre la lectura del sondeo
  %% HU-225
  P-->>M: Cuentas con sí y que piden detalle frente al umbral de D-11, en el plazo de 3 ediciones
```

## Trazabilidad

| Paso | HU | AC |
|---|---|---|
| Combinar facetas con contadores | HU-219 | AC-1 y AC-2 (happy) |
| Opción con 0 | HU-219 | AC-3 (error) |
| Desde el encuadre | HU-219 | AC-5 (edge) |
| Quitar un filtro | HU-220 | AC-1 (happy) |
| Quitar todos | HU-220 | AC-2 (happy) · AC-5 (edge) |
| Valor sin perfiles | HU-220 | AC-3 (error) |
| Filtro sobre la instrucción | HU-074 | AC-1 (happy) |
| Cero del filtro, no de la instrucción | HU-074 | AC-3 (error) |
| Sin instrucción previa | HU-074 | AC-4 (edge) |
| Qué filtro deja fuera | HU-223 | AC-1 (happy) |
| Quitar el que recupera | HU-223 | AC-2 (happy) |
| Ningún filtro recupera / valor inexistente | HU-223 | AC-3 (error) · AC-4 y AC-5 (edge) |
| Ordenar | HU-222 | AC-1 y AC-2 (happy) · AC-3 (error) · AC-5 (edge) |
| Conmutar a tabla (teléfono: desplazamiento en su contenedor) | HU-121 | AC-1 (happy) |
| Tabla nunca vacía | HU-121 | AC-2 (error) · AC-3 (edge) |
| Ficha desde la tabla | HU-121 | AC-4 (edge) |
| Selección múltiple | HU-250 | AC-1 (happy) |
| Marcado no publicado | HU-250 | AC-2 (error) |
| Copiar el enlace | HU-221 | AC-1 (happy) · AC-5 (edge) |
| Desconocidos y estado largo | HU-221 | AC-2 (error) · AC-4 (edge) |
| Espacio no-perfil | HU-226 | AC-1 (happy) · AC-2 (edge) |
| Votar | HU-019 | AC-2 (happy) · AC-3 (alterno) |
| Voto no guardado | HU-019 | AC-4 (error) |
| Descartar | HU-020 | AC-1 (happy) · AC-2 (edge) |
| Voto a HubSpot | HU-224 | AC-1 y AC-2 (happy) · AC-4 (edge) |
| HubSpot no responde | HU-224 | AC-3 (error) |
| Lectura del umbral | HU-225 | AC-1 (happy) · AC-2 (edge) |

## Notas

**Discovery 2026-10-02.** La épica pasa de 2 a 13 historias: nacen HU-019 y HU-020 (sondeo, con los identificadores que el mapa reservaba), HU-219 a HU-226 (facetas, etiquetas, URL, orden, cero por filtros, voto a HubSpot, umbral y espacio no-perfil) y HU-250 (selección múltiple, partida de HU-121 por INVEST; D112). **La tabla en teléfono no degrada a tarjetas:** las columnas que no caben se desplazan dentro de su contenedor, sin desplazar la página de lado, como dice el PRD (RF-13.12); el diagrama anterior decía lo contrario y se corrige. La salida «pedir el perfil a medida» del cero por filtros se cablea con EP-010 vía HU-228 (D128, HU-223). El descarte y el voto del sondeo se guardan en el servidor por invitado y la URL gana Categoría, Sector, Disponibilidad y orden: enmienda 2026-10-02 de ADR-0004.

**Esta épica contiene la prueba que puede tumbar la Fase 2.** Si más de la mitad de las sesiones usa filtros después de haber escrito una instrucción, la subordinación de las facetas está mal hecha (PRD §14.2). El flujo se diagrama como refinamiento, no como entrada: si la medición dice lo contrario, este diagrama se invierte.

**AC no diagramados:** HU-019 AC-1 y AC-5 (redacción de la tarjeta), HU-020 AC-3 a AC-5, HU-219 AC-4 (las siete facetas), HU-220 AC-4, HU-222 AC-4 (relevancia por omisión), HU-224 AC-5 (votos internos), HU-225 AC-3 a AC-5, HU-226 AC-3 a AC-5, HU-250 AC-3 y AC-4.
