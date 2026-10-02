# Design

## Context

Ver `proposal.md` (Why). EP-001 y EP-006 están archivadas: el inventario completo vive en el panel (migraciones 0013–0026), con una sola vía de escritura del perfil (`ServicioPerfiles` sobre la unidad de trabajo de `packages/infra/src/postgres/unidad-inventario.ts`), la guarda de publicar como función pura `evaluarPublicacion` (`packages/dominio/src/inventario/perfil.ts`) que usan el editor del panel, `perfiles-panel.ts` (publicar y editar publicado, D1) y el plan de importación (`packages/dominio/src/importacion/plan.ts`), la auditoría encadenada por campo (`auditoria.registrar(...)`), los catálogos paramétricos sin borrado con parecidos (`packages/dominio/src/catalogo/{tipos,parecidos}.ts`, `catalogos-panel.ts`), la importación en dos fases con el contrato único de columnas (`packages/contratos/src/importacion.ts`) y la ficha compartida portal/vista previa (`packages/ui/src/FichaPerfil.tsx` sobre `armarFicha` de `packages/contratos/src/ficha.ts`, contrato estricto `FichaPerfil`, vista `operacion.ficha_publicable`). El portal abre la ficha en panel lateral (`apps/portal/src/ficha/PanelFicha.tsx`, `packages/dominio/src/catalogo/recorrido.ts`) y la tarjeta es `apps/portal/src/seleccion/TarjetaPerfil.tsx` sobre `@ps/contratos/catalogo`. La banda de disponibilidad la calcula `packages/dominio/src/catalogo/banda.ts`; el contacto vigente, `operacion.contacto_trycore` + `packages/ui/src/ContactoTrycore.tsx`.

Este diseño **no rehace nada de eso: lo amplía**. Decisiones aplicadas sin repetirlas: ADR-0003 (una vía de escritura, `version`/`If-Match`, auditoría por campo, catálogos sin borrado, migraciones sin DML), ADR-0006 (registro técnico estructurado), ADR-0008/0010 (stack y roles; `ps_portal` solo vistas), y las decisiones del sponsor D59–D64, D73, D80, D81, D87, D96, D97, D101.

## Goals / Non-Goals

**Goals:**
- Toda regla nueva vive en `packages/dominio` como función pura y determinista, con `Reloj.fechaHoy()` en `America/Bogota`: fecha no futura, las dos condiciones nuevas de publicación, «Incompleto», lenguaje de inventario, plantillas de evidencia ✓/–, recorte de tecnologías, validación del Sello Personal y elección de la frase del estándar.
- **Una sola regla de publicación**: «Incompleto» (panel), el conteo del encabezado (portal), el bloqueo del editor, la pregunta D1 y la importación salen de `evaluarPublicacion`; ninguna copia en SQL ni en la UI.
- La lista negra B.4 y los datos internos (`aporte`, `vinculo`, marca «Incompleto», alcance desactivado como estado) nunca cruzan al portal: lo garantizan las vistas de `operacion` y los contratos estrictos `zod`.
- Cada sub-slice cierra con su parte del `wiring_checklist` en `passing`, `journey_smoke` verde y fidelidad observada contra el prototipo.

**Non-Goals:**
- El motor único de criterios y el conteo de deseables (HU-174, HU-118 → EP-009 por D87): aquí la evidencia se dibuja a partir de criterios ya resueltos.
- Sumar o quitar desde la ficha (HU-175 → EP-004 por D101). HU-079 está descartada.
- La ciudad condicionada por la necesidad declarada (EP-009): la necesidad sigue «remota» por omisión.
- Aviso de lenguaje de inventario en la vista previa de la importación (HU-194, fuera por decisión de la historia).
- Captura del Nivel 2 de la validación técnica (D59) y artefacto adjunto (D29).

## Decisions

### 1. Modelo de datos (migraciones 0027–0029, hacia adelante)

