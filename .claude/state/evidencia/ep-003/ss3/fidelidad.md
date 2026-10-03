# SS3 · fidelidad visual (tarea 3.5) — PENDIENTE DE APROBACIÓN DEL SPONSOR (D124)

- sha: 2f24debdf795401877264e5a0ae378b320060020 · rama feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T20:22:08Z
- Captura real con MCP chrome-devtools (contexto «ep003»), panel de este worktree en 3201 (borde en 3202)
  contra `ps_ep003` (0029 re-aplicada con las claves del lote). 1440 px de ancho, página completa.
  Nada se confirmó: el lote quedó «calculado» (el banco no cambió).

## Referencia
`docs/05-prototipo/pantallas/importar-perfiles.html`, `importar-perfiles--vista-previa.html` y
`importar-perfiles--filas-con-error.html`: las tres columnas nuevas no están dibujadas; se pintan con los
mismos componentes aprobados (fila de emparejamiento, tarjeta «Actualizados» con antes → después, tarjeta
«Con error» con el motivo y la fila cruda). Mismo trato D124 que SS1/SS2.

| Pantalla | Captura | Observación |
|---|---|---|
| Pegar y emparejar con las tres columnas | fidelidad/importar-emparejamiento-tres-columnas.png | se reconocen por nombre; el selector corta «Alcance de la verificación SAR…» (ancho fijo del prototipo) |
| Vista previa: actualizados y errores SARO/DISC | fidelidad/vista-previa-saro-disc-y-errores.png | alcance en su forma registrada aunque se escribió en minúsculas; 15/03/2026 → 2026-03-15; los 4 motivos de HU-191 con el valor exacto |
| Plantilla de muestra (CSV) | (descarga; contenido verificado) | encabezados autoexplicativos y la fila PS-0900 con «Antecedentes judiciales, disciplinarios y fiscales», 2026-03-15, 2026-04-10 |

Observación menor para el sponsor: el selector del campo trunca el nombre largo del alcance; se puede
acortar la etiqueta a «Alcance SARO» en la pasada de copy (D73). El gate `fidelity` NO se toca.
