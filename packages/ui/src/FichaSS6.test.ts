// Ficha · EP-003 SS6 (HU-156, HU-158) con el componente real. HU-156: la verificación de seguridad bajo
// SARO (texto del alcance y mes) y la evaluación DISC (mes y, si hay, las competencias del Sello Personal)
// como contenido en «Verificado por Trycore»; lo no registrado se omite sin marca y sin hueco; nunca un
// puntaje, semáforo ni el DISC detallado. HU-158: el cierre con las condiciones operativas, el SLA de 10
// días hábiles en el tamaño del texto y la garantía Neural Speed con texto único; el código solo al pie con
// la línea del estándar, nunca en la cabecera.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { armarFicha, type DatosFicha, type Necesidad } from "@ps/contratos/ficha";
import { FichaPerfil } from "./FichaPerfil";
import { COPY_FICHA } from "./copy";

const AHORA = new Date("2026-10-02T15:00:00Z");
const SARO = "Antecedentes judiciales, disciplinarios y fiscales";
const SELLO = ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"];
const base: DatosFicha = {
  codigo: "PS-0142",
  nombre: "Laura",
  primerApellido: "Méndez",
  rol: "Desarrolladora backend",
  seniority: "Senior",
  aniosExperiencia: 9,
  sectores: ["Banca"],
  tecnologias: ["Java", "Kafka"],
  modalidad: "Híbrido",
  pais: "Colombia",
  ciudad: "Medellín",
  // 2026-10-30 desde el 2026-10-02 cae en la banda «1 mes».
  disponibilidadFecha: "2026-10-30",
  disponibilidadActualizadaEn: AHORA,
  resumen: "Backend de pagos con foco en confiabilidad.",
  selloPersonal: SELLO,
  formacion: "Ingeniería de Sistemas",
  idiomas: ["Español", "Inglés"],
  trayectoria: [
    {
      cargo: "Arquitecta de software",
      cliente: null,
      desde: 2020,
      hasta: 2026,
      descripcion: "Diseñó la arquitectura de pagos para 3 millones de usuarios.",
    },
  ],
  incluyeClientes: false,
  enunciadoPrueba: "Resolvió un reto de código revisado por un arquitecto de Trycore.",
  saro: { texto: SARO, fecha: "2026-03-15" },
  disc: { fecha: "2026-04-10" },
};
const CONTACTO = {
  direccion: "eida.tinjaca@trycore.com",
  nombre: "Eida Tinjacá",
  cargo: "Coordinación de Servicio",
};
const html = (d: Partial<DatosFicha> = {}, necesidad: Necesidad = "remota") =>
  renderToStaticMarkup(
    createElement(FichaPerfil, {
      ficha: armarFicha({ ...base, ...d }, { ahora: AHORA, necesidad }),
      contacto: CONTACTO,
    }),
  );
const visible = (h: string) =>
  h
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const seccion = (h: string, id: string) => {
  const i = h.indexOf(`aria-labelledby="${id}"`);
  return i < 0 ? "" : h.slice(i, h.indexOf("</section>", i));
};
const fila = (h: string, id: string) => {
  const i = h.indexOf(`id="${id}"`);
  return i < 0 ? "" : h.slice(h.indexOf(">", i) + 1, h.indexOf("</dd>", i));
};
const cabecera = (h: string) => h.slice(h.indexOf("<header"), h.indexOf("</header>"));
const MARCAS_INCOMPLETO = /incomplet|pendiente|no aplica|por completar|falta/i;

describe("HU-156 · SARO y DISC como contenido", () => {
  it("happy: SARO con el texto del alcance y «marzo de 2026»; DISC con «abril de 2026» y sus tres competencias", () => {
    const h = html();
    const ver = seccion(h, "fp-verificado");
    expect(visible(fila(ver, "vp-fila-seguridad"))).toContain(`${SARO} · marzo de 2026`);
    const disc = visible(fila(ver, "vp-fila-disc"));
    expect(disc).toContain("Evaluación DISC");
    expect(disc).toContain("abril de 2026");
    expect(disc).toContain(SELLO.join(" · "));
    // Las competencias van con la DISC (B.1: el Sello Personal sale de la DISC), sin una fila aparte.
    expect(ver.match(/Sello Personal/g)?.length).toBe(1);
    // Contenido, no insignias ni sellos de color.
    for (const id of ["vp-fila-seguridad", "vp-fila-disc"])
      expect(fila(ver, id)).not.toMatch(/pp-badge|pp-estado|pp-chip|insignia|sello--/);
  });

  it("error · heredado sin SARO: ni la línea ni una marca; el resto completo", () => {
    const h = html({ saro: null });
    expect(h).not.toContain("vp-fila-seguridad");
    expect(visible(h)).not.toMatch(/SARO/);
    expect(visible(h)).not.toMatch(MARCAS_INCOMPLETO);
    for (const x of [
      "abril de 2026",
      "Validación técnica",
      "Arquitecta de software",
      "Referencia interna PS-0142",
    ])
      expect(visible(h)).toContain(x);
  });

  it("error · heredado sin fecha DISC: ni la línea ni una marca; el Sello Personal registrado sigue a la vista", () => {
    const h = html({ disc: null });
    expect(h).not.toContain("vp-fila-disc");
    expect(visible(h)).not.toMatch(/DISC/);
    expect(visible(h)).not.toMatch(MARCAS_INCOMPLETO);
    expect(visible(seccion(h, "fp-verificado"))).toContain(SELLO.join(" · "));
    expect(visible(h)).toContain(`${SARO} · marzo de 2026`);
  });

  it("edge · DISC con fecha y sin Sello Personal: la evaluación con su mes, sin competencias ni título vacío", () => {
    const h = html({ selloPersonal: [] });
    const disc = fila(h, "vp-fila-disc");
    expect(visible(disc)).toBe("Evaluación DISC abril de 2026");
    expect(h).not.toContain("Sello Personal");
    expect(h).not.toMatch(/<dd>\s*<\/dd>|<span class="fp-sub">\s*<\/span>/);
  });

  it("edge · nunca un puntaje, porcentaje, semáforo ni «aprobado» por dimensión; nada del DISC detallado", () => {
    const h = html();
    expect(visible(h)).not.toMatch(/\d+\s*%|\/\s*\d|puntaje|puntuación|aprobad[oa]|semáforo/i);
    expect(visible(h)).not.toMatch(
      /Dominancia|Influencia|Estabilidad|Cumplimiento|perfil DISC|\bD\s*\d|\bI\s*\d/i,
    );
    expect(h).not.toMatch(/pp-estado--(ok|warn|error)|semaforo/);
  });
});