| Migración | Contenido | Historias |
|---|---|---|
| `0027_catalogo_alcances_saro` | `inventario.catalogo_alcances_saro` con la forma de los catálogos de EP-006: `nombre`, `nombre_normal` único, `texto_cliente` NOT NULL (1–280), `activo`, `fusionado_en_id`, `version`; permisos sin `DELETE`; `ps_portal` sin acceso directo | 177 |
| `0028_saro_disc_perfil` | `perfiles` + `saro_alcance_id` (FK al catálogo), `saro_fecha date`, `disc_fecha date`, con CHECK `<= current_date` como defensa en profundidad (la regla y su mensaje son del dominio); `operacion.ficha_publicable` gana `saro_texto` (texto de cara al cliente del alcance, también si está desactivado), `saro_fecha` y `disc_fecha`; `operacion.catalogo_publicable` gana `sello_personal` y conserva el orden de carga de las tecnologías | 176, 156, 081, 153 |
| `0029_indicadores_publicacion` | vista `operacion.indicadores_publicacion` legible por `ps_portal`: una fila por perfil publicado con **solo booleanos y enteros** (tiene nombre, rol, nº de tecnologías, modalidad de prueba elegida y activa, SARO completo, DISC, …), sin código ni datos personales; la consume el conteo del encabezado (§4) | 159, 178 |

La fusión de alcances reutiliza la transacción de fusión de EP-006 (`origen = fusion`). `TIPOS_CATALOGO` gana `alcance_saro` (con su etiqueta y género), de modo que listar, crear, parecidos, desactivar y fusionar salen del mismo código de `catalogos-panel.ts` y `HojasCatalogo.tsx`, y el texto de cara al cliente se edita como el de la modalidad de prueba.

### 2. Guarda de publicación ampliada e «Incompleto» (una sola regla)

`DatosParaPublicar` gana `saro: { alcance: boolean; fecha: boolean }` y `disc: { fecha: boolean }`; `ClaveCondicion` gana `saro_alcance`, `saro_fecha` y `disc_fecha` con etiquetas «el alcance de la verificación SARO», «la fecha de la verificación SARO» y «la fecha de la evaluación DISC», y cada condición declara el campo del editor al que se salta. Un alcance **desactivado** pero asignado cuenta como registrado (HU-177 edge): la guarda pregunta «¿tiene alcance?», no «¿está activo?»; asignarlo es lo que exige activo (editor e importación). El Sello Personal no entra en la guarda (D63).

`estadoDeEntrada(perfil)` = `evaluarPublicacion(...)` sobre un publicado: si no es publicable, «Incompleto: falta <condiciones>» con las etiquetas de la guarda (HU-178). No es un estado de la máquina (ADR-0003): el listado del panel lo calcula al leer y lo filtra; la pregunta D1 de HU-126 ya se dispara cuando una edición deja la guarda sin cumplir, y un publicado incompleto está en esa situación desde antes de editarse, así que no se escribe lógica nueva para la pregunta, solo se verifica. Completar lo que falta y confirmar deja de marcarlo en la misma lectura.

Fecha no futura: `validarFechaVerificacion(fecha, hoy)` en `dominio/inventario`, usada por el editor (422 con «la fecha de una verificación no puede ser posterior a hoy», sin escribir) y por el plan de importación. Formato aceptado = el de las demás fechas del perfil (spec de importación).

### 3. Aviso de lenguaje de inventario (HU-194)

`avisosDeLenguaje(texto)` en `dominio/inventario/lenguaje.ts`: lista fija de RF-3.6 (`unidad`, `ítem`, `disponible para asignación`, `stock`) ampliable sin cambiar la mecánica; normaliza con la misma `normalizar` de `catalogo/parecidos` (minúsculas, sin tildes) y compara por expresión completa con límite de palabra Unicode («Stockholm» no avisa, «ITEM» sí). Devuelve las expresiones encontradas en su forma original. Se evalúa al guardar sobre resumen y descripciones de la trayectoria; la respuesta del guardado lleva `avisos[]` separado de `errores[]`, también cuando el guardado se rechaza por otra regla. No entra en la guarda ni en «Incompleto». Sin modelo (RF-16).

