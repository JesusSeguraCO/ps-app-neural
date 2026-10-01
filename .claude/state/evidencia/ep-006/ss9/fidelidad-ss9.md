# EP-006 · sub-slice 9 — fidelidad y clics reales (MCP chrome-devtools)

- Panel standalone :3101 (NODE_ENV=production, dobles, sin EDGE_SECRET) sobre la BD de desarrollo en 0022, build de
  `591711b`. Sesiones de karen.rodriguez@ (administradora) y e2e-observador@ (consulta) creadas en la BD.
- Datos propios creados por la API real (`sembrar-fid.mjs`, fuera del repo): PS-1464…1473 con los nombres del
  prototipo, seis colocados del panel y una carga de tres de Operaciones. Los ficticios no se tocaron. Al terminar se
  archivaron los diez (cierra sus colocaciones), se devolvieron las fechas de las cargas y el aviso encolado quedó
  `caducado` para que el worker local no lo envíe.
- Comparación lado a lado con `docs/05-prototipo/pantallas/*.html` a 1440 (`proto-colocados--carga-operaciones-1440.png`).

| Pantalla | App | Veredicto |
|---|---|---|
| colocados | `app-colocados-1440.png` | FIEL: meta con cuentas, fuente y corte; grupos «Vencen en los próximos 60 días · N · hasta el …» y «Después de 60 días»; faltan destacados; fuente «Panel · correo» / «Operaciones · corte …»; pie. Bandas con los rótulos del PRD (sponsor 2026-09-28). |
| colocados--registrar | `app-colocados--registrar-1440.png` | FIEL: hoja con perfil (publicados sin colocación), «Hoy: «…»», cliente, inicio = hoy, liberación con su ayuda. Clic real en «Guardar colocado» → aviso «Laura Méndez quedó colocado en Bancolombia hasta el 18 dic 2026…» y fila en la tabla; el portal ve 2026-12-18. |
| colocados--sin-fecha-liberacion | `app-colocados--sin-fecha-liberacion-1440.png` | FIEL: campo en rojo y «Un colocado siempre lleva su fecha de liberación. No se guardó: Laura Méndez sigue publicado con «Disponible ahora».»; nada se envió. |
| colocados--en-el-portal | `app-colocados--en-el-portal-1440.png` | FIEL: Asignación (registrada por, cuenta, inicio, vence · faltan), En el inventario (Publicado, disponible desde · fin de la asignación), Lo que ve el cliente (rol, nombre, banda) y «Desde el 14 oct · 1 mes». Sin sectores ni modalidad (D35). |
| colocados--carga-operaciones | `app-colocados--carga-operaciones-1440.png` | FIEL: «Carga aplicada: 3 filas de …csv. 3 colocados nuevos. La fecha de corte es el momento de esta carga. Se ignoró la columna «Observaciones»…»; corte «hoy, 3:15 p. m.» en la meta. Los botones bajan de línea porque la meta es más larga («· 1 de la migración»). |
| colocados--formato-no-admitido | `app-colocados--formato-no-admitido-1440.png` | FIEL: subida real de `archivos/asignaciones-octubre.xlsx` → «No se cargó asignaciones-octubre.xlsx. Solo se admite un archivo JSON o CSV. Nada cambió… (hoy, 3:15 p. m.)» con «Elegir otro archivo». |
| colocados--carga-filas-con-error | `app-colocados--carga-filas-con-error-1440.png` | FIEL: subida real de `archivos/asignaciones-operaciones-02oct.csv` → «Se aplicaron 3 de 5 filas…», «Filas que no se aplicaron»: fila 4 PS-237 (formato) y fila 6 «30/02/2027» no válida. |
| colocados--diferencia-operaciones | `app-colocados--diferencia-operaciones-1440.png` | FIEL: «Diferencias con Operaciones · 1 · gana el panel hasta que decidas»; Santiago Herrera, fila 5, «En el panel · karen… Liberación 13 nov 2026» / «En Operaciones Liberación 30 nov 2026»; clic en «Aceptar la de Operaciones» → aviso y el portal pasa a 2026-11-30. |
| colocados--corte-desactualizado | `app-colocados--corte-desactualizado-1440.png` | FIEL: cargas atrasadas 9 días → «corte 22 sep … · dato desincronizado» y aviso «La última carga de Operaciones es del 22 sep: hace 9 días sin una nueva. Sus 4 colocados siguen a la vista…» con «Cargar archivo». |
| inventario-perfiles--observador | `app-inventario-perfiles--observador-1440.png` | FIEL: columna «¿Dato desactualizado?» con «Avisar» por fila; sin crear, editar, seleccionar ni «Más acciones». El aviso «Llegaste por la dirección…» del prototipo aparece en `/inventario?rechazado=nuevo` (cubierto por test HTTP). |
| perfil-editor--observador | `app-perfil-editor--observador-1440.png`, `…-avisar-1440.png` | FIEL: «Tu rol es de consulta. Llegaste por la dirección de edición de PS-1473: no se cambió nada y el intento quedó en la auditoría…», «Avisar a Talento Humano» y «Vista previa»; formulario inerte. Clic real: hoja con el perfil identificado y nota → «Aviso enviado a Talento Humano sobre Laura Méndez (PS-1473).»; `acceso_rechazado` registrado (`GET /inventario/PS-1473`). Desviación menor: los buscadores del catálogo se ven deshabilitados en vez de ocultos (igual desde ss2). |
| móvil | `app-colocados-390.png` | Lista apilada del prototipo; sin scroll horizontal (la ventana de Chrome no baja de 500 px; Playwright verifica 320 y 390). |

Consola sin errores ni avisos.
