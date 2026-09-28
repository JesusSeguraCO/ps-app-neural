import { describe, expect, it } from "vitest";
import { destinoSinSesion, validarSesionPanel, validarSesionPortal } from "./sesion";

const AHORA = new Date("2026-09-28T12:00:00Z");
const min = (m: number) => new Date(AHORA.getTime() + m * 60_000);

describe("validarSesionPortal (ADR-0002: revalidación en cada petición)", () => {
  const vigente = {
    enlaceId: "e-1",
    invitadoId: "i-1",
    expira: min(60),
    enlaceEstado: "activo" as const,
    enlaceVigenteHasta: min(24 * 60),
    invitadoActivo: true,
  };

  it("sesión vigente de enlace activo e invitado activo → válida", () => {
    expect(validarSesionPortal(vigente, AHORA)).toEqual({
      ok: true,
      enlaceId: "e-1",
      invitadoId: "i-1",
    });
  });
  it("sin fila → sin_sesion", () => {
    expect(validarSesionPortal(null, AHORA)).toEqual({ ok: false, motivo: "sin_sesion" });
  });
  it("enlace revocado → enlace_revocado", () => {
    expect(validarSesionPortal({ ...vigente, enlaceEstado: "revocado" }, AHORA)).toEqual({
      ok: false,
      motivo: "enlace_revocado",
    });
  });
  it("enlace vencido → enlace_vencido, aunque la sesión siga viva", () => {
    expect(validarSesionPortal({ ...vigente, enlaceVigenteHasta: min(-1) }, AHORA)).toEqual({
      ok: false,
      motivo: "enlace_vencido",
    });
  });
  it("invitado dado de baja → enlace_revocado (ya no tiene acceso a ese enlace)", () => {
    expect(validarSesionPortal({ ...vigente, invitadoActivo: false }, AHORA)).toEqual({
      ok: false,
      motivo: "enlace_revocado",
    });
  });
  it("sesión caducada → sesion_expirada", () => {
    expect(validarSesionPortal({ ...vigente, expira: min(-1) }, AHORA)).toEqual({
      ok: false,
      motivo: "sesion_expirada",
    });
  });
  it("revocado prevalece sobre caducado (la pantalla dice lo que pasó con el enlace)", () => {
    expect(
      validarSesionPortal({ ...vigente, enlaceEstado: "revocado", expira: min(-1) }, AHORA),
    ).toMatchObject({
      motivo: "enlace_revocado",
    });
  });
});

describe("validarSesionPanel (12 h absolutas, 60 min de inactividad, activo y rol desde la BD)", () => {
  const viva = {
    usuarioId: "u-1",
    correo: "ana@trycore.com",
    rol: "administrador" as const,
    activo: true,
    creada: min(-60),
    ultimaActividad: min(-5),
  };

  it("sesión reciente de usuario activo → válida con rol leído de la BD", () => {
    expect(validarSesionPanel(viva, AHORA)).toMatchObject({
      ok: true,
      usuarioId: "u-1",
      rol: "administrador",
    });
  });
  it("usuario desactivado → sin_sesion en la siguiente petición", () => {
    expect(validarSesionPanel({ ...viva, activo: false }, AHORA)).toEqual({
      ok: false,
      motivo: "sin_sesion",
    });
  });
  it("12 h desde la apertura → sesion_expirada", () => {
    expect(validarSesionPanel({ ...viva, creada: min(-12 * 60) }, AHORA)).toEqual({
      ok: false,
      motivo: "sesion_expirada",
    });
    expect(validarSesionPanel({ ...viva, creada: min(-12 * 60 + 1) }, AHORA).ok).toBe(true);
  });
  it("61 min sin actividad → sesion_expirada", () => {
    expect(validarSesionPanel({ ...viva, ultimaActividad: min(-61) }, AHORA)).toEqual({
      ok: false,
      motivo: "sesion_expirada",
    });
  });
  it("la marca de actividad se reescribe como mucho una vez por minuto", () => {
    expect(validarSesionPanel({ ...viva, ultimaActividad: min(-0.5) }, AHORA)).toMatchObject({
      refrescarActividad: false,
    });
    expect(validarSesionPanel({ ...viva, ultimaActividad: min(-2) }, AHORA)).toMatchObject({
      refrescarActividad: true,
    });
  });
});

describe("destinoSinSesion (motivo como enum cerrado, sin parámetros de retorno)", () => {
  it.each([
    ["sin_sesion", "/acceso"],
    ["enlace_revocado", "/acceso?motivo=enlace_revocado"],
    ["enlace_vencido", "/acceso?motivo=enlace_vencido"],
    ["sesion_expirada", "/acceso?motivo=sesion_expirada"],
  ] as const)("%s → %s", (motivo, destino) => {
    expect(destinoSinSesion(motivo)).toBe(destino);
  });
});