### 4. Encabezado del estándar y conteo de incompletos (HU-159, D80, D97)

`fraseDelEstandar(conteo: number | null)` en `dominio/catalogo/estandar.ts`: `0` → versión que afirma «ningún perfil llega al portal sin…»; `≥ 1` o `null` → versión descriptiva, sin «ningún» ni afirmación de que todos cumplen. Nunca expone el número. El portal lee `operacion.indicadores_publicacion` en el servidor con `statement_timeout` corto (500 ms) y cuenta con la misma `evaluarPublicacion` (adaptador de indicadores a `DatosParaPublicar` en el dominio); si la consulta falla o vence, `conteo = null`, se registra `{evento: "conteo_incompletos_no_disponible"}` y la página carga normal. El encabezado (componente único en `packages/ui`) se monta en la selección (`apps/portal/app/page.tsx`), el banco (`apps/portal/app/banco/page.tsx`) y el encuadre sin selección (`apps/portal/src/banco/Encuadre.tsx`), antes del primer contenido, en flujo normal (sin modal ni elemento fijo que reaparezca). Cuatro dimensiones (D64): se corrige el «cinco componentes» del prototipo. El bloque de respaldo (Trycore University, Hive Mind, Coordinación de Servicio dedicada, SLA de 10 días hábiles en el tamaño del texto) va en la selección.

### 5. Tarjeta (HU-153, HU-081, HU-119)

`PerfilCatalogo` (`@ps/contratos/catalogo`) gana `selloPersonal` y la lista de tecnologías en orden de carga. `capacidadDeTarjeta(p)` compone «Rol · Seniority · N años de experiencia» (D73: anclaje = años; el campo de texto `anclaje` no se muestra); `tecnologiasDeTarjeta` corta en 5 por orden de carga (la ficha conserva hasta 8); sector omitido sin hueco si no hay; banda de `banda.ts` sin reimplementar («Por confirmar» si venció y > 30 días). El código pasa al pie en letra pequeña. Sello Personal: `selloValido(xs)` exige 1–3 competencias no vacías; fuera de contrato, la tarjeta se dibuja como sin sello (no se cae la lista) y el servidor registra `{evento: "sello_fuera_de_contrato", codigo}` sin datos personales. Sin insignia, estado ni puntaje por dimensión.

**Evidencia ✓/– (HU-119).** Contrato `CriterioResuelto = { tipo, valor, cumple, dato }` y `lineaDeEvidencia(c)` en `dominio/catalogo/evidencia.ts` con la tabla fija de la historia (rol, seniority, tecnología, sector, idioma, modalidad, país: cumple · dato distinto · sin dato = no cumplido); tipo sin plantilla → «✓ Cumple {criterio}» / «– No cumple {criterio}» y registro técnico `{evento: "criterio_sin_plantilla", tipo}` (D96). Mismo texto y orden en la tarjeta y en el bloque «Frente a tu búsqueda» de la ficha; sin criterios activos no hay bloque. Sin porcentajes. **Origen de los criterios en esta épica:** el filtro activo del banco (`filtroDeConsulta`, rol o categoría del encuadre) resuelto por perfil con la misma comparación que `aplicarFiltro`; la selección del correo no tiene criterios (edge «sin criterios»). Las cinco plantillas restantes se verifican con criterios resueltos sembrados en tests; HU-174 (EP-009) sustituye la fuente por el motor único sin cambiar el contrato.

### 6. Ficha (HU-154, HU-155, HU-156, HU-157, HU-158)

