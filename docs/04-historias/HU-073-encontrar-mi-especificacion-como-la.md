---
id: HU-073
titulo: "Encontrar mi especificación como la dejé"
epica: EP-009
prioridad: media
complejidad: S
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-070]
---

# HU-073 — Encontrar mi especificación como la dejé

**Como** líder de proyecto que vuelve al portal días después desde el mismo computador,
**quiero** recuperar el Perfil Objetivo que ya había ajustado,
**para** no repetir el trabajo de especificar cada vez que entro.

## Criterios de aceptación

### Happy path — retomo en el mismo navegador

**Dado** que el 28 de septiembre ajusté en este navegador un Perfil Objetivo con reto, «Desarrollador Frontend» obligatorio y «React» deseable, y cerré el portal
**Cuando** vuelvo a entrar con mi sesión desde el mismo navegador
**Entonces** veo «Retomamos tu especificación del 28 sep» con esos criterios aplicados y sus resultados
**Y** veo la opción «Empezar de nuevo», que deja el Perfil Objetivo en blanco

### Error — el navegador no conservó el dato

**Dado** que entro en modo privado o después de limpiar el almacenamiento del navegador
**Cuando** abro el Perfil Objetivo
**Entonces** está en blanco
**Y** no veo ningún mensaje que prometa recuperar una especificación anterior

### Edge case — otro dispositivo: vuelve mi equipo, no mi especificación

**Dado** que tengo 2 perfiles en «Mi equipo» y un Perfil Objetivo guardado en mi portátil
**Cuando** entro con mi correo y mi código desde mi teléfono
**Entonces** «Mi equipo» muestra mis 2 perfiles
**Y** el Perfil Objetivo está en blanco, sin aviso de error

### Edge case — un colega usa el mismo navegador

**Dado** que dejé un Perfil Objetivo guardado en este navegador y un colega invitado al mismo enlace entró con su propio correo en él
**Cuando** abre el Perfil Objetivo
**Entonces** lo encuentra en blanco y no ve nada de mi especificación
**Y** mi especificación sigue guardada en ese navegador bajo mi correo (verificable al entrar yo, como en el happy path)

### Edge case — especificación guardada con un esquema anterior

**Dado** que el navegador guarda una especificación con una versión de esquema que el portal ya no reconoce
**Cuando** entro al portal
**Entonces** el Perfil Objetivo arranca en blanco, sin ningún error en pantalla
**Y** el dato no reconocido se descarta del navegador

## Notas

Cubre **RF-13.4** (el Perfil Objetivo persiste contra el dispositivo de quien lo especificó), **RF-13.4.3** (otro dispositivo arranca limpio, aunque «Mi equipo» sí se recupera: HU-205, EP-004) y **RF-13.4.4** (degradación honesta: sin promesas de recuperación).

**Refinada el 2026-10-02 (discovery de EP-009).** Se retira la nota que decía «se reabre cuando exista autenticación real»: desde D-4 revisada cada invitado tiene identidad verificada, y el PRD (RF-13.4.1) dice que mantener el Perfil Objetivo en el dispositivo es una decisión de alcance del sponsor (T-1), no una imposibilidad técnica. Se reabre solo si negocio necesita continuidad entre dispositivos.

**Decisiones por delegación del sponsor (elegidas por el modelo):**
- **La clave local incluye al invitado de la sesión**: «dispositivo de quien lo especificó» se lee como navegador **y** persona, para que dos invitados que comparten un computador no se vean la especificación (cuarto escenario).
- **Al volver se retoma con los criterios aplicados** y la opción de empezar de nuevo, como el prototipo `perfil-objetivo--retomada`.
- Almacenamiento local versionado con migración o descarte (ADR-0004); el estado de búsqueda sigue viviendo en la URL.

**Línea de release.** El mapa la ubica en v1.1 por alcance, con la nota de que D-16 la abarata y puede adelantarse al MVP. Es ubicación, no recorte.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-13.4 · RF-13.4.1 · RF-13.4.3 · RF-13.4.4 · D-16 · T-1 · ADR-0004 (almacén local versionado) · depende de HU-070 (misma épica) · relacionada con HU-205 (EP-004, «Mi equipo» en otro dispositivo)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada del Perfil Objetivo (HU-070, misma épica) |
| N | Negociable | ✓ son fijos que vive en el navegador por persona, que no promete lo que no puede y que otro dispositivo arranca limpio; el mensaje de retomar se negocia |
| V | Valiosa | ✓ quien vuelve no repite el trabajo de especificar |
| E | Estimable | ✓ S: guardar y leer en el almacenamiento local con versión y clave por invitado |
| S | Pequeña | ✓ S: cinco escenarios sobre un mecanismo |
| T | Testeable | ✓ e2e con contextos de navegador separados (mismo, privado, otro dispositivo, otro invitado) y un dato sembrado con versión desconocida |
