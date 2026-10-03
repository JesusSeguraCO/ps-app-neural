// Tarjeta del perfil (EP-003 · SS4; HU-153, HU-081, HU-119): se dibuja con el componente real y se
// leen los textos exactos. La capacidad va primero (h3) con el nombre junto; debajo las 5 primeras
// tecnologías, sector (si hay), modalidad, país y la banda de `banda.ts`; el código solo al pie. El Sello
// Personal como competencias verificadas, sin insignia ni puntaje. La evidencia ✓/– solo con criterios.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PerfilCatalogo } from "@ps/contratos/catalogo";
import { bandaDeDisponibilidad } from "@ps/dominio/catalogo/banda";
import { lineasDeEvidencia, type CriterioResuelto } from "@ps/dominio/catalogo/evidencia";
import { TarjetaPerfil } from "./TarjetaPerfil";

const HOY = new Date("2026-10-02T15:00:00Z");
const base: PerfilCatalogo = {
  codigo: "PS-0901",
  nombre: "Laura",
  primerApellido: "Méndez",
  familia: "Desarrollo",
  roles: ["Desarrolladora Backend"],
  seniority: "Senior",
  aniosExperiencia: 9,
  tecnologias: ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
  sectores: ["Banca"],
  modalidad: "Remoto",
  pais: "Colombia",
  // 10 días → «2 semanas» con los límites de banda.ts
  disponibilidad: bandaDeDisponibilidad({ fecha: "2026-10-12", actualizadaEn: HOY }, HOY),
  selloPersonal: [],
};

const tarjeta = (p: Partial<PerfilCatalogo> = {}, criterios?: CriterioResuelto[]) =>
  renderToStaticMarkup(
    createElement(TarjetaPerfil, {
      item: { codigo: p.codigo ?? base.codigo, tipo: "disponible", perfil: { ...base, ...p } },
      ficha: { href: `/?ficha=${p.codigo ?? base.codigo}`, abierta: false },
      evidencia: criterios ? lineasDeEvidencia(criterios) : undefined,
    }),
  );
// Texto visible, sin etiquetas y sin lo que solo lee el lector de pantalla.
const visible = (h: string) =>
  h
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const entre = (h: string, clase: string) => {
  const m = h.match(new RegExp(`<[a-z0-9]+ [^>]*class="${clase}"[^>]*>(.*?)</(h3|p|ul|span|div)>`));
  return m ? visible(m[1]!) : null;
};

describe("HU-153 · la capacidad como descriptor inmediato", () => {
  it("happy: capacidad primero, nombre y primer apellido, tecnologías, sector, modalidad, país, banda y código al pie", () => {
    const h = tarjeta();
    expect(entre(h, "pp-perfil__rol")).toBe(
      "Desarrolladora Backend · Senior · 9 años de experiencia",
    );
    expect(entre(h, "pp-perfil__nombre")).toBe("Laura Méndez");
    // La capacidad va antes que el nombre y que todo lo demás.
    expect(h.indexOf("pp-perfil__rol")).toBeLessThan(h.indexOf("pp-perfil__nombre"));
    expect(h.indexOf("pp-perfil__nombre")).toBeLessThan(h.indexOf("pp-perfil__tecnologias"));
    expect(entre(h, "pp-perfil__tecnologias")).toBe("Java Spring Boot Kafka PostgreSQL");
    expect(entre(h, "pp-perfil__meta")).toBe("Banca Remoto Colombia");
    expect(visible(h)).toContain("En 2 semanas");
    // Código solo al pie, en letra pequeña (pp-codigo-perfil), y una sola vez.
    expect(h.match(/PS-0901/g)?.length).toBe(2); // el texto del pie y el href de la ficha
    expect(visible(h).match(/PS-0901/g)?.length).toBe(1);
    expect(h).toMatch(
      /<div class="pp-perfil__pie">.*<span class="pp-codigo-perfil">PS-0901<\/span><\/div>/,
    );
    expect(h.indexOf("pp-codigo-perfil")).toBeGreaterThan(h.indexOf("pp-perfil__meta"));
    // Sin foto, sin segundo apellido, sin fecha de disponibilidad.
    expect(h).not.toMatch(/<img|foto|2026-10-12|12 oct/i);
  });

  it("error: disponibilidad vencida y sin tocar > 30 días → «por confirmar», nunca «Inmediato» ni la fecha", () => {
    const vencida = bandaDeDisponibilidad(
      { fecha: "2026-08-01", actualizadaEn: new Date("2026-08-15T15:00:00Z") },
      HOY,
    );
    expect(vencida).toBe("por_confirmar");
    const h = tarjeta({ disponibilidad: vencida });
    expect(visible(h)).toContain("Disponibilidad por confirmar");
    expect(visible(h)).not.toMatch(/Inmediato|Disponible ahora|2026-08-01|1 ago/i);
  });

  it("edge: 8 tecnologías y sin sector → las 5 primeras en orden de carga, sin sector ni hueco", () => {
    const h = tarjeta({
      tecnologias: [
        "Java",
        "Spring Boot",
        "Kafka",
        "PostgreSQL",
        "Docker",
        "AWS",
        "Redis",
        "Kubernetes",
      ],
      sectores: [],
    });
    expect(entre(h, "pp-perfil__tecnologias")).toBe("Java Spring Boot Kafka PostgreSQL Docker");
    expect(h).not.toMatch(/AWS|Redis|Kubernetes/);
    expect(entre(h, "pp-perfil__meta")).toBe("Remoto Colombia");
    expect(h).not.toMatch(/<li><\/li>/);
    expect(visible(h)).not.toMatch(/Sector/);
  });

  it("sin sector, modalidad ni país: no hay lista de datos vacía", () => {
    const h = tarjeta({ sectores: [], modalidad: null, pais: null });
    expect(h).not.toContain("pp-perfil__meta");
  });
});

