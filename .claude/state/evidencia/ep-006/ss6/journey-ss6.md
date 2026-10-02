# EP-006 · sub-slice 6 — journey smoke (clics reales; BD local 0018)

Reproducible: `e2e/marco.panel.spec.ts` «editar un publicado y su reporte (HU-126, HU-140, HU-130)» — Chrome de Playwright contra el panel standalone :3101, perfiles propios creados por la API. Suite e2e completa: 48 ✓ (1 omitido preexistente), axe sin incidencias serias en las dos hojas y en el borrador, consola sin errores.

1. Publicado → cambio «Años de experiencia» → «Guardar cambios» → hoja «Esto cambia para el cliente» → «Confirmar cambios» → aviso «Cambios confirmados. El portal ya los muestra.»
2. Quitar la única tecnología → «Guardar cambios» → «Este cambio deja el perfil incompleto» → «Pasar a borrador» → aviso y editor en borrador (fuera del portal).
3. Otro publicado → «Registrar reporte detallado» → borrador «De la modalidad de prueba» → corrijo entregables («Editado por ti») → escribo evaluador, fecha, resultado → «Confirmar» sin revisión dice qué falta → marco «Revisé cada campo» → confirmo → «Reporte confirmado. La ficha del portal ya lo muestra, sin republicar.» → vista previa con «Validación técnica · Aprobada, nivel senior · Evaluó: …», sin scroll a 320/390.
4. Por MCP (ver `fidelidad-ss6.md`): PS-1314 con `ps_portal` antes/después de confirmar el impacto y el reporte; descartar sin rastro; PS-1315 sin rol → el botón del reporte lleva al rol.

Fuera de este recorrido por D29: adjuntar y descargar el artefacto (HU-131).
