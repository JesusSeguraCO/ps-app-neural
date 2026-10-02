---
id: HU-066
titulo: "Arrancar desde una sugerencia en lugar de un campo vacío"
epica: EP-009
prioridad: alta
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-065]
---

# HU-066 — Arrancar desde una sugerencia en lugar de un campo vacío

**Como** líder de área que entra al portal sin tener claro cómo formular lo que busca,
**quiero** encontrar la barra con el contexto de mi proyecto y tres instrucciones sugeridas que pueda usar tal cual o retocar,
**para** no tener que decidir qué escribir desde cero cuando entro con prisa y poca frecuencia de uso.

## Criterios de aceptación

### Happy path — sugerencias del proyecto de mi enlace

**Dado** que entré por un enlace con la razón «Modernización de pagos (ficticio)» y una selección de 2 perfiles de Desarrollador Backend y 1 de QA de automatización
**Y** que la familia con más perfiles publicados del banco fuera de esas dos es Desarrollador Frontend
**Cuando** abro la búsqueda
**Entonces** la barra muestra «Modernización de pagos (ficticio)» como contexto, nunca vacía
**Y** debajo veo exactamente 3 sugerencias: «Desarrollador Backend para Modernización de pagos (ficticio)», «QA de automatización para Modernización de pagos (ficticio)» y «Desarrollador Frontend para Modernización de pagos (ficticio)»

### Happy path — sugerencia enviada sin editar

**Dado** que toqué la sugerencia «Desarrollador Backend para Modernización de pagos (ficticio)» y quedó cargada en la barra sin cambios
**Cuando** pulso «Buscar»
**Entonces** se ejecuta la búsqueda con ese texto y veo su lectura
**Y** se registra el evento `instruccion_enviada` con origen `sugerencia_sin_editar` y el identificador de esa sugerencia

### Edge case — sugerencia retocada antes de enviar

**Dado** que cargué en la barra la sugerencia «Desarrollador Backend para Modernización de pagos (ficticio)» y cambié «Desarrollador Backend» por «Arquitecto de software»
**Cuando** pulso «Buscar»
**Entonces** se ejecuta la búsqueda con mi texto
**Y** se registra `instruccion_enviada` con origen `sugerencia_editada` y el identificador de la sugerencia de la que partí

### Edge case — entrada sin proyecto conocido

**Dado** que entré sin selección curada ni razón declarada (HU-093)
**Y** que las tres familias con más perfiles publicados son Desarrollador Backend (14), Desarrollador Frontend (12) y Desarrollador Full Stack (9)
**Cuando** abro la búsqueda
**Entonces** veo 3 sugerencias genéricas: «Desarrollador Backend», «Desarrollador Frontend» y «Desarrollador Full Stack»
**Y** ninguna sugerencia nombra un proyecto

### Error — enviar la barra vacía

**Dado** que borré todo el texto de la barra
**Cuando** pulso «Buscar»
**Entonces** no se ejecuta ninguna búsqueda ni se registra `instruccion_enviada`
**Y** veo «Escribe lo que necesitas o toca una sugerencia» con las 3 sugerencias todavía visibles

## Notas

Cubre **RF-12.1** (barra nunca vacía, precargada con el proyecto activo y sugerencias) y su prueba de falsación: si más del 60 % de las instrucciones son sugerencias sin editar, el portal dicta la demanda en vez de captarla. La lectura de esa proporción es **HU-173** (EP-008), que consume el `origen` de `instruccion_enviada` (ADR-0006); el origen lo declara el navegador (riesgo aceptado en ADR-0006).

**Decisiones por delegación del sponsor (elegidas por el modelo, opción conservadora):**
- **«Proyecto activo de la cuenta» = la razón declarada del enlace curado** por el que entró el invitado (RF-19.4). Es el único dato de proyecto que el portal tiene sin inventar.
- **Tres sugerencias, deterministas:** una por familia de rol presente en la selección curada (ordenadas por número de perfiles), completadas hasta tres con las familias con más perfiles publicados del banco; formato «<familia> para <razón>». Sin razón declarada, las tres familias con más perfiles publicados, sin nombre de proyecto. Solo se sugieren familias con al menos un perfil publicado. RF-12.1 dice «tres o cuatro»: se fija en tres.
- **Tocar una sugerencia la carga en la barra; enviar es un paso aparte.** Así «editada» y «sin editar» se distinguen con la letra de HU-173 («cambió una palabra antes de enviarla»).

**Fuente de diseño:** `docs/05-prototipo/pantallas/inicio-busqueda.html` y `inicio-busqueda--sugerencia-generica.html` (borrador). El prototipo muestra cuatro sugerencias redactadas a mano; la regla determinista de arriba las sustituye (negociable en la forma, no en que salgan de datos reales).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-12.1 · RF-19.4 · ADR-0006 (`instruccion_enviada`) · depende de HU-065 (intérprete, misma épica) · relacionada con HU-093 (EP-001, entrada sin selección) y HU-173 (EP-008, lectura de la falsación)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: ejecuta la búsqueda de HU-065 (misma épica); los datos del enlace ya existen (EP-001) |
| N | Negociable | ✓ son fijos el contexto del enlace, las tres sugerencias deterministas y el origen del evento; redacción y disposición se negocian |
| V | Valiosa | ✓ el cliente que entra con prisa arranca con algo útil y Mercadeo puede medir si el portal capta o dicta la demanda |
| E | Estimable | ✓ S: una función pura de sugerencias sobre la selección y la taxonomía con conteos, la carga en la barra y el campo `origen` del evento |
| S | Pequeña | ✓ S: cinco escenarios sobre la pantalla de entrada |
| T | Testeable | ✓ e2e con un enlace sembrado (razón y 3 perfiles) y otro sin razón: textos exactos de las sugerencias y carga del evento verificada en la tabla de eventos |
