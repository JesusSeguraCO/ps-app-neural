// Dependencias de los Route Handlers de acceso del portal (configuración, BD, correo).
import "server-only";
import { cargarConfiguracion, doblesDe } from "@ps/infra/config";
import { DobleCorreo, enviadorMailgun, latenciaDelDoble, type EnviadorCorreo } from "@ps/infra/mailgun/index";
import { poolDe } from "@ps/infra/postgres/pool";

let correo: EnviadorCorreo | undefined;

export function servicios() {
  const config = cargarConfiguracion("portal");
  correo ??= doblesDe(config).has("mailgun")
    ? new DobleCorreo(
        (m) => console.log(JSON.stringify({ evento: "correo_doble", para: m.para, asunto: m.asunto, texto: m.texto })),
        latenciaDelDoble(process.env.DOBLE_MAILGUN_LATENCIA_MS),
      )
    : enviadorMailgun({ clave: config.MAILGUN_SENDING_KEY!, dominio: config.MAILGUN_DOMAIN! });
  return {
    bd: poolDe("portal"),
    correo,
    secretos: { emailHmac: config.EMAIL_HMAC_KEY!, pepper: config.OTP_PEPPER_CLIENTE! },
  };
}

export { ipDelCliente as ipDe } from "@ps/infra/http/envoltorios";
