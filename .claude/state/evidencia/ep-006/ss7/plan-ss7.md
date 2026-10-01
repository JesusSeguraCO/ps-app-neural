# EP-006 · sub-slice 7 (HU-132, HU-136, HU-133) — plan

## Estado al abrir (tras cerrar el sub-slice 6 en 880c219)
- ss6 completo salvo HU-131 (D29, diferida por el sponsor). BD local migrada a 0018. Dev DB: PS-1314
  publicado con reporte confirmado; PS-1315 borrador sin rol; PS-13xx de los e2e.
- Hallazgo: RF-8.16 y la nota de HU-133 piden los motivos de pausa como catálogo administrable desde el
  panel, y Catálogos no tiene ese tipo (hueco de ss1). Se incluye aquí.

## Piezas
1. Migración 0019: `perfiles.pausado_en`; un pausado exige motivo y fecha de pausa (CHECK `NOT VALID`:
   sin DML, V3-7); `catalogo_motivos_pausa` con `descripcion` y `fusionado_en_id`; `fusionar_valor`
   admite `motivo_pausa`.
2. Dominio: tipo de catálogo `motivo_pausa`; `vigencia.ts` puro con fecha civil de Bogotá (V3-4):
   publicados sin actualizar > 30 días (orden por antigüedad, «por confirmar» primero, «dato
   incompleto» sin fecha), pausados > 30 días (31 sí, 30 no).
3. Infra: disponibilidad de uno o varios (resultado por perfil, auditoría, `inventario_version`),
   «confirmar sin cambios» (toca `disponibilidad_actualizada_en`), pausar con motivo, reactivar con
   disponibilidad (pasa las guardas de publicar), archivar idempotente; consulta de la bandeja.
   Importación y reversión mantienen `pausado_en`.
4. API (`perfil.escribir`): `POST /api/v1/perfiles/disponibilidad` (uno o en bloque),
   `POST …/{codigo}/pausar`, `…/reactivar`, `…/archivar`.
5. Panel: listado con disponibilidad en la fila y en bloque (prototipo `inventario-perfiles--lote`),
   «Pausar» con hoja de motivos y desvío a disponibilidad (`--pausar-motivo`), bandeja `/vigencia`
   (`bandeja-vigencia`, `--vacia`, `--pausado-reactivar`), pestaña «Motivos de pausa» en Catálogos;
   destino «Vigencia» del menú habilitado con su conteo.
6. Siembra ficticia: los tres motivos de RF-8.14.2 con su ayuda (local/CI/staging; en producción se
   crean desde Catálogos).

## Estado al cortar la sesión (2026-10-01, contexto agotado) — retomar aquí
Hecho y en verde (suite 955 ✓ antes de los dos últimos tests; migración 0019 aplicada en dev):
- 0019 (`pausado_en` con disparador, CHECK NOT VALID, `archivado_en`, motivos con `descripcion` y fusión,
  foto previa con `pausado_en`) + `migracion-0019.test.ts`; dominio `vigencia.ts` (8 tests, V3-4);
  infra `estado-perfil.ts` (8 tests BD real); tipo de catálogo `motivo_pausa` (Catálogos lo administra);
  rutas `/api/v1/perfiles/disponibilidad`, `…/{codigo}/pausar|reactivar|archivar`; listado con
  disponibilidad en la fila y en bloque, «Pausar» con hoja de motivos y desvío; bandeja `/vigencia`;
  menú «Vigencia» habilitado con conteo; HTTP `apps/vigencia-panel.test.ts` (5 ✓).
- Dev DB: perfiles propios PS-1328…1332 con fechas atrasadas (1328 por confirmar 107 d, 1329 86 d,
  1330 46 d); motivos de pausa sembrados; PS-0151 con motivo.
Pendiente, en este orden:
1. FALLO VISTO: en el listado la columna de acciones no cabe («Pausar» + «Editar» desbordan la tabla a
   1440). Hacer el menú «Más acciones» del prototipo (`inventario-perfiles--lote`) con «Pausar» (y en
   ss8 «Archivar»), o resolver el ancho; comprobar sin scroll horizontal a 1440/390.
2. Clics reales (MCP) y capturas: `inventario-perfiles--lote` (aplicar en bloque → resultado por perfil),
   `--pausar-motivo` (pausar PS-1331; desvío «Poner la fecha» abre la fecha en la fila),
   `bandeja-vigencia` (atrasar `pausado_en` de PS-1331 a 64 d), `--pausado-reactivar`, `--vacia`.
3. Mutación acotada (`ss7/mutar-ss7.py`) sobre vigencia.ts, estado-perfil.ts, 0019 y las rutas.
4. e2e en `e2e/marco.panel.spec.ts` (actualizar en bloque → pausar → bandeja con +31 días → reactivar;
   ya actualicé la cuenta de destinos del menú a 5 deshabilitados) y suite e2e completa.
5. Evidencia `ss7/tdd-ss7.md`, `fidelidad-ss7.md`, `journey-ss7.md`; sembrar y marcar el wiring de ss7
   (HU-132×3, HU-133×4, HU-136×5) solo con evidencia; marcar 7.1–7.5 en tasks.md.
Desviaciones a registrar (D31, bajo D27): «quién lo cambió» no se muestra en la fila (está en la
auditoría, HU-138 en ss10); sin «Deshacer» en el aviso de la bandeja; sin «en N enlaces activos»
(enlaces curados aún no existen); «Ver los que entran esta semana» de la bandeja vacía no se construyó.

## Avance tras retomar (2026-10-01, `30d4e65`)
- Hecho: punto 1 (menú «Más acciones»; hoja sin `nowrap`) y la mayor parte del 2 (clics y capturas de
  `--lote`, `--pausar-motivo`, `bandeja-vigencia`, `--pausado-reactivar`; ver `fidelidad-ss7.md`).
- Falta del 2: captura de `bandeja-vigencia--vacia` y probar el desvío «Poner la fecha en que queda
  libre» con clic (abre la fecha en la fila).
- Siguen pendientes 3 (mutación), 4 (e2e propio) y 5 (evidencia + wiring), y registrar D31.

## Cierre del sub-slice 7 (2026-10-01, sesión 3)
- Capturas que faltaban: `bandeja-vigencia--vacia` (copia desechable de la BD, borrada), desvío «Poner la fecha» con clic, 390 de listado y bandeja.
- Construido además: «· en N enlaces activos» en la causa de la fila (prototipo), con test rojo→verde en infra y HTTP.
- Mutación 17/17 (dos tests nuevos para M11/M12); observadora: sin cambio ni auditoría tras 403.
- e2e propio del recorrido + `/vigencia` y motivos en la ronda de axe; suite 962 ✓, e2e 51 ✓.
- D31 registrada; wiring ss7 sembrado (12) y en passing con evidencia en `wiring/`; re-emitido HU-126-ac1 (rechazado antes por `slice_id` vacío).
- Siguiente: sub-slice 8 (HU-134, HU-135: coherencia estado/disponibilidad y archivar).
