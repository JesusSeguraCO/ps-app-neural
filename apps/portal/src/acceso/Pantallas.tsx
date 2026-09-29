// Pantallas sin estado de la cara cliente (prototipo enlace-revocado; «abre el enlace de tu correo»).
// Sin puerta ni inventario: solo explican qué hacer, en lenguaje llano.
import type { ReactNode } from "react";
import { Marca } from "../marco/Marca";

export const CONTACTO = "people.service@trycore.com";

export function Tarjeta({ children, pie }: { children: ReactNode; pie?: ReactNode }) {
  return (
    <main className="pp-puerta">
      <div className="pp-puerta__tarjeta">
        <Marca producto="Portal de perfiles" />
        {children}
        {pie}
      </div>
    </main>
  );
}

export function EnlaceRevocado() {
  return (
    <div className="pp-puerta__cuerpo er-cuerpo">
      <h1>Este enlace ya no abre</h1>
      <p>Escríbenos desde el correo invitado y te enviamos uno nuevo el mismo día hábil.</p>
      <div className="pp-puerta__acciones">
        <a
          className="pp-btn pp-btn--primario pp-btn--bloque"
          href={`mailto:${CONTACTO}?subject=Enlace%20nuevo%20al%20portal%20de%20perfiles`}
        >
          Escribir a People Service
        </a>
      </div>
      <p className="er-contacto">
        o directamente a{" "}
        <a className="pp-enlace" href={`mailto:${CONTACTO}`}>
          {CONTACTO}
        </a>
      </p>
      <p className="er-nota">¿Te llegó uno más reciente? Ábrelo desde ese correo.</p>
    </div>
  );
}

export function AbreTuEnlace({ sesionTerminada }: { sesionTerminada: boolean }) {
  return (
    <div className="pp-puerta__cuerpo er-cuerpo">
      <h1>{sesionTerminada ? "Tu sesión terminó" : "Abre el enlace de tu correo"}</h1>
      <p>
        Para ver tu selección de perfiles, abre el enlace que recibiste en tu correo y entra con tu correo invitado.
      </p>
      <p className="er-nota">
        ¿No lo encuentras? Escribe a{" "}
        <a className="pp-enlace" href={`mailto:${CONTACTO}`}>
          {CONTACTO}
        </a>
      </p>
    </div>
  );
}
