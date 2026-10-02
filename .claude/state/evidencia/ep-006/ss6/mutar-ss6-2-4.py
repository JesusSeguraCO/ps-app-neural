# Mutación acotada de 6.2 (reducida por D29) y 6.4 (HU-140, HU-130 edge).
import subprocess
DOM = "packages/dominio/src/inventario/validacion.ts"
SRV = "packages/infra/src/postgres/validaciones.ts"
MIG = "packages/infra/migraciones/0018_validaciones.ts"
T_DOM = "packages/dominio/src/inventario/validacion.test.ts"
T_SRV = "packages/infra/src/postgres/validaciones.test.ts"
T_UI = "packages/ui/src/FichaPerfil.test.ts"
M = [
 ("M1 la precarga no marca «plantilla»", DOM, 'origen: { enunciadoReto: "plantilla", entregables: "plantilla", criterios: "plantilla" },', 'origen: { enunciadoReto: "persona", entregables: "plantilla", criterios: "plantilla" },', T_SRV),
 ("M2 borrador sin modalidad", DOM, 'if (!m) return { ok: false, motivo: "sin_modalidad_prueba" };', 'if (!m) return { ok: true, borrador: { modalidadId: "", enunciadoReto: "", entregables: "", criterios: [], origen: { enunciadoReto: "plantilla", entregables: "plantilla", criterios: "plantilla" } } };', T_SRV),
 ("M3 confirma sin revisión", DOM, '  if (!r.revisado) falta.push("revisado");\n', "", T_SRV),
 ("M4 fecha futura aceptada", DOM, "|| r.fecha > hoy) falta.push", ") falta.push", T_DOM),
 ("M5 lo corregido sigue como plantilla", DOM, 'igual(valores.entregables, plantilla.entregables) ? "plantilla" : "persona"', '"plantilla"', T_SRV),
 ("M6 descartar no descarta", SRV, "SET estado = 'descartada', descartada_en = now() WHERE id = $1", "SET descartada_en = NULL WHERE id = $1", T_SRV),
 ("M7 confirmar sin auditoría", SRV, '      cambio("estado", "borrador", "confirmada"),\n', "", T_SRV),
 ("M8 confirma con otra modalidad", SRV, "    if (f.modalidad_prueba_id !== p.modalidad_prueba_id)\n      throw new RechazoInventario(\"modalidad_cambio\");\n", "", T_SRV),
 ("M9 la vista muestra reportes de otra modalidad", MIG, " AND x.modalidad_prueba_id = p.modalidad_prueba_id\n     ORDER BY", "\n     ORDER BY", T_SRV),
 ("M10 la ficha no dibuja los criterios", "packages/ui/src/FichaPerfil.tsx", '<span className="fp-sub">{`Evaluó: ${f.validacion.criterios.join(" · ")}.`}</span>', "", T_UI),
 ("M11 una llamada saliente al pedir", SRV, "    const pendiente = await leerBorrador(tx, codigo);\n", "    await fetch(\"http://127.0.0.1:9/\").catch(() => {});\n    const pendiente = await leerBorrador(tx, codigo);\n", T_SRV),
]
for nombre, f, a, b, t in M:
    s = open(f).read(); assert a in s, nombre
    open(f, "w").write(s.replace(a, b, 1))
    try:
        r = subprocess.run(["npx", "vitest", "run", t], capture_output=True, text=True)
        print(nombre, "MUERTO" if r.returncode != 0 else "VIVO")
    finally:
        open(f, "w").write(s)
