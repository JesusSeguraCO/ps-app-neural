# Release Gate R1-mvp · tramo EP-001 + EP-006 — RETOMAR AQUÍ (2026-10-02)

Estado: EP-006 mergeada (PR #10, c3ff45b) y archivada en el hub. Release Gate corrido sobre `acce296..c3ff45b`.
Veredictos medidos (informes en esta carpeta): security PASS · smell FAIL · stack_arch FAIL · coherence FAIL · ux FAIL ·
integration PARCIAL (riesgos declarados, `integration.md`).

Arreglos de los bloqueantes en **PR #11** (`fix/release-r0-hallazgos`), runner verde. Decisiones: D50–D51
(`.claude/state/evidencia/ep-006/decisiones-sponsor-2026-10-01.md`); backlog arquitectónico E-13 a E-15.

## Pasos que faltan
1. CI del PR #11 en verde → merge (decisión del sponsor).
2. Re-verificación incremental (sobre el diff de PR #11 + rutas gemelas) de `smell`, `stack_arch`, `coherence` y `ux`
   con sus agentes; contrastar una evidencia por PASS.
3. Reportar los 6 veredictos con `release-ops.sh verdict R1-mvp <gate> <estado> --evidence-file …`.
   **Bloqueado:** el hub responde 404 en `/releases/R1-mvp/verdicts` aunque el grafo v8 ya tiene `release_line=R1-mvp`
   en las 11 épicas → el sponsor debe abrir/crear la release en la consola. `integration` queda parcial →
   el cierre es humano (no hay auto-cierre).
4. HU-152 (desbloquear acceso al panel; security MEDIO-2, D51.2): borrador en `docs/04-historias/`; cuando el sponsor
   la apruebe → `estado: lista`, graph-sync y slice pequeño (¿dentro de EP-006 reabierta o épica de mantenimiento? decidir).
5. Pendientes humanos: D46 en el DoR de EP-009; `estado` de HU-131 (diferida); `design_source_applies` del hub (D49).
