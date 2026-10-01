# Mutación acotada del sub-slice 8 (HU-134, HU-135): dominio de coherencia, plan de importación, infra de
# estado y publicación, rutas del panel y el guardia de borrado físico. Cada mutante se aplica, se corre el
# test que lo sostiene y se revierte. Correr con `eval "$(scripts/bd-local.sh entorno)"` (si no, los tests
# con BD se saltan y todo sale VIVO).
import subprocess
COH = "packages/dominio/src/inventario/coherencia.ts"
PLAN = "packages/dominio/src/importacion/plan.ts"
EST = "packages/infra/src/postgres/estado-perfil.ts"
PER = "packages/infra/src/postgres/perfiles-panel.ts"
QUI = "apps/panel/app/api/v1/perfiles/[codigo]/quitar-disponibilidad/permisos.ts"
LIB = "apps/panel/app/api/v1/perfiles/[codigo]/usar-liberacion/permisos.ts"
ARC = "apps/panel/app/api/v1/perfiles/[codigo]/archivar/route.ts"
T_COH = "packages/dominio/src/inventario/coherencia.test.ts"
T_PLAN = "packages/dominio/src/importacion/plan.test.ts"
T_EST = "packages/infra/src/postgres/estado-perfil.test.ts"
T_HTTP = "apps/coherencia-panel.test.ts"
T_GUA = "apps/sin-borrado-fisico.test.ts"
M = [
 ("M1 pausado sin disponibilidad también es ALTA", COH, '    if (clase === "ninguna") return null;\n', "", T_COH),
 ("M2 «Disponible ahora» de hace días cuenta como vencida", COH, "    p.fecha! > diaCivilDeColombia(p.actualizadaEn);", "    p.fecha! >= diaCivilDeColombia(p.actualizadaEn);", T_COH),
 ("M3 colocado con fecha futura es ALTA", COH, '&& clase === "ahora" && !vencida)', '&& clase !== "ninguna" && !vencida)', T_COH),
 ("M4 30 días ya es MEDIA", COH, "if (dias !== null && dias > UMBRAL_DIAS)", "if (dias !== null && dias >= UMBRAL_DIAS)", T_COH),
 ("M5 por confirmar no se dice", COH, 'porConfirmar: clave === "por_confirmar",', "porConfirmar: false,", T_COH),
 ("M6 borrador con contradicción", COH, '  if (p.estado === "borrador") return null;\n', "", T_COH),
 ("M7 la importación no marca la ALTA", PLAN, '    if (coherencia?.severidad === "alta")', "    if (false)", T_PLAN),
 ("M8 la importación marca aunque la fila no toque estado ni disponibilidad", PLAN, 'cambios.some((c) => c.campo === "estado" || c.campo === "disponibilidad")', "true", T_PLAN),
 ("M9 pausar conserva la disponibilidad", EST, "    const vaciada = await vaciarDisponibilidad(tx, autor, codigo, f);", "    const vaciada: CambioAuditado[] = [];", T_EST),
 ("M10 archivar conserva la disponibilidad", EST, "        ...(await vaciarDisponibilidad(tx, autor, codigo, f)),\n", "", T_EST),
 ("M11 al pausado no se le puede poner fecha en su fila", EST, 'const pausadoSolo = f.estado === "pausado" && unicos.length === 1;', "const pausadoSolo = false;", T_EST),
 ("M12 en bloque el pausado también recibe fecha", EST, 'const pausadoSolo = f.estado === "pausado" && unicos.length === 1;', 'const pausadoSolo = f.estado === "pausado";', T_EST),
 ("M13 quitar la disponibilidad a un publicado", EST, '    if (f.estado !== "pausado" && f.estado !== "archivado")\n      throw new RechazoInventario("no_aplica", { estado: f.estado });\n    const cambios = await vaciarDisponibilidad', "    const cambios = await vaciarDisponibilidad", T_EST),
 ("M14 usar liberación no cambia la fecha", EST, "      { fecha: f.fecha_liberacion },", "      { confirmar: true },", T_EST),
 ("M15 publicar con ALTA", PER, '    if (antes.coherencia?.severidad === "alta")', "    if (false)", T_EST),
 ("M16 la observadora quita la disponibilidad", QUI, '{ POST: "perfil.escribir" }', '{ POST: "sesion.salir" }', T_HTTP),
 ("M17 la observadora usa la liberación", LIB, '{ POST: "perfil.escribir" }', '{ POST: "sesion.salir" }', T_HTTP),
 ("M18 una ruta DELETE de perfiles aparece", ARC, "export const POST = conBorde(", "export const DELETE = () => new Response(null, { status: 204 });\nexport const POST = conBorde(", T_GUA),
 ("M19 un DELETE FROM inventario.perfiles aparece", EST, "// ─── bandeja de vigencia (HU-136) ───", "export const borrar = `DELETE FROM inventario.perfiles WHERE codigo = $1`;\n// ─── bandeja de vigencia (HU-136) ───", T_GUA),
]
compilar = lambda: subprocess.run(["npm", "run", "build", "-w", "@ps/panel"], capture_output=True, text=True, check=True)
import sys
desde = int(sys.argv[1]) if len(sys.argv) > 1 else 1
for nombre, f, a, b, t in M[desde - 1:]:
    s = open(f).read(); assert a in s, nombre
    open(f, "w").write(s.replace(a, b, 1))
    try:
        if t == T_HTTP:
            compilar()
        r = subprocess.run(["npx", "vitest", "run", t], capture_output=True, text=True)
        print(nombre, "MUERTO" if r.returncode != 0 else "VIVO", flush=True)
    finally:
        open(f, "w").write(s)
compilar()
