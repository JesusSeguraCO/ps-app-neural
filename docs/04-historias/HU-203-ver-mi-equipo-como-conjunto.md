---
id: HU-203
titulo: "Ver mi equipo como conjunto"
epica: EP-004
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-192]
---

# HU-203 — Ver mi equipo como conjunto

**Como** líder de proyecto invitado que ya sumó varios perfiles a «Mi equipo»,
**quiero** abrir mi equipo desde el indicador y verlo como conjunto, con los roles que cubre y cuándo podría arrancar completo,
**para** saber qué equipo voy a pedir y desde cuándo podría trabajar, sin sumar a mano las disponibilidades de cada perfil.

## Criterios de aceptación

### Happy path — abrir el resumen desde el indicador

**Dado** que entré con mi correo invitado y mi equipo tiene 3 perfiles: Backend con banda «1 semana», QA de automatización «Inmediato» y Arquitectura de software «1 mes»
**Y** que estoy en el banco de perfiles
**Cuando** toco el indicador «Mi equipo»
**Entonces** veo la vista «Mi equipo» con los 3 perfiles, cada uno con su capacidad, su nombre y primer apellido y su banda de disponibilidad
**Y** el resumen dice «Perfiles: 3», «Roles cubiertos: 3» y «Arranque del equipo completo: 1 mes»
**Y** la vista dice «Armar un equipo aquí no reserva ni compromete a nadie»

### Alterno — quitar un perfil desde el resumen

**Dado** que estoy en la vista «Mi equipo» con 3 perfiles: Backend «1 semana», QA de automatización «Inmediato» y Arquitectura de software «1 mes»
**Cuando** toco «Quitar» en el perfil de Arquitectura de software
**Entonces** la vista muestra 2 perfiles y el resumen dice «Roles cubiertos: 2» y «Arranque del equipo completo: 1 semana»
**Y** el indicador «Mi equipo» pasa a 2

### Edge case — roles repetidos y disponibilidad por confirmar

**Esquema del escenario:** el resumen cuenta roles distintos y arranca con el perfil más tardío
**Dado** que mi equipo tiene <perfiles>
**Cuando** abro la vista «Mi equipo»
**Entonces** el resumen dice «Roles cubiertos: <roles>» y «Arranque del equipo completo: <arranque>»

**Ejemplos:**

| perfiles | roles | arranque |
|---|---|---|
| Backend «Inmediato», Backend «2 semanas», QA de automatización «1 semana» | 2 | 2 semanas |
| Backend «Inmediato» | 1 | Inmediato |
| Backend «1 semana», Frontend «Por confirmar» | 2 | Por confirmar (1 perfil con disponibilidad por confirmar) |

### Edge case — equipo vacío

**Dado** que entré por un enlace con selección y mi equipo no tiene perfiles
**Cuando** toco el indicador «Mi equipo»
**Entonces** veo «Todavía no has sumado perfiles» y una acción que me lleva a la selección de mi correo
**Y** no veo los conteos de roles ni el arranque del conjunto, ni una pantalla en blanco

### Error — no se puede leer el equipo

**Dado** que mi equipo tiene 3 perfiles y el servidor no puede leerlo en este momento
**Cuando** abro la vista «Mi equipo»
**Entonces** el portal me dice que no pudo cargar mi equipo y me ofrece intentarlo de nuevo
**Y** no me muestra «Todavía no has sumado perfiles» ni un conteo en 0

## Notas

Cubre **RF-4.3** (vista de resumen: perfiles seleccionados, roles cubiertos y fecha de inicio más temprana posible del conjunto) y la parte de **RF-4.2** que hace que el indicador sea *accesible*: hoy EP-001 lo dibuja deshabilitado y HU-192 le da el conteo; esta historia lo convierte en la entrada a la vista. Prototipo: pantalla «8 · Mi equipo» de `docs/07-prototipo/Portal de Perfiles v2.dc.html` (resumen «Perfiles · Roles cubiertos · Inicio más temprano posible», lista con «Ver ficha» y «Quitar»).

