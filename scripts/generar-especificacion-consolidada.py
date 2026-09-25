#!/usr/bin/env python3
"""Genera docs/ESPECIFICACION-CONSOLIDADA.md desde los artefactos de discovery.

Fuentes (de solo lectura):
  docs/01-prd/portal-people-service.md   Parte I, II, V y VI
  docs/03-backlog/epicas.md              Parte III (una sección por épica)
  docs/04-historias/HU-*.md              Parte III (historias de cada épica)
  docs/10-specs/*.md                     Parte IV

El resultado no se edita a mano: se corrige la fuente y se vuelve a generar.

    python3 scripts/generar-especificacion-consolidada.py
"""
import datetime
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DOCS = RAIZ / "docs"
SALIDA = DOCS / "ESPECIFICACION-CONSOLIDADA.md"

# Requisitos que ninguna épica puede contradecir. Se extraen del PRD por id.
PRINCIPIOS = ["RF-14.0", "RF-16.1", "RF-16.2", "RF-16.3", "RF-16.4", "RF-13.8", "RF-8.14"]


def leer(ruta):
    return ruta.read_text(encoding="utf-8")


def frontmatter(texto):
    m = re.match(r"^---\n(.*?)\n---\n", texto, re.S)
    if not m:
        return {}, texto
    campos = {}
    for linea in m.group(1).splitlines():
        if ":" in linea:
            clave, valor = linea.split(":", 1)
            campos[clave.strip()] = valor.strip().strip('"')
    return campos, texto[m.end():]


def seccion(texto, inicio, fin):
    """Desde la línea que empieza por `inicio` hasta la primera que empieza por `fin` (excluida)."""
    lineas = texto.split("\n")
    i = next(n for n, l in enumerate(lineas) if l.startswith(inicio))
    j = next((n for n in range(i + 1, len(lineas)) if lineas[n].startswith(fin)), len(lineas))
    return "\n".join(lineas[i:j]).strip("\n")


def bloque_rf(texto, rid):
    """Viñeta de primer nivel `- **RF-x` con todas sus sub-viñetas."""
    lineas = texto.split("\n")
    patron = "- **%s" % rid
    for i, l in enumerate(lineas):
        if l.startswith(patron) and l[len(patron)] in " *·":
            j = i + 1
            while j < len(lineas) and lineas[j].startswith("  "):
                j += 1
            return "\n".join(lineas[i:j])
    raise SystemExit("No encuentro %s en el PRD" % rid)


def bajar_titulos(texto, niveles):
    def sustituir(m):
        return "#" * min(6, len(m.group(1)) + niveles) + " "
    return re.sub(r"^(#{1,6}) ", sustituir, texto, flags=re.M)


def historias():
    todas = []
    for ruta in sorted((DOCS / "04-historias").glob("HU-*.md")):
        campos, cuerpo = frontmatter(leer(ruta))
        todas.append((campos, cuerpo.strip("\n")))
    return todas


def epicas(texto_epicas):
    """Lista de (código, sección) en el orden del documento de épicas."""
    lineas = texto_epicas.split("\n")
    inicios = [n for n, l in enumerate(lineas) if re.match(r"^## EP-\d{3} ", l)]
    resultado = []
    for k, i in enumerate(inicios):
        fin = inicios[k + 1] if k + 1 < len(inicios) else len(lineas)
        # La última épica termina donde empieza la siguiente sección de primer nivel.
        for n in range(i + 1, fin):
            if lineas[n].startswith("# "):
                fin = n
                break
        cuerpo = "\n".join(lineas[i:fin]).strip("\n")
        cuerpo = re.sub(r"\n---\s*$", "", cuerpo).strip("\n")
        resultado.append((lineas[i].split()[1], cuerpo))
    return resultado