Se amplía la ficha existente, no se copia:
- `FichaPerfil` (contrato estricto) gana `seguridad: { alcance, fecha } | null` y `disc: { fecha } | null` en formato «mes de año» calculado en el dominio; `armarFicha` los rellena desde la vista y deja `null` lo ausente (D62: se omite sin marca). La vista previa del panel muestra lo mismo (HU-129).
- «Verificado por Trycore» (Sello Personal, validación técnica, SARO, DISC) con tratamiento propio; «Declarado por la persona» (trayectoria, formación, stack). La experiencia nunca se cita en la validación técnica.
- Validación técnica como bloque desplegable por clic/toque (no `hover`), abierto por omisión como el prototipo: Nivel 1 con los cinco campos de D59 en orden fijo (prueba aplicada, qué se evaluó, resultado «Cumple el estándar», evaluador, fecha); Nivel 0 con el texto de la modalidad y sin fecha (D73); línea fija «la evidencia de la validación puede revisarse en la sesión de alineación con Trycore»; ningún enlace a artefactos.
- Bloque de contacto con `ContactoTrycore` (texto de representación comercial, sin acción «Escribir a Trycore», D73); ningún dato de contacto de la persona; `vinculo` no viaja.
- Cierre: condiciones operativas (modalidad, banda, idiomas, país; ciudad según `armarFicha`), SLA de 10 días hábiles en el tamaño del texto y garantía Neural Speed con texto único; pie «Referencia interna PS-XXXX. Todos los perfiles que publicamos pasan por nuestro estándar Neural-Grid™»; el código sale de la cabecera y del `<title>`.
- Copy visible marcado para revisión de copy (D73) en constantes de `packages/ui`, no repartido por componentes.

**Lista negra B.4.** Ninguna vista de `operacion` expone foto, contacto, hoja de vida, `aporte` (D20), DISC detallado, promedio ni certificaciones; el contrato estricto falla ante cualquier campo de más. Un test pide la respuesta de la ficha y comprueba la ausencia de cada campo.

### 7. Importación (HU-191, D81)

`CAMPOS_IMPORTACION` gana `saro_alcance` («Alcance de la verificación SARO (del catálogo)»), `saro_fecha` y `disc_fecha`, con ejemplo; la plantilla toma como ejemplo de alcance uno **activo** del catálogo con su forma registrada. En `calcularPlan`: el alcance se compara normalizado contra el catálogo cerrado (desconocido o desactivado para un perfil que no lo tenía → error de fila «el alcance SARO no está en el catálogo», nunca «valor nuevo de taxonomía»); fecha futura o ilegible → error con su motivo y el valor exacto; `[vaciar]` de SARO o DISC en un publicado → error «no se puede vaciar una validación de entrada de un perfil publicado; pásalo a borrador desde el editor»; en un borrador se aplica. La importación sigue sin publicar. `aplicar_importacion` escribe por el `ServicioPerfiles` con `origen = importacion` y actor = quien confirmó. La exportación escribe el alcance con su forma registrada para que la ida y vuelta quede «sin cambios».

### 8. Recorrido de fichas (HU-120)

Construido en EP-006 (D47). Se re-verifica con e2e: siguiente/anterior en computador (panel lateral) y teléfono (pantalla completa) con «n de N»; extremos con botón y con flecha del teclado deshabilitados y sin dar la vuelta; cerrar vuelve a la misma lista con el mismo filtro y **en la posición del perfil** (scroll restaurado al ancla `p-XXXX`). Lo que falle se corrige en `PanelFicha.tsx`/`recorrido.ts`.

### 9. Pantallas y fidelidad

Pantallas del prototipo v2 (`docs/07-prototipo/`): catálogos (pestaña de alcances SARO), editor del perfil (bloque de validaciones de entrada), listado con marca y filtro «Incompleto», importar, tarjeta, ficha (`validacion-tecnica`, cierre), `hero-neural-grid` y `franja-servicio`. Fidelidad con captura real (MCP chrome-devtools) en cada sub-slice; toda desviación se registra aquí con su razón y la aprobación del sponsor. Las pantallas del panel que el prototipo no dibuja se extraen con `/build:prototype` modo feature y se aprueban antes de construir su UI.

## Sub-slices (orden del DoR, `dor-pass.md`)

1. **SS1** HU-177, HU-176 — catálogo de alcances SARO y captura SARO/DISC.
2. **SS2** HU-178, HU-194 — «Incompleto» y aviso de lenguaje de inventario.
3. **SS3** HU-191 — columnas SARO/DISC en importación, plantilla y exportación.
4. **SS4** HU-153, HU-081, HU-119 — tarjeta.
5. **SS5** HU-154, HU-155, HU-157 — ficha: verificado/declarado, validación técnica, conversación por Trycore.
6. **SS6** HU-156, HU-158 — ficha: SARO/DISC y cierre.
7. **SS7** HU-159, HU-120 — encabezado del estándar y re-verificación del recorrido.

