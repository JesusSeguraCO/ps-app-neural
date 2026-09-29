"use client";
// Puerta de la cara cliente (HU-090, HU-144, HU-092). En `/e/#t=…` lee el token del fragmento, lo borra
// de la barra y pregunta su estado (ADR-0002 H5); el token solo vive en memoria de esta pestaña.
// Pasos: correo → código → aterrizaje; o enlace revocado; o vencido → pedir enlace nuevo. Mensajes
// neutros: nunca revela si un correo está invitado. Prototipo: puerta-acceso y variantes,
// acceso-vencido y variantes, enlace-revocado.
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  fechaDeColombia as fecha,
  horaDesbloqueoDeColombia as desbloqueo,
} from "@ps/dominio/fecha/colombia";
import { enviarJson } from "./cliente";
import { AbreTuEnlace, CONTACTO, EnlaceRevocado } from "./Pantallas";

type Paso =
  | { tipo: "abriendo" }
  | { tipo: "sin_enlace" }
  | { tipo: "correo" }
  | { tipo: "codigo"; correo: string; error: boolean }
  | { tipo: "espera"; hasta: Date }
  | { tipo: "revocado" }
  | { tipo: "vencido"; vencio: Date | null }
  | { tipo: "renovacion_enviada"; correo: string; vencio: Date | null }
  | { tipo: "renovacion_en_camino"; correo: string; desde: Date; vencio: Date | null }
  | { tipo: "renovacion_persona" };

