import { describe, expect, it } from "vitest";
import {
  campoDelRegistro,
  filtrarRegistro,
  leerFiltros,
  paginar,
  presentarValor,
  quienDelCambio,
} from "./registro";

const NOMBRES = new Map([
  ["11111111-1111-4111-8111-111111111111", "Desarrolladora backend"],
  ["22222222-2222-4222-8222-222222222222", "Java"],
  ["33333333-3333-4333-8333-333333333333", "Spring Boot"],
  ["44444444-4444-4444-8444-444444444444", "Medellín"],
]);
const nombre = (id: string) => NOMBRES.get(id);

describe("registro de auditoría por perfil (HU-138)", () => {
  it("cada campo con su etiqueta y su grupo; estado y consentimiento igual que el contenido", () => {
    expect(campoDelRegistro("perfiles", "ciudad")).toEqual({
      etiqueta: "Ciudad",
      grupo: "contenido",
    });
    expect(campoDelRegistro("perfiles", "estado")).toEqual({
      etiqueta: "Publicación",
      grupo: "estado",
    });
    expect(campoDelRegistro("perfiles", "consentimiento").grupo).toBe("consentimiento");
    expect(campoDelRegistro("perfiles", "disponibilidad_fecha")).toEqual({
      etiqueta: "Disponibilidad",
      grupo: "disponibilidad",
    });
    expect(campoDelRegistro("validaciones", "evaluador")).toEqual({
      etiqueta: "Validación · evaluador",
      grupo: "validacion",
    });
    // Un campo que aún no tiene etiqueta se muestra con su nombre, nunca se oculta.
    expect(campoDelRegistro("perfiles", "campo_nuevo")).toEqual({
      etiqueta: "campo_nuevo",
      grupo: "contenido",
    });
  });

  it("los valores de catálogo se muestran por su nombre, también en listas", () => {
    expect(presentarValor("perfiles", "rol", "11111111-1111-4111-8111-111111111111", nombre)).toBe(
      "Desarrolladora backend",
    );
    expect(
      presentarValor(
        "perfiles",
        "tecnologias",
        '["22222222-2222-4222-8222-222222222222","33333333-3333-4333-8333-333333333333"]',
        nombre,
      ),
    ).toBe("Java · Spring Boot");
    expect(presentarValor("perfiles", "tecnologias", "[]", nombre)).toBe("Ninguna");
    // La fusión de catálogos registra nombres, no identificadores.
    expect(presentarValor("perfiles", "tecnologias", "Figma", nombre)).toBe("Figma");
    // Un identificador que ya no está en el catálogo no se pierde.
    expect(
      presentarValor("perfiles", "ciudad", "99999999-9999-4999-8999-999999999999", nombre),
    ).toBe("Valor de catálogo 99999999");
  });

  it("estado, consentimiento, disponibilidad, trayectoria y motivo en lenguaje llano", () => {
    expect(presentarValor("perfiles", "estado", "archivado", nombre)).toBe("Archivado");
    expect(presentarValor("perfiles", "estado", "colocado", nombre)).toBe("Colocado");
    expect(
      presentarValor(
        "perfiles",
        "consentimiento",
        '{"nominal":true,"incluyeClientes":true}',
        nombre,
      ),
    ).toBe("Nominal, con clientes nombrados");
    expect(
      presentarValor(
        "perfiles",
        "consentimiento",
        '{"nominal":true,"incluyeClientes":false}',
        nombre,
      ),
    ).toBe("Nominal, sin nombrar clientes");
    expect(presentarValor("perfiles", "consentimiento", "revocado", nombre)).toBe("Revocado");
    expect(presentarValor("perfiles", "disponibilidad_fecha", "2026-12-01", nombre)).toBe(
      "1 dic 2026",
    );
    expect(presentarValor("perfiles", "disponibilidad_fecha", null, nombre)).toBeNull();
    expect(
      presentarValor(
        "perfiles",
        "experiencias",
        '[{"cargo":"Backend senior","cliente":"Bancolombia","desde":2021,"hasta":null,"descripcion":"Pagos."}]',
        nombre,
      ),
    ).toBe("Backend senior · Bancolombia · 2021–hoy");
    expect(presentarValor("perfiles", "motivo_estado", "edicion_deja_incompleto", nombre)).toBe(
      "La edición dejó datos obligatorios sin completar",
    );
    expect(
      presentarValor("perfiles", "colocacion", "Bancolombia · desde 2026-09-11 · libera 2026-11-15", nombre),
    ).toBe("Bancolombia · desde 11 sep 2026 · libera 15 nov 2026");
    expect(presentarValor("validaciones", "criterios", '["Diseño","Pruebas"]', nombre)).toBe(
      "Diseño · Pruebas",
    );
  });

  it("quién: la persona, o el proceso con la persona detrás; nunca «sistema» a secas", () => {
    expect(quienDelCambio({ origen: "panel", actor: "karen@trycore.com" })).toEqual({
      tipo: "persona",
      titulo: "karen@trycore.com",
    });
    expect(
      quienDelCambio({
        origen: "importacion",
        actor: "karen@trycore.com",
        lote: { id: "l1", archivo: "inventario-sep.xlsx" },
      }),
    ).toEqual({
      tipo: "importacion",
      titulo: "Importación «inventario-sep.xlsx»",
      detalle: "confirmó karen@trycore.com",
      enlace: "/importar?lote=l1",
    });
    expect(
      quienDelCambio({
        origen: "reversion",
        actor: "karen@trycore.com",
        lote: { id: "l1", archivo: "inventario-sep.xlsx" },
      }).detalle,
    ).toBe("deshizo karen@trycore.com");
    expect(
      quienDelCambio({
        origen: "sincronizacion",
        actor: "eida@trycore.com",
        carga: { id: "c1", archivo: "asignaciones.csv", corte: "2026-08-14T16:05:00Z" },
      }),
    ).toEqual({
      tipo: "carga",
      titulo: "Carga de Operaciones «asignaciones.csv»",
      detalle: "corte 14 ago 2026, 11:05 a. m. · cargó eida@trycore.com",
      enlace: "/colocados?carga=c1",
    });
    expect(quienDelCambio({ origen: "migracion", actor: "worker:migrar_colocados" })).toEqual({
      tipo: "proceso",
      titulo: "Migración de datos",
      detalle: "al desplegar la versión que retiró «colocado» como estado",
    });
    expect(quienDelCambio({ origen: "migracion", actor: "sistema:sembrar_ficticios" }).titulo).toBe(
      "Datos ficticios de prueba",
    );
    expect(quienDelCambio({ origen: "fusion", actor: "karen@trycore.com" })).toEqual({
      tipo: "proceso",
      titulo: "Fusión de valores del catálogo",
      detalle: "fusionó karen@trycore.com",
    });
  });

  it("filtros por grupo, quién y periodo; paginación de 25 sin salirse de rango", () => {
    const ahora = new Date("2026-10-01T15:00:00Z");
    const fila = (grupo: "contenido" | "estado", tipo: "persona" | "importacion", dias: number) => ({
      grupo,
      quien: { tipo, titulo: "x" },
      cuando: new Date(ahora.getTime() - dias * 86_400_000).toISOString(),
    });
    const filas = [fila("contenido", "persona", 1), fila("estado", "importacion", 40), fila("estado", "persona", 100)];
    expect(filtrarRegistro(filas, leerFiltros({}), ahora)).toHaveLength(3);
    expect(filtrarRegistro(filas, leerFiltros({ campo: "estado" }), ahora)).toHaveLength(2);
    expect(filtrarRegistro(filas, leerFiltros({ quien: "importaciones" }), ahora)).toEqual([filas[1]]);
    expect(filtrarRegistro(filas, leerFiltros({ periodo: "90" }), ahora)).toHaveLength(2);
    expect(filtrarRegistro(filas, leerFiltros({ periodo: "30", campo: "estado" }), ahora)).toEqual([]);
    // Lo que no se reconoce no filtra.
    expect(leerFiltros({ campo: "x", quien: "y", periodo: "7" })).toEqual({
      grupo: null,
      quien: "todos",
      periodo: "todo",
    });
    const muchas = Array.from({ length: 60 }, (_, i) => i);
    expect(paginar(muchas, 1)).toMatchObject({ pagina: 1, paginas: 3, desde: 0 });
    expect(paginar(muchas, 3).filas).toEqual([50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);
    expect(paginar(muchas, 9).pagina).toBe(3);
    expect(paginar([], 1)).toMatchObject({ pagina: 1, paginas: 1, filas: [] });
  });
});
