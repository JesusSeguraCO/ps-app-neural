# EP-006 · sub-slice 9 (HU-137, HU-150, HU-124) — plan

## Estado al abrir (tras cerrar ss8 en fa2ef7e)
- Sponsor aprobó (2026-10-01, en sesión) la migración expand + contract de `colocado` tal como está diseñada.
- BD local en 0019. Ficticio colocado: PS-0137 (Sara Londoño).

## Lectura del diseño (§1, §11) y decisiones (D33, bajo D27)
1. `colocado` deja de ser estado: el perfil queda `publicado` y la asignación vive en `colocaciones`
   (`perfil_id`, `cuenta`, `inicio`, `liberacion` NOT NULL, `fuente` panel·operaciones, `carga_id`,
   `registrado_por`, `vigente`). Colocación vigente = `vigente` y `liberacion` > hoy en Bogotá.
2. El catálogo (`catalogo_publicable`, `ficha_publicable`) ya filtra `estado = 'publicado'`: el colocado entra con
   su banda sin tocarlas (HU-137 edge). Las vistas de estado (`estado_enlace_perfil`, `estado_seleccion_perfil`)
   derivan `colocado` de la colocación vigente y conservan su salida (`libera_en`), para que el enlace curado siga
   mostrando «colocado hasta tal fecha» (RF-19.2, spec vigente de aterrizaje-curado). El aterrizaje da prioridad al
   estado `colocado` sobre la tarjeta publicada (regresión V3-2 de aterrizaje-curado y generacion-enlaces).
3. Datos: un trabajo del worker (`migrar_colocados`, origen `migracion`, auditado) pasa cada `colocado` a `publicado`
   + colocación (cuenta «Sin registrar» si no se sabe, liberación = `fecha_liberacion`). La migración contract
   (0021) falla con mensaje si quedan colocados sin migrar, retira `colocado` del CHECK, el acople con
   `fecha_liberacion` y la columna. V3-7: ninguna migración hace DML.
4. Registrar colocado (panel): solo publicados sin colocación vigente; exige cliente y liberación (> hoy); inicio
   por omisión hoy; fija disponibilidad = liberación y la actualiza ahora; fuente `panel` con su autor.
5. Carga de Operaciones: JSON o CSV (otro → rechazo entero, sin tocar nada); columnas mínimas código, cliente,
   inicio, liberación (sinónimos razonables en encabezados); el resto se ignora e informa; filas válidas se
   aplican, erróneas con número y motivo (código inexistente o no publicado, fechas inválidas, liberación ≤
   inicio); si hay colocación del panel distinta → `diferencias_operaciones` (gana el panel) para aceptar o
   descartar; igual → nada; colocación previa de Operaciones → se reemplaza. Fecha de corte = `cargado_en`.
   «Dato desincronizado» si han pasado más de 7 días (7 no, 8 sí).
6. Observador (HU-124): lee inventario, enlaces y colocados sin controles; la ruta de edición muestra el formulario
   inerte con «tu rol es de consulta» y queda `acceso_rechazado` en la auditoría (también un 403 de API); botón
   «Avisar a Talento Humano» encola `notificar` con el perfil identificado. Matriz completa de EP-006 con V2-3.
7. Enmiendas en `docs/adr/_backlog-arquitectonico.md`: ADR-0009 (`sincronizar_colocados` no se construye, D8) y
   ADR-0003 (estado `colocado` retirado).

## Orden
9.1 migraciones 0020 (expand) + worker + 0021 (contract) + vistas + código sin `colocado` → commit
9.2 registrar colocado + pestaña → commit · 9.3 carga de Operaciones → commit · 9.4 observador → commit
9.5 backlog · 9.6 fidelidad MCP · 9.7 journey, mutación, e2e, wiring → commit de cierre

## Avance (2026-10-01) — retomar aquí
- **9.1 hecha** (commit de 9.1): 0020 (`colocaciones`, `cargas_operaciones`, `diferencias_operaciones`), trabajo
  `migrar_colocados` (worker al arrancar y `--migrar-colocados`), 0021 (contract: CHECK de 4 estados, fuera
  `fecha_liberacion`, vistas de estado derivadas), `colocado` fuera de `EstadoAlmacenado`, `PerfilEditor.colocacion`,
  aterrizaje con prioridad de `colocado`, plan de importación con `colocados` vigentes, siembra PS-0137 publicado +
  colocación `siembra`, `MIGRAR_HASTA` en el job `migrar`. Tests: `migracion-0020-0021.test.ts` (3) y ajustes.
  Suite 1069 ✓, e2e 52 ✓.
- Dev DB: migrada a 0021 con el flujo de dos pasos. PS-0137 (ficticio) quedó en borrador por no tener modalidad de
  prueba (sembrado antes de 0017); se reparó a mano: modalidad de su familia + publicado (como lo siembra hoy).
- **9.2 hecha**: dominio `inventario/colocados.ts` (validación, tabla por vencimiento ≤ 60 días, próximo cambio de
  banda), infra `registrarColocado`/`listarColocados`, `POST /api/v1/colocados` (`colocados.escribir`), página
  `/colocados` con hojas de registro y de asignación, menú habilitado, «Ver en Colocados» en la incoherencia.
  Tests: dominio 12, infra 5, HTTP 6 (`apps/colocados-panel.test.ts`), e2e 1 + axe de `/colocados`. Mutación manual
  en `mutacion-9.2.md` (3/3 muertos).
- **9.3 hecha**: lector `contratos/operaciones.ts` (formato, columnas mínimas con sinónimos, errores por fila,
  `datoDesincronizado`), infra `cargarOperaciones`/`resumenCarga`/`ultimoCorte`/`listarDiferencias`/`decidirDiferencia`
  (una unidad, origen `sincronizacion`, gana el panel), `POST /api/v1/colocados/cargas` y
  `POST /api/v1/colocados/diferencias/{id}`, pestaña con resultado, filas con error, diferencias, corte y aviso.
  Tests: lector 9, infra +4, HTTP +6, e2e 1. Mutación en `mutacion-9.3.md` (5/5). D36.
- **9.4 hecha**: 0022 (`acceso_rechazado` en `accesos_log` con usuario/acción/recurso; `encolar_panel` y
  `origen_permitido` admiten `notificar` `dato_desactualizado`), 403 explicado y registrado en `conAutorizacion`,
  rechazo de página (`src/sesion/rechazo.ts`) en la edición, nuevo perfil y nuevo enlace, editor en consulta con
  `?vista=ficha`, «Avisar» (`POST /api/v1/perfiles/{código}/avisar`, `perfil.avisar`) y despacho al buzón de Talento
  Humano. BD de desarrollo en 0022. Tests: dominio 3, HTTP+worker 6, e2e 1. Mutación en `mutacion-9.4.md` (4/4). D37.
- **9.5 hecha**: E-11 (ADR-0009: sin `sincronizar_colocados`, `notificar` del panel) y E-12 (ADR-0003: `colocado`
  deja de ser estado; colocaciones, cargas y diferencias) en `docs/adr/_backlog-arquitectonico.md`; la fila UC-14 del
  tablero las cita y suma ADR-0009.
- **Siguiente: 9.6** (fidelidad MCP de las 11 pantallas), luego 9.7 (journey, e2e, mutación de 9.1, wiring, cierre). Falta la mutación de 9.1 (añadirla a `mutar-ss9.py` al cerrar).
