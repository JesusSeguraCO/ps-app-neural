import { describe, expect, it } from "vitest";
import { cuantosLaUsan, cuantosSinPublicarLaConservan } from "./concordancia";

describe("catálogos: el verbo concuerda con el número de perfiles", () => {
  it("un perfil: «La usa 1 perfil»; varios: «Lo usan 3 perfiles»", () => {
    expect(cuantosLaUsan(1, true)).toBe("La usa 1 perfil");
    expect(cuantosLaUsan(3, false)).toBe("Lo usan 3 perfiles");
  });

  it("perfiles sin publicar que conservan el valor", () => {
    expect(cuantosSinPublicarLaConservan(1, "a")).toBe("1 perfil sin publicar la conserva.");
    expect(cuantosSinPublicarLaConservan(2, "o")).toBe("2 perfiles sin publicar lo conservan.");
  });
});
