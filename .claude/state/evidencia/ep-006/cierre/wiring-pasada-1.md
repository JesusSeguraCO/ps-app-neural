# EP-006 · verificación adversarial del cableado — pasada 1 (completa)

- Rama `feature/ep-006-administracion-del-inventario`, HEAD `b4110f8` (árbol de código limpio; solo cambia evidencia en `.claude/`).
- Verificador: `wiring-adversarial-verifier`, contexto virgen, solo lectura salvo este informe.
- **Veredicto: HUECOS → `wiring_verified = false`** (1 ALTA, 3 MEDIA, 3 BAJA).

## Lo que se ejecutó en esta pasada

| Qué | Resultado |
|---|---|
| `tools/loop/integration-check.sh` (lo lanzó el orquestador en paralelo; reporte `.claude/state/integration-report.txt`, leído al terminar) | VERDE: build, migrar, lint, tipos, vitest **1203 ✓ / 1 omitido** (107 ficheros, `REQUIERE_BD=1`), Playwright **58 ✓ / 1 omitido** (filtro de proyecto), Lighthouse ✓ |
| vitest por fichero, corrido por mí: `recorrido-ep006`, `registro-perfil`, `observador-panel`, `aplicar-importacion-panel`, `ficha-compartida`, `catalogos-lexico-panel`, `pruebas/entorno` | 7 ficheros, 53 ✓ |
| Newman, corrido por mí (`tests/postman/correr-ep-006.sh` → scratchpad, sin pisar la evidencia) | 226 peticiones, 350 aserciones, 0 fallos |
| Lo omitido | vitest: `packages/infra/src/gemini/frontera-real.test.ts` (sin `GEMINI_API_KEY`). La guarda `entorno.test.ts` confirma que con `REQUIERE_BD=1` ningún test de BD o de servidor se salta en silencio |
| Búsquedas | sin TODO, FIXME, stubs ni `not implemented` en los 206 ficheros de producción del diff; cada ruta de escritura declara su acción; las 46 rutas nuevas tienen quien las llame desde la UI; el worker despacha `aplicar_importacion`, `revertir_importacion` y `notificar(dato_desactualizado)` y planifica `proponer_lexico` |
| HU-131 / `I-spaces-subida-csp` (diferidos, D29) | nada a medias expuesto: sin tabla `artefactos`, sin SDK de S3 ni URL prefirmadas, sin `evidencia.subir`/`evidencia.descargar` en la matriz, sin CSP del bucket, sin botón de adjuntar |
| `BND-llm-interpreter-suggest-lexicon-entries` (evidencia viva) | anclada: `packages/infra/src/gemini/**` no cambia desde `e772614` (HTTP 200, esquema estricto). Se conserva; no se volvió a ejecutar |

## Hallazgos (por prioridad)

### H1 · ALTA · HU-138-ac2-sin-identidad (y sus gemelos HU-151-ac2-bajar-rol y HU-151-ac3-baja)
- **Escenario:** la sesión de la administradora vence con el editor abierto y pulsa «Guardar». La API responde 401 `{motivo:"sesion_expirada"}` y el editor muestra «No se pudo guardar. Inténtalo de nuevo.». No le pide volver a entrar, así que reintentar falla una y otra vez. Pasa lo mismo con `rol_cambiado` y `sin_sesion` (rol bajado o baja) en **todas** las acciones del navegador, porque todas pasan por `enviarJson`.
- **Dónde:** `apps/panel/src/acceso/cliente.ts:9-21` no trata el 401. `apps/panel/src/inventario/EditorPerfil.tsx:62-76` (`MOTIVO`) no tiene `sesion_expirada`, `rol_cambiado` ni `sin_sesion`, y las líneas 412, 431 y 483 caen en el mensaje genérico. En `apps/panel/src` ningún componente maneja esos motivos.
- **El test prueba otra cosa:** `apps/registro-perfil.test.ts:241-253` comprueba el 401 de la API y que *otra página* (GET `/inventario/PS-0151/auditoria`) redirige a `/acceso`. No recorre «intento guardar → me pide volver a entrar». El e2e de HU-151 (`e2e/marco.panel.spec.ts:855-857`) también lo comprueba solo navegando a otra página.
- **Arreglo mínimo:** en `enviarJson`, ante un 401 con `motivo ∈ {sin_sesion, sesion_expirada, rol_cambiado}`, ir a `destinoSinSesion(motivo)` (`/acceso?motivo=…`; la puerta ya explica el `rol_cambiado`) y que la puerta tenga texto para `sesion_expirada`. Añadir un e2e: sesión vencida en la BD → pulsar Guardar en el editor → URL `/acceso…` y ninguna fila nueva en la auditoría.

### H2 · MEDIA · HU-124-ac1-consulta (importación)
- **Escenario:** la observadora abre un lote, por ejemplo desde el enlace al lote del registro de auditoría (HU-138 ac3). Ve «Descargar las N filas» y «Ver para copiar». Las dos piden `GET /api/v1/importacion/lotes/{id}/errores`, que exige `importacion.ejecutar`, y responden 403. La descarga baja un JSON de error, el área de copiar queda vacía y el intento se registra como `acceso_rechazado`. También ve «Pegar filas». Al mismo tiempo, «Descargar reporte» del mismo lote no exige permiso, así que las dos descargas del mismo lote siguen reglas distintas.
- **Dónde:** `apps/panel/src/importacion/Resultado.tsx:310-320` y `:349-360` no reciben `puedeDeshacer`/rol. `apps/panel/app/api/v1/importacion/lotes/[id]/errores/permisos.ts` frente a `.../reporte/route.ts:10-11`, que no tiene `conAutorizacion`. El test `apps/observador-panel.test.ts:115-146` solo mira `/importar` sin `?lote=`.
- **Arreglo mínimo:** ocultar las acciones de errores y «Pegar filas» si no hay `importacion.ejecutar`, o abrir `errores` a ambos roles igual que `reporte`. Decidirlo y fijarlo con un test que mire `/importar?lote=…` como observadora.

