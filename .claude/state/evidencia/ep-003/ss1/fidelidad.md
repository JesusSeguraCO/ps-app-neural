# SS1 · fidelidad visual (tarea 1.9) — PENDIENTE DE APROBACIÓN DEL SPONSOR

- sha: a255155ee92dbde40a8fd1c8293b3c4930831ce7 + arreglo de la hoja de impacto (lista fuera del aviso) en el commit siguiente
- hora: 2026-10-02T19:38:28Z · rama feature/ep-003-evidencia-del-perfil
- Captura real con MCP chrome-devtools, contexto aislado «ep003», panel de este worktree en 3201 (vía un
  borde emulado en 3202 que añade la cabecera de borde, como la Transform Rule de Cloudflare) contra la BD
  aislada `ps_ep003`. 1440×900. Consola sin errores ni avisos.

## Sin prototipo: no se inventa ni se aprueba
Se buscó «SARO», «DISC», «alcance» y «validaciones de entrada» en `docs/07-prototipo/` (v2 .dc.html y
tokens) y en `docs/05-prototipo/pantallas/` (catalogos*, perfil-editor*, vista-previa*): **ninguna
pantalla dibuja la pestaña de alcances SARO, la corrección con impacto, el alcance desactivado ni el
bloque de validaciones de entrada del editor**. Lo construido reutiliza tal cual los patrones ya aprobados
de EP-006 (pestaña de catálogo con «Lo que ve el cliente» como la modalidad de prueba; hoja de duplicado
de `catalogos--duplicado`; aviso + lista de fichas de `catalogos--modalidad-en-uso`; campos y errores de
`perfil-editor`; fila del bloque «Verificado por Trycore» de la vista previa). Las capturas quedan como
**borrador para aprobación del sponsor** (o para extraerlas con `/build:prototype` modo feature). El
gate `fidelity` NO se toca.

| Pantalla | Captura | Patrón reutilizado | Observación |
|---|---|---|---|
| Catálogos · pestaña Alcances SARO | fidelidad/catalogos-alcances-saro.png | catalogos | columna «Lo que ve el cliente» y «N publicados» |
| Crear · idéntico salvo mayúsculas | fidelidad/catalogos-duplicado.png | catalogos--duplicado | mismo texto y «Ver en la lista» |
| Editar texto en uso · impacto previo | fidelidad/catalogos-impacto-correccion.png | catalogos--modalidad-en-uso | botón pasa a «Confirmar corrección»; la lista de fichas se sacó del aviso (estaba apretada en la primera captura) |
| Alcance desactivado en la lista | fidelidad/catalogos-desactivado.png | catalogos (fila inactiva) | «Desactivado · sus perfiles lo conservan» |
| Editor · validaciones de entrada (alcance desactivado conservado) | fidelidad/editor-validaciones-desactivado.png | perfil-editor | opción «(desactivado)» + nota; fechas con max=hoy; lateral con 7 condiciones |
| Vista previa · SARO y DISC | fidelidad/vista-previa-saro-disc.png | vista-previa-ficha | presentación final de la ficha es de HU-156 (SS6) |

Decisión para el sponsor: aprobar estas pantallas como están (registrar la desviación en design.md) o
pedir su extracción a prototipo antes de cerrar `fidelity` al final de la épica.
