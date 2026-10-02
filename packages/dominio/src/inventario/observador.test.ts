import { describe, expect, it } from "vitest";
import { MENSAJE_CONSULTA, mensajeDatoDesactualizado } from "./observador";

describe("observador (HU-124)", () => {
  it("el rechazo explica que el rol es de consulta y que el intento quedó registrado", () => {
    expect(MENSAJE_CONSULTA).toMatch(/^Tu rol es de consulta/);
    expect(MENSAJE_CONSULTA).toContain("quedó en la auditoría");
  });

  it("el aviso a Talento Humano identifica el perfil, quién avisa y lo que vio; escapa el HTML", () => {
    const m = mensajeDatoDesactualizado({
      avisa: "mirar@trycore.com",
      nombre: "Laura Méndez",
      codigo: "PS-0142",
      nota: "Ya no está en <Bancolombia>",
      enlace: "https://panel.people.trycore.com/inventario/PS-0142",
    });
    expect(m.asunto).toBe("Dato desactualizado: Laura Méndez (PS-0142)");
    expect(m.texto).toContain("mirar@trycore.com avisa que el perfil de Laura Méndez (PS-0142)");
    expect(m.texto).toContain("Lo que vio: Ya no está en <Bancolombia>");
    expect(m.texto).toContain("/inventario/PS-0142");
    expect(m.html).toContain("Ya no está en &#60;Bancolombia&#62;");
    expect(m.html).not.toContain("<Bancolombia>");
  });

  it("sin nota, el aviso solo identifica el perfil", () => {
    const m = mensajeDatoDesactualizado({
      avisa: "a@trycore.com",
      nombre: "X",
      codigo: "PS-0001",
      nota: null,
      enlace: "/inventario/PS-0001",
    });
    expect(m.texto).not.toContain("Lo que vio");
  });
});
