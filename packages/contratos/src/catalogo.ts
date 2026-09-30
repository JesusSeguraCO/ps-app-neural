// Contrato de `GET /api/v1/catalogo` y de la proyección del catálogo (ADR-0008 fila UC-4/QA-5, V8-4).
// Estricto: un campo que no está aquí hace FALLAR el parseo en lugar de descartarse. Sin fecha de
// disponibilidad (solo la banda, RF-3.13) ni ciudad (la decide el contrato de ciudades, ADR-0003);
// nada de la lista negra B.4.
import { z } from "zod";
import { BANDAS } from "@ps/dominio/catalogo/banda";

export const PerfilCatalogo = z.strictObject({
  codigo: z.string().regex(/^PS-\d{4}$/),
  nombre: z.string().min(1),
  primerApellido: z.string().min(1),
  familia: z.string().nullable(),
  roles: z.array(z.string()),
  seniority: z.string().nullable(),
  aniosExperiencia: z.number().int().nonnegative().nullable(),
  tecnologias: z.array(z.string()),
  sectores: z.array(z.string()),
  modalidad: z.string().nullable(),
  pais: z.string().nullable(),
  disponibilidad: z.enum(BANDAS),
});
export type PerfilCatalogo = z.infer<typeof PerfilCatalogo>;

export const CAMPOS_PERFIL_CATALOGO = [
  "codigo",
  "nombre",
  "primerApellido",
  "familia",
  "roles",
  "seniority",
  "aniosExperiencia",
  "tecnologias",
  "sectores",
  "modalidad",
  "pais",
  "disponibilidad",
] as const;

export const RespuestaCatalogo = z.strictObject({ perfiles: z.array(PerfilCatalogo) });
export type RespuestaCatalogo = z.infer<typeof RespuestaCatalogo>;
