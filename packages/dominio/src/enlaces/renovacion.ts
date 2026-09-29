// Renovación del enlace vencido (HU-092, HU-146, design §2). Pura: la decisión, la ventana de espera y
// los correos. Desde el 2026-09-29 (sponsor) no consulta HubSpot: el enlace nuevo va solo al buzón de un
// invitado, quien pide ve siempre la misma respuesta y toda petición se avisa a Talento Humano.
import { T, escapar } from "../acceso/mensajes";
import { fechaDeColombia, horaDeColombia } from "../fecha/colombia";

export type ResultadoRenovacion = "enlace_enviado" | "no_invitado";

export function decidirRenovacion(invitado: boolean): { resultado: ResultadoRenovacion; emitir: boolean; avisar: true } {
  return invitado
    ? { resultado: "enlace_enviado", emitir: true, avisar: true }
    : { resultado: "no_invitado", emitir: false, avisar: true };
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
  cuerpo?: string; // HTML ya escapado que sustituye a párrafos y botón (correo con marcado propio)
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
${o.cuerpo ?? `${o.parrafos.slice(0, 1).map(p).join("")}${boton}${o.parrafos.slice(1).map(p).join("")}`}
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
    html: correo({ asunto, titulo: "Tu enlace nuevo", parrafos, cuerpo: cuerpoEnlaceRenovado(d, para), pie }),
  };
}

// Marcado del prototipo correo-enlace-renovado: cuenta en negrita, vencimiento y cierre en pequeño,
// dirección de respaldo en un bloque mono gris.
function cuerpoEnlaceRenovado(d: { url: string; correo: string; venceEl: Date }, para: string): string {
  const url = escapar(d.url);
  return [
    `<p style="margin:0 0 24px">Para la selección de perfiles de <strong style="font-weight:600;color:${T.h}">${escapar(para)}</strong>.</p>`,
    `<p style="margin:0 0 12px"><a href="${url}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#0F6E78;color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none">Abrir la selección</a></p>`,
    `<p style="margin:0 0 32px;font-size:13px;color:${T.m}">Vence el ${escapar(fechaDeColombia(d.venceEl))}. Solo funciona con <span style="color:${T.h};overflow-wrap:anywhere">${escapar(d.correo)}</span>; al abrirlo te llega un código a este buzón.</p>`,
    `<p style="margin:0 0 8px;font-size:12px;color:${T.m}">Si el botón no funciona, copia esta dirección:</p>`,
    `<p style="margin:0 0 32px;padding:8px 12px;background:${T.subtle};border-radius:6px;font-family:${T.mono};font-size:12px;color:${T.h};overflow-wrap:anywhere;word-break:break-all">${url}</p>`,
    `<p style="margin:0;font-size:13px;color:${T.m}">El enlace es personal: reenviarlo no le da acceso a nadie más. Si no lo pediste, ignora este mensaje.</p>`,
  ].join("\n");
}

// Aviso a una persona cuando la renovación no puede ser automática (fallo cerrado).
export function mensajeAvisoRenovacion(d: {
  resultado: ResultadoRenovacion;
  cuenta: string;
  proyecto: string | null;
  codigoEnlace: string;
  codigoNuevo: string | null;
  correo: string;
  pedidaEn: Date;
}): Mensaje {
  const cuenta = d.proyecto ? `${d.cuenta} · ${d.proyecto}` : d.cuenta;
  const invitado = d.resultado === "enlace_enviado";
  const asunto = invitado ? `Enlace nuevo pedido: ${cuenta}` : `Enlace nuevo pedido por alguien no invitado: ${cuenta}`;
  const cuando = `El ${horaDeColombia(d.pedidaEn)} (hora de Colombia)`;
  const parrafos = invitado
    ? [
        `${cuando}, ${d.correo}, invitado al enlace ${d.codigoEnlace} de ${cuenta}, pidió un enlace nuevo porque el suyo venció.`,
        `Se le envió el enlace nuevo ${d.codigoNuevo} a su buzón.`,
        "Si esa persona ya no debería ver la selección, revoca el enlace nuevo desde la bandeja de renovaciones del panel.",
      ]
    : [
        `${cuando}, ${d.correo} no estaba invitado al enlace ${d.codigoEnlace} de ${cuenta} y pidió un enlace nuevo desde él.`,
        "No se le envió ningún enlace. En el portal vio la misma respuesta que un invitado.",
        "Puede ser un colega al que conviene invitar, o el enlace circuló fuera de la cuenta.",
      ];
  const pie = "People Service · Trycore · Aviso interno del Portal de perfiles.";
  return {
    asunto,
    texto: [asunto, "", ...parrafos.flatMap((x) => [x, ""]), pie].join("\n"),
    html: correo({ asunto, titulo: invitado ? "Enlace nuevo pedido" : "Enlace nuevo pedido por alguien no invitado", parrafos, pie }),
  };
}
