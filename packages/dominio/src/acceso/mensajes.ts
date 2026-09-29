// Correo del código de un uso (pantallas correo-codigo-acceso y --panel del prototipo, HU-090/HU-123).
// Sin enlace ni botón que dé acceso: el código se escribe en la pestaña donde se pidió. El código no
// va en el asunto (no se lee en la notificación). Vigencia de ADR-0002: 10 minutos (el prototipo dice
// 15; manda la ADR). Colores y medidas en línea con los valores de tokens.css (PP:correo v2).

export type AmbitoCodigo = "cliente" | "panel";

export interface MensajeCodigo {
  asunto: string;
  texto: string;
  html: string;
}

export interface OpcionesCodigo {
  pedidoEn?: Date;
  // Cliente: «cuenta · proyecto» del enlace (fila «Enlace»); se omite si no se conoce.
  detalle?: string;
}

const escapar = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// «27 sep 2026, 8:05 a. m.» en America/Bogota (UTC-5 todo el año, sin horario de verano).
export function horaDeColombia(fecha: Date): string {
  const d = new Date(fecha.getTime() - 5 * 3_600_000);
  const h = d.getUTCHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${h12}:${min} ${h < 12 ? "a. m." : "p. m."}`;
}

const T = {
  canvas: "#F6F7FA",
  card: "#FFFFFF",
  subtle: "#F1F3F7",
  borde: "#E4E7EE",
  h: "#0B1020",
  b: "#3B4256",
  m: "#5C6377",
  s: "#6B7285",
  cuerpo: "Geist,'Segoe UI',Arial,sans-serif",
  mono: "'Geist Mono',Menlo,monospace",
};

export function mensajeCodigo(
  ambito: AmbitoCodigo,
  codigo: string,
  opciones: OpcionesCodigo = {},
): MensajeCodigo {
  const panel = ambito === "panel";
  const producto = panel ? "Panel de People Service" : "Portal de perfiles";
  const asunto = panel
    ? "Tu código para entrar al panel de People Service"
    : "Tu código para entrar al Portal de perfiles";
  const titulo = panel ? "Tu código para entrar al panel" : "Tu código para entrar";
  const instruccion =
    "Escríbelo en la página donde lo pediste. Vence en 10 minutos y sirve una vez.";
  const aviso = panel
    ? "Si no pediste este código, ignora el mensaje. Tu entrada queda registrada con este correo."
    : "Si no pediste este código, ignora el mensaje. Reenviarlo no da acceso a otra persona.";
  const pie = panel
    ? "People Service · Trycore · Bogotá. Recibes este correo porque se pidió un código de acceso al panel con esta dirección corporativa."
    : "People Service · Trycore · Bogotá. Recibes este correo porque se pidió un código de acceso al Portal de perfiles con esta dirección.";
  const filas: Array<[string, string]> = [];
  if (panel) filas.push(["Acceso", "Panel · administración de inventario"]);
  else if (opciones.detalle) filas.push(["Enlace", opciones.detalle]);
  filas.push(["Pedido", `${horaDeColombia(opciones.pedidoEn ?? new Date())} (hora de Colombia)`]);

  const a = codigo.slice(0, 3);
  const b = codigo.slice(3);
  const texto = [
    titulo,
    "",
    `${a} ${b}`,
    "",
    instruccion,
    "",
    ...filas.map(([k, v]) => `${k}: ${v}`),
    "",
    aviso,
    "",
    pie,
  ].join("\n");

  const filasHtml = filas
    .map(
      ([k, v], i) =>
        `<tr><td width="64" style="padding:0 12px ${i < filas.length - 1 ? 4 : 0}px 0;white-space:nowrap;vertical-align:top">${escapar(k)}</td><td style="padding:0 0 ${i < filas.length - 1 ? 4 : 0}px;color:${T.b};font-variant-numeric:tabular-nums">${escapar(v)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:${T.canvas}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.canvas}"><tr><td style="padding:40px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;background:${T.card};border:1px solid ${T.borde};border-radius:10px;border-collapse:separate;overflow:hidden;font-family:${T.cuerpo};color:${T.b}">
<tr><td style="padding:18px 32px;border-bottom:1px solid ${T.borde}"><span style="font-size:17px;font-weight:700;color:${T.h}">trycore</span><span style="font-size:13px;color:${T.m}">&nbsp;/&nbsp;${escapar(producto)}</span></td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6">
<p style="margin:0 0 8px;font-size:17px;line-height:1.35;font-weight:600;color:${T.h}">${escapar(titulo)}</p>
<p style="margin:0 0 18px">${escapar(instruccion)}</p>
<p aria-label="Código: ${escapar(codigo.split("").join(" "))}" style="margin:0 0 24px;padding:16px;background:${T.subtle};border-radius:10px;text-align:center;font-family:${T.mono};font-variant-numeric:tabular-nums;font-size:30px;line-height:1.2;font-weight:500;letter-spacing:0.55px;color:${T.h}"><span>${escapar(a)}</span><span style="padding-left:12px">${escapar(b)}</span></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;font-size:13px;line-height:1.6;color:${T.m}">${filasHtml}</table>
<p style="margin:0;padding-top:18px;border-top:1px solid ${T.borde};font-size:13px;color:${T.m}">${escapar(aviso)}</p>
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid ${T.borde};font-size:12px;line-height:1.6;color:${T.s}">${escapar(pie)}</td></tr>
</table></td></tr></table></body></html>`;
  return { asunto, texto, html };
}
