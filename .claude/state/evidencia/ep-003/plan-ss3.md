# EP-003 · arranque del sub-slice 3 (HU-191)

Estado de partida (SS2 hecho, sin push): 0029 (`operacion.indicadores_publicacion`) aplicada solo en BD
temporales y en `ps_ep003` (D125). `estadoDeEntrada`/`contarIncompletos` (dominio/inventario/entrada.ts),
marca y filtro «Incompletos» en /inventario y en GET /api/v1/perfiles, pregunta D1 con `faltaPara`,
`avisos[]` de lenguaje (lenguaje.ts) en alta, borrador, publicado y 422.
Heredados de demo: `sembrarHeredadosIncompletos` / `migrar.js --sembrar-ficticios --heredados-incompletos`
(PS-0105 sin SARO, PS-0112 sin SARO ni DISC, PS-0118 sin DISC, PS-0124 sin modalidad). Ya sembrados en ps_ep003.

Tareas (tasks.md §3), TDD:
1. 3.1 `CLAVES_CAMPO` + `CAMPOS_IMPORTACION`: saroAlcance, saroFecha, discFecha tras modalidadPrueba. OJO: el
   bloqueo B.4 de emparejar.ts tumba toda columna con «disc»: excepción solo para la fecha DISC.
   El test de contrato «nunca hay columna … disc» hay que acotarlo a la fecha.
2. 3.2 `bancoEnFormato` exporta el nombre registrado del alcance y las fechas; `ejemplosPlantilla(alcanceActivo)`
   y la ruta de plantilla lee un alcance activo.
3. 3.3 `calcularPlan`: `Catalogos.alcancesSaro` (nombre+activo); motivos de HU-191 con el valor; DD/MM/AAAA
   aceptada (el ejemplo «15/11/2026»); `[vaciar]` en publicado → error.
4. 3.4 `Traductor.entrada` → saroAlcanceId/saroFecha/discFecha por ServicioPerfiles; SQL_ESTADO_PREVIO y
   COLUMNAS de revertir con las tres columnas.
5. 3.5 fidelidad (vista previa, errores, plantilla) · 3.6 journey smoke.
Tests ya escritos en rojo: dominio/importacion/plan-saro.test.ts, contratos/importacion-saro.test.ts,
apps/importacion-saro-panel.test.ts.
