// Invitar a un colega (HU-095) y decidir la petición en el panel (HU-145). Puras.
import { normalizarCorreo } from "../acceso/codigo";
import { T, escapar } from "../acceso/mensajes";

export type ErrorPeticion = "correo_invalido" | "es_tu_correo";

const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const opcional = (s: string | undefined, max: number) => {
  const t = s?.trim();
  return t ? t.slice(0, max) : null;
};

export function validarPeticion(
  e: { correo: string; nombre?: string; paraQue?: string },
  correoSolicitante: string,
): { ok: true; correo: string; nombre: string | null; paraQue: string | null } | { ok: false; error: ErrorPeticion } {
  const correo = normalizarCorreo(e.correo);
  if (!CORREO.test(correo) || correo.length > 254) return { ok: false, error: "correo_invalido" };
  if (correo === normalizarCorreo(correoSolicitante)) return { ok: false, error: "es_tu_correo" };
  return { ok: true, correo, nombre: opcional(e.nombre, 120), paraQue: opcional(e.paraQue, 500) };
}

export type MarcaPeticion = null | "enlace_vencido" | "enlace_revocado" | "ya_invitado";

// Sobre un enlace no vigente no se aprueba (se puede rechazar); un correo ya invitado no se duplica:
// cerrarla como aprobada no añade una segunda fila.
export function situacionPeticion(p: { estadoEnlace: "vigente" | "vencido" | "revocado"; yaInvitado: boolean }): {
  marca: MarcaPeticion;
  puedeAprobar: boolean;
  puedeRechazar: boolean;
} {
  if (p.estadoEnlace !== "vigente") return { marca: `enlace_${p.estadoEnlace}`, puedeAprobar: false, puedeRechazar: true };
  if (p.yaInvitado) return { marca: "ya_invitado", puedeAprobar: true, puedeRechazar: false };
  return { marca: null, puedeAprobar: true, puedeRechazar: true };
}

const dominio = (c: string) => normalizarCorreo(c).split("@")[1] ?? "";

export function dominioDistinto(solicitante: string, propuesto: string): boolean {
  return dominio(solicitante) !== dominio(propuesto);
}

// Aviso interno a Talento Humano de una petición nueva (HU-095): quién pide, para quién y dónde decidir.
export function mensajeAvisoPeticion(d: {
  pide: string;
  correo: string;
  nombre: string | null;
  paraQue: string | null;
  enlace: string; // «ENL-0007 · Bancolombia · Modernización de pagos»
}): { asunto: string; texto: string; html: string } {
  const asunto = `Petición de invitación: ${d.nombre ?? d.correo}`;
  const lineas = [
    `${d.pide} pide invitar a ${d.nombre ? `${d.nombre} (${d.correo})` : d.correo} al enlace ${d.enlace}.`,
    ...(d.paraQue ? [`Para qué: ${d.paraQue}`] : []),
    "Apruébala o recházala en el panel, en «Peticiones». Mientras tanto esa persona no tiene acceso.",
  ];
  const texto = ["Petición de invitación", "", ...lineas.flatMap((l) => [l, ""]), "People Service · Trycore · Aviso interno del Portal de perfiles."].join("\n");
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapar(asunto)}</title></head><body style="margin:0;background:${T.canvas};font-family:${T.cuerpo};color:${T.b}"><div style="max-width:600px;margin:0 auto;padding:32px;background:${T.card};border:1px solid ${T.borde};border-radius:10px"><p style="margin:0 0 12px;font-size:17px;font-weight:600;color:${T.h}">Petición de invitación</p>${lineas.map((l) => `<p style="margin:0 0 12px">${escapar(l)}</p>`).join("")}<p style="margin:16px 0 0;font-size:12px;color:${T.s}">People Service · Trycore · Aviso interno del Portal de perfiles.</p></div></body></html>`;
  return { asunto, texto, html };
}
