# Design

## Context

Ver `proposal.md` (Why). El monorepo ya existe (scaffold confirmado, ADR-0008): `apps/portal` y `apps/panel` (Next.js 15.5+, App Router, TypeScript), `apps/worker` (Node, bundle esbuild), `packages/{dominio,infra,contratos,motor,ui}`, PostgreSQL 16 con PgBouncer en modo transacción, Mailgun y HubSpot como fronteras solo de servidor. Hoy las apps sirven una página vacía: no hay migraciones, roles, sesiones ni cola.

Las decisiones de arquitectura ya están tomadas y aceptadas; este diseño **no las repite**, las aplica:

- **ADR-0002** — identidad, acceso y sesiones: token opaco de 32 bytes en el fragmento (`/e/#t=`), solo `SHA-256` en BD; códigos de un uso con HMAC y pepper por ámbito; respuesta neutra y modo degradado; estados de acceso tipados (`410 enlace_revocado|enlace_vencido`, `401 sesion_expirada`, `403 codigo_invalido`); `exigirSesion` en cada página; envoltorios `conSesion`/`conCsrf`/`conAutorizacion`/`conLimite`; verificaciones V2-1…V2-4.
- **ADR-0003** — datos y auditoría encadenada del panel; `equipos`/`equipo_perfiles` (CRN-12); `catalogo_publicable`.
- **ADR-0008** — plataforma, roles de BD, `middleware.ts` (borde, CSP con nonce), orden de sub-slices y verificaciones V8-1…V8-13 con su columna «Desde».
- **ADR-0009** — cola `trabajos` con `FOR UPDATE SKIP LOCKED`, `enviar_codigo` (5/15/30 s, caducidad 10 min, plazas reservadas), encolado por lista blanca por rol.
- **ADR-0010** — entornos, salud `vivo`/`lista`, secretos por componente, borde de Cloudflare.

## Goals / Non-Goals

**Goals:**
- Un esqueleto que camina de punta a punta desde el sub-slice 1 y se engorda de uno en uno sin romper `journey_smoke`.
- Cada verificación de ADR-0008/0002 con «Desde: EP-001 · N» entra en verde en el sub-slice N, no antes ni después.
- La lógica de acceso (vigencia, estados, respuesta neutra, límites, reevaluación de perfiles) vive en `packages/dominio` como funciones puras y deterministas, testeables sin red.

**Non-Goals:**
- Edición de perfiles, consentimientos e importación (EP-006): aquí solo existe el modelo mínimo publicable con perfiles **ficticios** sembrados en local, CI y staging.
- Sumar y quitar en «Mi equipo» (EP-004), panel de especificación (EP-009), «pedir a medida» (EP-010), escritura en HubSpot (EP-007).
- Despliegue a producción con datos reales (bloqueado por H12/R-44: solo datos ficticios).

## Decisions

1. **Orden de construcción = ADR-0008, troceado en 7 sub-slices** (6 se parte en 6a/6b para no superar 3 HU). Cada sub-slice cierra con su parte del `wiring_checklist` en `passing` y el recorrido verde. Alternativa descartada: construir por capas (toda la BD, luego todo el portal): rompe la regla del esqueleto que camina.

2. **Renovación del enlace vencido por la cola, no en la petición.** `POST /acceso/renovar` valida forma y límite, responde **siempre** el mensaje neutro en tiempo constante y encola `renovar_enlace {ref}`; el worker comprueba si el correo estaba invitado, lee de HubSpot si la empresa está activa (timeout 20 s de ADR-0009) y, según el caso, emite el enlace nuevo por Mailgun, avisa al propietario de la empresa o avisa a Talento Humano. Razón: consultar HubSpot en la petición filtraría por tiempo si el correo estaba invitado y acoplaría la disponibilidad del portal a HubSpot. Alternativa descartada: llamada síncrona con respuesta neutra (el tiempo la delata). **Requiere añadir `renovar_enlace` a la lista blanca de `encolar_portal` (enmienda menor de ADR-0009; se registra al cerrar el slice).**

