# Mutación acotada de la tarea 6.1 (HU-126, HU-129 edge): cada mutante debe hacer fallar su test.
import subprocess
INFRA = "packages/infra/src/postgres/editar-publicado.test.ts"
PURO = "packages/contratos/src/cambios-ficha.test.ts"
SRV = "packages/infra/src/postgres/perfiles-panel.ts"
M = [
 ("M1 previsualizar escribe (COMMIT)", SRV, '      await tx.query("ROLLBACK").catch(() => {});\n      tx.release();', '      await tx.query("COMMIT").catch(() => {});\n      tx.release();', INFRA),
 ("M2 confirma aunque quede incompleto", SRV, "        if (!perfil.evaluacion.publicable)\n          throw new RechazoInventario(\"deja_incompleto\"", "        if (false)\n          throw new RechazoInventario(\"deja_incompleto\"", INFRA),
 ("M3 descartar no es descartar", SRV, 'if (o.resolucion === "descartar") {', "if (false) {", INFRA),
 ("M4 a_borrador sin motivo auditado", SRV, '          salida("motivo_estado", null, "edicion_deja_incompleto"),\n', "", INFRA),
 ("M5 a_borrador no sale del portal", SRV, "      await tx.query(`UPDATE inventario.perfiles SET estado = $2 WHERE id = $1`, [fila.id, t.a]);", "", INFRA),
 ("M6 lo interno se cuela como dato", SRV, ".filter((c) => CAMPOS_INTERNOS.has(c)),\n      };", ".filter(() => true),\n      };", INFRA),
 ("M7 diff que no declara nada", "packages/contratos/src/ficha.ts", "return a === d ? []", "return true ? []", PURO),
 ("M8 banda comparada como texto libre", "packages/contratos/src/ficha.ts", '["disponibilidad", "Disponibilidad", (f) => ROTULO_BANDA[f.disponibilidad]],', '["disponibilidad", "Disponibilidad", (f) => f.disponibilidad],', PURO),
]
for nombre, f, a, b, t in M:
    s = open(f).read(); assert a in s, nombre
    open(f, "w").write(s.replace(a, b, 1))
    try:
        r = subprocess.run(["npx", "vitest", "run", t], capture_output=True, text=True)
        print(nombre, "MUERTO" if r.returncode != 0 else "VIVO")
    finally:
        open(f, "w").write(s)
