# Tasks

> Un grupo = un sub-slice del DoR (`.claude/state/evidencia/ep-003/dor-pass.md`), construidos de uno en uno. Cada tarea arranca con su test en rojo (TDD) y se da por hecha solo con su verificación **ejecutada** (suite, página cargada, consola leída), nunca por inspección. Al cerrar cada grupo: `journey_smoke` verde, su parte del `wiring_checklist` en `passing`, evidencia en `.claude/state/evidencia/ep-003/ssN/` y checkpoint en el hub. Fidelidad = captura real con MCP chrome-devtools contra el prototipo v2 (`docs/07-prototipo/`); toda desviación se registra en `design.md` con su razón y la aprobación del sponsor. Los ficticios fijados por los e2e (PS-0142 y demás) no quedan alterados.

## 1. Sub-slice 1 — Catálogo de alcances SARO y captura SARO/DISC (HU-177, HU-176)

- [x] 1.1 Test de migración primero y migración `0027_catalogo_alcances_saro` (`nombre_normal` único, `texto_cliente` obligatorio, `activo`, `fusionado_en_id`, sin `DELETE`, `ps_portal` sin acceso directo) registrada en `indice.ts`; verificar V3-2, V3-7 y la batería de permisos
- [x] 1.2 `alcance_saro` en `TIPOS_CATALOGO` (etiqueta y género) y en `catalogos-panel.ts`/`HojasCatalogo.tsx` reutilizando alta, parecidos, desactivar y fusionar; tests de dominio e infra primero; verificar los escenarios «crear con su texto» e «idéntico salvo mayúsculas» de HU-177 y observador → 403
- [x] 1.3 Corregir el texto de cara al cliente con `?previsualizar` (conteo de fichas publicadas afectadas) y confirmación auditada con valor anterior y nuevo; verificar el escenario «corregir el texto de un alcance en uso» con 4 perfiles sembrados
- [x] 1.4 Test de migración primero y migración `0028_saro_disc_perfil` (`saro_alcance_id`, `saro_fecha`, `disc_fecha` con CHECK `<= current_date`; `ficha_publicable` con `saro_texto`, `saro_fecha`, `disc_fecha`; `catalogo_publicable` con `sello_personal` y orden de carga de tecnologías); verificar que ninguna columna B.4 ni `vinculo`/`aporte` aparece en las vistas
- [x] 1.5 Dominio: `validarFechaVerificacion(fecha, hoy)` y las condiciones `saro_alcance`, `saro_fecha`, `disc_fecha` en `evaluarPublicacion` (alcance desactivado asignado = registrado; Sello Personal fuera de la guarda), con su campo de destino; tests de tabla primero
- [x] 1.6 Editor del perfil: selector del alcance (solo activos; el desactivado actual se muestra señalado y no se ofrece a otros), fechas SARO y DISC, rechazo 422 de fecha futura sin escribir, vista previa con texto del alcance y «mes de año»; verificar los escenarios «registrar los tres datos» y «una fecha futura» de HU-176
- [x] 1.7 Bloqueo de publicar (individual y masiva) con «Falta <motivo>» y salto al campo; corrección en publicado por la confirmación de HU-126 con historial; verificar los tres ejemplos del bloqueo y «corregir el dato de un perfil publicado» de HU-176, y que ninguna vía (panel, importación, SQL como `ps_panel`) publica sin ellos
- [x] 1.8 Desactivar un alcance en uso (los perfiles lo conservan, el editor deja de ofrecerlo, sin borrar) y editar/re-publicar un perfil que lo conserva; verificar los dos escenarios de retirar y editar con alcance desactivado de HU-177
- [ ] 1.9 (capturas hechas en `ss1/fidelidad.md`; pendiente de aprobación del sponsor: ninguna pantalla de SS1 tiene prototipo) Fidelidad con captura MCP de catálogos (pestaña de alcances SARO, duplicado, impacto de corrección, desactivado) y del bloque de validaciones de entrada del editor; pantallas sin prototipo extraídas con `/build:prototype` modo feature y aprobadas antes de construir
- [x] 1.10 Journey smoke: crear un alcance → asignarlo con fechas a un perfil → intentar publicar sin DISC (bloqueado con motivo) → completar y publicar → la vista previa muestra SARO y DISC; evidencia en `ss1/` y checkpoint

