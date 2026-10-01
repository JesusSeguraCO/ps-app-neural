"use client";
// Vista previa de la ficha (HU-129, HU-130; prototipos vista-previa-ficha, --bloque-incompleto y
// --bloque-opcional). Dibuja la ficha del portal —el mismo componente y el mismo `armarFicha`— con el
// perfil tal como está en el editor, cambios sin guardar incluidos; el portal no cambia hasta guardar.
// La ficha va inerte. Un bloque obligatorio que falta se numera en la ficha y en el lateral y nombra
// el dato (es la misma regla que impide publicar); un opcional sin datos no se dibuja y no impide
// publicar. «Ver como necesidad» muestra la ciudad solo si la necesidad es presencial o híbrida.
import { useState } from "react";
import {
  BLOQUE_DE_DATO,
  armarFicha,
  opcionalesVacios,
  type BloqueFicha,
  type BloqueOpcional,
  type Necesidad,
} from "@ps/contratos/ficha";
import type { EvaluacionPublicacion } from "@ps/dominio/inventario/perfil";
import { FichaPerfil, type MarcasFicha } from "@ps/ui/FichaPerfil";
import { datosFichaDePerfil, type PerfilParaFicha } from "./ficha";

const NECESIDAD: Record<Necesidad, string> = {
  remota: "Remota",
  hibrida: "Híbrida",
  presencial: "Presencial",
};

const NOMBRE_BLOQUE: Record<BloqueFicha, string> = {
  cabecera: "Rol",
  persona: "Datos de la persona",
  disponibilidad: "Disponibilidad",
  modalidad: "Modalidad y ubicación",
  validacion: "Validación técnica",
  trayectoria: "Trayectoria",
  stack: "Stack",
};

const POR_QUE: Partial<Record<BloqueFicha, string>> = {
  trayectoria: "Sin experiencias, el cliente no tiene con qué evaluar el perfil.",
  validacion: "Sin modalidad de prueba no hay enunciado de Nivel 0 que publicar.",
  disponibilidad: "Sin fecha, el portal no puede afirmar cuándo arranca.",
};

const OPCIONAL: Record<BloqueOpcional, string> = {
  resumen: "Resumen del perfil",
  sello: "Sello Personal",
  formacion: "Formación",
  idiomas: "Idiomas",
  sectores: "Sectores",
};

// Dónde se completa cada bloque en el editor.
const CAMPO_DE_BLOQUE: Record<BloqueFicha, string> = {
  cabecera: "pe-rol",
  persona: "pe-nombre",
  disponibilidad: "pe-disp",
  modalidad: "pe-modalidad",
  validacion: "pe-prueba",
  trayectoria: "pe-trayectoria",
  stack: "pe-tec",
};