3. **Adaptador HubSpot de solo lectura en `packages/infra`, solo en el worker**, con una operación: `estadoDeEmpresa` → `{activa, propietario}` (HU-092). Doble declarado en CI y local (`DOBLES`); en producción el arranque rechaza dobles (V8-9). Fallo o timeout → resultado `desconocido`, que el dominio trata como **fallo cerrado**. El nombre exacto de la propiedad «cuenta activa» se fija en configuración (`HUBSPOT_PROP_CUENTA_ACTIVA`), no en código. *Enmienda 2026-09-28 (sponsor): se retira `contactoDeCuenta`; la generación del enlace (HU-122) no lee HubSpot y la llave sigue solo en el worker.*
4. **Reevaluación del estado de los perfiles al abrir** como función pura `reevaluarSeleccion(codigos, catalogo)` → lista ordenada con `{codigo, estado, liberaEn?}`, sin omitir ninguno (RF-19.2). El portal lee de `catalogo_publicable` y de una vista mínima de estados por código (sin campos B.4).

5. **«Mi equipo» mínimo**: tablas `equipos` (único por invitado y enlace) y `equipo_perfiles` de ADR-0003, creadas vacías al primer ingreso; en EP-001 solo lectura y aislamiento. La escritura (sumar/quitar) queda para EP-004 detrás de la misma tabla.

6. **Peticiones de invitación** como filas `invitaciones_solicitadas` (enlace, correo solicitado, quien pidió, estado, motivo); aprobar inserta en `enlace_invitados` con `origen = 'invitacion_aprobada'` usando un único `(enlace, correo)` para no duplicar; ambas decisiones escriben en la auditoría encadenada (ADR-0003). El aviso a Talento Humano de una petición nueva usa el tipo `notificar` existente (ADR-0006/0009).

7. **Encuadre sin selección** con los valores de rol y categoría que ya expone `catalogo_publicable` (sub-slice 3 los incluye), filtrado por una sola opción en el cliente. No se construye el panel de facetas de EP-002.

8. **Pantallas** desde `docs/05-prototipo/` (37 pantallas de EP-001 aprobadas) con los tokens y componentes de `packages/ui`; fidelidad verificada por captura real con MCP chrome-devtools en la fase smoke de cada sub-slice con UI.

## Desviaciones intencionales del prototipo (fidelidad del sub-slice 2)

Verificadas con Chrome DevTools contra `docs/05-prototipo/pantallas/` (2026-09-28):

- **Menú del panel**: los doce destinos se ven siempre y van deshabilitados hasta que su épica los entregue (decisión del sponsor, 2026-09-28). Sin conteos mientras no haya datos.
- **Inicio del panel**: encabezado, no la tabla de Inventario (pertenece a otra épica).
- **Pie de la barra lateral**: rol y hora de fin de la jornada en lugar del nombre; `usuarios_panel` no guarda nombre (el correo ya va en la barra superior).
- **Vigencia del código**: 10 minutos (ADR-0002); el prototipo dice 15.
- **Sesión caducada**: sin «Al entrar vuelves a …»; no hay `?volver=` (redirector abierto, ADR-0002).
- **Pie de la puerta en móvil**: objetivo táctil de 44 px (M-2) baja el pie unos 12 px.

### Sub-slice 4 (generación y revocación de enlaces)

- **Cuenta e invitados a mano**: sin «Cambiar» contra HubSpot ni «contacto en el CRM» (sponsor, 2026-09-28; HU-122 escenario 4).
- **Enlace `/e/#t=<token>`**, mostrado una sola vez con «Cópialo ahora»; el prototipo pinta `/e/<token>` (E-8).
- **Sin aperturas** en el registro de enlaces hasta el sub-slice 5 (el acceso del cliente las escribe); sin paginación mientras haya pocos enlaces.
- **Correo en lugar de nombre** de quien generó o revocó (no hay nombre en `usuarios_panel`).
- **Selector de perfiles publicados propio** en «Añadir desde el inventario»; el inventario completo es de EP-006.

### Sub-slice 5 (acceso y aterrizaje del cliente)

Verificadas con Chrome DevTools contra `docs/05-prototipo/pantallas/` (2026-09-29):

