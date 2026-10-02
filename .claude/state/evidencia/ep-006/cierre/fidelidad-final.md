# EP-006 · 11.3 — fidelidad final contra el prototipo (2026-10-01)

Manifiesto `docs/05-prototipo/manifest.json`: **66 pantallas de EP-006. Resultado: 64 FIEL + 2 N/A = 66.**

| Grupo | Pantallas | Cómo se verificó hoy | Veredicto |
|---|---|---|---|
| Inventario y vigencia | 10 | MCP, lote A + re-verificación R | 10 FIEL (`bandeja-vigencia--vacia` por la evidencia de ss7: vaciarla exigía tocar datos de otros lotes) |
| Editor, borrador de evidencia y vista previa | 14 | MCP, lote B + R | 14 FIEL |
| Importar | 10 | MCP, lote C + R | 10 FIEL |
| Catálogos y léxico | 10 | MCP, lote D + R | 10 FIEL |
| Colocados | 9 | MCP, lote E + R | 9 FIEL |
| Administración y auditoría | 11 | MCP en 10.6 sobre `d2c5f4c` (después solo cambiaron tests hasta esta pasada; el menú de la observadora se re-verificó en R) | 11 FIEL |
| `perfil-editor--adjunto-no-admitido`, `borrador-evidencia--sin-texto` | 2 | — | N/A: HU-131 diferida (D29, aprobada en el hub) y sin artefacto no hay borrador «sin texto» (D30(7)) |

Entorno: BD efímera `ps_t_9bb06e62` (ficticios + datos propios de cada lote), panel/portal standalone y worker con el doble de
Mailgun; entrada real por código de un uso. Informes por lote: `fidelidad/lote-{A,B,C,D,E,R}.md`; capturas
`fidelidad/app-<slug>-1440.png`; prototipo en `.local/fid-final/proto/` (fuera de Git).

**Desviaciones nuevas encontradas y corregidas** (commit `4850728` y el orden de posteriores): botón «Importar» en el
inventario; menú de la observadora con los destinos del prototipo y de D14 (D43); ayudas superpuestas en «reactivar»; «Guardar
cambios» y «Registrar reporte detallado» en la vista previa; campos inertes en gris; «Historial» en el paso 1 de Importar; fila
pedida resaltada y «Ver perfiles» en «revertir no es la última», con las posteriores de la más reciente a la más antigua;
candidata de origen resaltada en el léxico; marca «· diferencia con Operaciones», «· nuevo» y «corte hoy HH:MM» en Colocados.
**Defectos encontrados y corregidos con test:** el historial contaba las filas excluidas; la vista previa desordenaba las celdas
al recalcular; «La usan 1 perfil»; Enter en el buscador de catálogo ofrecía crear un valor que ya existía; el error de la fecha
de liberación no se iba al corregirla.

**Desviaciones aprobadas** (registradas en `design.md` §12): ss1 (D42, sponsor), ss2–ss4 (D22, D25, sponsor), ss5 (D28), ss6
(D30), ss7 (D31), ss8 (D32), ss9 (D33, D35–D37), ss10 (D38–D41), pasada final (D43).

Sin verificar con captura nueva: el orden de las importaciones posteriores (cambio de una consulta, cubierto por los tests de
reversión que siguen en verde).
