// Impacto de editar un publicado (HU-126, D3): qué cambia de cara al cliente, campo a campo, con su
// valor anterior y el nuevo. Se calcula sobre la ficha armada (la misma que ve el portal), así que un
// dato interno —motivación, vínculo, capacidad— nunca aparece como cambio para el cliente, la fecha
// de disponibilidad se compara como banda y el cliente nombrado solo cuenta si el consentimiento lo
// incluye.
import { describe, expect, it } from "vitest";
import { armarFicha, cambiosDeCaraAlCliente, type DatosFicha } from "./ficha";

const ahora = new Date("2026-10-01T15:00:00Z");
const base: DatosFicha = {
  codigo: "PS-0142",
  nombre: "Laura",
  primerApellido: "Méndez",
  rol: "Desarrolladora backend",
  seniority: "Senior",
  aniosExperiencia: 9,
  sectores: ["Banca"],
  tecnologias: ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
  modalidad: "Híbrido",
  pais: "Colombia",
  ciudad: "Medellín",
  disponibilidadFecha: "2026-10-05",
  disponibilidadActualizadaEn: ahora,
  resumen: "Backend de pagos.",
  selloPersonal: ["Pagos en tiempo real"],
  formacion: "Ingeniería de sistemas",
  idiomas: ["Inglés B2"],
  trayectoria: [
    {
      cargo: "Backend senior",
      cliente: "Bancolombia",
      desde: 2020,
      hasta: 2026,
      descripcion: "Núcleo de pagos.",
    },
  ],
  incluyeClientes: true,
  enunciadoPrueba: "Validada por Trycore con un reto de código sustentado ante evaluador.",
};
const ficha = (d: Partial<DatosFicha>) =>
  armarFicha({ ...base, ...d }, { ahora, necesidad: "presencial" });

describe("cambiosDeCaraAlCliente", () => {
  it("sin cambios visibles no hay nada que declarar", () => {
    expect(cambiosDeCaraAlCliente(ficha({}), ficha({}))).toEqual([]);
  });

  it("dice cada campo que cambia con su valor anterior y el nuevo, en el orden de la ficha", () => {
    const c = cambiosDeCaraAlCliente(
      ficha({}),
      ficha({
        tecnologias: [...base.tecnologias, "AWS"],
        disponibilidadFecha: "2026-10-12",
      }),
    );
    expect(c).toEqual([
      {
        campo: "tecnologias",
        etiqueta: "Tecnologías ancla",
        antes: "Java · Spring Boot · Kafka · PostgreSQL",
        despues: "Java · Spring Boot · Kafka · PostgreSQL · AWS",
      },
      {
        campo: "disponibilidad",
        etiqueta: "Disponibilidad",
        antes: "1 semana",
        despues: "2 semanas",
      },
    ]);
  });

  it("la disponibilidad se compara como banda: otra fecha en la misma banda no es un cambio", () => {
    expect(cambiosDeCaraAlCliente(ficha({}), ficha({ disponibilidadFecha: "2026-10-06" }))).toEqual(
      [],
    );
  });

  it("un dato que se queda vacío se declara sin valor nuevo", () => {
    const [c] = cambiosDeCaraAlCliente(ficha({}), ficha({ tecnologias: [] }));
    expect(c).toEqual({
      campo: "tecnologias",
      etiqueta: "Tecnologías ancla",
      antes: "Java · Spring Boot · Kafka · PostgreSQL",
      despues: null,
    });
  });

  it("nombre, ubicación, trayectoria y validación se declaran como los ve el cliente", () => {
    const c = cambiosDeCaraAlCliente(
      ficha({}),
      ficha({
        primerApellido: "Méndez Ruiz",
        ciudad: "Bogotá",
        trayectoria: [{ ...base.trayectoria[0]!, descripcion: "Núcleo de pagos y Kafka." }],
        enunciadoPrueba: "Validada por Trycore con un proyecto bajo presión.",
      }),
    );
    expect(c.map((x) => [x.campo, x.antes, x.despues])).toEqual([
      ["nombre", "Laura Méndez", "Laura Méndez Ruiz"],
      ["ubicacion", "Medellín, Colombia", "Bogotá, Colombia"],
      [
        "trayectoria",
        "Backend senior · Bancolombia, 2020–2026: Núcleo de pagos.",
        "Backend senior · Bancolombia, 2020–2026: Núcleo de pagos y Kafka.",
      ],
      [
        "validacion",
        "Validada por Trycore con un reto de código sustentado ante evaluador.",
        "Validada por Trycore con un proyecto bajo presión.",
      ],
    ]);
  });

  it("el cliente nombrado no cuenta si el consentimiento no lo incluye", () => {
    const sin = (d: Partial<DatosFicha>) => ficha({ incluyeClientes: false, ...d });
    const otro = [{ ...base.trayectoria[0]!, cliente: "Nequi" }];
    expect(cambiosDeCaraAlCliente(sin({}), sin({ trayectoria: otro }))).toEqual([]);
  });
});

// HU-130 edge: el reporte confirmado enriquece la validación a Nivel 1; sin él, Nivel 0.
describe("armarFicha · validación", () => {
  const reporte = {
    modalidad: "Reto de código sustentado",
    resultado: "Aprobada, nivel senior ",
    evaluador: "Célula de arquitectura de Trycore",
    fecha: "2026-09-28",
    criterios: ["Diseño de la capa de servicios", " ", "Cobertura de pruebas"],
  };

  it("sin reporte: Nivel 0 con el enunciado de la modalidad", () => {
    expect(ficha({}).validacion).toEqual({ nivel: 0, enunciado: base.enunciadoPrueba });
  });

  it("con reporte confirmado: Nivel 1 con resultado, evaluador, fecha y criterios", () => {
    expect(ficha({ reporte }).validacion).toEqual({
      nivel: 1,
      enunciado: base.enunciadoPrueba,
      modalidad: "Reto de código sustentado",
      resultado: "Aprobada, nivel senior",
      evaluador: "Célula de arquitectura de Trycore",
      fecha: "2026-09-28",
      criterios: ["Diseño de la capa de servicios", "Cobertura de pruebas"],
    });
  });

  it("sin modalidad de prueba no hay validación, aunque quedara un reporte", () => {
    expect(ficha({ enunciadoPrueba: null, reporte }).validacion).toBeNull();
  });

  it("el reporte que llega a un publicado se declara como cambio para el cliente", () => {
    const [c] = cambiosDeCaraAlCliente(ficha({}), ficha({ reporte }));
    expect(c?.campo).toBe("validacion");
    expect(c?.despues).toContain("Aprobada, nivel senior");
    expect(c?.despues).toContain("Evaluó: Diseño de la capa de servicios · Cobertura de pruebas");
  });
});
