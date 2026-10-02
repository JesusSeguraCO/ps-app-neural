# EP-003 · gate fidelity (tarea 8.3)

- sha HEAD: 227a06fc87d72d6b81214e24decc26aad87badf6 · rama: feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T22:46:56Z
- Método: capturas reales con MCP chrome-devtools (contexto aislado «ep003») de la app de este worktree contra la
  BD aislada `ps_ep003` (D125), comparadas con el prototipo v2 (`docs/07-prototipo/`) y `docs/05-prototipo/pantallas/`.
- Desviaciones consolidadas y registradas en `openspec/changes/ep-003-evidencia-del-perfil/design.md`
  § «Fidelidad final de la épica · desviaciones registradas (tarea 8.3; D124, D126, D134)».

## Re-verificación en HEAD (portal 3200 + borde 3204, sesión de la selección de 5 perfiles del recorrido integrado)
| Pantalla | Captura | Observado |
|---|---|---|
| Selección: encabezado del estándar (frase descriptiva con incompletos en el banco), 5 tarjetas, respaldo con SLA | fidelidad-final/seleccion-encabezado-tarjetas-computador.png | igual a ss7 (marca núcleo + 4 nodos, cuatro dimensiones D64; D134) y ss4 (título = capacidad, banda, código al pie) |
| Ficha en hoja lateral: «Verificado por Trycore» con SARO (texto del alcance · marzo de 2026), DISC (abril de 2026), validación técnica abierta; declarado; contacto | fidelidad-final/ficha-computador.png | estructura del prototipo v2 §6 (`ficha-perfil.tsx`, `validacion-tecnica.tsx`), desviaciones de ss5/ss6 |
| Ficha en teléfono 390 px: pantalla completa | fidelidad-final/ficha-telefono.png | sin scroll horizontal; consola sin errores ni avisos |

## Consolidado por sub-slice (capturas reales previas, una por pantalla)
| SS | Fichero | Referencia | Veredicto |
|---|---|---|---|
| SS1 catálogo de alcances, editor, vista previa | ss1/fidelidad.md (6 capturas) | sin prototipo → patrones EP-006 | DESVIACIÓN REGISTRADA (D124) |
| SS2 marca/pestaña «Incompletos», aviso de lenguaje, D1 | ss2/fidelidad.md (5) | inventario-perfiles, perfil-editor--incompleto-al-guardar | DESVIACIÓN REGISTRADA (D124/D126) |
| SS3 importación SARO/DISC | ss3/fidelidad.md (2) | importar-perfiles* | DESVIACIÓN REGISTRADA (D126; corte del selector → D73) |
| SS4 tarjeta y «Frente a tu búsqueda» | ss4/fidelidad.md (8, con prototipo-resultados-tarjetas.png) | v2 tarjeta-perfil / resultados.html | FIEL con 6 desviaciones a favor de HU/PRD |
| SS5 ficha: validación técnica, verificado, contacto | ss5/fidelidad.md (7, con prototipo-ficha-perfil.png) | v2 validacion-tecnica / ficha-perfil.html | FIEL con 4 desviaciones a favor de HU |
| SS6 SARO/DISC/Sello, cierre, referencia | ss6/fidelidad.md (4) | v2 §6 | FIEL con 4 desviaciones a favor de HU |
| SS7 encabezado del estándar y respaldo | ss7/fidelidad.md (5) | v2 §1 hero-neural-grid, franja-servicio | DESVIACIÓN REGISTRADA (D134) |

Veredicto: PASS — toda pantalla de la épica tiene captura real contra su referencia; las desviaciones están
registradas en design.md con su decisión (D124/D126/D134 elegidas por delegación del sponsor, revisables en el PR).
Fuera de este gate (Release Gate): textos de 12 px heredados (M-8) y la pasada de copy D73.
