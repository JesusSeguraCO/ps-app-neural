import subprocess, sys
M = [
 ("M1 publicar sin evaluar", "packages/infra/src/postgres/perfiles-panel.ts", "    if (!antes.evaluacion.publicable)\n", "    if (false)\n", "packages/infra/src/postgres/publicar-perfil.test.ts"),
 ("M2 disparador sin modalidad", "packages/infra/migraciones/0017_publicar_y_ficha.ts", "WHERE m.id = NEW.modalidad_prueba_id AND m.activo AND m.familia_id = NEW.familia_id) THEN", "WHERE true) THEN", "packages/infra/src/postgres/publicar-perfil.test.ts"),
 ("M3 masiva aborta", "packages/infra/src/postgres/perfiles-panel.ts", "      if (!(e instanceof RechazoInventario)) throw e;\n      const ev", "      throw e;\n      const ev", "packages/infra/src/postgres/publicar-perfil.test.ts"),
 ("M4 ciudad siempre", "packages/contratos/src/ficha.ts", 'ciudad: o.necesidad === "remota" ? null : texto(d.ciudad),', "ciudad: texto(d.ciudad),", "apps/ficha-compartida.test.ts"),
 ("M5 vista previa ignora consentimiento", "apps/panel/src/inventario/ficha.ts", "incluyeClientes: Boolean(p.consentimiento?.vigente && p.consentimiento.incluyeClientes),", "incluyeClientes: true,", "apps/ficha-compartida.test.ts"),
 ("M6 opcional vacío se dibuja", "packages/ui/src/FichaPerfil.tsx", '{f.formacion && <Fila titulo="Formación">{f.formacion}</Fila>}', '<Fila titulo="Formación">{f.formacion}</Fila>', "apps/ficha-compartida.test.ts"),
 ("M7 Nivel 0 no sale de la modalidad", "packages/contratos/src/ficha.ts", "const enunciado = texto(d.enunciadoPrueba);", 'const enunciado = "Validado por Trycore";', "apps/ficha-compartida.test.ts"),
]
for nombre, f, a, b, t in M:
    s = open(f).read(); assert a in s, nombre
    open(f, "w").write(s.replace(a, b, 1))
    try:
        r = subprocess.run(["npx", "vitest", "run", t], capture_output=True, text=True)
        print(nombre, "MUERTO" if r.returncode != 0 else "VIVO")
    finally:
        open(f, "w").write(s)
