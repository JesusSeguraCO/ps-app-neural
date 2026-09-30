// Frontera `otp-mail` (build-config.json): Mailgun por su API HTTP, solo desde el servidor
// (ADR-0009). Llave de envío de dominio por componente; `fetch` con timeout; sin seguimiento de clics.
import "server-only";
import { clasificarEnvio, type ResultadoEnvio } from "@ps/dominio/acceso/codigo";

export interface Mensaje {
  para: string;
  asunto: string;
  texto: string;
  html?: string;
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
        ...(m.html ? { html: m.html } : {}),
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
// poder leer el código de acceso sin buzón real. `latenciaMs` simula un Mailgun lento (V2-4: 3-5 s).
export class DobleCorreo implements EnviadorCorreo {
  readonly enviados: Mensaje[] = [];
  private readonly programados: ResultadoEnvio[] = [];

  constructor(
    private readonly alEnviar?: (m: Mensaje) => void,
    private readonly latenciaMs?: readonly [number, number],
    private readonly rebota?: { buzones: ReadonlySet<string>; alRebotar?: (para: string) => void },
  ) {}

  programar(...resultados: ResultadoEnvio[]): this {
    this.programados.push(...resultados);
    return this;
  }

  async enviar(m: Mensaje): Promise<ResultadoMensaje> {
    if (this.latenciaMs) {
      const [min, max] = this.latenciaMs;
      await new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
    }
    // Buzón muerto (p. ej. quien salió de la empresa): Mailgun acepta el envío y el rebote llega
    // después, así que el resultado es «ok», pero el mensaje nunca llega al buzón.
    if (this.rebota?.buzones.has(m.para.toLowerCase())) {
      this.rebota.alRebotar?.(m.para);
      return { resultado: this.programados.shift() ?? "ok" };
    }
    this.enviados.push(m);
    this.alEnviar?.(m);
    return { resultado: this.programados.shift() ?? "ok" };
  }
}

// `DOBLE_MAILGUN_REBOTA=salio@trycore.com,otro@trycore.com`: buzones que el doble trata como muertos
// (HU-123 «buzón desactivado»). Solo donde el doble está declarado.
export function rebotesDelDoble(valor: string | undefined): ReadonlySet<string> {
  return new Set((valor ?? "").split(",").map((c) => c.trim().toLowerCase()).filter(Boolean));
}

// `DOBLE_MAILGUN_LATENCIA_MS=3000-5000`: latencia del doble para las pruebas de tiempos (V2-4). Solo
// tiene efecto donde el doble está declarado (local y CI); nunca cambia el Mailgun real.
export function latenciaDelDoble(valor: string | undefined): [number, number] | undefined {
  const m = valor?.match(/^(\d+)-(\d+)$/);
  if (!m) return undefined;
  const min = Number(m[1]);
  const max = Number(m[2]);
  return max >= min ? [min, max] : undefined;
}
