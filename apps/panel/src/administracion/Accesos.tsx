"use client";
// Accesos al panel (HU-151; prototipos admin-accesos, --alta, --correo-externo, --cambio-rol, --baja y
// --ultimo-admin): inscribir un correo @trycore.com con su rol, cambiar el rol y dar de baja, cada uno en
// su hoja. El servidor decide (dominio, último administrador); la hoja explica lo que pasará con la sesión.
import { useState } from "react";
import { AYUDA_ROL, ETIQUETA_ROL } from "@ps/dominio/acceso/accesos";
import type { RolPanel } from "@ps/dominio/acceso/sesion";
import { enviarJson } from "../acceso/cliente";
import { Hoja, recargarConAviso } from "../marco/Hoja";

const ROLES: RolPanel[] = ["administrador", "observador"];

function Roles(p: { valor: RolPanel; alCambiar: (r: RolPanel) => void; nombre: string }) {
  return (
    <fieldset className="ad-roles">
      <legend className="pp-label">Rol</legend>
      {ROLES.map((r) => (
        <label className="pp-check" key={r}>
          <input
            type="radio"
            name={p.nombre}
            checked={p.valor === r}
            onChange={() => p.alCambiar(r)}
          />
          <span className="pp-check__texto">
            {ETIQUETA_ROL[r]}
            <span className="pp-check__ayuda">{AYUDA_ROL[r]}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function ErrorHoja(p: { id?: string; texto: string }) {
  return (
    <p className="pp-error" id={p.id} role="alert">
      <span aria-hidden="true">!</span>
      {p.texto}
    </p>
  );
}

const ULTIMO =
  "Eres la única administradora de inventario activa y el panel no puede quedarse sin ningún administrador. Sigues inscrita como administradora. Da el rol a otra persona antes de cambiar el tuyo; lo mismo aplica si intentas darte de baja.";

function AvisoUltimo(p: { propio: boolean }) {
  return (
    <div className="pp-aviso pp-aviso--danger" role="alert">
      <span className="pp-aviso__icono" aria-hidden="true">
        !
      </span>
      <p>
        <span className="pp-aviso__titulo">
          {p.propio ? "No puedes quitarte el rol." : "No se puede quitar el rol."}
        </span>
        {p.propio
          ? ULTIMO
          : "Es la única administradora de inventario activa y el panel no puede quedarse sin ningún administrador. Da el rol a otra persona primero."}
      </p>
    </div>
  );
}

export function InscribirCorreo() {
  const [abierta, setAbierta] = useState(false);
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolPanel>("observador");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function inscribir() {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson("/api/v1/accesos", { correo, rol });
      const d = await r.json().catch(() => ({}));
      if (r.status === 201)
        return recargarConAviso(
          `${d.inscrito.correo} ${d.inscrito.reactivado ? "volvió a quedar inscrito" : "inscrito"} como ${ETIQUETA_ROL[rol].toLowerCase()}. Ya puede pedir su código; el alta quedó en la auditoría.`,
        );
      setError(
        d.motivo === "correo_externo"
          ? "Solo se inscriben correos @trycore.com. No se inscribió y la lista quedó igual."
          : d.motivo === "correo_invalido"
            ? "Escribe el correo completo, como nombre.apellido@trycore.com."
            : d.motivo === "ya_inscrito"
              ? "Ese correo ya está inscrito y activo. Cambia su rol desde la lista."
              : "No se pudo inscribir. Inténtalo de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="pp-btn pp-btn--primario"
        aria-haspopup="dialog"
        onClick={() => {
          setError(null);
          setAbierta(true);
        }}
      >
        Inscribir correo
      </button>
      {abierta && (
        <Hoja
          titulo="Inscribir un correo"
          sub="Queda en la auditoría con tu correo y la hora."
          cerrarEtiqueta="Cerrar"
          alCerrar={() => setAbierta(false)}
          pie={
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => setAbierta(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="ad-alta"
                className="pp-btn pp-btn--primario"
                disabled={enviando}
              >
                Inscribir
              </button>
            </>
          }
        >
          <form
            id="ad-alta"
            className="pp-hoja__cuerpo"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void inscribir();
            }}
          >
            <div className="pp-form">
              <div className="pp-campo">
                <label className="pp-label" htmlFor="ad-alta-correo">
                  Correo corporativo
                </label>
                <input
                  className="pp-input"
                  id="ad-alta-correo"
                  type="email"
                  data-foco=""
                  autoComplete="off"
                  value={correo}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={`ad-alta-ayuda${error ? " ad-alta-error" : ""}`}
                  onChange={(e) => setCorreo(e.target.value)}
                />
                <p className="pp-ayuda" id="ad-alta-ayuda">
                  Solo @trycore.com. Al pedir entrar le llegará un código de un uso.
                </p>
                {error && <ErrorHoja id="ad-alta-error" texto={error} />}
              </div>
              <Roles valor={rol} alCambiar={setRol} nombre="ad-alta-rol" />
            </div>
          </form>
        </Hoja>
      )}
    </>
  );
}

export interface InscritoEnFila {
  id: string;
  correo: string;
  rol: RolPanel;
  meta: string; // «Entró hoy, 7:40 a. m. · sesión abierta»
  sesionAbierta: boolean;
  propio: boolean;
  // Es la única administradora activa: ni cambia de rol ni se da de baja.
  unicaAdministradora: boolean;
}

export function AccionesAcceso(p: { inscrito: InscritoEnFila }) {
  const i = p.inscrito;
  const [hoja, setHoja] = useState<"rol" | "baja" | null>(null);
  const [rol, setRol] = useState<RolPanel>(
    i.rol === "administrador" ? "observador" : "administrador",
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState(false);
  const bloqueado = i.unicaAdministradora || ultimo;

  async function enviar(ruta: string, cuerpo: unknown, aviso: string) {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(ruta, cuerpo);
      const d = await r.json().catch(() => ({}));
      if (r.ok) return recargarConAviso(aviso);
      if (d.motivo === "ultimo_administrador") return setUltimo(true);
      setError("No se pudo guardar. Recarga la página e inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const abrir = (h: "rol" | "baja") => {
    setError(null);
    setUltimo(false);
    setHoja(h);
  };
  const quien = i.propio ? "tu" : `el`;
  const baja = !i.propio && rol === "observador" && i.rol === "administrador";

  return (
    <div className="pp-fila__acciones">
      <button
        type="button"
        className="pp-btn pp-btn--fantasma pp-btn--sm"
        aria-haspopup="dialog"
        aria-label={`Dar de baja a ${i.correo}`}
        onClick={() => abrir("baja")}
      >
        Dar de baja
      </button>
      <button
        type="button"
        className="pp-btn pp-btn--contorno pp-btn--sm"
        aria-haspopup="dialog"
        aria-label={`Cambiar el rol de ${i.correo}`}
        onClick={() => abrir("rol")}
      >
        Cambiar rol
      </button>
      {hoja === "rol" && (
        <Hoja
          titulo={i.propio ? "Cambiar tu rol" : `Cambiar el rol de ${i.correo}`}
          sub={i.propio ? `${i.correo} · eres tú` : i.meta}
          cerrarEtiqueta="Cerrar"
          alCerrar={() => setHoja(null)}
          pie={
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => setHoja(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--primario"
                aria-disabled={
                  (bloqueado && i.rol === "administrador") || rol === i.rol || undefined
                }
                disabled={enviando}
                onClick={() => {
                  if (rol === i.rol || (bloqueado && i.rol === "administrador")) return;
                  void enviar(
                    `/api/v1/accesos/${i.id}/rol`,
                    { rol },
                    `${i.correo} pasó a ${ETIQUETA_ROL[rol].toLowerCase()}.${rol === "observador" && i.sesionAbierta ? " Su sesión se corta en su siguiente petición." : ""} El cambio quedó en la auditoría.`,
                  );
                }}
              >
                {rol === "observador" ? "Pasar a observador" : "Pasar a administradora"}
              </button>
            </>
          }
        >
          <div className="pp-hoja__cuerpo ad-hoja-cuerpo">
            <div className="ad-hoja-bloque">
              <p>
                Rol actual: <strong>{ETIQUETA_ROL[i.rol]}</strong>.
              </p>
              <Roles valor={rol} alCambiar={setRol} nombre={`ad-rol-${i.id}`} />
            </div>
            {bloqueado && i.rol === "administrador" && rol === "observador" ? (
              <AvisoUltimo propio={i.propio} />
            ) : (
              baja &&
              i.sesionAbierta && (
                <div className="pp-aviso pp-aviso--warn" role="status">
                  <span className="pp-aviso__icono" aria-hidden="true">
                    !
                  </span>
                  <p>
                    <span className="pp-aviso__titulo">Tiene una sesión abierta.</span>
                    En su siguiente petición al panel la sesión se corta y tendrá que volver a
                    entrar, ya como observador. La auditoría guarda el rol anterior y el nuevo.
                  </p>
                </div>
              )
            )}
            {error && <ErrorHoja texto={error} />}
          </div>
        </Hoja>
      )}
      {hoja === "baja" && (
        <Hoja
          titulo={i.propio ? "Darte de baja" : `Dar de baja a ${i.correo}`}
          sub={i.meta}
          cerrarEtiqueta="Cerrar"
          alCerrar={() => setHoja(null)}
          pie={
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => setHoja(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--destructivo"
                aria-disabled={bloqueado || undefined}
                disabled={enviando}
                onClick={() => {
                  if (bloqueado) return;
                  void enviar(
                    `/api/v1/accesos/${i.id}/baja`,
                    {},
                    `${i.correo} quedó dado de baja: ya no recibe código.${i.sesionAbierta ? " Su sesión se corta en su siguiente petición." : ""}`,
                  );
                }}
              >
                Dar de baja
              </button>
            </>
          }
        >
          <div className="pp-hoja__cuerpo ad-hoja-cuerpo">
            {bloqueado ? (
              <AvisoUltimo propio={i.propio} />
            ) : (
              <div className="ad-hoja-bloque">
                <p>
                  {`Deja de estar entre los inscritos activos. Si ${quien === "tu" ? "tienes" : "tiene"} una sesión abierta, se corta en ${quien === "tu" ? "tu" : "su"} siguiente petición.`}
                </p>
                <p>
                  Si vuelve a pedir entrar, no le llega código y el panel le responde igual que a un
                  correo no inscrito.
                </p>
                <p className="pp-meta">
                  La baja queda en la auditoría con tu correo y la hora. Puedes volver a inscribirlo
                  cuando haga falta.
                </p>
              </div>
            )}
            {error && <ErrorHoja texto={error} />}
          </div>
        </Hoja>
      )}
    </div>
  );
}
