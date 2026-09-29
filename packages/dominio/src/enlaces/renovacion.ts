// Renovación del enlace vencido (HU-092, design §2). Pura: la decisión, la ventana de espera y los
// correos. Lo que se muestra a quien pide (`publico`) depende SOLO del estado de la cuenta del enlace,
// que es el mismo para cualquiera que tenga esa dirección: nunca revela si el correo estaba invitado.
import { T, escapar } from "../acceso/mensajes";
import { fechaDeColombia } from "../fecha/colombia";

export type EstadoEmpresa =
  | { estado: "activa"; propietario: string | null }
  | { estado: "inactiva"; propietario: string | null }
  | { estado: "desconocido" }; // HubSpot sin respuesta, error o empresa no identificable

export type PublicoRenovacion = "automatica" | "persona";

export type AccionRenovacion =
  | { tipo: "emitir" }
  | { tipo: "avisar"; a: "propietario"; correo: string }
  | { tipo: "avisar"; a: "talento_humano" }
  | { tipo: "nada" };

export function decidirRenovacion(
  invitado: boolean,
  empresa: EstadoEmpresa,
): { publico: PublicoRenovacion; accion: AccionRenovacion } {
  const publico: PublicoRenovacion = empresa.estado === "activa" ? "automatica" : "persona";
  if (!invitado) return { publico, accion: { tipo: "nada" } };
  if (empresa.estado === "activa") return { publico, accion: { tipo: "emitir" } };
  if (empresa.estado === "inactiva" && empresa.propietario)
    return { publico, accion: { tipo: "avisar", a: "propietario", correo: empresa.propietario } };
  return { publico, accion: { tipo: "avisar", a: "talento_humano" } };
}

// Ventana antirrepetición por enlace + correo (negociable en HU-092; propuesta: 15 min).
export const VENTANA_RENOVACION_MS = 15 * 60_000;

export function enVentanaDeEspera(
  ultimaPedida: Date | null,
  ahora: Date,
): { enEspera: true; desde: Date } | { enEspera: false } {
  if (!ultimaPedida) return { enEspera: false };
  const desde = new Date(ultimaPedida.getTime() + VENTANA_RENOVACION_MS);
  return desde.getTime() > ahora.getTime() ? { enEspera: true, desde } : { enEspera: false };
}

export interface Mensaje {
  asunto: string;
  texto: string;
  html: string;
}

function correo(o: {
  asunto: string;
  titulo: string;
  parrafos: string[];
  boton?: { texto: string; url: string };
  pie: string;
}): string {
  const p = (t: string) => `<p style="margin:0 0 16px">${escapar(t)}</p>`;
  const boton = o.boton
    ? `<p style="margin:0 0 20px"><a href="${escapar(o.boton.url)}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#0F6E78;color:#FFFFFF;font-weight:600;text-decoration:none">${escapar(o.boton.texto)}</a></p>`
    : "";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapar(o.asunto)}</title></head><body style="margin:0;background:${T.canvas}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.canvas}"><tr><td style="padding:40px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;background:${T.card};border:1px solid ${T.borde};border-radius:10px;border-collapse:separate;overflow:hidden;font-family:${T.cuerpo};color:${T.b}">
<tr><td style="padding:18px 32px;border-bottom:1px solid ${T.borde}"><span style="font-size:17px;font-weight:700;color:${T.h}">trycore</span><span style="font-size:13px;color:${T.m}">&nbsp;/&nbsp;Portal de perfiles</span></td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6">
<p style="margin:0 0 8px;font-size:17px;line-height:1.35;font-weight:600;color:${T.h}">${escapar(o.titulo)}</p>
${o.parrafos.slice(0, 1).map(p).join("")}${boton}${o.parrafos.slice(1).map(p).join("")}
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid ${T.borde};font-size:12px;line-height:1.6;color:${T.s}">${escapar(o.pie)}</td></tr>
</table></td></tr></table></body></html>`;
}

// Correo con el enlace nuevo (prototipo correo-enlace-renovado): la dirección solo viaja al buzón.
export function mensajeEnlaceRenovado(d: {
  url: string;
  cuenta: string;
  proyecto: string | null;
  correo: string;
  venceEl: Date;
}): Mensaje {
  const asunto = "Tu enlace nuevo al portal de perfiles";
  const para = d.proyecto ? `${d.cuenta} · ${d.proyecto}` : d.cuenta;
  const parrafos = [
    `Para la selección de perfiles de ${para}.`,
    `Vence el ${fechaDeColombia(d.venceEl)}. Solo funciona con ${d.correo}; al abrirlo te llega un código a este buzón.`,
    `Si el botón no funciona, copia esta dirección: ${d.url}`,
    "El enlace es personal: reenviarlo no le da acceso a nadie más. Si no lo pediste, ignora este mensaje.",
  ];
  const pie =
    "People Service · Trycore · Bogotá. Recibes este correo porque se pidió un enlace nuevo al Portal de perfiles con tu dirección.";
  return {
    asunto,
    texto: ["Tu enlace nuevo", "", parrafos[0], "", `Abrir la selección: ${d.url}`, "", ...parrafos.slice(1, 2), "", parrafos[3], "", pie].join("\n"),
    html: correo({ asunto, titulo: "Tu enlace nuevo", parrafos, boton: { texto: "Abrir la selección", url: d.url }, pie }),
  };
}

// Aviso a una persona cuando la renovación no puede ser automática (fallo cerrado).
export function mensajeAvisoRenovacion(d: {
  motivo: "cuenta_no_activa" | "hubspot_sin_respuesta";
  cuenta: string;
  codigoEnlace: string;
  correoInvitado: string;
}): Mensaje {
  const asunto = `Petición de enlace nuevo: ${d.cuenta}`;
  const porque =
    d.motivo === "cuenta_no_activa"
      ? `La empresa ${d.cuenta} no figura como cuenta activa en HubSpot, así que no se generó un enlace automático.`
      : `HubSpot no respondió al comprobar si ${d.cuenta} es una cuenta activa, así que no se generó un enlace automático.`;
  const parrafos = [
    `${d.correoInvitado}, invitado al enlace ${d.codigoEnlace}, pidió un enlace nuevo porque el suyo venció.`,
    porque,
    "Escríbele para renovar el acceso; si corresponde, genera un enlace nuevo desde el panel. En el portal ve que alguien de People Service lo contactará.",
  ];
  const pie = "People Service · Trycore · Aviso interno del Portal de perfiles.";
  return {
    asunto,
    texto: ["Petición de enlace nuevo", "", ...parrafos.flatMap((x) => [x, ""]), pie].join("\n"),
    html: correo({ asunto, titulo: "Petición de enlace nuevo", parrafos, pie }),
  };
}
