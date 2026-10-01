// Rol observador (HU-124; RF-8.1.2): consulta sin escribir. Lo que el panel le dice cuando intenta una
// acción reservada y el aviso a Talento Humano con el perfil identificado («Avisar»).
import { T, escapar } from "../acceso/mensajes";

export const MENSAJE_CONSULTA =
  "Tu rol es de consulta: no se cambió nada y el intento quedó en la auditoría.";

export const TOPE_NOTA_AVISO = 280;

export function mensajeDatoDesactualizado(d: {
  avisa: string; // correo de quien avisa
  nombre: string;
  codigo: string;
  nota: string | null;
  enlace: string; // dirección del perfil en el panel
}): { asunto: string; texto: string; html: string } {
  const asunto = `Dato desactualizado: ${d.nombre} (${d.codigo})`;
  const lineas = [
    `${d.avisa} avisa que el perfil de ${d.nombre} (${d.codigo}) tiene un dato desactualizado.`,
    ...(d.nota ? [`Lo que vio: ${d.nota}`] : []),
    `Revísalo en el panel: ${d.enlace}`,
  ];
  const texto = [
    "Dato desactualizado en un perfil",
    "",
    ...lineas.flatMap((l) => [l, ""]),
    "People Service · Trycore · Aviso interno del panel de perfiles.",
  ].join("\n");
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapar(asunto)}</title></head><body style="margin:0;background:${T.canvas};font-family:${T.cuerpo};color:${T.b}"><div style="max-width:600px;margin:0 auto;padding:32px;background:${T.card};border:1px solid ${T.borde};border-radius:10px"><p style="margin:0 0 12px;font-size:17px;font-weight:600;color:${T.h}">Dato desactualizado en un perfil</p>${lineas.map((l) => `<p style="margin:0 0 12px">${escapar(l)}</p>`).join("")}<p style="margin:16px 0 0;font-size:12px;color:${T.s}">People Service · Trycore · Aviso interno del panel de perfiles.</p></div></body></html>`;
  return { asunto, texto, html };
}
