// De un perfil del panel —el guardado o el que se está editando— a los datos de la ficha (HU-129).
// Lo que sale de aquí entra en `armarFicha`, la misma función que usa el portal: la vista previa no
// reinterpreta nada. El cliente nombrado solo si el consentimiento vigente lo incluye (HU-127).
import type { DatosFicha } from "@ps/contratos/ficha";
import type { PerfilEditor } from "@ps/infra/postgres/perfiles-panel";

export type PerfilParaFicha = Pick<
  PerfilEditor,
  | "codigo"
  | "nombre"
  | "primerApellido"
  | "rol"
  | "seniority"
  | "aniosExperiencia"
  | "sectores"
  | "tecnologias"
  | "modalidadTrabajo"
  | "ciudad"
  | "disponibilidadFecha"
  | "disponibilidadActualizadaEn"
  | "resumen"
  | "selloPersonal"
  | "formacion"
  | "idiomas"
  | "experiencias"
  | "consentimiento"
  | "modalidadPrueba"
> &
  Partial<Pick<PerfilEditor, "reporte">>;

export function datosFichaDePerfil(p: PerfilParaFicha): DatosFicha {
  return {
    codigo: p.codigo,
    nombre: p.nombre,
    primerApellido: p.primerApellido,
    rol: p.rol?.nombre ?? null,
    seniority: p.seniority?.nombre ?? null,
    aniosExperiencia: p.aniosExperiencia,
    sectores: p.sectores.map((x) => x.nombre),
    tecnologias: p.tecnologias.map((x) => x.nombre),
    modalidad: p.modalidadTrabajo?.textoCliente ?? null,
    pais: p.ciudad?.pais ?? null,
    ciudad: p.ciudad?.nombre ?? null,
    disponibilidadFecha: p.disponibilidadFecha,
    disponibilidadActualizadaEn: p.disponibilidadActualizadaEn
      ? new Date(p.disponibilidadActualizadaEn)
      : null,
    resumen: p.resumen,
    selloPersonal: p.selloPersonal,
    formacion: p.formacion,
    idiomas: p.idiomas,
    trayectoria: p.experiencias.map((e) => ({
      cargo: e.cargo,
      cliente: e.cliente,
      desde: e.desde,
      hasta: e.hasta,
      descripcion: e.descripcion,
    })),
    incluyeClientes: Boolean(p.consentimiento?.vigente && p.consentimiento.incluyeClientes),
    enunciadoPrueba: p.modalidadPrueba?.activa ? p.modalidadPrueba.textoCliente : null,
    reporte: p.reporte
      ? {
          modalidad: p.reporte.modalidad,
          resultado: p.reporte.resultado,
          evaluador: p.reporte.evaluador,
          fecha: p.reporte.fecha,
          criterios: p.reporte.criterios,
        }
      : null,
  };
}