## 2. Sub-slice 2 — «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194)

- [x] 2.1 Dominio `estadoDeEntrada` sobre `evaluarPublicacion` («Incompleto: falta …» con las etiquetas de la guarda); tests de tabla primero con publicados sin SARO, sin DISC, sin modalidad y sin Sello Personal
- [x] 2.2 Listado del panel: marca «Incompleto: falta …» y filtro «incompleto», sin tocar el estado ni el portal; verificar los tres ejemplos de HU-178 y «el Sello Personal no marca un perfil como incompleto»
- [x] 2.3 Edición de un publicado incompleto: la pregunta D1 con el motivo cuando el cambio no completa lo que falta (portal con la versión vigente) y publicación del cambio que lo completa; verificar «editar sin completarlo» y «completar lo que falta» de HU-178
- [x] 2.4 Migración `0029_indicadores_publicacion` (solo booleanos y enteros por publicado, sin código ni datos personales, legible por `ps_portal`) y conteo en el dominio con la misma `evaluarPublicacion`; test que compara el conteo del portal con las marcas del panel sobre el mismo banco sembrado
- [x] 2.5 Dominio `avisosDeLenguaje` (lista de RF-3.6, `normalizar`, límite de palabra Unicode); tests primero con «disponible para asignación», «stock», «ITEM», «Stockholm» y una frase sin «unidad»
- [x] 2.6 Guardado del editor con `avisos[]` separado de `errores[]` (también cuando falla por la fecha futura) y aviso no bloqueante en la UI; verificar los cinco escenarios de HU-194
- [ ] 2.7 (capturas hechas en `ss2/fidelidad.md`; pendiente de aprobación del sponsor, D124: sin prototipo de la marca ni del aviso) Fidelidad con captura MCP del listado con marca y filtro «Incompleto», la pregunta D1 por incompleto y el aviso de lenguaje (con y sin error a la vez)
- [x] 2.8 Journey smoke: listado con un publicado sembrado sin SARO marcado → editar sin completarlo (pregunta) → completarlo y confirmar (deja de marcarse) → guardar una trayectoria con «stock» (aviso, guardado); evidencia en `ss2/` y checkpoint

## 3. Sub-slice 3 — Columnas SARO/DISC en importación, plantilla y exportación (HU-191)

- [ ] 3.1 Contrato `CAMPOS_IMPORTACION` con `saro_alcance`, `saro_fecha`, `disc_fecha` (encabezados autoexplicativos, ejemplo, alias); tests de contrato primero
- [ ] 3.2 Exportación (CSV y JSON) con el alcance en su forma registrada y plantilla con un alcance activo de ejemplo; verificar la ida y vuelta «sin cambios» y que la fila de ejemplo no da error
- [ ] 3.3 `calcularPlan`: alcance contra el catálogo cerrado normalizado (desconocido o desactivado sin tenerlo → error, nunca valor nuevo), fecha futura o ilegible → error con motivo y valor exacto, `[vaciar]` en publicado → error, en borrador → se aplica; tests primero con los tres ejemplos y el de vaciar
- [ ] 3.4 `aplicar_importacion` escribe los tres datos por `ServicioPerfiles` sin cambiar estados, con `origen = importacion` y actor; verificar «completar los publicados incompletos con una hoja» (dejan de marcarse, la ficha del portal muestra SARO y DISC, historial por importación)
- [ ] 3.5 Fidelidad con captura MCP de la vista previa con las tres columnas, las filas con error de SARO/DISC y la plantilla
- [ ] 3.6 Journey smoke: exportar → completar SARO/DISC de tres incompletos → pegar → vista previa → confirmar → listado sin marcas → ficha del portal con SARO y DISC; evidencia en `ss3/` y checkpoint

## 4. Sub-slice 4 — Tarjeta (HU-153, HU-081, HU-119)

