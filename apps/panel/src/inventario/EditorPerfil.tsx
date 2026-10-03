"use client";
// Editor del perfil (HU-125, HU-127; prototipo perfil-editor y sus variantes). Rol y tecnologías se
// eligen del catálogo con su buscador (sin texto libre); el rol encadena la familia y las modalidades
// de prueba que se ofrecen, y una familia sin modalidades se advierte al elegirlo. Guardar deja
// siempre un borrador y señala lo que falta; el consentimiento nominal se registra y se revoca en su
// sección. «Publicar» aplica las guardas del servidor y, si falta algo, dice exactamente qué y ofrece
// ir a resolverlo (HU-128, HU-130); «Vista previa» muestra la ficha del portal con lo que hay en el
// editor, sin guardar (HU-129). La evidencia la entrega el sub-slice 6.
// Validaciones de entrada (EP-003 · SS1; HU-176, HU-177): alcance de la verificación SARO elegido del
// catálogo cerrado (solo activos; el desactivado que el perfil conserva se muestra señalado y no se
// ofrece a otros), fecha SARO y fecha DISC. Una fecha posterior a hoy no se guarda (422) y el perfil
// conserva lo que tenía; publicar sin alguno dice «Falta …» y lleva al campo.
import type { ContactoTrycore } from "@ps/dominio/contacto/contacto";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { horaCortaDeColombia, horaDeColombia, fechaCivil } from "@ps/dominio/fecha/colombia";
import { estadoDeEntrada } from "@ps/dominio/inventario/entrada";
import { ETIQUETA_ESTADO } from "@ps/dominio/inventario/estados";
import {
  MENSAJE_FECHA_FUTURA,
  MOTIVO_CONDICION,
  OPCIONES_DISPONIBILIDAD,
  clienteEnDescripcion,
  evaluarPublicacion,
  faltaDe,
  validarConsentimiento,
  validarFechaVerificacion,
  type ClaveCondicion,
  type CampoObligatorio,
  type EvaluacionPublicacion,
  type OpcionDisponibilidad,
} from "@ps/dominio/inventario/perfil";
import type {
  ExperienciaEntrada,
  OpcionesEditor,
  PerfilEditor,
} from "@ps/infra/postgres/perfiles-panel";
import type { CambioDeCaraAlCliente } from "@ps/contratos/ficha";
import { enviarJson, pedir } from "../acceso/cliente";
import { Hoja, recargarConAviso } from "../marco/Hoja";
import { BuscadorCatalogo, type ValorElegible } from "./BuscadorCatalogo";
import type { PerfilParaFicha } from "./ficha";
import { VistaPrevia } from "./VistaPrevia";
import { AvisarTalentoHumano } from "./Avisar";
import { ANCLA_CONDICION, VALIDACION_ENTRADA } from "./anclas";

type Rol = OpcionesEditor["roles"][number];
type Experiencia = ExperienciaEntrada & { clave: string };
type SelDisp = "" | OpcionDisponibilidad | "fecha";

const NOMBRE_MODALIDAD: Record<string, string> = {
  remoto: "Remoto",
  hibrido: "Híbrido",
  presencial: "Presencial",
};
const VINCULO: Record<string, string> = {
  vinculado: "Vinculado a Trycore",
  banco_no_vinculado: "Banco no vinculado",
  fabrica: "Fábrica de software",
};

const ERROR_CAMPO: Record<CampoObligatorio, { id: string; texto: string }> = {
  nombre: { id: "pe-nombre", texto: "Falta el nombre." },
  primer_apellido: { id: "pe-apellido", texto: "Falta el primer apellido." },
  rol: { id: "pe-rol", texto: "Falta el rol." },
  tecnologias: { id: "pe-tec", texto: "Falta al menos una tecnología." },
  seniority: { id: "pe-seniority", texto: "Falta el seniority." },
  anios_experiencia: { id: "pe-anios", texto: "Faltan los años de experiencia." },
  ciudad: { id: "pe-ciudad", texto: "Falta la ciudad." },
  modalidad_trabajo: { id: "pe-modalidad", texto: "Falta la modalidad de trabajo." },
  disponibilidad: { id: "pe-disp", texto: "Falta la banda de disponibilidad." },
  trayectoria: { id: "pe-trayectoria", texto: "Falta al menos una experiencia." },
};


const MOTIVO: Record<string, string> = {
  fecha_verificacion_futura: MENSAJE_FECHA_FUTURA,
  fecha_verificacion_ilegible: "La fecha de una verificación no es una fecha válida (AAAA-MM-DD).",
  valor_no_disponible:
    "Uno de los valores elegidos ya no está activo en el catálogo. Vuelve a elegirlo.",
  modalidad_de_otra_familia:
    "La modalidad de prueba no es de la familia del rol. Elige una de esa familia.",
  cliente_en_texto:
    "Una experiencia nombra al cliente dentro del texto. El cliente va solo en su campo.",
  version_distinta:
    "Alguien guardó este perfil después de que lo abriste. Recarga para ver su versión antes de guardar.",
  editar_publicado:
    "Los cambios de un perfil publicado se aplican mostrando antes qué verá el cliente.",
  no_es_publicado: "Este perfil ya no está publicado. Recarga para ver su estado.",
  no_existe: "El perfil ya no existe.",
  transicion_invalida: "Este perfil ya no está en borrador. Recarga para ver su estado.",
};

let secuencia = 0;
const nuevaClave = () => `x${++secuencia}`;

function selDeFecha(fecha: string | null, hoy: string): SelDisp {
  if (!fecha) return "";
  return fecha <= hoy ? "ahora" : "fecha";
}

