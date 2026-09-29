// Dependencias de los Route Handlers de acceso del panel (configuración, BD, correo).
import "server-only";
import { cargarConfiguracion, doblesDe } from "@ps/infra/config";
import { DobleCorreo, enviadorMailgun, type EnviadorCorreo } from "@ps/infra/mailgun/index";
import { poolDe } from "@ps/infra/postgres/pool";

let correo: EnviadorCorreo | undefined;

export function servicios() {
  const config = cargarConfiguracion("panel");
  correo ??= doblesDe(config).has("mailgun")
    ? new DobleCorreo((m) => console.log(JSON.stringify({ evento: "correo_doble", para: m.para, asunto: m.asunto, texto: m.texto })))
    : enviadorMailgun({ clave: config.MAILGUN_SENDING_KEY!, dominio: config.MAILGUN_DOMAIN! });
  return {
    bd: poolDe("panel"),
    correo,
    secretos: { emailHmac: config.EMAIL_HMAC_KEY!, pepper: config.OTP_PEPPER_PANEL! },
  };
}

export { ipDelCliente as ipDe } from "@ps/infra/http/envoltorios";
