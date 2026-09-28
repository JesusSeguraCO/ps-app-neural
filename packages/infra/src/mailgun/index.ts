// Frontera `otp-mail` (build-config.json): Mailgun por su API HTTP, solo desde el servidor
// (ADR-0009). Llave de envío de dominio por componente; `fetch` con timeout; sin seguimiento de clics.
import { clasificarEnvio, type ResultadoEnvio } from "@ps/dominio/acceso/codigo";

export interface Mensaje {
  para: string;
  asunto: string;
  texto: string;
  variables?: Record<string, string>;
}

export interface ResultadoMensaje {
  resultado: ResultadoEnvio;
  status?: number;
}

export interface EnviadorCorreo {
  enviar(m: Mensaje): Promise<ResultadoMensaje>;
}

export const REMITENTE = "Trycore People <notify@people.trycore.com>";

export function enviadorMailgun(opciones: {
  clave: string;
  dominio: string;
  timeoutMs?: number;
  base?: string;
  fetch?: typeof fetch;
}): EnviadorCorreo {
  const f = opciones.fetch ?? fetch;
  const base = opciones.base ?? "https://api.mailgun.net";
  const autorizacion = `Basic ${Buffer.from(`api:${opciones.clave}`).toString("base64")}`;
  return {
    async enviar(m) {
      const cuerpo = new URLSearchParams({
        from: REMITENTE,
        to: m.para,
        subject: m.asunto,
        text: m.texto,
        "o:tracking": "no",
        "o:tracking-clicks": "no",
        "o:tracking-opens": "no",
      });
      for (const [k, v] of Object.entries(m.variables ?? {})) cuerpo.set(`v:${k}`, v);
      try {
        const r = await f(`${base}/v3/${opciones.dominio}/messages`, {
          method: "POST",
          headers: { authorization: autorizacion },
          body: cuerpo,
          signal: AbortSignal.timeout(opciones.timeoutMs ?? 10_000),
        });
        return { resultado: clasificarEnvio({ status: r.status }), status: r.status };
      } catch (e) {
        const timeout = (e as Error).name === "TimeoutError" || (e as Error).name === "AbortError";
        return { resultado: clasificarEnvio({ error: timeout ? "timeout" : "red" }) };
      }
    },
  };
}

// Doble declarado (`DOBLES=mailgun`, solo local y CI): guarda los mensajes y devuelve los
// resultados programados (por omisión «ok»). En local también los escribe en un directorio para
// poder leer el código de acceso sin buzón real.
export class DobleCorreo implements EnviadorCorreo {
  readonly enviados: Mensaje[] = [];
  private readonly programados: ResultadoEnvio[] = [];

  constructor(private readonly alEnviar?: (m: Mensaje) => void) {}

  programar(...resultados: ResultadoEnvio[]): this {
    this.programados.push(...resultados);
    return this;
  }

  async enviar(m: Mensaje): Promise<ResultadoMensaje> {
    this.enviados.push(m);
    this.alEnviar?.(m);
    return { resultado: this.programados.shift() ?? "ok" };
  }
}