function Icono({ d }: { d: string }) {
  return (
    <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function ErrorCampo({ id, texto }: { id: string; texto: string }) {
  return (
    <p className="pp-error" id={id}>
      <span aria-hidden="true">!</span>
      {texto}
    </p>
  );
}

export function EditorPerfil(p: {
  perfil: PerfilEditor | null;
  opciones: OpcionesEditor;
  escribe: boolean;
  registraConsentimiento: boolean;
  hoy: string;
  // Correo de quien edita: la hoja de impacto dice con qué autor queda la auditoría (D25).
  autor?: string;
  modoInicial?: "editar" | "previa";
  // Rol de consulta (HU-124): el formulario inerte dice por qué y ofrece avisar a Talento Humano;
  // `porDireccionDeEdicion` cuando llegó por la dirección de edición (el intento quedó registrado).
  consulta?: { porDireccionDeEdicion: boolean };
  // Contacto vigente de Trycore: la vista previa dibuja el mismo bloque de conversación que el portal.
  contacto?: ContactoTrycore;
}) {
  const inicial = p.perfil;
  const [perfil, setPerfil] = useState(inicial);
  const [roles, setRoles] = useState(p.opciones.roles);
  const [familias, setFamilias] = useState(p.opciones.familias);
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [apellido, setApellido] = useState(inicial?.primerApellido ?? "");
  const [rol, setRol] = useState<Rol | null>(
    inicial?.rol ? (p.opciones.roles.find((r) => r.id === inicial.rol!.id) ?? null) : null,
  );
  const [tecnologias, setTecnologias] = useState<ValorElegible[]>(inicial?.tecnologias ?? []);
  const [sectores, setSectores] = useState<ValorElegible[]>(inicial?.sectores ?? []);
  const [seniorityId, setSeniorityId] = useState(inicial?.seniority?.id ?? "");
  const [anios, setAnios] = useState(inicial?.aniosExperiencia?.toString() ?? "");
  const [ciudadId, setCiudadId] = useState(inicial?.ciudad?.id ?? "");
  const [modalidadId, setModalidadId] = useState(inicial?.modalidadTrabajo?.id ?? "");
  const [selDisp, setSelDisp] = useState<SelDisp>(
    selDeFecha(inicial?.disponibilidadFecha ?? null, p.hoy),
  );
  const [fechaDisp, setFechaDisp] = useState(
    inicial?.disponibilidadFecha && inicial.disponibilidadFecha > p.hoy
      ? inicial.disponibilidadFecha
      : "",
  );
  const [pruebaId, setPruebaId] = useState(inicial?.modalidadPrueba?.id ?? "");
  const [capacidad, setCapacidad] = useState(inicial?.capacidad ?? "");
  const [anclaje, setAnclaje] = useState(inicial?.anclaje ?? "");
  const [resumen, setResumen] = useState(inicial?.resumen ?? "");
  const [formacion, setFormacion] = useState(inicial?.formacion ?? "");
  const [idiomas, setIdiomas] = useState((inicial?.idiomas ?? []).join("; "));
  const [vinculo, setVinculo] = useState(inicial?.vinculo ?? "");
  const [sello, setSello] = useState<string[]>(
    [0, 1, 2].map((i) => inicial?.selloPersonal[i] ?? ""),
  );
  const [aporte, setAporte] = useState(inicial?.aporte ?? "");
  const [saroAlcanceId, setSaroAlcanceId] = useState(inicial?.saro.alcance?.id ?? "");
  const [saroFecha, setSaroFecha] = useState(inicial?.saro.fecha ?? "");
  const [discFecha, setDiscFecha] = useState(inicial?.disc.fecha ?? "");
  // Fecha rechazada por el servidor (422): qué campo y por qué.
  const [errorFecha, setErrorFecha] = useState<{ campo: string; texto: string } | null>(null);
  const [experiencias, setExperiencias] = useState<Experiencia[]>(
    (inicial?.experiencias ?? []).map((e) => ({ ...e, clave: e.id })),
  );
  const [hojaExp, setHojaExp] = useState<Experiencia | null>(null);
  const [crear, setCrear] = useState<{
    tipo: "rol" | "tecnologia" | "sector";
    texto: string;
  } | null>(null);
  const [hojaConsent, setHojaConsent] = useState<"nuevo" | "anterior" | "alcance" | null>(null);
  const [rechazado, setRechazado] = useState<{
    fechaFirma: string | null;
    alcance: { nombreApellido: boolean; trayectoria: boolean; clientes: boolean };
  } | null>(null);
  const [hojaRevocar, setHojaRevocar] = useState(false);
  const [alcancePropuesto, setAlcancePropuesto] = useState<{
    nombreApellido: boolean;
    trayectoria: boolean;
    clientes: boolean;
  } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  // Expresiones de inventario de la última respuesta del guardado (HU-194): aviso, no error.
  const [lenguaje, setLenguaje] = useState<string[]>([]);
  const tomarAvisos = (d: { avisos?: Array<{ expresion: string }> }) => {
    if (Array.isArray(d.avisos)) setLenguaje(d.avisos.map((a) => a.expresion));
  };
  // Tras recargar o saltar al perfil recién creado, el aviso sigue a la vista.
  useEffect(() => {
    try {
      const guardadas = sessionStorage.getItem(CLAVE_LENGUAJE);
      sessionStorage.removeItem(CLAVE_LENGUAJE);
      if (guardadas) setLenguaje(JSON.parse(guardadas));
    } catch {
      // Sin almacenamiento solo se pierde el aviso.
    }
  }, []);
  const [intento, setIntento] = useState(Boolean(inicial));
  const [modo, setModo] = useState<"editar" | "previa">(
    p.modoInicial === "previa" && p.perfil ? "previa" : "editar",
  );
  const [publicando, setPublicando] = useState(false);
  const [intentoPublicar, setIntentoPublicar] = useState(false);
  // Lo que el servidor dijo que falta, si discrepó del cálculo local (otro cambio en paralelo).
  const [bloqueoServidor, setBloqueoServidor] = useState<EvaluacionPublicacion | null>(null);
  const [base, setBase] = useState<string | null>(null);

  // Un publicado también se edita, en dos pasos y con su impacto a la vista (HU-126).
  const enPortal = perfil?.estado === "publicado";
  // Publicado al que la guarda rechazaría hoy (HU-178, D62): se dice antes de editar.
  const incompleto = perfil
    ? estadoDeEntrada(perfil.estado, perfil.evaluacion)
    : { incompleto: false, faltan: [], texto: null };
  const editable = p.escribe && (!perfil || perfil.estado === "borrador" || enPortal);
  const [impacto, setImpacto] = useState<Impacto | null>(null);
  const prueba = p.opciones.modalidadesPrueba.find((m) => m.id === pruebaId) ?? null;
  // Alcances que se ofrecen: los activos y, si el perfil guardado conserva uno desactivado, ese (HU-177).
  const alcanceGuardado = perfil?.saro.alcance ?? null;
  const alcances = [
    ...p.opciones.alcancesSaro.map((a) => ({ ...a, activo: true })),
    ...(alcanceGuardado && !alcanceGuardado.activo
      ? [
          {
            id: alcanceGuardado.id,
            nombre: alcanceGuardado.nombre,
            textoCliente: alcanceGuardado.textoCliente,
            activo: false,
          },
        ]
      : []),
  ];
  const alcance = alcances.find((a) => a.id === saroAlcanceId) ?? null;
  // La regla de fecha no futura en vivo, la misma del servidor.
  const fechaInvalida = (campo: "saroFecha" | "discFecha", v: string): string | null => {
    const r = validarFechaVerificacion(v || null, p.hoy);
    if (!r.ok)
      return r.motivo === "fecha_futura" ? MENSAJE_FECHA_FUTURA : MOTIVO.fecha_verificacion_ilegible!;
    return errorFecha?.campo === campo ? errorFecha.texto : null;
  };
  const errSaroFecha = fechaInvalida("saroFecha", saroFecha);
  const errDiscFecha = fechaInvalida("discFecha", discFecha);
  const pruebasFamilia = rol
    ? p.opciones.modalidadesPrueba.filter((m) => m.familiaId === rol.familiaId)
    : [];
  const familiaRol = rol ? familias.find((f) => f.id === rol.familiaId) : null;
  const modalidadesFamilia = familiaRol?.modalidades ?? rol?.modalidades ?? 0;
  const fechaDisponibilidad =
    selDisp === "fecha"
      ? fechaDisp || null
      : selDisp
        ? new Date(Date.now() - 5 * 3_600_000 + OPCIONES_DISPONIBILIDAD[selDisp].dias * 86_400_000)
            .toISOString()
            .slice(0, 10)
        : null;

  // Lo que falta, calculado en vivo con la misma regla del servidor.
  const evaluacion = useMemo(
    () =>
      evaluarPublicacion({
        nombre,
        primerApellido: apellido,
        rol: Boolean(rol),
        tecnologias: tecnologias.length,
        seniority: Boolean(seniorityId),
        aniosExperiencia: anios === "" ? null : Number(anios),
        ciudad: Boolean(ciudadId),
        modalidadTrabajo: Boolean(modalidadId),
        disponibilidadFecha: fechaDisponibilidad,
        experiencias: experiencias.length,
        modalidadPrueba: {
          elegida: Boolean(prueba),
          activa: Boolean(prueba && rol && prueba.familiaId === rol.familiaId),
        },
        familiaConModalidades: !rol || modalidadesFamilia > 0,
        consentimiento: perfil?.consentimiento
          ? { vigente: perfil.consentimiento.vigente, nominal: perfil.consentimiento.nominal }
          : null,
        saro: { alcance: Boolean(saroAlcanceId), fecha: Boolean(saroFecha) },
        disc: { fecha: Boolean(discFecha) },
      }),
    [
      saroAlcanceId,
      saroFecha,
      discFecha,
      nombre,
      apellido,
      rol,
      tecnologias,
      sectores,
      seniorityId,
      anios,
      ciudadId,
      modalidadId,
      fechaDisponibilidad,
      experiencias,
      prueba,
      modalidadesFamilia,
      perfil,
    ],
  );
  const falta = (c: CampoObligatorio) =>
    intento && evaluacion.faltanDatos.some((f) => f.campo === c);
  const err = (c: CampoObligatorio) => (falta(c) ? `${ERROR_CAMPO[c].id}-error` : undefined);

  const cuerpo = () => ({
    nombre,
    primerApellido: apellido,
    rolId: rol?.id ?? null,
    tecnologiaIds: tecnologias.map((t) => t.id),
    sectorIds: sectores.map((x) => x.id),
    seniorityId: seniorityId || null,
    aniosExperiencia: anios === "" ? null : Number(anios),
    ciudadId: ciudadId || null,
    modalidadTrabajoId: modalidadId || null,
    disponibilidad:
      selDisp === "fecha"
        ? fechaDisp
          ? { fecha: fechaDisp }
          : null
        : selDisp
          ? { opcion: selDisp }
          : null,
    modalidadPruebaId: pruebaId || null,
    capacidad,
    anclaje,
    resumen,
    vinculo: vinculo || null,
    formacion,
    idiomas: idiomas
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean),
    selloPersonal: sello.map((x) => x.trim()).filter(Boolean),
    aporte,
    saroAlcanceId: saroAlcanceId || null,
    saroFecha: saroFecha || null,
    discFecha: discFecha || null,
    experiencias: experiencias.map((e) => ({
      id: e.id ?? null,
      cargo: e.cargo,
      cliente: e.cliente ?? null,
      desde: e.desde ?? null,
      hasta: e.hasta ?? null,
      descripcion: e.descripcion,
    })),
  });

  // Lo guardado, para saber si hay cambios sin guardar (vista previa y publicar).
  const actual = JSON.stringify(cuerpo());
  useEffect(() => {
    setBase(JSON.stringify(cuerpo()));
  }, [perfil]);
  const sinGuardar = Boolean(perfil) && base !== null && actual !== base;
  const cambiosSinGuardar = (() => {
    if (!sinGuardar || base === null) return 0;
    const a = JSON.parse(base) as Record<string, unknown>;
    const d = JSON.parse(actual) as Record<string, unknown>;
    return Object.keys(d).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(d[k])).length;
  })();

  // El perfil tal como está en el editor, con la forma de la ficha (HU-129).
  const enEdicion = (): PerfilParaFicha | null => {
    if (!perfil) return null;
    const ciudad = p.opciones.ciudades.find((c) => c.id === ciudadId) ?? null;
    const modalidad = p.opciones.modalidadesTrabajo.find((m) => m.id === modalidadId) ?? null;
    const seniority = p.opciones.seniorities.find((x) => x.id === seniorityId) ?? null;
    return {
      codigo: perfil.codigo,
      nombre,
      primerApellido: apellido,
      rol: rol ? { id: rol.id, nombre: rol.nombre } : null,
      seniority,
      aniosExperiencia: anios === "" ? null : Number(anios),
      sectores,
      tecnologias,
      modalidadTrabajo: modalidad,
      ciudad: ciudad ? { id: ciudad.id, nombre: ciudad.nombre, pais: ciudad.pais } : null,
      disponibilidadFecha: fechaDisponibilidad,
      disponibilidadActualizadaEn:
        fechaDisponibilidad && fechaDisponibilidad === perfil.disponibilidadFecha
          ? perfil.disponibilidadActualizadaEn
          : fechaDisponibilidad
            ? new Date().toISOString()
            : null,
      resumen,
      selloPersonal: sello.map((x) => x.trim()).filter(Boolean),
      formacion,
      idiomas: idiomas
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean),
      experiencias: experiencias.map((e) => ({
        id: e.id ?? e.clave,
        cargo: e.cargo,
        cliente: e.cliente ?? null,
        desde: e.desde ?? null,
        hasta: e.hasta ?? null,
        descripcion: e.descripcion,
      })),
      consentimiento: perfil.consentimiento,
      // El reporte confirmado vale para la modalidad con la que se hizo (HU-130): cambiarla vuelve a Nivel 0.
      reporte: pruebaId && pruebaId === perfil.modalidadPrueba?.id ? perfil.reporte : null,
      modalidadPrueba: prueba
        ? {
            id: prueba.id,
            nombre: prueba.nombre,
            activa: Boolean(rol && prueba.familiaId === rol.familiaId),
            textoCliente: prueba.textoCliente,
          }
        : null,
      saro: { alcance, fecha: saroFecha || null },
      disc: { fecha: discFecha || null },
    };
  };

  // Reporte detallado (HU-140, HU-130): vale para la modalidad con la que se hizo.
  const reporteVigente =
    perfil?.reporte && pruebaId && pruebaId === perfil.modalidadPrueba?.id ? perfil.reporte : null;
  const [pidiendo, setPidiendo] = useState(false);
  const [errorReporte, setErrorReporte] = useState<string | null>(null);
  // El borrador sale de la modalidad guardada; sin modalidad no hay borrador y se remite al selector.
  async function pedirReporte() {
    if (!perfil) return;
    setErrorReporte(null);
    const alSelector = (texto: string) => {
      // Sin rol el selector está cerrado: se lleva primero al rol, que abre las modalidades de su familia.
      setErrorReporte(
        rol
          ? texto
          : `${texto} Elige primero el rol: la modalidad sale del catálogo de su familia.`,
      );
      const el = document.getElementById(rol ? "pe-prueba" : "pe-rol");
      el?.scrollIntoView({ block: "center" });
      el?.focus();
    };
    if (!pruebaId)
      return alSelector("El borrador sale de la modalidad de prueba: elige una para este perfil.");
    if (sinGuardar)
      return setErrorReporte(
        "Guarda primero los cambios del perfil: el borrador sale de la modalidad guardada.",
      );
    setPidiendo(true);
    try {
      const r = await enviarJson(`/api/v1/perfiles/${perfil.codigo}/validacion`, {});
      const d = await r.json().catch(() => ({}));
      if (r.ok) window.location.href = `/inventario/${perfil.codigo}/validacion`;
      else if (d.motivo === "sin_modalidad_prueba")
        alSelector("El borrador sale de la modalidad de prueba: elige una para este perfil.");
      else setErrorReporte("No se pudo preparar el borrador. Inténtalo de nuevo.");
    } finally {
      setPidiendo(false);
    }
  }

  // Lleva al campo (scroll y foco) tras pintar.
  function irA(id: string) {
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: "center" });
      el?.focus();
    }, 0);
  }

  const aplicar = (nuevo: PerfilEditor) => {
    setPerfil(nuevo);
    setSaroAlcanceId(nuevo.saro.alcance?.id ?? "");
    setSaroFecha(nuevo.saro.fecha ?? "");
    setDiscFecha(nuevo.disc.fecha ?? "");
    setExperiencias(nuevo.experiencias.map((e) => ({ ...e, clave: e.id })));
  };

  // Guardar un publicado (HU-126): primero se pide el impacto sin escribir nada; la hoja lo muestra
  // y la persona confirma o, si el cambio lo deja incompleto, elige descartar o pasar a borrador.
  async function previsualizarCambios() {
    if (!perfil) return;
    setGuardando(true);
    setError(null);
    setIntento(true);
    try {
      const r = await enviarJson(
        `/api/v1/perfiles/${perfil.codigo}?previsualizar`,
        cuerpo(),
        "PATCH",
        { "if-match": `"${perfil.version}"` },
      );
      const d = await r.json().catch(() => ({}));
      tomarAvisos(d);
      if (d.motivo === "deja_incompleto")
        setImpacto({ incompleto: true, faltaPara: d.faltaPara, yaIncompleto: d.yaIncompleto, ...d.impacto });
      else if (r.ok) setImpacto({ incompleto: false, ...d.impacto });
      else rechazoGuardado(d);
    } finally {
      setGuardando(false);
    }
  }

  // Un rechazo del guardado: una fecha de verificación inválida se señala en su campo y el foco va a él;
  // el perfil conserva lo que tenía (nada se escribió).
  function rechazoGuardado(d: { motivo?: string; campo?: string }) {
    setError(MOTIVO[d.motivo ?? ""] ?? "No se pudo guardar. Inténtalo de nuevo.");
    if (
      (d.motivo === "fecha_verificacion_futura" || d.motivo === "fecha_verificacion_ilegible") &&
      (d.campo === "saroFecha" || d.campo === "discFecha")
    ) {
      setErrorFecha({ campo: d.campo, texto: MOTIVO[d.motivo]! });
      irA(ANCLA_CONDICION[d.campo === "saroFecha" ? "saro_fecha" : "disc_fecha"]);
    }
  }

  async function guardar() {
    setErrorFecha(null);
    if (enPortal) return previsualizarCambios();
    setGuardando(true);
    setError(null);
    setIntento(true);
    try {
      const r = perfil
        ? await enviarJson(`/api/v1/perfiles/${perfil.codigo}`, cuerpo(), "PATCH", {
            "if-match": `"${perfil.version}"`,
          })
        : await enviarJson("/api/v1/perfiles", cuerpo());
      const d = await r.json().catch(() => ({}));
      tomarAvisos(d);
      if (!r.ok) {
        rechazoGuardado(d);
        return;
      }
      if (!perfil) {
        try {
          sessionStorage.setItem(
            "pp-aviso",
            "Guardado como borrador. No se perdió nada de lo que escribiste.",
          );
        } catch {
          // Sin almacenamiento solo se pierde el aviso.
        }
        recordarLenguaje(d.avisos);
        window.location.href = `/inventario/${d.perfil.codigo}`;
        return;
      }
      aplicar(d.perfil);
      setAviso("Guardado como borrador. No se perdió nada de lo que escribiste.");
      setTimeout(() => setAviso(null), 6000);
    } finally {
      setGuardando(false);
    }
  }

  // Publicar (HU-128, HU-130): con lo que falta a la vista no se envía nada; si está completo, guarda
  // primero lo que haya sin guardar y publica con esa versión. El servidor vuelve a evaluar.
  async function publicar() {
    if (!perfil) return;
    setIntento(true);
    setIntentoPublicar(true);
    setBloqueoServidor(null);
    setError(null);
    if (!evaluacion.publicable) {
      // Una validación de entrada que falta (HU-176): «Falta …» y el foco a su campo.
      const primera = evaluacion.condiciones.find((c) => !c.cumple);
      if (primera && VALIDACION_ENTRADA.has(primera.clave)) irA(ANCLA_CONDICION[primera.clave]);
      return;
    }
    setPublicando(true);
    try {
      let version = perfil.version;
      if (sinGuardar) {
        const g = await enviarJson(`/api/v1/perfiles/${perfil.codigo}`, cuerpo(), "PATCH", {
          "if-match": `"${perfil.version}"`,
        });
        const dg = await g.json().catch(() => ({}));
        tomarAvisos(dg);
        if (!g.ok) {
          setError(MOTIVO[dg.motivo] ?? "No se pudo guardar. Inténtalo de nuevo.");
          return;
        }
        aplicar(dg.perfil);
        version = dg.perfil.version;
        recordarLenguaje(dg.avisos);
      }
      const r = await enviarJson(`/api/v1/perfiles/${perfil.codigo}/publicar`, {}, "POST", {
        "if-match": `"${version}"`,
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (d.motivo === "no_publicable") setBloqueoServidor(d.evaluacion);
        else if (d.motivo === "incoherencia")
          setError(`No se publicó: ${d.contradiccion} Resuélvelo en su fila del inventario.`);
        else setError(MOTIVO[d.motivo] ?? "No se pudo publicar. Inténtalo de nuevo.");
        return;
      }
      recargarConAviso("Publicado. El portal ya muestra su ficha.");
    } finally {
      setPublicando(false);
    }
  }

  const titulo =
    [perfil?.nombre, perfil?.primerApellido].filter(Boolean).join(" ") || "Nuevo perfil";
  // Falta una validación de entrada tras intentar publicar: el campo lo dice.
  const faltaEntrada = (clave: ClaveCondicion) =>
    intentoPublicar && evaluacion.condiciones.some((c) => c.clave === clave && !c.cumple);
  const condicionesCumplidas = evaluacion.condiciones.filter((c) => c.cumple).length;
  const sinConsentimiento = evaluacion.condiciones.find(
    (c) => c.clave === "consentimiento" && !c.cumple,
  );
  const sinPrueba = evaluacion.condiciones.find((c) => c.clave === "modalidad_prueba" && !c.cumple);
  const consent = perfil?.consentimiento ?? null;
  // Tras intentar publicar: lo que falta según el servidor si discrepó, si no el cálculo en vivo.
  const bloqueo =
    bloqueoServidor ?? (intentoPublicar && !evaluacion.publicable ? evaluacion : null);

  if (modo === "previa" && perfil) {
    const vista = enEdicion()!;
    return (
      <>
        <VistaPrevia
          perfil={vista}
          evaluacion={evaluacion}
          estado={perfil.estado}
          publicado={perfil.estado === "publicado"}
          sinGuardar={sinGuardar}
          puedePublicar={editable && !enPortal}
          etiquetaVolver={p.consulta ? "Ver los datos del perfil" : undefined}
          enlaceRegistro={`/inventario/${perfil.codigo}/auditoria`}
          contacto={p.contacto}
          publicando={publicando}
          alVolver={(campo) => {
            setModo("editar");
            setIntento(true);
            if (campo)
              setTimeout(() => {
                const el = document.getElementById(campo);
                el?.scrollIntoView({ block: "center" });
                el?.focus();
              }, 0);
            else window.scrollTo(0, 0);
          }}
          alPublicar={() => void publicar()}
          // Mismo «Guardar cambios» del editor: vuelve al editor, donde se abre la hoja del impacto.
          alGuardar={
            editable && enPortal
              ? () => {
                  setModo("editar");
                  void guardar();
                }
              : undefined
          }
          guardando={guardando}
          enlaceReporte={editable ? `/inventario/${perfil.codigo}/validacion` : undefined}
          alRegistrarReporte={
            editable
              ? () => {
                  // Tras pintar el editor: si falta la modalidad, el aviso y el foco van a su selector.
                  setModo("editar");
                  setTimeout(() => void pedirReporte(), 0);
                }
              : undefined
          }
          alRegistrarConsentimiento={
            p.registraConsentimiento
              ? () => {
                  setModo("editar");
                  setHojaConsent(consent?.vigente ? "alcance" : "nuevo");
                }
              : undefined
          }
        />
        {error && (
          <div className="pp-toast pe-toast" role="alert">
            <p className="pp-toast__texto">{error}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">{titulo}</h1>
          <p className="pp-encabezado__meta pe-meta">
            <span className={`pp-estado ${enPortal ? "pp-estado--ok" : "pp-estado--borrador"}`}>
              {perfil ? ETIQUETA_ESTADO[perfil.estado] : "Borrador"}
            </span>
            {perfil && (
              <>
                <span className="pe-sep">·</span>
                <span className="pp-mono">{perfil.codigo}</span>
                <span className="pe-sep">·</span>
                {`guardado a las ${horaCortaDeColombia(new Date(perfil.actualizadoEn))}`}
                {enPortal && cambiosSinGuardar > 0 && (
                  <>
                    <span className="pe-sep">·</span>
                    {cambiosSinGuardar === 1
                      ? "1 cambio sin guardar"
                      : `${cambiosSinGuardar} cambios sin guardar`}
                  </>
                )}
              </>
            )}
            {!perfil && (
              <>
                <span className="pe-sep">·</span>sin guardar
              </>
            )}
          </p>
        </div>
        {(editable || perfil) && (
          <div className="pp-encabezado__acciones">
            {p.consulta && perfil && <AvisarTalentoHumano codigo={perfil.codigo} nombre={titulo} />}
            {perfil && (
              <a className="pp-btn pp-btn--fantasma" href={`/inventario/${perfil.codigo}/auditoria`}>
                Registro de auditoría
              </a>
            )}
            {perfil && (
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => {
                  setModo("previa");
                  window.scrollTo(0, 0);
                }}
              >
                Vista previa
              </button>
            )}
            {editable && enPortal && sinGuardar && (
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => window.location.reload()}
                disabled={guardando}
              >
                Descartar cambios
              </button>
            )}
            {editable && enPortal && (
              <button
                type="button"
                className="pp-btn pp-btn--primario"
                onClick={guardar}
                aria-disabled={!sinGuardar || undefined}
                disabled={guardando}
              >
                {guardando ? "Revisando…" : "Guardar cambios"}
              </button>
            )}
            {editable && !enPortal && (
              <button
                type="button"
                className="pp-btn pp-btn--contorno"
                onClick={guardar}
                disabled={guardando || publicando}
              >
                {guardando ? "Guardando…" : "Guardar borrador"}
              </button>
            )}
            {editable && perfil && !enPortal && (
              <button
                type="button"
                className="pp-btn pp-btn--primario"
                aria-disabled={!evaluacion.publicable || undefined}
                aria-describedby={evaluacion.publicable ? undefined : "pe-condiciones"}
                disabled={publicando || guardando}
                onClick={publicar}
              >
                {publicando ? "Publicando…" : "Publicar"}
              </button>
            )}
          </div>
        )}
      </div>

      {p.consulta && perfil && (
        <div className="pe-alerta">
          <div className="pp-aviso pp-aviso--info" role="status">
            <span className="pp-aviso__icono" aria-hidden="true">
              i
            </span>
            <p>
              <span className="pp-aviso__titulo">Tu rol es de consulta.</span>
              {p.consulta.porDireccionDeEdicion ? (
                <>
                  {"Llegaste por la dirección de edición de "}
                  <span className="pp-mono">{perfil.codigo}</span>
                  {": no se cambió nada y el intento quedó en la auditoría. "}
                </>
              ) : (
                "Ves los datos del perfil sin poder cambiarlos. "
              )}
              Si ves un dato desactualizado, avisa a Talento Humano con el perfil ya identificado.
            </p>
          </div>
        </div>
      )}
      {bloqueo && perfil && (
        <AvisoBloqueo
          codigo={perfil.codigo}
          evaluacion={bloqueo}
          familia={rol?.familia ?? perfil.familia?.nombre ?? null}
          modalidadesFamilia={modalidadesFamilia}
          alRegistrarConsentimiento={
            p.registraConsentimiento
              ? () => setHojaConsent(consent?.vigente ? "alcance" : "nuevo")
              : undefined
          }
        />
      )}
      {error && (
        <div className="pp-aviso pp-aviso--danger pe-alerta" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">No se guardó.</span> {error}
          </p>
        </div>
      )}
      <AvisoLenguaje expresiones={lenguaje} />
      {incompleto.incompleto && (
        <div className="pp-aviso pp-aviso--warn pe-alerta" role="note">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">{`${incompleto.texto}.`}</span> Sigue publicado y el
            portal lo muestra, pero un cambio no se publica mientras falte: complétalo al editar.
          </p>
        </div>
      )}
      {perfil && perfil.estado !== "borrador" && p.escribe && (
        <div className="pp-aviso pp-aviso--info pe-alerta" role="note">
          <span className="pp-aviso__icono" aria-hidden="true">
            i
          </span>
          <p>
            {enPortal
              ? "Este perfil está publicado: al guardar verás qué cambia para el cliente antes de confirmar. El portal sigue con la versión actual hasta entonces."
              : `Este perfil está ${ETIQUETA_ESTADO[perfil.estado].toLowerCase()}: sus datos no se editan en este estado. Su consentimiento se gestiona aquí abajo.`}
          </p>
        </div>
      )}

      <div className="pp-con-lateral">
        <form
          className="pp-form pp-form--alineado pe-lienzo"
          aria-label={perfil ? `Datos del perfil ${perfil.codigo}` : "Datos del perfil nuevo"}
          onSubmit={(e) => {
            e.preventDefault();
            if (editable) void guardar();
          }}
        >
          <fieldset disabled={!editable} style={{ display: "contents" }}>
            <section className="pp-form-fila" aria-labelledby="pe-s-ident">
              <div className="pp-form-fila__etiqueta">
                <h2 className="pe-seccion-titulo" id="pe-s-ident">
                  Identidad
                </h2>
              </div>
              <div className="pp-form-fila__control">
                <div className="pe-campos">
                  <div className="pe-dos">
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-nombre">
                        Nombre
                      </label>
                      <input
                        className="pp-input"
                        id="pe-nombre"
                        type="text"
                        value={nombre}
                        maxLength={80}
                        autoComplete="off"
                        aria-invalid={falta("nombre") || undefined}
                        aria-describedby={err("nombre")}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                      {falta("nombre") && (
                        <ErrorCampo id="pe-nombre-error" texto={ERROR_CAMPO.nombre.texto} />
                      )}
                    </div>
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-apellido">
                        Primer apellido
                      </label>
                      <input
                        className="pp-input"
                        id="pe-apellido"
                        type="text"
                        value={apellido}
                        maxLength={80}
                        autoComplete="off"
                        aria-invalid={falta("primer_apellido") || undefined}
                        aria-describedby={err("primer_apellido")}
                        onChange={(e) => setApellido(e.target.value)}
                      />
                      {falta("primer_apellido") && (
                        <ErrorCampo
                          id="pe-apellido-error"
                          texto={ERROR_CAMPO.primer_apellido.texto}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="pp-form-fila" aria-labelledby="pe-s-rol">
              <div className="pp-form-fila__etiqueta">
                <h2 className="pe-seccion-titulo" id="pe-s-rol">
                  Rol y tecnologías
                </h2>
                <p className="pp-ayuda">Solo valores del catálogo.</p>
              </div>
              <div className="pp-form-fila__control">
                <div className="pe-campos">
                  <div className="pp-campo">
                    <label className="pp-label" htmlFor="pe-rol">
                      Rol
                    </label>
                    {rol && (
                      <ul className="pe-valores" aria-label="Rol elegido">
                        <li className="pe-valor">
                          {rol.nombre}
                          {editable && (
                            <button
                              type="button"
                              className="pe-valor__quitar"
                              aria-label={`Quitar ${rol.nombre}`}
                              onClick={() => {
                                setRol(null);
                                setPruebaId("");
                              }}
                            >
                              <Icono d="M6 6l12 12M18 6L6 18" />
                            </button>
                          )}
                        </li>
                      </ul>
                    )}
                    <BuscadorCatalogo
                      id="pe-rol"
                      tipo="rol"
                      placeholder={
                        rol ? "Cambiar de rol: buscar en el catálogo" : "Elige un rol del catálogo"
                      }
                      deshabilitado={!editable}
                      invalido={falta("rol")}
                      describedBy={err("rol")}
                      meta={(v) => roles.find((r) => r.id === v.id)?.familia ?? null}
                      alElegir={(v) => {
                        const r = roles.find((x) => x.id === v.id);
                        if (!r) return;
                        if (r.familiaId !== rol?.familiaId) setPruebaId("");
                        setRol(r);
                      }}
                      alCrear={(texto) => setCrear({ tipo: "rol", texto })}
                    />
                    {falta("rol") && <ErrorCampo id="pe-rol-error" texto={ERROR_CAMPO.rol.texto} />}
                    {rol && (
                      <p className="pp-meta">
                        {`Familia ${rol.familia}`}
                        <span className="pe-sep"> · </span>
                        {`${modalidadesFamilia} ${modalidadesFamilia === 1 ? "modalidad" : "modalidades"} de prueba`}
                      </p>
                    )}
                    {rol && modalidadesFamilia === 0 && (
                      <div className="pp-aviso pp-aviso--warn" role="alert">
                        <span className="pp-aviso__icono" aria-hidden="true">
                          !
                        </span>
                        <p>
                          <span className="pp-aviso__titulo">
                            Esta familia no tiene modalidades de prueba.
                          </span>
                          {`Sin una, ningún perfil de ${rol.familia} podrá publicarse.`}
                        </p>
                        <a
                          className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
                          href={`/catalogos?tipo=modalidad_prueba&crear=1&familia=${rol.familiaId}`}
                        >
                          Registrar modalidad
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="pe-dos">
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-seniority">
                        Seniority
                      </label>
                      <div className="pp-select">
                        <select
                          className="pp-input"
                          id="pe-seniority"
                          value={seniorityId}
                          aria-invalid={falta("seniority") || undefined}
                          aria-describedby={err("seniority")}
                          onChange={(e) => setSeniorityId(e.target.value)}
                        >
                          <option value="">Elige el seniority</option>
                          {p.opciones.seniorities.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      {falta("seniority") && (
                        <ErrorCampo id="pe-seniority-error" texto={ERROR_CAMPO.seniority.texto} />
                      )}
                    </div>
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-anios">
                        Años de experiencia
                      </label>
                      <input
                        className="pp-input"
                        id="pe-anios"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={60}
                        value={anios}
                        aria-invalid={falta("anios_experiencia") || undefined}
                        aria-describedby={err("anios_experiencia")}
                        onChange={(e) => setAnios(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      />
                      {falta("anios_experiencia") && (
                        <ErrorCampo
                          id="pe-anios-error"
                          texto={ERROR_CAMPO.anios_experiencia.texto}
                        />
                      )}
                    </div>
                  </div>
                  <div className="pp-campo">
                    <label className="pp-label" htmlFor="pe-tec">
                      Tecnologías ancla
                    </label>
                    {tecnologias.length > 0 && (
                      <ul className="pe-valores" aria-label="Tecnologías elegidas">
                        {tecnologias.map((t) => (
                          <li key={t.id} className="pe-valor">
                            {t.nombre}
                            {editable && (
                              <button
                                type="button"
                                className="pe-valor__quitar"
                                aria-label={`Quitar ${t.nombre}`}
                                onClick={() =>
                                  setTecnologias((xs) => xs.filter((x) => x.id !== t.id))
                                }
                              >
                                <Icono d="M6 6l12 12M18 6L6 18" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <BuscadorCatalogo
                      id="pe-tec"
                      tipo="tecnologia"
                      placeholder="Buscar en el catálogo"
                      excluir={tecnologias.map((t) => t.id)}
                      deshabilitado={!editable || tecnologias.length >= 8}
                      invalido={falta("tecnologias")}
                      describedBy={err("tecnologias")}
                      alElegir={(v) => setTecnologias((xs) => [...xs, v])}
                      alCrear={(texto) => setCrear({ tipo: "tecnologia", texto })}
                    />
                    {falta("tecnologias") && (
                      <ErrorCampo id="pe-tec-error" texto={ERROR_CAMPO.tecnologias.texto} />
                    )}
                  </div>
                  <div className="pp-campo">
                    <label className="pp-label" htmlFor="pe-sector">
                      Sectores
                    </label>
                    {sectores.length > 0 && (
                      <ul className="pe-valores" aria-label="Sectores elegidos">
                        {sectores.map((x) => (
                          <li key={x.id} className="pe-valor">
                            {x.nombre}
                            {editable && (
                              <button
                                type="button"
                                className="pe-valor__quitar"
                                aria-label={`Quitar ${x.nombre}`}
                                onClick={() => setSectores((xs) => xs.filter((y) => y.id !== x.id))}
                              >
                                <Icono d="M6 6l12 12M18 6L6 18" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <BuscadorCatalogo
                      id="pe-sector"
                      tipo="sector"
                      placeholder="Buscar en el catálogo"
                      excluir={sectores.map((x) => x.id)}
                      deshabilitado={!editable || sectores.length >= 8}
                      alElegir={(v) => setSectores((xs) => [...xs, v])}
                      alCrear={(texto) => setCrear({ tipo: "sector", texto })}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="pp-form-fila" aria-labelledby="pe-s-disp">
              <div className="pp-form-fila__etiqueta">
                <h2 className="pe-seccion-titulo" id="pe-s-disp">
                  Ubicación y disponibilidad
                </h2>
              </div>
              <div className="pp-form-fila__control">
                <div className="pe-campos">
                  <div className="pe-dos">
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-ciudad">
                        Ciudad
                      </label>
                      <div className="pp-select">
                        <select
                          className="pp-input"
                          id="pe-ciudad"
                          value={ciudadId}
                          aria-invalid={falta("ciudad") || undefined}
                          aria-describedby={err("ciudad")}
                          onChange={(e) => setCiudadId(e.target.value)}
                        >
                          <option value="">Elige la ciudad</option>
                          {p.opciones.ciudades.map((c) => (
                            <option key={c.id} value={c.id}>{`${c.nombre}, ${c.pais}`}</option>
                          ))}
                        </select>
                      </div>
                      {falta("ciudad") && (
                        <ErrorCampo id="pe-ciudad-error" texto={ERROR_CAMPO.ciudad.texto} />
                      )}
                    </div>
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-modalidad">
                        Modalidad de trabajo
                      </label>
                      <div className="pp-select">
                        <select
                          className="pp-input"
                          id="pe-modalidad"
                          value={modalidadId}
                          aria-invalid={falta("modalidad_trabajo") || undefined}
                          aria-describedby={err("modalidad_trabajo")}
                          onChange={(e) => setModalidadId(e.target.value)}
                        >
                          <option value="">Elige la modalidad</option>
                          {p.opciones.modalidadesTrabajo.map((m) => (
                            <option key={m.id} value={m.id}>
                              {NOMBRE_MODALIDAD[m.nombre] ?? m.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      {falta("modalidad_trabajo") && (
                        <ErrorCampo
                          id="pe-modalidad-error"
                          texto={ERROR_CAMPO.modalidad_trabajo.texto}
                        />
                      )}
                    </div>
                  </div>
                  <div className="pe-dos">
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-disp">
                        Disponibilidad
                      </label>
                      <div className="pp-select">
                        <select
                          className="pp-input"
                          id="pe-disp"
                          value={selDisp}
                          aria-invalid={falta("disponibilidad") || undefined}
                          aria-describedby={err("disponibilidad")}
                          onChange={(e) => setSelDisp(e.target.value as SelDisp)}
                        >
                          <option value="">Elige la disponibilidad</option>
                          {(Object.keys(OPCIONES_DISPONIBILIDAD) as OpcionDisponibilidad[]).map(
                            (k) => (
                              <option key={k} value={k}>
                                {OPCIONES_DISPONIBILIDAD[k].etiqueta}
                              </option>
                            ),
                          )}
                          <option value="fecha">Fecha concreta…</option>
                        </select>
                      </div>
                      {falta("disponibilidad") && (
                        <ErrorCampo id="pe-disp-error" texto={ERROR_CAMPO.disponibilidad.texto} />
                      )}
                    </div>
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-disp-fecha">
                        Fecha en que queda libre
                      </label>
                      <input
                        className="pp-input"
                        id="pe-disp-fecha"
                        type="date"
                        min={p.hoy}
                        value={fechaDisp}
                        disabled={selDisp !== "fecha"}
                        aria-describedby="pe-disp-fecha-ayuda"
                        onChange={(e) => setFechaDisp(e.target.value)}
                      />
                      <p className="pp-ayuda" id="pe-disp-fecha-ayuda">
                        Solo si eliges «Fecha concreta».
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="pp-form-fila" aria-labelledby="pe-s-verif">
              <div className="pp-form-fila__etiqueta">
                <h2 className="pe-seccion-titulo" id="pe-s-verif">
                  <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Verificado por Trycore
                </h2>
              </div>
              <div className="pp-form-fila__control">
                <div className="pe-campos">
                  <div className="pp-campo">
                    <label className="pp-label" htmlFor="pe-prueba">
                      Modalidad de prueba
                    </label>
                    <div className="pp-select">
                      <select
                        className="pp-input"
                        id="pe-prueba"
                        value={pruebaId}
                        disabled={!rol || pruebasFamilia.length === 0}
                        onChange={(e) => setPruebaId(e.target.value)}
                      >
                        {!rol ? (
                          <option value="">Elige primero el rol</option>
                        ) : pruebasFamilia.length === 0 ? (
                          <option value="">Sin modalidades para esta familia</option>
                        ) : (
                          <>
                            <option value="">Elige la modalidad de prueba</option>
                            {pruebasFamilia.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nombre}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <p className="pp-ayuda">
                      Del catálogo de su familia. Obligatoria para publicar, igual que el
                      consentimiento.
                    </p>
                  </div>
                  {prueba && (
                    <div className="pp-campo">
                      <p className="pp-label">Enunciado publicado</p>
                      <p className="pe-enunciado">{`«${prueba.textoCliente}»`}</p>
                      <p className="pp-meta">
                        {reporteVigente
                          ? "Con el reporte detallado de abajo: la ficha muestra resultado, evaluador, fecha y criterios."
                          : "Nivel 0, mientras no haya reporte detallado."}
                      </p>
                    </div>
                  )}
                  <fieldset className="pe-alcance pe-entrada" aria-labelledby="pe-l-entrada">
                    <legend className="pp-label" id="pe-l-entrada">
                      Validaciones de entrada
                    </legend>
                    <p className="pp-ayuda">
                      Verificación de seguridad bajo SARO y evaluación DISC. Obligatorias para
                      publicar.
                    </p>
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-saro-alcance">
                        Alcance de la verificación SARO
                      </label>
                      <div className="pp-select">
                        <select
                          className="pp-input"
                          id="pe-saro-alcance"
                          value={saroAlcanceId}
                          aria-invalid={faltaEntrada("saro_alcance") || undefined}
                          aria-describedby={
                            faltaEntrada("saro_alcance") ? "pe-saro-alcance-error" : undefined
                          }
                          onChange={(e) => setSaroAlcanceId(e.target.value)}
                        >
                          <option value="">
                            {alcances.length ? "Elige el alcance del catálogo" : "Sin alcances en el catálogo"}
                          </option>
                          {alcances.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.activo ? a.nombre : `${a.nombre} (desactivado)`}
                            </option>
                          ))}
                        </select>
                      </div>
                      {faltaEntrada("saro_alcance") && (
                        <ErrorCampo
                          id="pe-saro-alcance-error"
                          texto={`${faltaDe({ motivo: MOTIVO_CONDICION.saro_alcance })}.`}
                        />
                      )}
                      {alcance && (
                        <p className="pe-enunciado">{`«${alcance.textoCliente}»`}</p>
                      )}
                      {alcance && !alcance.activo && (
                        <p className="pp-meta" id="pe-saro-desactivado">
                          Desactivado en el catálogo: este perfil lo conserva y su ficha lo sigue
                          mostrando, pero no se ofrece a otros perfiles.
                        </p>
                      )}
                      {!alcances.length && (
                        <p className="pp-meta">
                          <a className="pp-enlace" href="/catalogos?tipo=alcance_saro">
                            Registrar un alcance en Catálogos
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="pe-dos">
                      <div className="pp-campo">
                        <label className="pp-label" htmlFor="pe-saro-fecha">
                          Fecha de la verificación SARO
                        </label>
                        <input
                          className="pp-input"
                          id="pe-saro-fecha"
                          type="date"
                          max={p.hoy}
                          value={saroFecha}
                          aria-invalid={Boolean(errSaroFecha) || faltaEntrada("saro_fecha") || undefined}
                          aria-describedby={
                            errSaroFecha || faltaEntrada("saro_fecha") ? "pe-saro-fecha-error" : undefined
                          }
                          onChange={(e) => {
                            setSaroFecha(e.target.value);
                            if (errorFecha?.campo === "saroFecha") setErrorFecha(null);
                          }}
                        />
                        {errSaroFecha ? (
                          <ErrorCampo id="pe-saro-fecha-error" texto={errSaroFecha} />
                        ) : (
                          faltaEntrada("saro_fecha") && (
                            <ErrorCampo
                              id="pe-saro-fecha-error"
                              texto={`${faltaDe({ motivo: MOTIVO_CONDICION.saro_fecha })}.`}
                            />
                          )
                        )}
                      </div>
                      <div className="pp-campo">
                        <label className="pp-label" htmlFor="pe-disc-fecha">
                          Fecha de la evaluación DISC
                        </label>
                        <input
                          className="pp-input"
                          id="pe-disc-fecha"
                          type="date"
                          max={p.hoy}
                          value={discFecha}
                          aria-invalid={Boolean(errDiscFecha) || faltaEntrada("disc_fecha") || undefined}
                          aria-describedby={
                            errDiscFecha || faltaEntrada("disc_fecha") ? "pe-disc-fecha-error" : undefined
                          }
                          onChange={(e) => {
                            setDiscFecha(e.target.value);
                            if (errorFecha?.campo === "discFecha") setErrorFecha(null);
                          }}
                        />
                        {errDiscFecha ? (
                          <ErrorCampo id="pe-disc-fecha-error" texto={errDiscFecha} />
                        ) : (
                          faltaEntrada("disc_fecha") && (
                            <ErrorCampo
                              id="pe-disc-fecha-error"
                              texto={`${faltaDe({ motivo: MOTIVO_CONDICION.disc_fecha })}.`}
                            />
                          )
                        )}
                      </div>
                    </div>
                    <p className="pp-meta">La ficha muestra el mes de cada una, nunca el día.</p>
                  </fieldset>
                  {perfil && (
                    <div className="pp-campo" id="pe-reporte">
                      <p className="pp-label">Reporte detallado</p>
                      {reporteVigente && (
                        <div className="pe-reporte">
                          <p className="pe-enunciado">{`${reporteVigente.modalidad} · ${reporteVigente.resultado}`}</p>
                          <p className="pp-meta">
                            {`${reporteVigente.evaluador} · ${fechaCivil(reporteVigente.fecha)} · confirmado por ${reporteVigente.confirmadaPor ?? "—"}`}
                          </p>
                          <p className="pp-meta">{`Evaluó: ${reporteVigente.criterios.join(" · ")}.`}</p>
                        </div>
                      )}
                      {perfil.reporte && !reporteVigente && (
                        <p className="pp-meta">
                          El reporte confirmado es de otra modalidad de prueba: con esta, la ficha
                          vuelve a Nivel 0.
                        </p>
                      )}
                      {p.escribe && (
                        <div>
                          <button
                            type="button"
                            className="pp-btn pp-btn--contorno pp-btn--sm"
                            disabled={pidiendo}
                            aria-describedby={errorReporte ? "pe-reporte-error" : undefined}
                            onClick={pedirReporte}
                          >
                            {perfil.borradorValidacion
                              ? "Continuar el borrador"
                              : perfil.reporte
                                ? "Registrar un reporte nuevo"
                                : "Registrar reporte detallado"}
                          </button>
                        </div>
                      )}
                      {errorReporte && <ErrorCampo id="pe-reporte-error" texto={errorReporte} />}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="pp-form-fila" aria-labelledby="pe-s-ficha">
              <div className="pp-form-fila__etiqueta">
                <h2 className="pe-seccion-titulo" id="pe-s-ficha">
                  Ficha para el cliente
                </h2>
                <p className="pp-ayuda">Lo que la tarjeta y la ficha muestran de su capacidad.</p>
              </div>
              <div className="pp-form-fila__control">
                <div className="pe-campos">
                  <div className="pe-dos">
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-capacidad">
                        Capacidad
                      </label>
                      <input
                        className="pp-input"
                        id="pe-capacidad"
                        type="text"
                        maxLength={120}
                        placeholder="Ingeniera Backend Senior"
                        value={capacidad}
                        onChange={(e) => setCapacidad(e.target.value)}
                      />
                    </div>
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-anclaje">
                        Anclaje de experiencia
                      </label>
                      <input
                        className="pp-input"
                        id="pe-anclaje"
                        type="text"
                        maxLength={120}
                        placeholder="8 años en core bancario"
                        value={anclaje}
                        onChange={(e) => setAnclaje(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="pp-campo">
                    <label className="pp-label" htmlFor="pe-resumen">
                      Resumen del perfil
                    </label>
                    <textarea
                      className="pp-input pp-input--area"
                      id="pe-resumen"
                      maxLength={1200}
                      aria-describedby="pe-resumen-ayuda"
                      value={resumen}
                      onChange={(e) => setResumen(e.target.value)}
                    />
                    <p className="pp-ayuda" id="pe-resumen-ayuda">
                      Sin universidad, semestre ni empleadores nombrados.
                    </p>
                  </div>
                  <div className="pe-dos">
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-formacion">
                        Nivel de formación
                      </label>
                      <input
                        className="pp-input"
                        id="pe-formacion"
                        type="text"
                        maxLength={160}
                        placeholder="Ingeniera de Sistemas"
                        value={formacion}
                        onChange={(e) => setFormacion(e.target.value)}
                      />
                    </div>
                    <div className="pp-campo">
                      <label className="pp-label" htmlFor="pe-vinculo">
                        Vínculo con Trycore
                      </label>
                      <div className="pp-select">
                        <select
                          className="pp-input"
                          id="pe-vinculo"
                          value={vinculo}
                          onChange={(e) => setVinculo(e.target.value as typeof vinculo)}
                        >
                          <option value="">Elige el vínculo</option>
                          {Object.entries(VINCULO).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pp-campo">
                    <label className="pp-label" htmlFor="pe-idiomas">
                      Idiomas y nivel
                    </label>
                    <input
                      className="pp-input"
                      id="pe-idiomas"
                      type="text"
                      placeholder="Inglés B2; Portugués A2"
                      aria-describedby="pe-idiomas-ayuda"
                      value={idiomas}
                      onChange={(e) => setIdiomas(e.target.value)}
                    />
                    <p className="pp-ayuda" id="pe-idiomas-ayuda">
                      Separados por punto y coma.
                    </p>
                  </div>
                  <fieldset className="pe-alcance">
                    <legend className="pp-label">Sello Personal</legend>
                    <div className="pe-sello">
                      {sello.map((v, i) => (
                        <input
                          key={i}
                          id={`pe-sello-${i + 1}`}
                          className="pp-input"
                          type="text"
                          maxLength={80}
                          aria-label={`Competencia ${i + 1} del Sello Personal`}
                          value={v}
                          onChange={(e) =>
                            setSello((xs) => xs.map((x, k) => (k === i ? e.target.value : x)))
                          }
                        />
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            </section>

            <section className="pp-form-fila" aria-labelledby="pe-s-decl">
              <div className="pp-form-fila__etiqueta">
                <h2 className="pe-seccion-titulo" id="pe-s-decl">
                  Declarado por la profesional
                </h2>
              </div>
              <div className="pp-form-fila__control">
                <div className="pe-campos">
                  <div className="pp-campo" id="pe-trayectoria">
                    <p className="pp-label" id="pe-l-tray">
                      Trayectoria
                    </p>
                    <ul
                      className={`pe-exps${falta("trayectoria") ? " pe-exps--error" : ""}`}
                      aria-labelledby="pe-l-tray"
                      aria-describedby={err("trayectoria")}
                    >
                      {experiencias.length === 0 ? (
                        <li className="pe-exp pe-exp--vacia">
                          <div className="pe-exp__principal">
                            <p className="pe-exp__titulo">Sin experiencias</p>
                            <p className="pp-meta">Añade al menos una con rol y empresa.</p>
                          </div>
                        </li>
                      ) : (
                        experiencias.map((e) => {
                          const t = [e.cargo, e.cliente].filter(Boolean).join(" · ");
                          return (
                            <li key={e.clave} className="pe-exp">
                              <div className="pe-exp__principal">
                                <p className="pe-exp__titulo">
                                  {t}{" "}
                                  {(e.desde || e.hasta) && (
                                    <span className="pe-exp__periodo">{`${e.desde ?? "…"} — ${e.hasta ?? "hoy"}`}</span>
                                  )}
                                </p>
                                <p className="pe-exp__texto">{e.descripcion}</p>
                              </div>
                              {editable && (
                                <div className="pe-exp__acciones">
                                  <button
                                    type="button"
                                    className="pp-btn pp-btn--fantasma pp-btn--sm"
                                    aria-label={`Editar ${t}`}
                                    onClick={() => setHojaExp(e)}
                                  >
                                    Editar
                                  </button>
                                </div>
                              )}
                            </li>
                          );
                        })
                      )}
                    </ul>
                    {falta("trayectoria") && (
                      <ErrorCampo id="pe-trayectoria-error" texto={ERROR_CAMPO.trayectoria.texto} />
                    )}
                    {editable && (
                      <div className="pe-acciones-campo">
                        <button
                          type="button"
                          className="pp-btn pp-btn--contorno pp-btn--sm"
                          onClick={() =>
                            setHojaExp({
                              clave: nuevaClave(),
                              cargo: "",
                              cliente: "",
                              desde: null,
                              hasta: null,
                              descripcion: "",
                            })
                          }
                        >
                          Añadir experiencia
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="pp-campo">
                    <label className="pp-label" htmlFor="pe-aporte">
                      Qué le interesa aportar
                    </label>
                    <textarea
                      className="pp-input pp-input--area"
                      id="pe-aporte"
                      maxLength={280}
                      aria-describedby="pe-aporte-cuenta"
                      value={aporte}
                      onChange={(e) => setAporte(e.target.value)}
                    />
                    <p
                      className="pp-meta pe-contador"
                      id="pe-aporte-cuenta"
                    >{`${aporte.length} / 280`}</p>
                  </div>
                </div>
              </div>
            </section>
          </fieldset>

          <section className="pp-form-fila" aria-labelledby="consentimiento">
            <div className="pp-form-fila__etiqueta">
              <h2 className="pe-seccion-titulo" id="consentimiento">
                Consentimiento nominal
              </h2>
              <p className="pp-ayuda">Obligatorio para publicar.</p>
            </div>
            <div className="pp-form-fila__control">
              <SeccionConsentimiento
                perfil={perfil}
                rechazado={rechazado}
                puede={p.registraConsentimiento}
                alRegistrar={() => setHojaConsent(consent?.vigente ? "alcance" : "nuevo")}
                alRevocar={() => setHojaRevocar(true)}
                alVerAnterior={() => setHojaConsent("anterior")}
                alCambiarAlcance={(a) => {
                  setAlcancePropuesto(a);
                  setHojaConsent("alcance");
                }}
              />
            </div>
          </section>
        </form>

        <aside className="pe-lateral" aria-labelledby="pe-condiciones">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="pe-condiciones">
              Para publicar
            </h2>
          </div>
          <p className="pp-meta">
            {condicionesCumplidas === evaluacion.condiciones.length &&
            evaluacion.faltanDatos.length === 0
              ? `Cumple las ${evaluacion.condiciones.length} condiciones.`
              : `Cumple ${condicionesCumplidas} de ${evaluacion.condiciones.length} condiciones.`}
          </p>
          {evaluacion.faltanDatos.length > 0 ? (
            <ul className="pe-faltas">
              {sinConsentimiento && (
                <li className="pe-falta">
                  <a href={perfil ? "#pe-registrar-consent" : "#consentimiento"}>
                    Registrar el consentimiento nominal
                  </a>
                </li>
              )}
              {sinPrueba && (
                <li className="pe-falta">
                  <a
                    href={
                      sinPrueba.detalle === "familia_sin_modalidades" ? "#pe-rol" : "#pe-prueba"
                    }
                  >
                    {sinPrueba.detalle === "familia_sin_modalidades"
                      ? "Registrar una modalidad de prueba para la familia"
                      : "Elegir la modalidad de prueba"}
                  </a>
                </li>
              )}
              {evaluacion.condiciones
                .filter((c) => !c.cumple && VALIDACION_ENTRADA.has(c.clave))
                .map((c) => (
                  <li key={c.clave} className="pe-falta">
                    <a href={`#${ANCLA_CONDICION[c.clave]}`}>{faltaDe(c)}</a>
                  </li>
                ))}
              <li className="pe-falta">
                <a href={`#${ERROR_CAMPO[evaluacion.faltanDatos[0]!.campo].id}`}>
                  {evaluacion.faltanDatos.length === 1
                    ? "Completar 1 dato obligatorio"
                    : `Completar ${evaluacion.faltanDatos.length} datos obligatorios`}
                </a>
                <span className="pp-meta">
                  {evaluacion.faltanDatos.map((f, i) => (
                    <span key={f.campo}>
                      {i > 0 && " · "}
                      <a href={`#${ERROR_CAMPO[f.campo].id}`}>{f.etiqueta}</a>
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          ) : (
            <ul className="pe-conds">
              {evaluacion.condiciones.map((c) => (
                <li key={c.clave} className={`pe-cond${c.cumple ? "" : " pe-cond--no"}`}>
                  <span className={c.cumple ? "pp-si" : "pp-no"} aria-hidden="true">
                    {c.cumple ? "✓" : "–"}
                  </span>
                  <span className="pe-cond__texto">
                    {c.cumple ? (
                      c.etiqueta
                    ) : (
                      <a
                        href={
                          c.clave === "modalidad_prueba" && c.detalle === "familia_sin_modalidades"
                            ? "#pe-rol"
                            : `#${ANCLA_CONDICION[c.clave]}`
                        }
                      >
                        {c.etiqueta}
                      </a>
                    )}
                    <span className="pp-sr">{c.cumple ? " (cumple)" : " (falta)"}</span>
                    {!c.cumple && (
                      <DetalleCondicion
                        clave={c.clave}
                        detalle={c.detalle}
                        familia={rol?.familia ?? null}
                        consent={consent}
                        rechazado={rechazado}
                      />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {hojaExp && (
        <HojaExperiencia
          experiencia={hojaExp}
          existe={experiencias.some((e) => e.clave === hojaExp.clave)}
          alCerrar={() => setHojaExp(null)}
          alGuardar={(e) => {
            setExperiencias((xs) =>
              xs.some((x) => x.clave === e.clave)
                ? xs.map((x) => (x.clave === e.clave ? e : x))
                : [...xs, e],
            );
            setHojaExp(null);
          }}
          alQuitar={() => {
            setExperiencias((xs) => xs.filter((x) => x.clave !== hojaExp.clave));
            setHojaExp(null);
          }}
        />
      )}
      {crear && (
        <HojaCrearValor
          tipo={crear.tipo}
          texto={crear.texto}
          familias={familias}
          familiaInicial={rol?.familiaId ?? null}
          alCerrar={() => setCrear(null)}
          alUsar={(v) => {
            if (crear.tipo === "tecnologia")
              setTecnologias((xs) =>
                xs.some((x) => x.id === v.id) ? xs : [...xs, { id: v.id, nombre: v.nombre }],
              );
            else if (crear.tipo === "sector")
              setSectores((xs) =>
                xs.some((x) => x.id === v.id) ? xs : [...xs, { id: v.id, nombre: v.nombre }],
              );
            else {
              const r = roles.find((x) => x.id === v.id);
              if (r) {
                if (r.familiaId !== rol?.familiaId) setPruebaId("");
                setRol(r);
              }
            }
            setCrear(null);
          }}
          alCreado={(v, familiaId) => {
            if (crear.tipo === "tecnologia") setTecnologias((xs) => [...xs, v]);
            else if (crear.tipo === "sector") setSectores((xs) => [...xs, v]);
            else if (familiaId) {
              const f = familias.find((x) => x.id === familiaId)!;
              const r: Rol = {
                id: v.id,
                nombre: v.nombre,
                familiaId,
                familia: f.nombre,
                modalidades: f.modalidades,
              };
              setRoles((xs) => [...xs, r]);
              setFamilias((xs) => xs);
              if (familiaId !== rol?.familiaId) setPruebaId("");
              setRol(r);
            }
            setCrear(null);
          }}
        />
      )}
      {hojaConsent && perfil && (
        <HojaConsentimiento
          perfil={perfil}
          hoy={p.hoy}
          inicial={
            hojaConsent === "anterior"
              ? rechazado
              : hojaConsent === "alcance" && consent?.vigente
                ? {
                    fechaFirma: consent.firmadoEn,
                    alcance: alcancePropuesto ?? {
                      nombreApellido: true,
                      trayectoria: true,
                      clientes: consent.incluyeClientes,
                    },
                  }
                : null
          }
          alCerrar={() => {
            setHojaConsent(null);
            setAlcancePropuesto(null);
          }}
          alRechazo={(r) => {
            setRechazado(r);
            setHojaConsent(null);
          }}
          alRegistrado={(nuevo) => {
            setRechazado(null);
            setHojaConsent(null);
            aplicar(nuevo);
            setAviso("Consentimiento nominal registrado.");
            setTimeout(() => setAviso(null), 6000);
          }}
        />
      )}
      {hojaRevocar && perfil && (
        <HojaRevocar
          perfil={perfil}
          alCerrar={() => setHojaRevocar(false)}
          alRevocado={(nuevo) => {
            setHojaRevocar(false);
            aplicar(nuevo);
            recargarConAviso(
              perfil.estado === "publicado"
                ? "Revocación registrada. El perfil salió del portal y quedó en borrador."
                : "Revocación registrada.",
            );
          }}
        />
      )}
      {impacto && perfil && (
        <HojaImpacto
          perfil={perfil}
          impacto={impacto}
          autor={p.autor ?? null}
          cuerpo={cuerpo()}
          lenguaje={lenguaje}
          alCerrar={() => setImpacto(null)}
          alIncompleto={(i) => setImpacto(i)}
        />
      )}
      {aviso && (
        <div className="pp-toast pe-toast" role="status">
          <span className="pp-toast__marca" aria-hidden="true">
            ✓
          </span>
          <p className="pp-toast__texto">{aviso}</p>
        </div>
      )}
    </>
  );
}

// Lo que impidió publicar (HU-128; prototipos perfil-editor--publicar-bloqueado y --sin-modalidad;
// HU-130 familia sin modalidades): un solo motivo se nombra con su salida directa; varios se cuentan y
// el lateral «Para publicar» los lista.
function AvisoBloqueo(p: {
  codigo: string;
  evaluacion: EvaluacionPublicacion;
  familia: string | null;
  modalidadesFamilia: number;
  alRegistrarConsentimiento?: () => void;
}) {
  const condiciones = p.evaluacion.condiciones.filter((c) => !c.cumple);
  const cubiertos = new Set(["trayectoria", "disponibilidad"]);
  const datos = p.evaluacion.faltanDatos.filter((f) => !cubiertos.has(f.campo));
  const total = condiciones.length + datos.length;
  const unica = total === 1 ? condiciones[0] : undefined;
  const codigo = <span className="pp-mono">{p.codigo}</span>;
  let texto: ReactNode = (
    <>
      No se publicó {codigo}: {total === 1 ? "falta 1 condición." : `faltan ${total} condiciones.`}
    </>
  );
  let accion: ReactNode = null;
  // Validaciones de entrada (HU-176): cada una dice exactamente «Falta …».
  const entradas = condiciones.filter((c) => VALIDACION_ENTRADA.has(c.clave));
  if (total > 1 && entradas.length)
    texto = (
      <>
        No se publicó {codigo}: {`faltan ${total} condiciones. `}
        {entradas.map((c) => `${faltaDe(c)}.`).join(" ")}
      </>
    );
  if (unica && VALIDACION_ENTRADA.has(unica.clave)) {
    texto = (
      <>
        No se publicó {codigo}: {`${faltaDe(unica)}.`}
      </>
    );
    accion = (
      <a
        className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
        href={`#${ANCLA_CONDICION[unica.clave]}`}
      >
        Ir al campo
      </a>
    );
  } else if (unica?.clave === "consentimiento") {
    texto = <>No se publicó {codigo}: falta el consentimiento nominal registrado.</>;
    if (p.alRegistrarConsentimiento)
      accion = (
        <button
          type="button"
          className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
          onClick={p.alRegistrarConsentimiento}
        >
          Registrar consentimiento
        </button>
      );
  } else if (unica?.clave === "modalidad_prueba" && unica.detalle === "familia_sin_modalidades") {
    texto = (
      <>
        No se publicó {codigo}: la familia {p.familia ?? "del rol"} no tiene modalidades de prueba.
        Sin una, ningún perfil de esa familia puede publicarse.
      </>
    );
    accion = (
      <a
        className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
        href="/catalogos?tipo=modalidad_prueba"
      >
        Registrar modalidad
      </a>
    );
  } else if (unica?.clave === "modalidad_prueba") {
    texto =
      unica.detalle === "modalidad_inactiva" ? (
        <>
          No se publicó {codigo}: la modalidad de prueba elegida ya no está activa o no es de la
          familia del rol. Elige otra.
        </>
      ) : (
        <>
          No se publicó {codigo}: falta elegir la modalidad de prueba.
          {p.modalidadesFamilia > 0 &&
            (p.modalidadesFamilia === 1
              ? ` ${p.familia ?? "Su familia"} tiene una: elígela.`
              : ` Elígela entre las ${p.modalidadesFamilia} de ${p.familia ?? "su familia"}.`)}
        </>
      );
    accion = (
      <a className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion" href="#pe-prueba">
        Elegir modalidad
      </a>
    );
  }
  return (
    <div className="pe-alerta">
      <div className="pp-aviso pp-aviso--danger" role="alert" id="pe-bloqueo">
        <span className="pp-aviso__icono" aria-hidden="true">
          !
        </span>
        <p>{texto}</p>
        {accion}
      </div>
    </div>
  );
}

function DetalleCondicion(p: {
  clave: string;
  detalle: string | undefined;
  familia: string | null;
  consent: PerfilEditor["consentimiento"];
  rechazado: { fechaFirma: string | null } | null;
}) {
  let t: string | null = null;
  if (p.clave === "consentimiento") {
    if (p.rechazado)
      t = p.rechazado.fechaFirma
        ? `El del ${fechaCivil(p.rechazado.fechaFirma)} no cubre la publicación con nombre.`
        : "El que se intentó registrar no cubre la publicación con nombre.";
    else if (p.consent && !p.consent.vigente)
      t = `Revocado el ${horaDeColombia(new Date(p.consent.revocadoEn!)).split(", ")[0]}.`;
    else t = "Sin registrar.";
  } else if (p.clave === "modalidad_prueba") {
    t =
      p.detalle === "familia_sin_modalidades"
        ? `${p.familia ?? "La familia"} no tiene ninguna.`
        : p.detalle === "modalidad_inactiva"
          ? "La elegida ya no está activa."
          : "Sin elegir.";
  }
  return t ? <span className="pp-meta">{t}</span> : null;
}

function SeccionConsentimiento(p: {
  perfil: PerfilEditor | null;
  rechazado: { fechaFirma: string | null } | null;
  puede: boolean;
  alRegistrar: () => void;
  alRevocar: () => void;
  alVerAnterior: () => void;
  alCambiarAlcance: (a: {
    nombreApellido: boolean;
    trayectoria: boolean;
    clientes: boolean;
  }) => void;
}) {
  const c = p.perfil?.consentimiento ?? null;
  const nombre = [p.perfil?.nombre, p.perfil?.primerApellido].filter(Boolean).join(" ");
  if (p.rechazado)
    return (
      <div className="pe-campos">
        <p className="pe-consent-estado">
          <span className="pp-estado pp-estado--danger">No válido para este uso</span>
          {p.rechazado.fechaFirma && (
            <span className="pp-meta">{`Firmado el ${fechaCivil(p.rechazado.fechaFirma)}`}</span>
          )}
        </p>
        <div className="pp-aviso pp-aviso--danger" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">No se registró.</span>
            {`${nombre || "El profesional"} lo firmó cuando el banco se mostraba sin nombres. Publicar su nombre con su trayectoria necesita una autorización nueva.`}
          </p>
        </div>
        <dl className="pp-datos">
          <div className="pp-datos__fila">
            <dt>Qué cubría</dt>
            <dd>Trayectoria y tecnologías en un perfil anónimo</dd>
          </div>
          <div className="pp-datos__fila">
            <dt>Qué falta</dt>
            <dd>Nombre y primer apellido, trayectoria y, si aplica, clientes nombrados</dd>
          </div>
        </dl>
        {p.puede && (
          <div className="pe-acciones-campo">
            <button
              type="button"
              className="pp-btn pp-btn--contorno pp-btn--sm"
              id="pe-registrar-consent"
              onClick={p.alRegistrar}
            >
              Registrar consentimiento nuevo
            </button>
            <button
              type="button"
              className="pp-btn pp-btn--fantasma pp-btn--sm"
              onClick={p.alVerAnterior}
            >
              Ver el anterior
            </button>
          </div>
        )}
      </div>
    );
  if (c?.vigente)
    return (
      <div className="pe-campos">
        <p className="pe-consent-estado">
          <span className="pp-estado pp-estado--ok">Registrado</span>
          <span className="pp-meta">{`${c.registradoPor ?? "Registro inicial"} · ${horaDeColombia(new Date(c.registradoEn))}`}</span>
        </p>
        <dl className="pp-datos">
          <div className="pp-datos__fila">
            <dt>Ante quién</dt>
            <dd>{c.anteQuien}</dd>
          </div>
          <div className="pp-datos__fila">
            <dt>Vigencia</dt>
            <dd>Continua, hasta que lo revoque</dd>
          </div>
          {c.firmadoEn && (
            <div className="pp-datos__fila">
              <dt>Firmado</dt>
              <dd>{fechaCivil(c.firmadoEn)}</dd>
            </div>
          )}
        </dl>
        <fieldset className="pe-alcance" disabled={!p.puede}>
          <legend className="pp-label">Alcance autorizado</legend>
          {(
            [
              [
                "nombreApellido",
                "Nombre y primer apellido",
                `${nombre || "Su nombre"}, tal como aparecerá en la tarjeta.`,
              ],
              ["trayectoria", "Trayectoria", null],
              [
                "clientes",
                "Clientes nombrados",
                "Sin esta autorización la experiencia se muestra sin el nombre del cliente.",
              ],
            ] as const
          ).map(([k, texto, ayuda]) => {
            const actual = { nombreApellido: true, trayectoria: true, clientes: c.incluyeClientes };
            return (
              <label key={k} className="pp-check">
                {/* Cambiar el alcance es registrar uno nuevo: la casilla abre la hoja con el cambio. */}
                <input
                  type="checkbox"
                  checked={actual[k]}
                  onChange={(e) => p.alCambiarAlcance({ ...actual, [k]: e.target.checked })}
                />
                <span className="pp-check__texto">
                  {texto}
                  {ayuda && <span className="pp-check__ayuda">{ayuda}</span>}
                </span>
              </label>
            );
          })}
        </fieldset>
        {p.puede && (
          <div className="pe-acciones-campo">
            <button
              type="button"
              className="pp-btn pp-btn--contorno pp-btn--sm pe-btn-peligro"
              onClick={p.alRevocar}
            >
              Registrar revocación
            </button>
          </div>
        )}
      </div>
    );
  return (
    <div className="pe-campos">
      <p className="pe-consent-estado">
        {c ? (
          <>
            <span className="pp-estado pp-estado--danger">Revocado</span>
            <span className="pp-meta">{`${c.revocadoPor ?? "—"} · ${horaDeColombia(new Date(c.revocadoEn!))}`}</span>
          </>
        ) : (
          <span className="pp-estado pp-estado--borrador">Sin registrar</span>
        )}
      </p>
      <p className="pp-ayuda">
        Debe cubrir nombre y primer apellido con la trayectoria, ante cuentas cliente y de forma
        continua. Uno recogido para el banco sin nombres no sirve.
      </p>
      {p.puede && (
        <div className="pe-acciones-campo">
          <button
            type="button"
            className="pp-btn pp-btn--contorno pp-btn--sm"
            id="pe-registrar-consent"
            disabled={!p.perfil}
            onClick={p.alRegistrar}
          >
            {c ? "Registrar consentimiento nuevo" : "Registrar consentimiento"}
          </button>
        </div>
      )}
      {p.puede && !p.perfil && (
        <p className="pp-meta">Guarda el borrador para registrar su consentimiento.</p>
      )}
    </div>
  );
}

function HojaExperiencia(p: {
  experiencia: Experiencia;
  existe: boolean;
  alCerrar: () => void;
  alGuardar: (e: Experiencia) => void;
  alQuitar: () => void;
}) {
  const [e, setE] = useState(p.experiencia);
  const [intento, setIntento] = useState(false);
  const enTexto = clienteEnDescripcion(e.descripcion, e.cliente?.trim() || null);
  const faltaCargo = !e.cargo.trim();
  const faltaTexto = !e.descripcion.trim();
  const periodoMal = e.desde && e.hasta ? e.hasta < e.desde : false;
  const ok = !faltaCargo && !faltaTexto && !enTexto && !periodoMal;
  const anio = (v: string) => (v ? Number(v.replace(/\D/g, "").slice(0, 4)) : null);
  return (
    <Hoja
      titulo={p.existe ? "Editar experiencia" : "Añadir experiencia"}
      sub="Experiencia clave declarada por la profesional."
      cerrarEtiqueta="Cerrar sin guardar la experiencia"
      alCerrar={p.alCerrar}
      pie={
        <>
          {p.existe && (
            <button
              type="button"
              className="pp-btn pp-btn--fantasma pe-btn-peligro"
              onClick={p.alQuitar}
            >
              Quitar experiencia
            </button>
          )}
          <button type="button" className="pp-btn pp-btn--contorno" onClick={p.alCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--primario"
            onClick={() => {
              setIntento(true);
              if (ok)
                p.alGuardar({
                  ...e,
                  cargo: e.cargo.trim(),
                  cliente: e.cliente?.trim() || null,
                  descripcion: e.descripcion.trim(),
                });
            }}
          >
            {p.existe ? "Guardar experiencia" : "Añadir"}
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo pe-hoja-bloque">
        <div className="pp-campo">
          <label className="pp-label" htmlFor="ex-cargo">
            Cargo o rol
          </label>
          <input
            className="pp-input"
            id="ex-cargo"
            data-foco
            type="text"
            maxLength={120}
            value={e.cargo}
            aria-invalid={(intento && faltaCargo) || undefined}
            onChange={(x) => setE({ ...e, cargo: x.target.value })}
          />
          {intento && faltaCargo && <ErrorCampo id="ex-cargo-error" texto="Falta el cargo." />}
        </div>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="ex-cliente">
            Cliente
          </label>
          <input
            className="pp-input"
            id="ex-cliente"
            type="text"
            maxLength={120}
            aria-describedby="ex-cliente-ayuda"
            value={e.cliente ?? ""}
            onChange={(x) => setE({ ...e, cliente: x.target.value })}
          />
          <p className="pp-ayuda" id="ex-cliente-ayuda">
            Solo aquí, no en el texto: si el consentimiento no autoriza nombrar clientes, este dato
            no se muestra.
          </p>
        </div>
        <div className="pe-dos">
          <div className="pp-campo">
            <label className="pp-label" htmlFor="ex-desde">
              Desde (año)
            </label>
            <input
              className="pp-input"
              id="ex-desde"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={e.desde ?? ""}
              onChange={(x) => setE({ ...e, desde: anio(x.target.value) })}
            />
          </div>
          <div className="pp-campo">
            <label className="pp-label" htmlFor="ex-hasta">
              Hasta (año)
            </label>
            <input
              className="pp-input"
              id="ex-hasta"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Vacío si sigue"
              value={e.hasta ?? ""}
              aria-invalid={periodoMal || undefined}
              onChange={(x) => setE({ ...e, hasta: anio(x.target.value) })}
            />
            {periodoMal && <ErrorCampo id="ex-hasta-error" texto="Termina antes de empezar." />}
          </div>
        </div>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="ex-texto">
            Qué hizo
          </label>
          <textarea
            className="pp-input pp-input--area"
            id="ex-texto"
            maxLength={600}
            value={e.descripcion}
            aria-invalid={(intento && (faltaTexto || enTexto)) || undefined}
            onChange={(x) => setE({ ...e, descripcion: x.target.value })}
          />
          {intento && faltaTexto && (
            <ErrorCampo id="ex-texto-error" texto="Falta describir qué hizo." />
          )}
          {enTexto && (
            <ErrorCampo
              id="ex-texto-cliente"
              texto={`El texto nombra a ${e.cliente?.trim()}. Quítalo de aquí: el cliente va solo en su campo.`}
            />
          )}
        </div>
      </div>
    </Hoja>
  );
}

function HojaCrearValor(p: {
  tipo: "rol" | "tecnologia" | "sector";
  texto: string;
  familias: OpcionesEditor["familias"];
  familiaInicial: string | null;
  alCerrar: () => void;
  alUsar: (v: ValorElegible) => void;
  alCreado: (v: ValorElegible, familiaId: string | null) => void;
}) {
  const [nombre] = useState(p.texto);
  const [familiaId, setFamiliaId] = useState(p.familiaInicial ?? "");
  const [revision, setRevision] = useState<
    | { tipo: "cargando" }
    | { tipo: "vacio" | "nuevo" }
    | { tipo: "identico"; existente: ValorElegible & { activo: boolean } }
    | { tipo: "parecido"; parecidos: Array<ValorElegible & { activo: boolean; perfiles: number }> }
  >({ tipo: "cargando" });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const singular = { rol: "rol", tecnologia: "tecnología", sector: "sector" }[p.tipo];

  useEffect(() => {
    void (async () => {
      const r = await pedir(`/api/v1/catalogos/${p.tipo}?revisar=${encodeURIComponent(p.texto)}`, {
        credentials: "same-origin",
      }).catch(() => null);
      setRevision(r?.ok ? await r.json() : { tipo: "nuevo" });
    })();
  }, [p.tipo, p.texto]);

  async function crear() {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(`/api/v1/catalogos/${p.tipo}`, {
        nombre,
        ...(p.tipo === "rol" ? { familiaId: familiaId || null } : {}),
        confirmarDistinto: revision.tipo === "parecido",
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 201)
        p.alCreado({ id: d.valor.id, nombre: d.valor.nombre }, p.tipo === "rol" ? familiaId : null);
      else if (d.motivo === "familia_requerida" || d.motivo === "familia_invalida")
        setError("Elige la familia del rol.");
      else if (d.motivo === "duplicado") setError("Ya existe en el catálogo con ese nombre.");
      else setError("No se pudo crear. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const habilitado = revision.tipo === "nuevo" || revision.tipo === "parecido";
  return (
    <Hoja
      titulo={`Crear ${singular} en el catálogo`}
      sub={`«${nombre}» todavía no está en el catálogo.`}
      cerrarEtiqueta="Cerrar sin crear"
      alCerrar={p.alCerrar}
      pie={
        <>
          <button type="button" className="pp-btn pp-btn--contorno" onClick={p.alCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--primario"
            disabled={!habilitado || enviando || (p.tipo === "rol" && !familiaId)}
            onClick={crear}
          >
            {revision.tipo === "parecido"
              ? `Crear «${nombre}» de todos modos`
              : `Crear ${singular}`}
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo pe-hoja-bloque">
        {revision.tipo === "cargando" && <p className="pp-meta">Buscando valores parecidos…</p>}
        {revision.tipo === "identico" && (
          <>
            <div className="pp-aviso pp-aviso--warn" role="alert">
              <span className="pp-aviso__icono" aria-hidden="true">
                !
              </span>
              <p>
                <span className="pp-aviso__titulo">{`Ya existe «${revision.existente.nombre}».`}</span>
                Es el mismo valor salvo mayúsculas o tildes.
              </p>
            </div>
            {revision.existente.activo && (
              <button
                type="button"
                className="pp-btn pp-btn--contorno"
                data-foco
                onClick={() => p.alUsar(revision.existente)}
              >
                {`Usar «${revision.existente.nombre}»`}
              </button>
            )}
          </>
        )}
        {revision.tipo === "parecido" && (
          <>
            <p>Antes de crear uno nuevo, revisa si es alguno de estos:</p>
            <ul className="pe-parecidos" aria-label="Valores parecidos del catálogo">
              {revision.parecidos.map((v) => (
                <li key={v.id} className="pe-parecido">
                  <span>
                    {v.nombre}
                    <span className="pp-meta">{` · ${v.perfiles} ${v.perfiles === 1 ? "perfil" : "perfiles"}${v.activo ? "" : " · desactivado"}`}</span>
                  </span>
                  {v.activo && (
                    <button
                      type="button"
                      className="pp-btn pp-btn--contorno pp-btn--sm"
                      data-foco
                      onClick={() => p.alUsar(v)}
                    >
                      Usar este
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
        {revision.tipo === "nuevo" && (
          <p className="pp-meta">No hay ningún valor parecido en el catálogo.</p>
        )}
        {p.tipo === "rol" && habilitado && (
          <div className="pp-campo">
            <label className="pp-label" htmlFor="cv-familia">
              Familia
            </label>
            <div className="pp-select">
              <select
                className="pp-input"
                id="cv-familia"
                value={familiaId}
                onChange={(e) => setFamiliaId(e.target.value)}
              >
                <option value="">Elige la familia</option>
                {p.familias.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>
            {familiaId && p.familias.find((f) => f.id === familiaId)?.modalidades === 0 && (
              <p className="pp-ayuda">
                Esta familia no tiene modalidades de prueba: sus perfiles no podrán publicarse hasta
                registrar una.
              </p>
            )}
          </div>
        )}
        {error && <ErrorCampo id="cv-error" texto={error} />}
      </div>
    </Hoja>
  );
}

function HojaConsentimiento(p: {
  perfil: PerfilEditor;
  hoy: string;
  inicial: {
    fechaFirma: string | null;
    alcance: { nombreApellido: boolean; trayectoria: boolean; clientes: boolean };
  } | null;
  alCerrar: () => void;
  alRechazo: (r: {
    fechaFirma: string | null;
    alcance: { nombreApellido: boolean; trayectoria: boolean; clientes: boolean };
  }) => void;
  alRegistrado: (p: PerfilEditor) => void;
}) {
  const [fecha, setFecha] = useState(p.inicial?.fechaFirma ?? "");
  const [alcance, setAlcance] = useState(
    p.inicial?.alcance ?? { nombreApellido: false, trayectoria: false, clientes: false },
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const nombre = [p.perfil.nombre, p.perfil.primerApellido].filter(Boolean).join(" ");
  const nominal = validarConsentimiento(alcance).ok;

  async function registrar() {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(`/api/v1/perfiles/${p.perfil.codigo}/consentimiento`, {
        ...alcance,
        fechaFirma: fecha || null,
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 201) p.alRegistrado(d.perfil);
      else if (d.motivo === "no_nominal") p.alRechazo({ fechaFirma: fecha || null, alcance });
      else if (d.motivo === "firma_futura") setError("La fecha de firma no puede ser futura.");
      else setError("No se pudo registrar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const casilla = (k: keyof typeof alcance, texto: string, ayuda?: string) => (
    <label className="pp-check">
      <input
        type="checkbox"
        checked={alcance[k]}
        onChange={(e) => setAlcance({ ...alcance, [k]: e.target.checked })}
      />
      <span className="pp-check__texto">
        {texto}
        {ayuda && <span className="pp-check__ayuda">{ayuda}</span>}
      </span>
    </label>
  );

  return (
    <Hoja
      titulo="Registrar consentimiento nominal"
      sub="Marca exactamente lo que el profesional autorizó por escrito."
      cerrarEtiqueta="Cerrar sin registrar"
      alCerrar={p.alCerrar}
      pie={
        <>
          <button type="button" className="pp-btn pp-btn--contorno" onClick={p.alCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--primario"
            disabled={enviando}
            onClick={registrar}
          >
            Registrar
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo pe-hoja-bloque">
        <dl className="pp-datos">
          <div className="pp-datos__fila">
            <dt>Ante quién</dt>
            <dd>Cuentas cliente de Trycore</dd>
          </div>
          <div className="pp-datos__fila">
            <dt>Vigencia</dt>
            <dd>Continua, hasta que lo revoque</dd>
          </div>
        </dl>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="cs-fecha">
            Fecha en que lo firmó
          </label>
          <input
            className="pp-input"
            id="cs-fecha"
            data-foco
            type="date"
            max={p.hoy}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <fieldset className="pe-alcance">
          <legend className="pp-label">Alcance autorizado</legend>
          {casilla(
            "nombreApellido",
            "Nombre y primer apellido",
            `${nombre || "Su nombre"}, tal como aparecerá en la tarjeta.`,
          )}
          {casilla("trayectoria", "Trayectoria")}
          {casilla(
            "clientes",
            "Clientes nombrados",
            "Sin esta autorización la experiencia se muestra sin el nombre del cliente.",
          )}
        </fieldset>
        {!nominal && (alcance.trayectoria || alcance.clientes) && (
          <p className="pp-ayuda">
            Sin nombre y primer apellido con la trayectoria no cubre la publicación nominal: no se
            podrá registrar.
          </p>
        )}
        {error && <ErrorCampo id="cs-error" texto={error} />}
      </div>
    </Hoja>
  );
}

function HojaRevocar(p: {
  perfil: PerfilEditor;
  alCerrar: () => void;
  alRevocado: (p: PerfilEditor) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const publicado = p.perfil.estado === "publicado" || p.perfil.estado === "pausado";
  async function revocar() {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(`/api/v1/perfiles/${p.perfil.codigo}/consentimiento/revocar`, {});
      const d = await r.json().catch(() => ({}));
      if (r.ok) p.alRevocado(d.perfil);
      else setError("No se pudo registrar la revocación. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }
  return (
    <Hoja
      titulo="Registrar revocación"
      sub="El profesional retiró su autorización para publicar su nombre."
      cerrarEtiqueta="Cerrar sin revocar"
      alCerrar={p.alCerrar}
      pie={
        <>
          <button type="button" className="pp-btn pp-btn--contorno" onClick={p.alCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--destructivo"
            data-foco
            disabled={enviando}
            onClick={revocar}
          >
            Registrar revocación
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo pe-hoja-bloque">
        {publicado ? (
          <p>
            El perfil sale del portal de inmediato y queda en borrador. Los enlaces curados que lo
            incluían mostrarán que dejó de estar disponible.
          </p>
        ) : (
          <p>El perfil no podrá publicarse hasta registrar un consentimiento nuevo.</p>
        )}
        {error && <ErrorCampo id="rv-error" texto={error} />}
      </div>
    </Hoja>
  );
}

// Aviso de lenguaje de inventario (HU-194; RF-3.6; D73): advierte y no bloquea; va aparte del error de
// guardado y nombra cada expresión tal como se escribió. Copy marcado para revisión (D73).
const CLAVE_LENGUAJE = "pp-lenguaje";
function recordarLenguaje(avisos: Array<{ expresion: string }> | undefined) {
  try {
    if (avisos?.length)
      sessionStorage.setItem(CLAVE_LENGUAJE, JSON.stringify(avisos.map((a) => a.expresion)));
  } catch {
    // Sin almacenamiento solo se pierde el aviso.
  }
}

function AvisoLenguaje(p: { expresiones: string[] }) {
  if (p.expresiones.length === 0) return null;
  return (
    <div className="pp-aviso pp-aviso--warn pe-alerta" role="status" data-aviso="lenguaje">
      <span className="pp-aviso__icono" aria-hidden="true">
        !
      </span>
      <p>
        <span className="pp-aviso__titulo">La trayectoria usa lenguaje de inventario:</span>{" "}
        {p.expresiones.map((e, i) => (
          <Fragment key={e}>
            {i > 0 && ", "}«<mark className="pe-expresion">{e}</mark>»
          </Fragment>
        ))}
        . Es un aviso: no impide guardar ni publicar. Describe la experiencia de la persona, no
        existencias.
      </p>
    </div>
  );
}

// Impacto de guardar un publicado (HU-126; prototipos perfil-editor--cambios-declarados y
// --incompleto-al-guardar): lo que cambia para el cliente, antes y después, y lo que no le llega.
type Impacto = {
  incompleto: boolean;
  // Un publicado que ya estaba incompleto (HU-178): lo que sigue faltando tras el cambio.
  faltaPara?: string;
  yaIncompleto?: boolean;
  cambios: CambioDeCaraAlCliente[];
  internos: string[];
  evaluacion: EvaluacionPublicacion;
};

const ETIQUETA_INTERNO: Record<string, string> = {
  aporte: "Qué le interesa aportar",
  vinculo: "Vínculo con Trycore",
  capacidad: "Capacidad",
  anclaje: "Anclaje",
};

// Del campo de la ficha al dato que la publicación exige (para decir por qué queda incompleto).
const EXIGIDO: Record<string, CampoObligatorio[]> = {
  nombre: ["nombre", "primer_apellido"],
  rol: ["rol"],
  seniority: ["seniority"],
  anios_experiencia: ["anios_experiencia"],
  tecnologias: ["tecnologias"],
  modalidad_trabajo: ["modalidad_trabajo"],
  ubicacion: ["ciudad"],
  disponibilidad: ["disponibilidad"],
  trayectoria: ["trayectoria"],
};

function HojaImpacto(p: {
  perfil: PerfilEditor;
  impacto: Impacto;
  autor: string | null;
  cuerpo: unknown;
  lenguaje: string[];
  alCerrar: () => void;
  alIncompleto: (i: Impacto) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cambios, internos, evaluacion, incompleto } = p.impacto;
  const nombre = [p.perfil.nombre, p.perfil.primerApellido].filter(Boolean).join(" ");
  const faltan = new Set<string>(evaluacion.faltanDatos.map((f) => f.campo));
  const condicionesFalladas = evaluacion.condiciones.filter((c) => !c.cumple);
  const exigido = (campo: string) => (EXIGIDO[campo] ?? []).some((c) => faltan.has(c));
  // Si el incompleto viene de un dato que no se ve como cambio (p. ej. la modalidad de prueba), se nombra.
  const faltaSinCambio = [
    ...evaluacion.faltanDatos.filter(
      (f) => !cambios.some((c) => (EXIGIDO[c.campo] ?? []).includes(f.campo)),
    ),
    ...condicionesFalladas.map((c) => ({ campo: c.clave, etiqueta: c.etiqueta })),
  ].filter((f, i, xs) => xs.findIndex((x) => x.etiqueta === f.etiqueta) === i);

  async function enviar(consulta: string) {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(
        `/api/v1/perfiles/${p.perfil.codigo}${consulta}`,
        p.cuerpo,
        "PATCH",
        {
          "if-match": `"${p.perfil.version}"`,
        },
      );
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        if (consulta !== "?resolucion=descartar") recordarLenguaje(d.avisos);
        recargarConAviso(
          consulta === "?resolucion=descartar"
            ? "Cambio descartado. El perfil sigue publicado con los valores que tenía."
            : consulta === "?resolucion=a_borrador"
              ? "Cambio guardado. El perfil salió del portal y quedó en borrador."
              : "Cambios confirmados. El portal ya los muestra.",
        );
        return;
      }
      // Otro cambio en paralelo lo dejó incompleto entre ver el impacto y confirmar: se pregunta.
      if (d.motivo === "deja_incompleto")
        p.alIncompleto({
          incompleto: true,
          faltaPara: d.faltaPara,
          yaIncompleto: d.yaIncompleto,
          ...d.impacto,
        });
      else setError(MOTIVO[d.motivo] ?? "No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const lista = (
    <ul className="pe-cambios">
      {cambios.map((c) => (
        <li className="pe-cambio" key={c.campo}>
          <span className="pe-cambio__campo">{c.etiqueta}</span>
          <div className="pe-cambio__valores">
            <p className="pe-cambio__antes">
              <span className="pp-sr">Antes: </span>
              {c.antes ?? "Sin dato"}
            </p>
            <p className="pe-cambio__despues">
              <span className="pp-sr">Después: </span>
              {c.despues ?? (exigido(c.campo) ? "Sin dato: la publicación lo exige" : "Sin dato")}
            </p>
          </div>
        </li>
      ))}
      {incompleto &&
        faltaSinCambio.map((f) => (
          <li className="pe-cambio" key={`falta-${f.campo}`}>
            <span className="pe-cambio__campo">{f.etiqueta}</span>
            <div className="pe-cambio__valores">
              <p className="pe-cambio__despues">Falta: la publicación lo exige</p>
            </div>
          </li>
        ))}
    </ul>
  );
  const internosTexto = internos.map((c) => ETIQUETA_INTERNO[c] ?? c).join(", ");

  if (incompleto)
    return (
      <Hoja
        titulo={
          p.impacto.yaIncompleto
            ? "Este cambio no se puede publicar"
            : "Este cambio deja el perfil incompleto"
        }
        sub={`${nombre} · ${p.perfil.codigo} · publicado`}
        cerrarEtiqueta="Seguir editando"
        alCerrar={p.alCerrar}
        pie={
          <>
            <button
              type="button"
              className="pp-btn pp-btn--contorno"
              disabled={enviando}
              onClick={() => enviar("?resolucion=descartar")}
            >
              Descartar el cambio
            </button>
            <button
              type="button"
              className="pp-btn pp-btn--primario"
              data-foco
              disabled={enviando}
              onClick={() => enviar("?resolucion=a_borrador")}
            >
              Pasar a borrador
            </button>
          </>
        }
      >
        <div className="pp-hoja__cuerpo">
          <div className="pe-hoja-bloque">
            {p.impacto.yaIncompleto && p.impacto.faltaPara && (
              <p>{`No se puede publicar mientras falte ${p.impacto.faltaPara}.`}</p>
            )}
            <p>
              <strong>¿Descarto el cambio o paso el perfil a borrador?</strong>
            </p>
            {lista}
            <AvisoLenguaje expresiones={p.lenguaje} />
            <p className="pp-meta">
              Mientras no respondas, el perfil sigue publicado sin el cambio.
            </p>
          </div>
          <div className="pe-hoja-bloque">
            <dl className="pp-datos">
              <div className="pp-datos__fila">
                <dt>Descartar el cambio</dt>
                <dd>
                  Conserva exactamente los valores que tenía. Sigue publicado y no queda nada en la
                  auditoría.
                </dd>
              </div>
              <div className="pp-datos__fila">
                <dt>Pasar a borrador</dt>
                <dd>
                  Guarda el cambio y lo saca del portal. La auditoría registra que salió de
                  publicado por esta edición, contigo y la hora.
                </dd>
              </div>
            </dl>
            {error && <ErrorCampo id="im-error" texto={error} />}
          </div>
        </div>
      </Hoja>
    );

  return (
    <Hoja
      titulo="Esto cambia para el cliente"
      sub={`${nombre} · ${p.perfil.codigo} · publicado`}
      cerrarEtiqueta="Seguir editando"
      alCerrar={p.alCerrar}
      pie={
        <>
          <button type="button" className="pp-btn pp-btn--fantasma" onClick={p.alCerrar}>
            Seguir editando
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--primario"
            data-foco
            disabled={enviando}
            onClick={() => enviar("")}
          >
            Confirmar cambios
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo">
        <div className="pe-hoja-bloque">
          {cambios.length > 0 ? (
            <>
              <p className="pp-meta">
                Se ven de inmediato en la tarjeta y la ficha, también para quien la tenga abierta.
              </p>
              {lista}
            </>
          ) : (
            <p>El cliente no verá ninguna diferencia.</p>
          )}
          <AvisoLenguaje expresiones={p.lenguaje} />
          {internos.length > 0 && (
            <p className="pp-meta">{`Sin efecto para el cliente: ${internosTexto} (dato interno de Talento Humano).`}</p>
          )}
        </div>
        <div className="pe-hoja-bloque">
          <p>
            <span className="pp-estado pp-estado--ok">
              {`Sigue cumpliendo las ${evaluacion.condiciones.length} condiciones de publicación`}
            </span>
          </p>
          <p className="pp-meta">
            {`Quedará en la auditoría del perfil: cada dato que cambió con su valor anterior, ${
              p.autor ?? "tu correo"
            } y la hora, al confirmar.`}
          </p>
          {error && <ErrorCampo id="im-error" texto={error} />}
        </div>
      </div>
    </Hoja>
  );
}