- [ ] 4.1 Contrato `PerfilCatalogo` con `selloPersonal` y tecnologías en orden de carga; dominio `capacidadDeTarjeta`, `tecnologiasDeTarjeta` (5) y `selloValido`; tests primero
- [ ] 4.2 `TarjetaPerfil` con la capacidad primero, nombre y primer apellido, 5 tecnologías, sectores opcionales sin hueco, modalidad, país, banda de `banda.ts` y código al pie; verificar los tres escenarios de HU-153
- [ ] 4.3 Sello Personal en la tarjeta sin insignia ni puntaje; sello fuera de contrato omitido con registro `sello_fuera_de_contrato` sin datos personales; verificar los cinco escenarios de HU-081
- [ ] 4.4 Dominio `lineaDeEvidencia` con la tabla fija por tipo y el texto genérico de D96 con registro `criterio_sin_plantilla`; tests primero con todas las filas de la tabla y los ejemplos de HU-119
- [ ] 4.5 Evidencia ✓/– en la tarjeta y en el bloque «Frente a tu búsqueda» de la ficha a partir de `CriterioResuelto[]` (fuente productiva: filtro activo del banco; sin criterios en la selección del correo), mismo texto y orden en los dos lugares, sin porcentajes; verificar los siete escenarios de HU-119
- [ ] 4.6 Fidelidad con captura MCP de la tarjeta (con y sin Sello Personal, con evidencia ✓/–, «Por confirmar») en computador y teléfono
- [ ] 4.7 Journey smoke: entrar con código → selección (tarjetas con capacidad, sello y código al pie, sin evidencia) → ampliar al banco con un filtro → tarjetas con su línea ✓ → abrir la ficha con «Frente a tu búsqueda»; evidencia en `ss4/` y checkpoint

## 5. Sub-slice 5 — Ficha: verificado vs declarado, validación técnica y conversación por Trycore (HU-154, HU-155, HU-157)

- [ ] 5.1 Test primero que pide la respuesta de la ficha y de la tarjeta con un perfil sembrado con `aporte`, `vinculo` y todos los campos B.4 en el panel, y comprueba su ausencia; ajustar vistas/contratos si falla; verificar «datos internos que nunca cruzan al portal» de HU-154
- [ ] 5.2 Bloques «Verificado por Trycore» y «Declarado por la persona» en `FichaPerfil` (tratamiento propio, la experiencia solo en lo declarado); verificar los dos escenarios restantes de HU-154 en el portal y en la vista previa del panel
- [ ] 5.3 Validación técnica desplegable por clic/toque con los cinco campos de D59 en orden fijo, «Cumple el estándar», Nivel 0 sin fecha y la línea de la sesión de alineación, sin enlaces a artefactos; verificar los tres escenarios de HU-155 en computador y teléfono
- [ ] 5.4 Bloque de contacto con `ContactoTrycore` y el texto de representación comercial, sin acción «Escribir a Trycore» ni vía a la persona, idéntico para los tres vínculos; verificar los tres escenarios de HU-157
- [ ] 5.5 Fidelidad con captura MCP de la ficha (`validacion-tecnica` Nivel 1 y Nivel 0, bloques verificado/declarado, contacto) en computador y teléfono
- [ ] 5.6 Journey smoke: abrir la ficha desde la selección → desplegar la validación técnica → ver el contacto vigente → cambiar el contacto en el panel → la ficha lo refleja; evidencia en `ss5/` y checkpoint

## 6. Sub-slice 6 — Ficha: SARO/DISC y cierre con condiciones, SLA y garantía (HU-156, HU-158)

