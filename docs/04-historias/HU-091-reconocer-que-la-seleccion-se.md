---
id: HU-091
titulo: "Reconocer que la selección se armó para mi proyecto"
epica: EP-001
prioridad: alta
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.13
depende_de: [HU-090]
---

# HU-091 — Reconocer que la selección se armó para mi proyecto

**Como** líder de proyecto que abre el enlace del correo,
**quiero** encontrar los mismos perfiles que vi en el correo, con la razón por la que los eligieron,
**para** sentir que alguien pensó en mi caso y no que me mandaron un catálogo.

## Criterios de aceptación

### Happy path

**Dado** que tengo una sesión válida con mi correo invitado en un enlace con selección
**Cuando** carga el portal
**Entonces** veo los mismos perfiles del correo, sin pasos intermedios
**Y** veo la razón declarada de la selección, referida a mi proyecto

### Error — un perfil de la selección ya no está disponible

**Dado** que tengo una sesión válida en un enlace con selección
**Y** que uno de los perfiles de la selección se pausó desde el envío
**Cuando** carga el portal
**Entonces** veo los demás perfiles de la selección con toda su información, sin cambios respecto al correo
**Y** veo el perfil pausado en el lugar que ocupaba en la selección, con la etiqueta de su estado real («Pausado»)

### Edge case — ningún perfil de la selección sigue publicado

**Dado** que tengo una sesión válida en un enlace con selección
**Y** que todos los perfiles de la selección dejaron de estar publicados
**Cuando** carga el portal
**Entonces** veo la lista completa de los perfiles de mi selección, cada uno con la etiqueta de su estado real
**Y** veo una invitación a explorar el banco con el contexto de mi proyecto ya aplicado

## Notas

Cubre **RF-1.3**, **RF-2.1** y **RF-19.2**. El escenario de error es real: entre que se arma el correo y que el cliente lo abre pasan días.

**Ajustada el 2026-09-27** (corrección de discovery, T-18): la precondición pasa a una sesión válida con el correo invitado, porque desde D-4 revisada (acceso nominal) nadie ve la selección sin superar la puerta de HU-090. El caso límite ya no «lleva a explorar» ocultando la selección: por RF-19.2 el portal **nunca omite un perfil en silencio**, así que muestra cada perfil con su estado y, además, ofrece explorar.

**Orden de construcción y pruebas** (decisión escrita, validación INVEST del 2026-09-27): HU-091 se construye después de HU-090, que es cimiento de acceso (cimiento antes que negocio). Para no esperar a que HU-090 esté terminada de punta a punta, HU-091 se construye y verifica con una **sesión sembrada** (fixture de identidad) y selecciones sembradas con perfiles pausados o despublicados. La demostración integrada con la puerta real ocurre al cerrar la épica.

## Trazabilidad

Épica madre: **EP-001** · PRD v4.13 · ADR-0002/0003 (UC-3) · depende de HU-090 · orden de construcción: después de HU-090 · se solapa con HU-144 (misma reevaluación al abrir, distinto origen del enlace)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita la puerta de HU-090 para entregar valor en producción, así que se secuencia después de ella; se construye y verifica sola con una sesión sembrada, sin esperar a HU-090 terminada |
| N | Negociable | ✓ describe el resultado, no la implementación |
| V | Valiosa | ✓ el cliente reconoce en el primer vistazo que la selección es para él |
| E | Estimable | ✓ la reevaluación al abrir está decidida (ADR-0003, UC-3); falta la cifra del equipo |
| S | Pequeña | ✓ S: una vista y la reevaluación de estado por perfil |
| T | Testeable | ✓ selecciones sembradas con perfiles pausados o despublicados dan resultados observables (etiqueta de estado, posición, invitación a explorar) |