export function VistaPrevia(p: {
  perfil: PerfilParaFicha;
  evaluacion: EvaluacionPublicacion;
  estado: string;
  publicado: boolean;
  sinGuardar: boolean;
  puedePublicar: boolean;
  publicando: boolean;
  alVolver: (campo?: string) => void;
  alPublicar: () => void;
  alRegistrarConsentimiento?: () => void;
}) {
  const [necesidad, setNecesidad] = useState<Necesidad>("remota");
  const ficha = armarFicha(datosFichaDePerfil(p.perfil), { ahora: new Date(), necesidad });

  // Bloques que faltan, en el orden de la ficha, con los datos que exige publicar.
  const porBloque = new Map<BloqueFicha, string[]>();
  for (const f of p.evaluacion.faltanDatos) {
    const b = BLOQUE_DE_DATO[f.campo];
    porBloque.set(b, [...(porBloque.get(b) ?? []), f.etiqueta]);
  }
  const prueba = p.evaluacion.condiciones.find((c) => c.clave === "modalidad_prueba" && !c.cumple);
  if (prueba) porBloque.set("validacion", ["Modalidad de prueba"]);
  const orden: BloqueFicha[] = [
    "cabecera",
    "persona",
    "disponibilidad",
    "validacion",
    "trayectoria",
    "stack",
    "modalidad",
  ];
  const incompletos = orden.filter((b) => porBloque.has(b));
  const marcas: MarcasFicha = Object.fromEntries(
    incompletos.map((b, i) => [b, { numero: i + 1, datos: porBloque.get(b)! }]),
  );
  const sinConsentimiento = p.evaluacion.condiciones.some(
    (c) => c.clave === "consentimiento" && !c.cumple,
  );
  const vacios = opcionalesVacios(ficha);
  const primero = incompletos[0];

  return (
    <>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Vista previa de la ficha</h1>
          <p className="pp-encabezado__meta">
            <span className={`pp-estado ${p.publicado ? "pp-estado--ok" : "pp-estado--borrador"}`}>
              {p.publicado ? "Publicado" : "No publicado"}
            </span>
            {p.publicado
              ? p.sinGuardar
                ? " · Cambios sin guardar. Así la verá el cliente si guardas; el portal sigue con la versión vigente."
                : " · Así la ve hoy el cliente."
              : p.sinGuardar
                ? " · Cambios sin guardar. Así la verá el cliente si la publicas."
                : " · Así la verá el cliente si la publicas hoy."}
          </p>
        </div>
        <div className="pp-encabezado__acciones">
          <button type="button" className="pp-btn pp-btn--contorno" onClick={() => p.alVolver()}>
            Volver a editar
          </button>
          {!p.publicado && p.puedePublicar && (
            <button
              type="button"
              className="pp-btn pp-btn--primario"
              disabled={!p.evaluacion.publicable || p.publicando}
              aria-describedby={p.evaluacion.publicable ? undefined : "vp-motivo"}
              onClick={p.alPublicar}
            >
              {p.publicando ? "Publicando…" : "Publicar"}
            </button>
          )}
        </div>
      </div>

      {!p.evaluacion.publicable && (
        <div className="pp-aviso pp-aviso--danger vp-motivo" id="vp-motivo" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            {primero
              ? `No se puede publicar hasta completar ${NOMBRE_BLOQUE[primero].toLowerCase()}, que la ficha exige${
                  incompletos.length > 1
                    ? `, y ${incompletos.length - 1} bloque${incompletos.length > 2 ? "s" : ""} más`
                    : ""
                }${sinConsentimiento ? "; además falta el consentimiento nominal" : ""}.`
              : "No se puede publicar sin el consentimiento nominal registrado."}
          </p>
          {primero ? (
            <button
              type="button"
              className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
              onClick={() => p.alVolver(CAMPO_DE_BLOQUE[primero])}
            >
              {`Completar ${NOMBRE_BLOQUE[primero].toLowerCase()}`}
            </button>
          ) : (
            p.alRegistrarConsentimiento && (
              <button
                type="button"
                className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
                onClick={p.alRegistrarConsentimiento}
              >
                Registrar consentimiento
              </button>
            )
          )}
        </div>
      )}

      <div className="vp-rejilla">
        <div className="vp-columna">
          <div className="vp-barra">
            <fieldset className="vp-modalidad">
              <legend>Ver como necesidad</legend>
              <span className="vp-segmento">
                {(Object.keys(NECESIDAD) as Necesidad[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={necesidad === n}
                    onClick={() => setNecesidad(n)}
                  >
                    {NECESIDAD[n]}
                  </button>
                ))}
              </span>
            </fieldset>
          </div>
          <div className="vp-escenario" id="vp-vista" inert>
            <FichaPerfil
              ficha={ficha}
              marcas={marcas}
              pie={
                <button
                  type="button"
                  className="pp-btn pp-btn--contorno"
                  aria-pressed="false"
                  aria-disabled="true"
                  tabIndex={-1}
                >
                  Sumar al equipo
                </button>
              }
            />
          </div>
        </div>

        <aside
          className="vp-lateral"
          aria-label={p.publicado ? "Revisión antes de guardar" : "Revisión antes de publicar"}
        >
          {p.evaluacion.publicable ? (
            <section className="pp-seccion vp-listo" aria-label="Estado de la ficha">
              <span className="pp-estado pp-estado--ok">Lista para publicar</span>
              <p className="pp-meta">
                Consentimiento, modalidad de prueba y bloques obligatorios completos.
              </p>
            </section>
          ) : (
            <section className="pp-seccion" aria-labelledby="vp-bloques">
              <div className="pp-seccion__cabecera">
                <h2 className="pp-seccion__titulo" id="vp-bloques">
                  {incompletos.length ? "Bloques incompletos" : "Falta para publicar"}
                </h2>
                {incompletos.length > 0 && (
                  <span className="pp-meta">
                    <span className="pp-mono">{incompletos.length}</span> en la ficha
                  </span>
                )}
              </div>
              <p className="vp-grupo">
                <span>Impide publicar</span>
                <span className="pp-mono">{incompletos.length + (sinConsentimiento ? 1 : 0)}</span>
              </p>
              <ul className="vp-bloques">
                {incompletos.map((b, i) => (
                  <li className="vp-bloque" key={b}>
                    <span className="vp-num vp-num--bloquea" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <p className="vp-bloque__campo">{NOMBRE_BLOQUE[b]}</p>
                      <p>{`Falta: ${porBloque.get(b)!.join(", ").toLowerCase()}.${POR_QUE[b] ? ` ${POR_QUE[b]}` : ""}`}</p>
                      <a
                        className="pp-enlace"
                        href={`#${CAMPO_DE_BLOQUE[b]}`}
                        onClick={(e) => {
                          e.preventDefault();
                          p.alVolver(CAMPO_DE_BLOQUE[b]);
                        }}
                      >
                        {`Completar ${NOMBRE_BLOQUE[b].toLowerCase()}`}
                      </a>
                    </div>
                  </li>
                ))}
                {sinConsentimiento && (
                  <li className="vp-bloque">
                    <span className="vp-num vp-num--bloquea" aria-hidden="true">
                      –
                    </span>
                    <div>
                      <p className="vp-bloque__campo">Consentimiento nominal</p>
                      <p>No es un bloque de la ficha, pero sin él el perfil no se publica.</p>
                      {p.alRegistrarConsentimiento && (
                        <a
                          className="pp-enlace"
                          href="#consentimiento"
                          onClick={(e) => {
                            e.preventDefault();
                            p.alRegistrarConsentimiento!();
                          }}
                        >
                          Registrar consentimiento
                        </a>
                      )}
                    </div>
                  </li>
                )}
              </ul>
            </section>
          )}
          <section className="pp-seccion" aria-labelledby="vp-opcionales">
            <div className="pp-seccion__cabecera">
              <h2 className="pp-seccion__titulo" id="vp-opcionales">
                Opcionales sin datos
              </h2>
              <span className="pp-meta">
                <span className="pp-mono">{vacios.length + 1}</span> · no impiden publicar
              </span>
            </div>
            <ul className="vp-bloques">
              <li className="vp-bloque">
                <span className="vp-num" aria-hidden="true">
                  –
                </span>
                <div>
                  <p className="vp-bloque__campo">Reporte detallado de validación</p>
                  <p>
                    La ficha se publica con el enunciado de Nivel 0 y sin ese bloque, igual que la
                    mostrará el portal.
                  </p>
                </div>
              </li>
              {vacios.map((v) => (
                <li className="vp-bloque" key={v}>
                  <span className="vp-num" aria-hidden="true">
                    –
                  </span>
                  <div>
                    <p className="vp-bloque__campo">{OPCIONAL[v]}</p>
                    <p>Sin dato, la ficha no muestra el bloque ni su título.</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