## Risks / Trade-offs

- **Publicados heredados sin SARO/DISC** (todos los de hoy): el encabezado no afirmará «ninguno» hasta completarlos; es lo que D80 quiere. Mitigación: HU-191 completa por hoja; los ficticios sembrados se actualizan en `sembrar-ficticios` sin alterar PS-0142 y los fijados por e2e (memoria del proyecto: BD dev = BD de e2e).
- **El contrato estricto de la ficha y los heredados**: `seguridad`/`disc` son anulables precisamente para que un publicado incompleto no salga del contrato (y deje de abrir ficha).
- **Evidencia sin motor (HU-119)**: en esta épica la única fuente productiva son los filtros del banco, que solo producen ✓ en lo filtrado; las líneas «–» se ven en producción cuando llegue HU-174. Se declara, no se esconde: no es un stub, es el contrato completo con su primera fuente.
- **Coste del conteo en cada carga del portal**: una vista agregable sobre los publicados (decenas a cientos de filas) con tiempo acotado y degradación a la versión descriptiva.
- **Falsos positivos del aviso de lenguaje** («ítems del backlog»): deliberado, el aviso no bloquea.
- **Copy pendiente de revisión** (D73): textos centralizados para que cambiar el copy no cambie la mecánica ni los escenarios.

## Alternatives considered

- **«Incompleto» como estado nuevo del perfil**: descartado (ADR-0003, HU-178): duplicaría la regla y obligaría a migrar estados; la marca se calcula con la guarda.
- **Conteo de incompletos en SQL** (vista que replica la guarda): descartado; dos reglas que pueden discrepar entre la marca del panel y la frase del portal (D80 exige que no).
- **Alcance SARO como texto libre o como taxonomía abierta en la importación**: descartado por D61 (catálogo cerrado).
- **Pregunta «¿descarto o paso a borrador?» en la importación al vaciar**: no tiene dónde hacerse en un lote; error de fila con instrucción (HU-191, negociable).
- **Redactar la evidencia con un modelo**: prohibido por RF-16.1; plantillas fijas.

## Migration Plan

Migraciones 0027–0029 hacia adelante, solo esquema y vistas (V3-7, sin DML); `down` que restaura las vistas anteriores. Los datos de los perfiles existentes no se tocan: quedan publicados e «Incompletos» (D62). Despliegue: migrar → panel → portal (las vistas nuevas son aditivas, el portal viejo las ignora).

## Open Questions

- ¿El bloque de validación técnica abre plegado o desplegado por omisión? Se construye desplegado como el prototipo (HU-155, negociable, no cambia escenarios).
- Copy del encabezado, del bloque de respaldo, de la garantía Neural Speed, del pie y de los textos de alcance: marcado para revisión de copy con Mercadeo (D73).

### Desviación registrada · SS2 (D124)

Las pantallas de SS2 sin dibujo en el prototipo (marca y pestaña «Incompletos» del listado, aviso de
lenguaje de inventario en el editor, variante «Este cambio no se puede publicar» de la pregunta D1) se
construyeron con los patrones aprobados de EP-006 (pestaña con alerta ámbar, sub-línea de estado,
`pp-aviso--warn`, hoja `perfil-editor--incompleto-al-guardar`). Capturas en
`.claude/state/evidencia/ep-003/ss2/fidelidad.md`; revisables por el sponsor en el PR. Los heredados
incompletos de demostración se siembran aparte (`sembrarHeredadosIncompletos`, `--heredados-incompletos`)
para no mover los conteos del banco ficticio que fijan los tests. El guardado devuelve `avisos[]` junto al
`motivo`/`campo` del rechazo existente (no se añade un `errores[]` paralelo: el rechazo ya es único).
