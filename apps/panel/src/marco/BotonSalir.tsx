"use client";
// «Cerrar sesión» de la barra superior (admin-shell): POST con CSRF a la API y vuelta a la puerta.
import { useState } from "react";
import { enviarJson } from "../acceso/cliente";

export function BotonSalir() {
  const [saliendo, setSaliendo] = useState(false);
  return (
    <button
      type="button"
      className="pp-btn pp-btn--fantasma pp-btn--sm"
      disabled={saliendo}
      onClick={async () => {
        setSaliendo(true);
        await enviarJson("/api/v1/acceso/salir", {}).catch(() => null);
        window.location.assign("/acceso");
      }}
    >
      Cerrar sesión
    </button>
  );
}
