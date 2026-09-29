import { describe, expect, it } from "vitest";
import { horaDeColombia, mensajeCodigo } from "./mensajes";

// 27 sep 2026, 8:05 a. m. en Bogotá (UTC-5).
const PEDIDO = new Date("2026-09-27T13:05:00Z");

describe("correo del código (prototipo correo-codigo-acceso y --panel)", () => {
  it("panel: textos del prototipo, código en dos grupos, sin enlace y sin el código en el asunto", () => {
    const m = mensajeCodigo("panel", "730568", { pedidoEn: PEDIDO });
    expect(m.asunto).toBe("Tu código para entrar al panel de People Service");
    expect(m.asunto).not.toContain("730");
    expect(m.texto).toContain("730 568");
    expect(m.texto).toContain("Acceso: Panel · administración de inventario");
    expect(m.texto).toContain("Pedido: 27 sep 2026, 8:05 a. m. (hora de Colombia)");
    expect(m.texto).toContain(
      "Si no pediste este código, ignora el mensaje. Tu entrada queda registrada con este correo.",
    );
    expect(m.texto).toContain(
      "People Service · Trycore · Bogotá. Recibes este correo porque se pidió un código de acceso al panel con esta dirección corporativa.",
    );
    expect(m.html).toContain('aria-label="Código: 7 3 0 5 6 8"');
    expect(m.html).toContain("background:#F1F3F7"); // caja del código (bg-subtle)
    expect(m.html).toContain("text-align:center");
    expect(m.html).not.toMatch(/<a\s|href=/);
    expect(m.html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
    expect(m.texto).not.toContain(" a el ");
  });

  it("cliente: fila Enlace solo si hay contexto y aviso de que reenviarlo no da acceso", () => {
    const sin = mensajeCodigo("cliente", "482913", { pedidoEn: PEDIDO });
    expect(sin.texto).not.toContain("Enlace:");
    const con = mensajeCodigo("cliente", "482913", {
      pedidoEn: PEDIDO,
      detalle: "Bancolombia · Modernización de pagos",
    });
    expect(con.texto).toContain("Enlace: Bancolombia · Modernización de pagos");
    expect(con.texto).toContain("Reenviarlo no da acceso a otra persona.");
    expect(con.asunto).toBe("Tu código para entrar al Portal de perfiles");
  });

  it("escapa el contexto en el HTML", () => {
    const m = mensajeCodigo("cliente", "111222", { pedidoEn: PEDIDO, detalle: "<b>x</b>" });
    expect(m.html).not.toContain("<b>x</b>");
    expect(m.html).toContain("&#60;b&#62;x");
  });

  it("hora de Colombia en formato del prototipo, a. m. y p. m.", () => {
    expect(horaDeColombia(PEDIDO)).toBe("27 sep 2026, 8:05 a. m.");
    expect(horaDeColombia(new Date("2026-09-28T02:30:00Z"))).toBe("27 sep 2026, 9:30 p. m.");
    expect(horaDeColombia(new Date("2026-01-01T17:00:00Z"))).toBe("1 ene 2026, 12:00 p. m.");
    expect(horaDeColombia(new Date("2026-01-01T05:10:00Z"))).toBe("1 ene 2026, 12:10 a. m.");
  });
});
