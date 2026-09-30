#!/usr/bin/env bash
# integration-check.sh (adaptado del template del arnés) — runner determinista FUERA DE CHAT para cerrar `journey_smoke` (inner loop).
#
# Qué es: un gate determinista que ejecuta build + suite completa + un journey-smoke end-to-end y
# emite un REPORTE de integración a disco, con salida 0 (verde) / ≠0 (rojo). Está pensado para correr
# en una **sesión/contexto virgen** distinta de la que escribió el código (el agente que cableó no es
# juez de su propio cableado), y para el **fix-loop** (lo corres, lees el reporte, arreglas, repites).
#
# Por qué un script y no un agente: el cableado end-to-end no se acredita "por inspección" sino
# EJECUTANDO. Mantenerlo fuera del chat lo hace reproducible y barato en contexto.
#
# AGNÓSTICO: este es un TEMPLATE. El arnés no asume tu stack. Ajusta los comandos marcados con
# «# ADAPTA» a tu proyecto (lenguaje, package manager, comando de e2e). Cópialo a tu repo
# (p.ej. tools/loop/integration-check.sh) y hazlo ejecutable.
#
# NO crea ningún gate nuevo en build-state.json: alimenta el gate EXISTENTE `journey_smoke` del slice.
# El gate `integration` con dependencias reales sigue siendo del Release Gate (outer loop), no de aquí.
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$(pwd)}")"
REPORT_DIR="$ROOT/.claude/state"
REPORT="$REPORT_DIR/integration-report.txt"
mkdir -p "$REPORT_DIR"

# Detecta el package manager si hay package.json (Node). ADAPTA para otros stacks.
PM="npm"
if [ -f "$ROOT/pnpm-lock.yaml" ]; then PM="pnpm";
elif [ -f "$ROOT/yarn.lock" ]; then PM="yarn"; fi

fail=0
log() { printf '%s\n' "$*" | tee -a "$REPORT"; }

: > "$REPORT"
log "== integration-check =="
log "root: $ROOT"
log "pm:   $PM"
log "ts:   (sin timestamp determinista; lo estampa quien invoca)"
log ""

run() { # run <etiqueta> <comando...>
  local label="$1"; shift
  log "▶ $label: $*"
  if "$@" >>"$REPORT" 2>&1; then
    log "  ✓ $label OK"
  else
    log "  ✗ $label FALLÓ"
    fail=1
  fi
  log ""
}

# --- Fases del runner (adaptado a este monorepo: ADR-0008/0010) ---
# 0) BD real: PostgreSQL 16 + PgBouncer en modo transacción con roles sin superusuario.
run "bd-local"  "$ROOT/scripts/bd-local.sh" arrancar
# 1) Build de todas las apps (Next standalone + bundle del worker).
run "build"     $PM run build
run "migrar"    bash -c 'eval "$("$0"/scripts/entorno-dev.sh migrar)" && node "$0"/apps/worker/dist/migrar.js' "$ROOT"
# 2) Estático: lint (reglas de V8-2) y tipos.
run "lint"      $PM run lint
run "tipos"     $PM run typecheck
# 3) Suite completa con BD real y servidores standalone; en este runner la BD es obligatoria.
run "tests"     bash -c 'cd "$0" && eval "$(scripts/bd-local.sh entorno)" && REQUIERE_BD=1 npx vitest run' "$ROOT"
# 4) Journey en navegador real: CSP sin violaciones, axe, móvil, redirección sin sesión.
run "e2e"       bash -c 'cd "$0" && npx playwright test' "$ROOT"
# 5) Presupuesto de rendimiento del shell (V8-6 a).
run "lighthouse" bash -c 'cd "$0" && npx lhci autorun --config=lighthouserc.cjs' "$ROOT"

log "== resultado: $([ "$fail" -eq 0 ] && echo VERDE || echo ROJO) =="
log "Reporte: $REPORT"

# Salida determinista: 0 verde, 1 rojo. El gate journey_smoke solo se marca true con salida 0.
exit "$fail"