- [ ] 6.1 Contrato `FichaPerfil` con `seguridad` y `disc` anulables y «mes de año» del dominio; `armarFicha` desde la vista; tests primero de contrato (un heredado sin datos sigue abriendo ficha)
- [ ] 6.2 Líneas SARO (texto del alcance, también desactivado) y DISC con competencias en «Verificado por Trycore», omitidas sin marca si faltan, sin puntaje ni DISC detallado; verificar los cinco escenarios de HU-156
- [ ] 6.3 Cierre: condiciones operativas (ciudad según `armarFicha`), SLA de 10 días hábiles en el tamaño del texto, garantía Neural Speed con texto único; código fuera de la cabecera y del `<title>`, solo al pie con la línea del estándar; copy centralizado y marcado para revisión (D73); verificar los cuatro escenarios de HU-158
- [ ] 6.4 Regresión de la vista previa del panel (HU-129) con los bloques nuevos: mismo HTML que el portal para el mismo perfil
- [ ] 6.5 Fidelidad con captura MCP de la ficha completa (SARO/DISC, sin Sello Personal, heredado sin SARO, cierre y pie)
- [ ] 6.6 Journey smoke: ficha de un perfil completo (SARO, DISC, cierre, código al pie) → ficha de un heredado sin SARO (línea omitida, sin marca) → completarlo en el panel → la ficha muestra la línea; evidencia en `ss6/` y checkpoint

## 7. Sub-slice 7 — Encabezado del estándar y re-verificación del recorrido (HU-159, HU-120)

- [ ] 7.1 Dominio `fraseDelEstandar(conteo | null)`; tests primero con 0, 1 y `null`, y que ninguna frase incluye el número
- [ ] 7.2 Encabezado único en `packages/ui` montado en la selección, el banco y el encuadre sin selección, antes del primer contenido y en el flujo de la página, en cuatro dimensiones (corrige «cinco componentes» del prototipo); verificar los cuatro escenarios de pantallas y teléfono de HU-159
- [ ] 7.3 Conteo en el servidor del portal con `statement_timeout` corto, degradación a la versión descriptiva y registro `conteo_incompletos_no_disponible`; verificar «cero», «un incompleto» y «conteo no disponible» de HU-159 y los dos escenarios de afirmación de HU-178 (completar el último incompleto devuelve la frase)
- [ ] 7.4 Bloque de respaldo (Trycore University, Hive Mind, Coordinación de Servicio dedicada, SLA en el tamaño del texto) en la selección; verificar su escenario de HU-159
- [ ] 7.5 E2E de HU-120 contra lo construido (D47): siguiente en computador y teléfono con «3 de 5», extremos con botón y con flecha del teclado, cerrar vuelve a la misma lista con el mismo filtro y en la posición del tercer perfil; corregir en `PanelFicha.tsx`/`recorrido.ts` lo que falle; verificar los seis escenarios del requisito modificado
- [ ] 7.6 Fidelidad con captura MCP de `hero-neural-grid`, `franja-servicio` y el encabezado en el encuadre, en computador y teléfono
- [ ] 7.7 Journey smoke: selección con un incompleto (frase descriptiva) → completar el último en el panel → recargar (frase «ninguno») → recorrer fichas hasta el extremo → cerrar en la misma posición; evidencia en `ss7/` y checkpoint

## 8. Cierre de la épica

- [ ] 8.1 Recorrido integrado de punta a punta: alcance → captura → bloqueo → incompleto → importación → tarjeta → ficha → encabezado; verificar en verde con la base real
- [ ] 8.2 Tests de contrato (Newman) de los endpoints nuevos o ampliados del panel y del portal (fase api) y gate `data` (`data-consistency-checker`) sobre la guarda, el conteo y las plantillas de evidencia
- [ ] 8.3 Fidelidad final de todas las pantallas del slice con desviaciones aprobadas en `design.md`
- [ ] 8.4 Verificación adversarial de cableado (`wiring-adversarial-verifier`, contexto virgen) y cierre de `wiring_verified`, sin exigir HU-079 ni HU-175 (fuera de alcance por el DoR y D101)
- [ ] 8.5 DoD con `dor-dod-gatekeeper`; referencias `> OpenSpec change: ep-003-evidencia-del-perfil` en EP-003 y sus 15 HU; verificar con `change-epic-coherence`
- [ ] 8.6 PR a `main` y archivo del change con los specs sincronizados en `openspec/specs/`; verificar `openspec validate --specs` en verde tras archivar