export function PuertaCliente({ inicial, vencio }: { inicial?: "vencido" | "revocado"; vencio?: string | null }) {
  const [paso, setPaso] = useState<Paso>(
    inicial === "revocado"
      ? { tipo: "revocado" }
      : inicial === "vencido"
        ? { tipo: "vencido", vencio: vencio ? new Date(vencio) : null }
        : { tipo: "abriendo" },
  );
  const token = useRef<string | undefined>(undefined);
  const [correo, setCorreo] = useState("");
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(""));
  const [fallo, setFallo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const casillas = useRef<Array<HTMLInputElement | null>>([]);
  // Cada vez que se pide o se rechaza un código, foco en la primera casilla (prototipo
  // puerta-acceso--codigo). Tras el render: un setTimeout podía correr antes y el foco caía en body.
  const [enfocarCodigo, setEnfocarCodigo] = useState(0);
  useEffect(() => {
    if (enfocarCodigo) casillas.current[0]?.focus();
  }, [enfocarCodigo]);

  useEffect(() => {
    if (inicial) return;
    const m = window.location.hash.match(/^#t=([A-Za-z0-9_-]+)$/);
    // El token no se queda en la barra ni en el historial (se comparte o se ve por encima del hombro).
    window.history.replaceState(null, "", "/e");
    if (!m) {
      // Sin fragmento no hay enlace que abrir (H5): la misma explicación que /acceso, sin recargar.
      window.history.replaceState(null, "", "/acceso");
      setPaso({ tipo: "sin_enlace" });
      return;
    }
    token.current = m[1];
    void (async () => {
      const r = await enviarJson("/api/v1/acceso/enlace", { token: m[1] });
      const cuerpo = await r.json().catch(() => ({}));
      if (r.status === 200 && cuerpo.con_sesion) window.location.replace("/");
      else if (r.status === 200) setPaso({ tipo: "correo" });
      else if (cuerpo.motivo === "enlace_vencido")
        setPaso({ tipo: "vencido", vencio: new Date(cuerpo.vencio) });
      else setPaso({ tipo: "revocado" });
    })();
  }, [inicial]);

  async function pedirCodigo(destino: string) {
    setEnviando(true);
    setFallo(null);
    try {
      const r = await enviarJson("/api/v1/acceso/codigo", {
        token: token.current,
        correo: destino,
      });
      if (r.status !== 202) throw new Error(String(r.status));
      setDigitos(Array(6).fill(""));
      setPaso({ tipo: "codigo", correo: destino, error: false });
      setEnfocarCodigo((n) => n + 1);
    } catch {
      setFallo("No pudimos pedir el código. Inténtalo de nuevo en unos segundos.");
    } finally {
      setEnviando(false);
    }
  }

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (paso.tipo !== "codigo") return;
    const codigo = digitos.join("");
    if (!/^\d{6}$/.test(codigo)) {
      setFallo("Escribe los 6 dígitos del código.");
      return;
    }
    setEnviando(true);
    setFallo(null);
    const r = await enviarJson("/api/v1/acceso/verificar", {
      token: token.current,
      correo: paso.correo,
      codigo,
    });
    setEnviando(false);
    if (r.status === 204) {
      window.location.replace("/");
      return;
    }
    const cuerpo = await r.json().catch(() => ({}));
    if (r.status === 429) setPaso({ tipo: "espera", hasta: new Date(cuerpo.hasta) });
    else {
      // Como el prototipo: casillas vacías y foco en la primera para escribir el código nuevo.
      setDigitos(Array(6).fill(""));
      setPaso({ ...paso, error: true });
      setEnfocarCodigo((n) => n + 1);
    }
  }

  async function pedirEnlaceNuevo(e: FormEvent) {
    e.preventDefault();
    const destino = correo.trim();
    const vencio = paso.tipo === "vencido" ? paso.vencio : null;
    setEnviando(true);
    setFallo(null);
    try {
      const r = await enviarJson("/api/v1/acceso/renovar", {
        token: token.current,
        correo: destino,
      });
      const cuerpo = await r.json();
      if (r.status === 200 && cuerpo.estado === "en_camino") {
        setPaso({
          tipo: "renovacion_en_camino",
          correo: destino,
          desde: new Date(cuerpo.puedes_desde),
          vencio,
        });
        return;
      }
      if (r.status !== 202) throw new Error(String(r.status));
      // La pantalla depende solo de la cuenta del enlace (automática o una persona), nunca de la invitación.
      for (let i = 0; i < 25; i++) {
        const s = await fetch(`/api/v1/acceso/renovar/${cuerpo.solicitud}`).then((x) => x.json());
        if (s.estado === "persona") return setPaso({ tipo: "renovacion_persona" });
        if (s.estado === "automatica") break;
        await new Promise((res) => setTimeout(res, 1000));
      }
      setPaso({ tipo: "renovacion_enviada", correo: destino, vencio });
    } catch {
      setFallo("No pudimos pedir el enlace. Inténtalo de nuevo en unos segundos.");
    } finally {
      setEnviando(false);
    }
  }

  function escribirDigito(i: number, valor: string) {
    const d = valor.replace(/\D/g, "").slice(-1);
    const nuevos = [...digitos];
    nuevos[i] = d;
    setDigitos(nuevos);
    if (d && i < 5) casillas.current[i + 1]?.focus();
  }

  function teclaDigito(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digitos[i] && i > 0) casillas.current[i - 1]?.focus();
  }

  function pegarCodigo(e: ClipboardEvent<HTMLInputElement>) {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (d.length === 6) {
      e.preventDefault();
      setDigitos(d.split(""));
      casillas.current[5]?.focus();
    }
  }

  const pieInvitacion = (
    <p className="av-pie">
      ¿Te llegó una invitación nueva?{" "}
      <a className="pp-enlace av-toque" href="/acceso">
        Entra con tu correo
      </a>
    </p>
  );
  const errorEnvio = fallo && (
    <p className="pp-error puerta-error" role="alert">
      {fallo}
    </p>
  );

  switch (paso.tipo) {
    case "abriendo":
      return (
        <div className="pp-puerta__cuerpo" role="status">
          <h1>Abriendo tu enlace…</h1>
        </div>
      );

    case "revocado":
      return <EnlaceRevocado />;

    case "sin_enlace":
      return <AbreTuEnlace sesionTerminada={false} />;

    case "correo":
      return (
        <form
          className="pp-puerta__cuerpo"
          aria-describedby="puerta-porque"
          onSubmit={(e) => {
            e.preventDefault();
            void pedirCodigo(correo.trim());
          }}
        >
          <h1>Entra con tu correo</h1>
          <p>Te enviamos un código de 6 dígitos. Sin contraseña.</p>
          <div className="pp-campo puerta-campo">
            <label className="pp-label" htmlFor="puerta-correo">
              Correo corporativo
            </label>
            <input
              className="pp-input puerta-input"
              id="puerta-correo"
              name="correo"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder="nombre@empresa.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          {errorEnvio}
          <div className="puerta-enviar">
            <button
              type="submit"
              className="pp-btn pp-btn--primario pp-btn--bloque"
              disabled={enviando}
            >
              Enviarme el código
            </button>
          </div>
          <p className="pp-puerta__porque" id="puerta-porque">
            Lo pedimos porque los perfiles muestran nombre y trayectoria de profesionales reales, y
            solo las personas invitadas a este enlace pueden verlos.
          </p>
        </form>
      );

    case "codigo":
      return (
        <form className="pp-puerta__cuerpo" aria-describedby="puerta-neutro" onSubmit={entrar}>
          <h1>Escribe el código de 6 dígitos</h1>
          <p id="puerta-neutro" role="status">
            {"Si "}
            <strong>{paso.correo}</strong>
            {
              " está invitado, te llegó un código. Vence en 10 minutos. Si no te llega, pídele a quien te compartió el enlace que solicite tu invitación."
            }
          </p>
          <fieldset
            className={`pp-codigo${paso.error ? " pp-codigo--error" : ""}`}
            aria-describedby={paso.error ? "puerta-codigo-error" : undefined}
            aria-invalid={paso.error || undefined}
          >
            <legend className="pp-label">Código</legend>
            {digitos.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  casillas.current[i] = el;
                }}
                className="pp-codigo__casilla"
                id={`puerta-codigo-${i + 1}`}
                name={`codigo-${i + 1}`}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                aria-label={`Dígito ${i + 1}`}
                value={d}
                onChange={(e) => escribirDigito(i, e.target.value)}
                onKeyDown={(e) => teclaDigito(i, e)}
                onFocus={(e) => e.target.select()}
                onPaste={pegarCodigo}
              />
            ))}
          </fieldset>
          {paso.error && (
            <p className="pp-error puerta-error" id="puerta-codigo-error" role="alert">
              Ese código no sirve. Pide uno nuevo y usa el último que te llegue.
            </p>
          )}
          {errorEnvio}
          <div className="puerta-enviar">
            <button
              type="submit"
              className="pp-btn pp-btn--primario pp-btn--bloque"
              disabled={enviando}
            >
              Entrar
            </button>
          </div>
          <div className="pp-puerta__acciones">
            <button
              type="button"
              className="pp-enlace puerta-accion"
              onClick={() => void pedirCodigo(paso.correo)}
            >
              Reenviar el código
            </button>
            <button
              type="button"
              className="pp-enlace puerta-accion"
              onClick={() => setPaso({ tipo: "correo" })}
            >
              Usar otro correo
            </button>
          </div>
        </form>
      );

    case "espera":
      return (
        <>
          <div className="pp-puerta__cuerpo" role="alert">
            <h1>
              {"Vuelve a intentarlo a las "}
              <time className="puerta-num" dateTime={paso.hasta.toISOString()}>
                {desbloqueo(paso.hasta)}
              </time>
            </h1>
            <p>Pausamos el ingreso tras varios códigos que no sirven.</p>
            <div className="puerta-contacto">
              <p>
                ¿Necesitas entrar antes? Escribe a quien te compartió el enlace o a People Service:
              </p>
              <p className="puerta-correo">{CONTACTO}</p>
            </div>
          </div>
          <p className="puerta-pie-global">
            {"¿Te llegó una invitación nueva? "}
            <a className="pp-enlace" href="/acceso">
              Entra con tu correo
            </a>
          </p>
        </>
      );

    case "vencido":
      return (
        <>
          <div className="pp-puerta__cuerpo av-cuerpo">
            <h1>Este enlace ya venció</h1>
            <p>
              {paso.vencio ? (
                <>
                  {"Venció el "}
                  <time className="av-fecha" dateTime={paso.vencio.toISOString()}>
                    {fecha(paso.vencio)}
                  </time>
                  {". "}
                </>
              ) : null}
              Los enlaces duran 30 días. Pide uno nuevo con tu correo de invitación.
            </p>
            <form className="av-form" onSubmit={pedirEnlaceNuevo}>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="av-correo">
                  Tu correo corporativo
                </label>
                <input
                  className="pp-input"
                  id="av-correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nombre.apellido@empresa.com"
                  aria-describedby="av-correo-ayuda"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
                <p className="pp-ayuda" id="av-correo-ayuda">
                  Si el correo está invitado, el enlace llega a ese buzón.
                </p>
              </div>
              {errorEnvio}
              <button
                type="submit"
                className="pp-btn pp-btn--primario pp-btn--bloque"
                disabled={enviando}
              >
                Pedir un enlace nuevo
              </button>
            </form>
          </div>
          {pieInvitacion}
        </>
      );

    case "renovacion_enviada":
      return (
        <div className="pp-puerta__cuerpo av-cuerpo" role="status">
          <h1>Revisa tu buzón</h1>
          <p>Si tu correo estaba invitado, te enviamos un enlace nuevo a tu buzón.</p>
          <p>
            {"Lo pediste con "}
            <span className="av-correo">{paso.correo}</span>.
          </p>
          <div className="av-separador">
            <p className="pp-meta">
              Asunto: «Tu enlace nuevo al portal de perfiles». Si no lo ves, revisa no deseados.
            </p>
          </div>
          <div className="pp-puerta__acciones">
            <button
              type="button"
              className="pp-enlace puerta-accion"
              onClick={() => setPaso({ tipo: "vencido", vencio: paso.vencio })}
            >
              Usar otro correo
            </button>
          </div>
        </div>
      );

    case "renovacion_en_camino":
      return (
        <>
          <div className="pp-puerta__cuerpo av-cuerpo" role="status">
            <h1>Tu enlace ya va en camino</h1>
            <p>
              {"Lo pediste hace unos minutos con "}
              <strong className="av-correo">{paso.correo}</strong>
              {". Si estaba invitado, llegará a ese buzón."}
            </p>
            <div className="av-separador">
              <p className="pp-meta">
                {"Puedes pedir otro a partir de las "}
                <span className="av-fecha">{desbloqueo(paso.desde)}</span>
              </p>
            </div>
            <div className="pp-puerta__acciones">
              <button
                type="button"
                className="pp-enlace av-toque puerta-accion"
                onClick={() => setPaso({ tipo: "vencido", vencio: paso.vencio })}
              >
                Usar otro correo
              </button>
            </div>
          </div>
          {pieInvitacion}
        </>
      );

    case "renovacion_persona":
      return (
        <>
          <div className="pp-puerta__cuerpo av-cuerpo" role="status">
            <h1>Recibimos tu petición</h1>
            <p>
              Si tu correo está invitado, alguien de People Service te escribirá para renovar el
              acceso.
            </p>
            <div className="av-separador">
              <p className="pp-meta">
                {"Si en 2 días hábiles no tienes noticias, escribe a "}
                <span className="av-correo">{CONTACTO}</span>.
              </p>
            </div>
          </div>
          {pieInvitacion}
        </>
      );
  }
}