def main():
    prd_meta, prd = frontmatter(leer(DOCS / "01-prd" / "portal-people-service.md"))
    ep_meta, texto_epicas = frontmatter(leer(DOCS / "03-backlog" / "epicas.md"))
    bl_meta, _ = frontmatter(leer(DOCS / "03-backlog" / "backlog.md"))
    mapa_meta, _ = frontmatter(leer(DOCS / "02-user-story-map" / "portal-people-service.md"))
    hus = historias()
    activas = [(c, b) for c, b in hus if c.get("estado") != "descartada"]
    descartadas = [(c, b) for c, b in hus if c.get("estado") == "descartada"]

    partes = []
    partes.append("""---
artefacto: especificacion-consolidada
proyecto: portal-people-service
version: {ep_v}
fecha: {hoy}
prd_version: {prd_v}
epicas_version: {ep_v}
backlog_version: {bl_v}
historias_activas: {n_act}
historias_descartadas: {n_desc}
fuente: generado con scripts/generar-especificacion-consolidada.py desde docs/01-prd, docs/03-backlog, docs/04-historias y docs/10-specs
uso: documento de construcción, organizado por épica
---

# Especificación consolidada — Portal de Perfiles People Service

> **Documento de construcción.** Reúne en un solo archivo el contexto que gobierna todo, el modelo de datos, y después **una sección por épica** con sus requisitos y sus historias completas. Se genera desde los artefactos originales con `scripts/generar-especificacion-consolidada.py`: **no se edita a mano**. Si algo está mal, se corrige la fuente y se regenera.

## Cómo usar este documento

1. **Parte I — Reglas que gobiernan todo.** Léela antes de tocar cualquier épica. Contiene el problema, los objetivos, lo que el producto no es, los principios transversales, los requisitos no funcionales (incluida la plataforma de ejecución, §8.3) y las decisiones ya cerradas.
2. **Parte II — Modelo de datos.** De dónde sale cada campo y qué nunca se publica.
3. **Parte III — Épicas.** Una sección por épica, autocontenida: para construir EP-00X basta con la Parte I más su sección.
4. **Parte IV — Especificaciones anexas.** Componentes con detalle propio.
5. **Parte V — Decisiones abiertas.** Lo que todavía puede cambiar y a quién hay que preguntarle.
6. **Parte VI — Orden de construcción.**

> **Artefactos hermanos, fuera de este documento.** El **mapa de historias** (`docs/02-user-story-map/`, v{mapa_v}) ordena el alcance por recorrido y release. La **priorización** (`docs/05-priorizacion/`) ordena las historias en una matriz valor/esfuerzo. Los **flujos de navegación** (`docs/06-flows/`, uno por épica, en Mermaid) diagraman cada épica con trazabilidad a sus criterios de aceptación. Las características verificadas del **hosting** viven en `docs/01-prd/requisitos-tecnicos-hosting.md` y el **prototipo** de referencia en `docs/07-prototipo/`.

---
""".format(ep_v=ep_meta.get("version", "?"), hoy=datetime.date.today().isoformat(),
           prd_v=prd_meta.get("version", "?"), bl_v=bl_meta.get("version", "?"),
           n_act=len(activas), n_desc=len(descartadas), mapa_v=mapa_meta.get("version", "?")))

    # ── Parte I ──
    partes.append("# PARTE I · Reglas que gobiernan todo\n")
    partes.append(seccion(prd, "## 2. ", "## 6. "))
    partes.append("---\n\n## Principios transversales\n\nNinguna épica puede contradecirlos.\n")
    partes.append("\n\n".join(bloque_rf(prd, rid) for rid in PRINCIPIOS))
    partes.append(seccion(prd, "## 8. ", "## 9. "))
    partes.append("---\n\n## Decisiones cerradas\n")
    partes.append(seccion(prd, "### 12.2 ", "### 12.3 "))

    # ── Parte II ──
    partes.append("---\n\n# PARTE II · Modelo de datos\n")
    partes.append(seccion(prd, "# Anexo B", "## Control de versiones"))

    # ── Parte III ──
    partes.append("---\n\n# PARTE III · Épicas\n")
    for codigo, cuerpo in epicas(texto_epicas):
        propias = [(c, b) for c, b in activas if c.get("epica") == codigo]
        partes.append(cuerpo)
        partes.append("### Historias de esta épica (%d)\n" % len(propias))
        for _, b in propias:
            partes.append(bajar_titulos(b, 3))
        partes.append("---")

    # ── Parte IV ──
    partes.append("# PARTE IV · Especificaciones anexas\n")
    for ruta in sorted((DOCS / "10-specs").glob("*.md")):
        _, cuerpo = frontmatter(leer(ruta))
        partes.append(bajar_titulos(cuerpo.strip("\n"), 2))
        partes.append("---")

    # ── Parte V ──
    partes.append("# PARTE V · Decisiones abiertas\n")
    partes.append(seccion(prd, "### 12.3 ", "## 13. ").rstrip("-\n "))

    # ── Parte VI ──
    partes.append("---\n\n# PARTE VI · Orden de construcción\n")
    partes.append(seccion(prd, "# Anexo A", "# Anexo B").rstrip("-\n "))

    # ── Historias descartadas ──
    partes.append("---\n\n## Historias descartadas\n\nSe conservan con su razón: la decisión de descartar es más útil que su ausencia.\n")
    partes.append("\n".join(
        "- **%s** — %s (%s)" % (c.get("id"), c.get("titulo"), c.get("epica")) for c, _ in descartadas
    ) or "Ninguna.")

    texto = "\n\n".join(p.strip("\n") for p in partes) + "\n"
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    SALIDA.write_text(texto, encoding="utf-8")
    print("%s: %d épicas, %d historias activas, %d descartadas, %d líneas" % (
        SALIDA.relative_to(RAIZ), len(epicas(texto_epicas)), len(activas), len(descartadas), texto.count("\n")))


if __name__ == "__main__":
    main()
