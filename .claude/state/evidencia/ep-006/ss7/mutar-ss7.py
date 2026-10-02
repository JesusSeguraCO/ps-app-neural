# Mutación acotada del sub-slice 7 (HU-132, HU-133, HU-136): dominio de vigencia, infra de estado,
# migración 0019 y rutas del panel. Cada mutante se aplica, se corre el test que lo sostiene y se revierte.
import subprocess
VIG = "packages/dominio/src/inventario/vigencia.ts"
EST = "packages/infra/src/postgres/estado-perfil.ts"
MIG = "packages/infra/migraciones/0019_pausa_y_vigencia.ts"
PAU = "apps/panel/app/api/v1/perfiles/[codigo]/pausar/permisos.ts"
DIS = "apps/panel/app/api/v1/perfiles/disponibilidad/permisos.ts"
T_VIG = "packages/dominio/src/inventario/vigencia.test.ts"
T_EST = "packages/infra/src/postgres/estado-perfil.test.ts"
T_MIG = "packages/infra/src/postgres/migracion-0019.test.ts"
T_HTTP = "apps/vigencia-panel.test.ts"
M = [
 ("M1 días por horas UTC, no civiles de Bogotá (V3-4)", VIG, "new Date(d.getTime() + BOGOTA_MS)", "new Date(d.getTime())", T_VIG),
 ("M2 30 días ya entra en «por revisar»", VIG, "else if (fila.dias! > DIAS_SIN_TOCAR) porRevisar.push(fila);", "else if (fila.dias! >= DIAS_SIN_TOCAR) porRevisar.push(fila);", T_VIG),
 ("M3 pausado de 30 días entra", VIG, "if (dias === null || dias > DIAS_SIN_TOCAR)", "if (dias === null || dias >= DIAS_SIN_TOCAR)", T_VIG),
 ("M4 orden del más reciente al más antiguo", VIG, ": b.dias - a.dias;", ": a.dias - b.dias;", T_VIG),
 ("M5 «por confirmar» mezclado con «por revisar»", VIG, 'else if (banda === "por_confirmar") porConfirmar.push(fila);', 'else if (banda === "por_confirmar") porRevisar.push(fila);', T_VIG),
 ("M6 sin fecha de actualización cuenta como al día", VIG, "if (fila.datoIncompleto) porRevisar.push(fila);", "if (fila.datoIncompleto) {}", T_VIG),
 ("M7 un pausado admite disponibilidad", EST, 'new Set<EstadoAlmacenado>(["borrador", "publicado", "colocado"])', 'new Set<EstadoAlmacenado>(["borrador", "publicado", "colocado", "pausado"])', T_EST),
 ("M8 en bloque, uno que falla aborta el resto", EST, "      if (!(e instanceof RechazoInventario)) throw e;\n      resultados.push({", "      throw e;\n      resultados.push({", T_EST),
 ("M9 confirmar sin cambios no renueva la fecha de revisión", EST, "disponibilidad_actualizada_en = $3 WHERE id = $1`,\n    [f.id, fecha, ahora],", "disponibilidad_actualizada_en = disponibilidad_actualizada_en WHERE id = $1 AND $3::timestamptz IS NOT NULL`,\n    [f.id, fecha, ahora],", T_EST),
 ("M10 pausa sin auditar el motivo", EST, '        cambio(autor, f, codigo, "motivo_pausa", f.motivo, m.nombre),\n', "", T_EST),
 ("M11 pausar con motivo inactivo o fusionado", EST, "WHERE id = $1 AND activo AND fusionado_en_id IS NULL`,\n        [motivoId],", "WHERE id = $1`,\n        [motivoId],", T_EST),
 ("M12 reactivar sin las guardas de publicar", EST, "    if (!antes.evaluacion.publicable)\n      throw", "    if (false)\n      throw", T_EST),
 ("M13 archivar repetido reescribe", EST, "    if (!t.ok)\n      return {\n        resultado: { yaArchivado: true", "    if (!t.ok && false)\n      return {\n        resultado: { yaArchivado: true", T_EST),
 ("M14 la pausa no guarda desde cuándo", MIG, "      now());", "      NULL);", T_MIG),
 ("M15 al salir de la pausa no se limpia el motivo", MIG, "    NEW.motivo_pausa_id := NULL;\n", "", T_MIG),
 ("M16 la observadora puede pausar", PAU, '{ POST: "perfil.escribir" }', '{ POST: "sesion.salir" }', T_HTTP),
 ("M17 la observadora puede cambiar disponibilidad", DIS, '{ POST: "perfil.escribir" }', '{ POST: "sesion.salir" }', T_HTTP),
]
for nombre, f, a, b, t in M:
    s = open(f).read(); assert a in s, nombre
    open(f, "w").write(s.replace(a, b, 1))
    try:
        if t == T_HTTP:
            subprocess.run(["npm", "run", "build", "-w", "@ps/panel"], capture_output=True, text=True, check=True)
        r = subprocess.run(["npx", "vitest", "run", t], capture_output=True, text=True)
        print(nombre, "MUERTO" if r.returncode != 0 else "VIVO", flush=True)
    finally:
        open(f, "w").write(s)
if any(t == T_HTTP for *_, t in M):
    subprocess.run(["npm", "run", "build", "-w", "@ps/panel"], capture_output=True, text=True, check=True)
