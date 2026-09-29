"use client";
// Puerta del panel (HU-123): correo @trycore.com inscrito → código de un uso al buzón → sesión de una
// jornada. Pantallas panel-acceso, panel-acceso--codigo y panel-acceso--sesion-caducada del prototipo.
// Mensajes neutros: nunca revela si un correo está inscrito.
import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { enviarJson } from "./cliente";
import { Marca } from "./Marca";

type Paso = { tipo: "correo" } | { tipo: "codigo"; correo: string };

const CONTACTO = "talento.humano@trycore.com";

export function PuertaPanel({ sesionTerminada }: { sesionTerminada: boolean }) {
  const [paso, setPaso] = useState<Paso>({ tipo: "correo" });
  const [correo, setCorreo] = useState("");
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const casillas = useRef<Array<HTMLInputElement | null>>([]);

  async function pedirCodigo(destino: string) {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson("/api/v1/acceso/codigo", { correo: destino });
      if (r.status !== 202) throw new Error(String(r.status));
      setDigitos(Array(6).fill(""));
      setPaso({ tipo: "codigo", correo: destino });
      setTimeout(() => casillas.current[0]?.focus(), 0);
    } catch {
      setError("No pudimos enviar el código. Inténtalo de nuevo en unos segundos.");
    } finally {
      setEnviando(false);
    }
  }

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (paso.tipo !== "codigo") return;
    const codigo = digitos.join("");
    if (!/^\d{6}$/.test(codigo)) {
      setError("Escribe los 6 dígitos del código.");
      return;
    }
    setEnviando(true);
    setError(null);
    const r = await enviarJson("/api/v1/acceso/verificar", { correo: paso.correo, codigo });
    setEnviando(false);
    if (r.status === 204) {
      window.location.assign("/");
      return;
    }
    setError("Código inválido o vencido. Pide uno nuevo si ya no lo tienes.");
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

  return (
    <main className="pp-puerta">
      <div className="pp-puerta__tarjeta">
        <Marca producto="Panel de People Service" />
        {paso.tipo === "correo" ? (
          <form
            className="pp-puerta__cuerpo pa-pantalla"
            aria-describedby="pa-porque"
            onSubmit={(e) => {
              e.preventDefault();
              void pedirCodigo(correo.trim());
            }}
          >
            <h1>{sesionTerminada ? "Tu sesión terminó" : "Entra al panel"}</h1>
            <p className="pa-lead" role="status">
              {sesionTerminada
                ? "La sesión dura 12 horas y se cierra tras 60 minutos sin actividad. Pide un código nuevo para seguir."
                : "Te enviamos un código de un solo uso. Sin contraseña."}
            </p>
            <div className="pp-campo pa-form">
              <label className="pp-label" htmlFor="pa-correo">
                Correo corporativo
              </label>
              <input
                className="pp-input"
                id="pa-correo"
                name="correo"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="nombre.apellido@trycore.com"
                aria-describedby="pa-correo-ayuda"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              <p className="pp-ayuda" id="pa-correo-ayuda">
                {sesionTerminada
                  ? "Si tu correo tiene acceso, te llegará un código. Si tu buzón corporativo ya no está activo, no llegará."
                  : "Solo correos @trycore.com inscritos."}
              </p>
            </div>
            {error && (
              <p className="pp-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="pp-btn pp-btn--primario pp-btn--bloque pa-enviar" disabled={enviando}>
              {sesionTerminada ? "Enviarme un código nuevo" : "Enviarme el código"}
            </button>
            <p className="pp-puerta__porque" id="pa-porque">
              {sesionTerminada
                ? "Lo que guardaste sigue en el panel."
                : "Pedimos tu correo corporativo porque el panel muestra el nombre y la trayectoria de profesionales reales."}
            </p>
          </form>
        ) : (
          <form className="pp-puerta__cuerpo pa-pantalla" aria-describedby="pa-sesion" onSubmit={entrar}>
            <h1>Escribe el código de 6 dígitos</h1>
            <p className="pa-lead" role="status">
              Si <strong className="pa-correo">{paso.correo}</strong> tiene acceso, le llegó un código. Vence en 10 minutos.
            </p>
            <div className="pa-codigo-bloque">
              <fieldset className={`pp-codigo${error ? " pp-codigo--error" : ""}`}>
                <legend className="pp-label">Código</legend>
                {digitos.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      casillas.current[i] = el;
                    }}
                    className="pp-codigo__casilla"
                    id={`pa-codigo-${i + 1}`}
                    name={`codigo-${i + 1}`}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    aria-label={`Dígito ${i + 1}`}
                    value={d}
                    onChange={(e) => escribirDigito(i, e.target.value)}
                    onKeyDown={(e) => teclaDigito(i, e)}
                    onPaste={pegarCodigo}
                  />
                ))}
              </fieldset>
            </div>
            {error && (
              <p className="pp-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="pp-btn pp-btn--primario pp-btn--bloque pa-enviar" disabled={enviando}>
              Entrar
            </button>
            <div className="pp-puerta__acciones pa-enlaces">
              <button type="button" className="pp-enlace pa-accion" onClick={() => void pedirCodigo(paso.correo)}>
                Reenviar el código
              </button>
              <button type="button" className="pp-enlace pa-accion" onClick={() => setPaso({ tipo: "correo" })}>
                Usar otro correo
              </button>
            </div>
            <p className="pp-puerta__porque" id="pa-sesion">
              La sesión dura hasta 12 horas y se cierra tras 60 minutos sin actividad.
            </p>
          </form>
        )}
        <p className="pa-pie">
          ¿Sin acceso? Escribe a{" "}
          <a className="pp-enlace" href={`mailto:${CONTACTO}`}>
            {CONTACTO}
          </a>
        </p>
      </div>
    </main>
  );
}
