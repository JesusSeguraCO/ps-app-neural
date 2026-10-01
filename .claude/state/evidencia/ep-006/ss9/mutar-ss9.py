# Mutación acotada de la tarea 9.1 del sub-slice 9 (colocado deja de ser estado): migración contract, trabajo
# migrar_colocados, vistas derivadas y plan de importación. Cada mutante se aplica, se corre el test que lo
# sostiene y se revierte. Las tareas 9.2–9.4 tienen su mutación en mutacion-9.2.md, -9.3.md y -9.4.md.
# Correr con `eval "$(scripts/bd-local.sh entorno)"` (si no, los tests con BD se saltan y todo sale VIVO).
import subprocess
M21 = "packages/infra/migraciones/0021_retirar_colocado.ts"
COL = "packages/infra/src/postgres/colocados.ts"
PLAN = "packages/dominio/src/importacion/plan.ts"
T_MIG = "packages/infra/src/postgres/migracion-0020-0021.test.ts"
T_PLAN = "packages/dominio/src/importacion/plan.test.ts"
M = [
 ("M1 la 0021 no se niega con colocados sin migrar", M21, "  IF n > 0 THEN\n", "  IF false THEN\n", T_MIG),
 ("M2 migrar_colocados no fija la disponibilidad", COL, "SET estado = 'publicado', fecha_liberacion = NULL, disponibilidad_fecha = $2", "SET estado = 'publicado', fecha_liberacion = NULL, disponibilidad_fecha = disponibilidad_fecha", T_MIG),
 ("M3 la vista no deriva «colocado» de la colocación", M21, "WHEN b.estado = 'publicado' AND b.libera IS NOT NULL THEN 'colocado'", "WHEN false THEN 'colocado'", T_MIG),
 ("M4 la importación cambia el estado de un colocado", PLAN, "    else if (colocacion)\n", "    else if (false)\n", T_PLAN),
]
for nombre, f, a, b, t in M:
    s = open(f).read(); assert a in s, nombre
    open(f, "w").write(s.replace(a, b, 1))
    try:
        r = subprocess.run(["npx", "vitest", "run", t], capture_output=True, text=True)
        print(nombre, "MUERTO" if r.returncode != 0 else "VIVO", flush=True)
    finally:
        open(f, "w").write(s)
