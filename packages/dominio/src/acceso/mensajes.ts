// Correo del código de un uso (pantallas correo-codigo-acceso y --panel del prototipo, HU-090/HU-123).
// Sin enlace ni botón que dé acceso: el código se escribe en la pestaña donde se pidió. El código no
// va en el asunto (no se lee en la notificación). Vigencia de ADR-0002: 10 minutos.

export type AmbitoCodigo = "cliente" | "panel";

export interface MensajeCodigo {
  asunto: string;
  texto: string;
  html: string;
}

const escapar = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function mensajeCodigo(ambito: AmbitoCodigo, codigo: string): MensajeCodigo {
  const destino = ambito === "panel" ? "el panel de People Service" : "el Portal de perfiles";
  const asunto =
    ambito === "panel"
      ? "Tu código para entrar al panel de People Service"
      : "Tu código para entrar al Portal de perfiles";
  const titulo = ambito === "panel" ? "Tu código para entrar al panel" : "Tu código para entrar";
  const lineas = [
    titulo,
    "",
    `${codigo.slice(0, 3)} ${codigo.slice(3)}`,
    "",
    "Escríbelo en la página donde lo pediste. Vence en 10 minutos y sirve una vez.",
    "",
    `Si no pediste entrar a ${destino}, ignora este correo: nadie entra sin el código.`,
  ];
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#F6F7FA">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E4E7EE;border-radius:10px;font-family:Geist,Segoe UI,Arial,sans-serif;color:#3B4256">
<tr><td style="padding:20px 28px;border-bottom:1px solid #E4E7EE;font-size:15px;color:#0B1020"><strong>trycore</strong> / ${escapar(ambito === "panel" ? "Panel de People Service" : "Portal de perfiles")}</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 8px;font-size:22px;letter-spacing:-0.02em;color:#0B1020">${escapar(titulo)}</h1>
<p style="margin:0 0 20px;font-size:15px">Escríbelo en la página donde lo pediste. Vence en 10 minutos y sirve una vez.</p>
<p style="margin:0 0 20px;font-family:'Geist Mono',Menlo,monospace;font-size:30px;font-weight:700;color:#0B1020;letter-spacing:0.08em"><span style="padding-right:14px">${escapar(codigo.slice(0, 3))}</span><span>${escapar(codigo.slice(3))}</span></p>
<p style="margin:0;font-size:13px;color:#5C6377">Si no pediste entrar a ${escapar(destino)}, ignora este correo: nadie entra sin el código.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { asunto, texto: lineas.join("\n"), html };
}