describe("HU-158 · el cierre de la ficha", () => {
  it("happy: condiciones operativas (Híbrido, 1 mes, idiomas, país) al final, SLA en el tamaño del texto y garantía de servicio", () => {
    const h = html();
    const cierre = seccion(h, "fp-condiciones");
    const v = visible(cierre);
    for (const x of ["Híbrido", "1 mes", "Español · Inglés", "Colombia"]) expect(v).toContain(x);
    // Necesidad remota por omisión (EP-009 aún no la declara): sin ciudad.
    expect(v).not.toContain("Medellín");
    expect(visible(seccion(html({}, "hibrida"), "fp-condiciones"))).toContain("Medellín");
    const servicio = seccion(h, "fp-servicio");
    expect(visible(servicio)).toContain(COPY_FICHA.servicioSla);
    expect(COPY_FICHA.servicioSla).toMatch(/10 días hábiles/);
    // En el tamaño del texto de la ficha (clase propia, no la de letra pequeña).
    expect(servicio).toMatch(/<p class="fp-servicio__sla">/);
    expect(servicio).not.toMatch(/pp-meta|fp-referencia|<small/);
    expect(visible(servicio)).toContain(COPY_FICHA.servicioGarantia);
    expect(COPY_FICHA.servicioGarantia).toMatch(/agentes de IA desde el día 1/);
    expect(COPY_FICHA.servicioGarantia).toMatch(/línea directa al CoE/);
    expect(COPY_FICHA.servicioGarantia).toMatch(/Trycore/);
    // El cierre es lo último del cuerpo: después de lo declarado y del contacto, antes de la referencia.
    const orden = [
      "fp-declarado",
      "fp-contacto",
      "fp-condiciones",
      "fp-servicio",
      "fp-referencia",
    ].map((x) => h.indexOf(x));
    expect(orden.every((x) => x > 0)).toBe(true);
    expect([...orden].sort((a, b) => a - b)).toEqual(orden);
    // Modalidad e idiomas ya no se repiten en lo declarado.
    expect(visible(seccion(h, "fp-declarado"))).not.toMatch(/Idiomas|Híbrido/);
  });

  it("edge · Neural Speed: mismo texto para un no vinculado sin IA y para uno con LLM en la trayectoria; nunca de la persona", () => {
    const sinIa = html();
    const conLlm = html({
      codigo: "PS-0187",
      trayectoria: [
        {
          cargo: "Ingeniera de IA",
          cliente: null,
          desde: 2024,
          hasta: 2026,
          descripcion: "Construyó un asistente con LLM para atención al cliente.",
        },
      ],
    });
    expect(seccion(sinIa, "fp-servicio")).toBe(seccion(conLlm, "fp-servicio"));
    expect(visible(sinIa)).not.toMatch(/LLM/);
    expect(visible(seccion(conLlm, "fp-declarado"))).toContain("LLM");
    expect(visible(conLlm.replace(seccion(conLlm, "fp-declarado"), ""))).not.toMatch(/LLM/);
    for (const h of [sinIa, conLlm]) {
      // «Neural Speed» solo en la garantía del servicio: ni en la cabecera, ni en lo verificado, ni como insignia.
      expect(h.replace(seccion(h, "fp-servicio"), "")).not.toMatch(/Neural Speed/);
      expect(seccion(h, "fp-servicio")).not.toMatch(/pp-badge|pp-estado|pp-chip/);
    }
  });

  it("edge · el código solo al pie, en letra pequeña, con la línea del estándar; nunca en la cabecera", () => {
    const h = html();
    expect(cabecera(h)).not.toContain("PS-0142");
    expect(h.match(/PS-0142/g)?.length).toBe(1);
    const ref = h.match(/<p class="fp-referencia">(.*?)<\/p>/s)?.[1] ?? "";
    expect(visible(ref)).toBe(COPY_FICHA.referencia("PS-0142"));
    expect(COPY_FICHA.referencia("PS-0142")).toBe(
      "Referencia interna PS-0142. Todos los perfiles que publicamos pasan por nuestro estándar Neural-Grid™.",
    );
    expect(h.indexOf("fp-referencia")).toBeGreaterThan(h.indexOf("fp-servicio"));
  });
});
