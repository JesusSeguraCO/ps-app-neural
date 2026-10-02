# Release Gate R1-mvp · tramo EP-001 + EP-006 — RETOMAR AQUÍ (2026-10-02)

Estado: EP-006 mergeada (PR #10, c3ff45b) y archivada en el hub. Release Gate corrido sobre `acce296..c3ff45b`.
Veredictos medidos (informes en esta carpeta): security PASS · smell FAIL · stack_arch FAIL · coherence FAIL · ux FAIL ·
integration PARCIAL (riesgos declarados, `integration.md`).

Arreglos de los bloqueantes en **PR #11** (`fix/release-r0-hallazgos`), runner verde. Decisiones: D50–D51
(`.claude/state/evidencia/ep-006/decisiones-sponsor-2026-10-01.md`); backlog arquitectónico E-13 a E-15.

## Pasos que faltan
1. CI del PR #11 en verde → merge (decisión del sponsor).
2. ✅ Re-verificación incremental hecha (2026-10-02, `1f9f6cf`): smell, stack_arch, coherence y ux **PASS** (sección
   «Re-verificación» al final de cada informe). Veredictos a reportar: security PASS · smell PASS · stack_arch PASS ·
   coherence PASS · ux PASS · integration PARCIAL (riesgos declarados) → sin auto-cierre, cierre humano.
3. Reportar los 6 veredictos con `release-ops.sh verdict R1-mvp <gate> <estado> --evidence-file …`.
   **Bloqueado:** el hub responde 404 «no hay release abierta de 'R1-mvp' en este proyecto» aunque el grafo v8 ya
   tiene `release_line=R1-mvp` en las 11 épicas → el sponsor debe abrir la release en la consola (si la interfaz no
   lo permite, es defecto del hub). Además el hub rechaza (422) `evidence` de más de 2000 caracteres y
   `release-ops.sh` no lo recorta: enviar un resumen corto que apunte al informe. `integration` queda parcial →
   el cierre es humano (no hay auto-cierre).
4. HU-152 (desbloquear acceso al panel; security MEDIO-2, D51.2): borrador en `docs/04-historias/`; cuando el sponsor
   la apruebe → `estado: lista`, graph-sync y slice pequeño (¿dentro de EP-006 reabierta o épica de mantenimiento? decidir).
5. Pendientes humanos: D46 en el DoR de EP-009; `estado` de HU-131 (diferida); `design_source_applies` del hub (D49).