describe("HU-081 · competencias del Sello Personal", () => {
  const sello = (h: string) => {
    const m = h.match(/<p class="rs-sello rs-sello--solo">(.*?)<\/p>/);
    return m ? visible(m[1]!) : null;
  };

  it("happy: dos perfiles con sellos distintos muestran cada uno sus tres competencias como verificadas", () => {
    const a = tarjeta({
      selloPersonal: [
        "Comunicación directa con negocio",
        "Rigor en la documentación",
        "Calma bajo presión",
      ],
    });
    const b = tarjeta({
      codigo: "PS-0902",
      selloPersonal: ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"],
    });
    expect(sello(a)).toBe(
      "Sello Personal Comunicación directa con negocio · Rigor en la documentación · Calma bajo presión",
    );
    expect(sello(b)).toBe(
      "Sello Personal Liderazgo técnico · Pensamiento sistémico · Comunicación clara",
    );
    for (const h of [a, b]) {
      expect(h).toContain("pp-bloque pp-bloque--verificado");
      expect(visible(h)).toContain("Verificado por Trycore");
      // Ni insignia ni estado ni puntaje por dimensión Neural-Grid.
      expect(h).not.toMatch(/Neural|insignia|pp-badge|puntaje|\d+\s*\/\s*\d+|%/i);
    }
  });

  it("edge: sin Sello Personal → sin bloque, sin título ni hueco, sin relleno", () => {
    const h = tarjeta({ selloPersonal: [] });
    expect(h).not.toMatch(
      /rs-sello|Sello Personal|pp-bloque--verificado|Verificado por Trycore|pp-evidencia/,
    );
  });

  it("edge: dos perfiles con las mismas tres competencias se dibujan igual que cualquier otro, sin señal de equivalencia", () => {
    const mismas = ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"];
    const a = tarjeta({ selloPersonal: mismas });
    const b = tarjeta({
      codigo: "PS-0902",
      nombre: "Felipe",
      primerApellido: "Arango",
      selloPersonal: mismas,
    });
    expect(sello(a)).toBe(sello(b));
    for (const h of [a, b])
      expect(visible(h)).not.toMatch(/equivalente|intercambiable|igual que|mismo sello|similar/i);
    // La estructura no cambia: solo cambian nombre y código.
    expect(a.replace(/Laura Méndez|0901/g, "X")).toBe(b.replace(/Felipe Arango|0902/g, "X"));
  });
});

describe("HU-119 · evidencia ✓/– en la tarjeta", () => {
  it("happy: una línea por criterio, cumple y no cumple distinguibles, sin porcentajes", () => {
    const h = tarjeta({}, [
      { tipo: "sector", valor: "Banca", cumple: true, dato: "8" },
      { tipo: "sector", valor: "Seguros", cumple: false, dato: null },
    ]);
    const lineas = [...h.matchAll(/<li class="pp-criterio (pp-criterio--\w+)">(.*?)<\/li>/g)].map(
      (m) => [m[1], visible(m[2]!)],
    );
    expect(lineas).toEqual([
      ["pp-criterio--cumple", "✓ Banca · 8 años declarados"],
      ["pp-criterio--no", "– Sin experiencia declarada en Seguros"],
    ]);
    // Para el lector de pantalla la marca dice lo que es (el símbolo es aria-hidden).
    expect(h).toContain('<span class="pp-sr">Cumple: </span>');
    expect(h).toContain('<span class="pp-sr">No cumple: </span>');
    expect(visible(h)).not.toMatch(/%|puntaje/i);
  });

  it("error: un tipo sin plantilla muestra el texto genérico en el mismo lugar y con la misma distinción", () => {
    const h = tarjeta({}, [
      { tipo: "disponibilidad", valor: "Disponibilidad inmediata", cumple: true, dato: null },
      { tipo: "disponibilidad", valor: "Disponibilidad inmediata", cumple: false, dato: null },
    ]);
    const lineas = [...h.matchAll(/<li class="pp-criterio (pp-criterio--\w+)">(.*?)<\/li>/g)].map(
      (m) => [m[1], visible(m[2]!)],
    );
    expect(lineas).toEqual([
      ["pp-criterio--cumple", "✓ Cumple Disponibilidad inmediata"],
      ["pp-criterio--no", "– No cumple Disponibilidad inmediata"],
    ]);
  });

  it("edge: sin criterios activos no hay bloque de evidencia, ni vacío ni con título", () => {
    // También con Sello Personal: el bloque verificado no arrastra un título de evidencia vacío.
    const conSello = { selloPersonal: ["Liderazgo técnico"] };
    for (const h of [tarjeta(), tarjeta({}, []), tarjeta(conSello), tarjeta(conSello, [])]) {
      expect(h).not.toMatch(
        /pp-criterio|pp-evidencia__conteo|criterios activos|Frente a tu búsqueda/,
      );
    }
  });

  it("edge: idioma sin registrar → no cumplido, nunca cumplido por omisión", () => {
    const h = tarjeta({}, [{ tipo: "idioma", valor: "Inglés", cumple: true, dato: null }]);
    expect(h).toContain('<li class="pp-criterio pp-criterio--no">');
    expect(visible(h)).toContain("– Sin idioma declarado: Inglés");
  });
});