**El arranque del conjunto se dice en banda, nunca en fecha** (RF-3.13, D-10): la fecha vive en el panel y no sale de él. La banda del conjunto se calcula en el dominio con la misma derivación y las mismas etiquetas de `packages/dominio/src/catalogo/banda.ts` («Inmediato», «1 semana», «2 semanas», «1 mes», «Más de 1 mes», «Por confirmar»), contra la fecha del día (RF-3.13.2).

**D110 (sponsor, 2026-10-02) cierra P1.** «Fecha de inicio más temprana posible *del conjunto*» es el momento en que **el equipo completo** puede estar trabajando: la banda del perfil **más tardío**; si alguno está «Por confirmar», el conjunto está «Por confirmar» y se dice cuántos lo están (RF-3.13.3). El prototipo calcula la del más temprano (`sort()[0]`) y se corrige. La etiqueta «Arranque del equipo completo» sustituye a «Inicio más temprano posible» del prototipo para no prometer de más: **marcada para revisión de copy** (D73).

**D111 (sponsor, 2026-10-02) cierra P2.** Esta es la vista de RF-4.3 (EP-004). **HU-096** (EP-005) queda como el resumen antes de enviar (RF-5.3) y **reutiliza el bloque de equipo de esta vista** (perfiles, roles cubiertos y arranque); no lo construye dos veces.

**Roles cubiertos = roles distintos** del catálogo entre los perfiles del equipo; dos Backend cuentan como un rol. **D114:** un perfil pausado o archivado sigue en la lista y en el indicador con su estado real, pero **no cuenta** en roles cubiertos ni en el arranque; ese comportamiento lo especifica **HU-206**.

**Fuera de esta historia:** la acción «Continuar a la solicitud» lleva a la solicitud (EP-005); comparar (HU-204); perfiles que cambiaron de estado (HU-206); el equipo en otro dispositivo (HU-205); la observación de vacío (HU-080) y la composición de referencia (HU-084, EP-009).

**Propuestas del modelo, negociables:** ruta `/equipo` en el portal (hay que añadirla a `apps/portal/rutas-permitidas.json`); el orden de la lista es el orden en que se sumaron (`equipo_perfiles.orden`).

## Trazabilidad

Épica madre: **EP-004** · PRD v4.18 · RF-4.2 · RF-4.3 · RF-3.13 · D110 · D111 · D114 · D122 (sponsor, 2026-10-02: el equipo se conserva igual tras enviar, así que esta vista lo sigue mostrando después de la solicitud) · depende de HU-192 (sumar, quitar e indicador) · reutilizada por HU-096 (EP-005) · relacionada con HU-206 (perfiles no disponibles en el equipo), HU-204 (comparador), HU-080 y HU-084

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: necesita el equipo con escritura de HU-192; HU-096 la reutiliza, no al revés (D111) |
| N | Negociable | ✓ son fijos los tres datos del resumen (RF-4.3), la banda y no la fecha, el arranque por el perfil más tardío (D110) y que un fallo no se confunda con un equipo vacío; el diseño y el texto de las etiquetas se negocian |
| V | Valiosa | ✓ el cliente ve qué pide y desde cuándo podría trabajar el equipo completo, sin sumar a mano disponibilidades |
| E | Estimable | ✓ M: una ruta nueva del portal con lectura del equipo, cálculo determinista de roles y banda del conjunto en el dominio, quitar reutilizando HU-192 y el estado vacío y de error |
| S | Pequeña | ✓ M: una vista con su resumen en cinco escenarios; los no disponibles, el comparador y la recuperación van en otras historias |
| T | Testeable | ✓ unitarios del cálculo con la tabla de ejemplos (roles distintos, banda más tardía, «Por confirmar») con reloj fijo, y e2e con un equipo sembrado de 3, quitar uno, equipo vacío y fallo simulado de lectura |