- **Aterrizaje**: sin bloques «Verificado por Trycore / Declarado» (sin datos de evidencia hasta EP-006/EP-002); sin «Sumar al equipo», «Ver ficha» ni «Ver perfiles parecidos» (EP-004/EP-002); sin ciudad (contrato del catálogo); firma sin nombre de quien seleccionó (`usuarios_panel` no guarda nombre); sin «desde el …» del cambio de estado (no se guarda la fecha del cambio). Buscar, Invitar a un colega y Mi equipo visibles y deshabilitados hasta 6a/6b.
- **Datos de perfiles que cambiaron**: pausados y colocados con consentimiento vigente muestran nombre, rol, sectores y modalidad; archivados y no publicados, solo código y etiqueta (Ley 1581, minimización; el prototipo muestra el nombre también para archivados). Vista `operacion.estado_seleccion_perfil` (migración 0008).
- **Texto neutro del código**: el de HU-090 («Si tu correo está invitado, te llegó un código… Si no te llega, pídele a quien te compartió el enlace…»), 10 min (ADR-0002); el prototipo dice «tiene invitación vigente… 15 minutos».
- **Intentos agotados**: `/verificar` responde 429 `{motivo: "en_espera", hasta}` —igual para invitados y no invitados— en lugar del «Código inválido o vencido» de ADR-0002, porque HU-090 exige ver que hay que esperar y a quién escribir.
- **Texto mínimo de 13 px** en la cara cliente (M-8, PRD §8.1): ayudas y notas que el prototipo pone a 12 px.
- **Renovación (decisión 2 aplicada)**: la pantalla tras pedir un enlace nuevo («Revisa tu buzón» o «Recibimos tu petición») depende solo del estado de la cuenta en HubSpot, que el worker consulta siempre, esté o no invitado el correo; el portal la consulta por `GET /api/v1/acceso/renovar/{id}`. Ventana de espera de 15 min por enlace y correo. El enlace renovado copia cuenta, proyecto, razón y selección, con vigencia nueva de 30 días y solo el invitado que lo pidió.
- **HubSpot por nombre**: como la cuenta se escribe a mano (HU-122 escenario 4, enmienda del 2026-09-28), `estadoDeEmpresa` busca la empresa por nombre exacto cuando el enlace no tiene `cuenta_ref`; cero o varias coincidencias = «desconocido» (fallo cerrado → Talento Humano). No existe en HubSpot una propiedad «cuenta activa»: se configura con `HUBSPOT_PROP_CUENTA_ACTIVA` y `HUBSPOT_VALOR_CUENTA_ACTIVA` (en desarrollo, `lifecyclestage` = `customer`). Variables nuevas del worker: `PORTAL_ORIGEN`, `HUBSPOT_PROP_CUENTA_ACTIVA`, `HUBSPOT_VALOR_CUENTA_ACTIVA`, `CORREO_TALENTO_HUMANO` (enmienda de ADR-0010 §3.3, a registrar con la de ADR-0009 en la tarea 8.2).

## Risks / Trade-offs

- [EP-001 es muy grande: 7 sub-slices y casi todo el monorepo] → un sub-slice por vez, checkpoint en el hub al cerrar cada uno y `journey_smoke` verde entre ellos; el `files_scope` amplio es aceptable porque es épica fundacional y nunca va en paralelo.
- [El hub tiene `design_source aplica=false`] → la fidelidad se exige igual por la regla dura 7 del arnés; el ADMIN debe corregir el hecho en la consola.
- [Enmienda de ADR-0009 por `renovar_enlace`] → se documenta en el PR del slice y en el backlog arquitectónico; no cambia ningún driver.
- [Propiedad «cuenta activa» aún sin nombre en HubSpot] → configurable; el doble de CI cubre los tres estados (activa, no activa, sin respuesta).
- [Neutralidad por tiempo difícil de medir en CI compartido] → V2-4 mide con N = 200 por rama y umbral de 5 ms como en ADR-0002; si CI es ruidoso, se aísla en un job dedicado.
- [Mailgun y HubSpot solo con dobles en CI] → la verificación contra servicios reales queda para staging y el Release Gate (integración con dependencias reales); se declara en el PR.

## Migration Plan

Proyecto nuevo: no hay datos que migrar. La migración inicial crea los esquemas `identidad`, `identidad_panel`, `operacion` (cola), inventario mínimo y auditoría con `roles.sql`; cada sub-slice añade sus migraciones hacia adelante (expand/contract). Rollback de cualquier sub-slice = revertir su PR; la base de datos de local/CI se recrea desde cero.

## Open Questions

- Plazo de escalamiento de una petición de invitación pendiente más allá del aviso a Talento Humano (pregunta abierta de HU-095; no cambia criterios).
- Si al rechazar se muestra al cliente el motivo o solo el contacto (HU-145; los criterios fijan el mínimo).
- Si la renovación conserva la misma selección o la reevalúa (HU-092; RF-19.2 garantiza el estado real en cualquier caso).