### H3 · MEDIA · HU-139-ac1-equivalencia / IP-ss1-lexico-portal
- **Escenario:** el AC dice «las búsquedas siguientes lo reconocen». `interpretarConsulta`/`vocabularioBusqueda` (`packages/infra/src/postgres/lexico.ts:479-510`) **no tiene quien la llame en producción**: solo la llama el test (`apps/catalogos-lexico-panel.test.ts:293-307`, que hace de «portal» con el rol `ps_portal`). La búsqueda real del portal (`apps/portal/app/banco/page.tsx` → `filtroDeConsulta`, `packages/dominio/src/catalogo/encuadre.ts:53-60`) filtra por categoría o rol y no lee el léxico. Hoy, aprobar un término no cambia nada de lo que ve un cliente. `ss1/journey-ss1.md` dice que «la búsqueda del portal… reconoce», y eso no es cierto en el producto.
- **Lectura:** el intérprete de texto libre es de EP-009 (RF-2.6), así que puede ser un orden legítimo entre épicas. Pero no está registrado: ni el DoR ni una decisión dicen que la búsqueda que consume el léxico llega con EP-009. D42 lo dice solo del texto de las candidatas.
- **Arreglo mínimo:** registrar la dependencia (decisión del hub o nota en `design.md` §12 aprobada por una persona) y llevar el item a EP-009 como punto de integración pendiente, o conectar `interpretarConsulta` a la búsqueda actual del portal. Corregir el texto de `journey-ss1.md`.

### H4 · MEDIA · HU-130-ac3-detalle-despues, HU-127-ac4-parcial-despersonaliza, HU-129-ac1-vista-fiel (lado cliente)
- `fichaDelPortal` (`packages/infra/src/postgres/catalogo.ts:97-130`) no tiene quien la llame en producción. El portal no tiene pantalla de ficha, así que «el cliente que la abra ve la evidencia por criterio» y «los clientes nombrados no aparecen en su ficha» solo se comprueban sobre la proyección (`apps/ficha-compartida.test.ts`), no en una pantalla del cliente. Esto **sí** está registrado (D28 y `design.md` §12: la monta EP-003, dueña de RF-3.2), por eso no lo cuento como recorte. Pero D28 lo aprobó el modelo bajo D27, y D27 deja «diferir» como decisión humana.
- **Arreglo mínimo:** que una persona confirme en el hub que la ficha del cliente es alcance de EP-003 (no se difiere nada de EP-006) y llevar `fichaDelPortal` como punto de integración obligatorio del DoR de EP-003. Con esa confirmación, estos items pueden quedar `passing`.

### H5 · BAJA · I-publicar-editor-api-bd-portal / recorrido 11.1
- `apps/recorrido-ep006.test.ts:215` se titula «…ve el perfil con su validación», pero solo comprueba el nombre en `/` del portal (líneas 241-242). La validación no se mira en el lado cliente (por la misma razón que H4). Arreglo: corregir el título o comprobar la proyección.

### H6 · BAJA · higiene de la BD de desarrollo (memoria «BD dev = BD de e2e»)
- `e2e/marco.panel.spec.ts:883` hace `DELETE FROM inventario.configuracion_contacto` al terminar. Borra cualquier contacto configurado a mano en la BD de desarrollo. Mejor restaurar el valor previo que borrar.

### H7 · BAJA · observadora en `/inventario/{c}/validacion`
- `apps/panel/app/inventario/[codigo]/validacion/page.tsx:24` redirige a la página de edición, y es allí donde se registra el `acceso_rechazado`. El recurso que queda auditado no es el que se pidió. Arreglo: llamar al rechazo explicado en la propia ruta.

## Items de `wiring_checklist[]` que deben quedar `failing`
- `HU-138-ac2-sin-identidad` (H1) · `HU-151-ac2-bajar-rol`, `HU-151-ac3-baja` (gemelos de H1: la sesión se corta en el servidor, pero la acción en curso no lleva a la persona a volver a entrar)
- `HU-124-ac1-consulta` (H2)
- `HU-139-ac1-equivalencia`, `IP-ss1-lexico-portal` (H3, hasta que se registre la dependencia o se conecte)
- `HU-130-ac3-detalle-despues`, `HU-127-ac4-parcial-despersonaliza`, `HU-129-ac1-vista-fiel` (H4, hasta que una persona lo confirme en el hub)

## Reproducidos en esta pasada (para `verified_at_sha = b4110f8`)
Los 128 items deterministas (135 − 5 de HU-131 − `I-spaces-subida-csp` − la frontera viva de Gemini), reproducidos por la suite completa (vitest + Playwright) en HEAD `b4110f8` y por Newman. Los 9 de arriba se reprodujeron, pero se dan como `failing` por los huecos descritos.
Conservado sin re-ejecutar: `BND-llm-interpreter-suggest-lexicon-entries` (evidencia viva anclada en `e772614`; el módulo no ha cambiado desde entonces).
Diferidos por D29, no evaluados: `HU-131-ac1..ac5`, `I-spaces-subida-csp`.
