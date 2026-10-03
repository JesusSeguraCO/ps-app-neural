// Siembra de perfiles ficticios (EP-001 · tarea 3.2): `node dist/migrar.js --sembrar-ficticios` (rol del panel; ADR-0009, 0026).
// Solo en local, CI y staging; con APP_ENV=produccion se niega antes de abrir conexiones. Idempotente
// por código. Cada perfil se audita con su propio titular (clave por profesional, ADR-0003 H42).
// Datos inventados: ninguna persona real; sin campos de la lista negra B.4.
import { randomBytes } from "node:crypto";
import type pg from "pg";
import { envolverClave } from "@ps/dominio/auditoria/cadena";
import { diaCivilDeColombia } from "@ps/dominio/fecha/colombia";
import { conAuditoria, type ClavesAuditoria } from "@ps/infra/postgres/auditoria";
import { MODALIDADES_FICTICIAS } from "./sembrar-lexico";

type Estado = "borrador" | "publicado" | "pausado" | "archivado";

export interface PerfilFicticio {
  codigo: string;
  nombre: string;
  primerApellido: string;
  estado: Estado;
  familia: string;
  roles: string[];
  seniority: string;
  anios: number;
  tecnologias: string[];
  sectores: string[];
  modalidad: "remoto" | "hibrido" | "presencial";
  ciudad: string;
  disponibleEnDias: number;
  // Colocado (HU-137): sigue publicado; la cuenta de su colocación y su liberación = su disponibilidad.
  colocadoEn?: string;
  // Publicado heredado (HU-178; D62): se publicó antes de que la guarda exigiera estas validaciones de
  // entrada y no las tiene; sigue publicado y el panel lo marca «Incompleto». Se siembra publicándolo
  // completo y quitándole el dato después (la guarda de la BD solo actúa al entrar en publicado).
  heredadoSin?: Array<"saro" | "disc" | "modalidad">;
}

const MODALIDADES = { remoto: "Remoto", hibrido: "Híbrido", presencial: "Presencial" } as const;
const SENIORITIES = ["Junior", "Semi senior", "Senior", "Líder técnico"];

export const PERFILES_FICTICIOS: PerfilFicticio[] = [
  {
    codigo: "PS-0142",
    nombre: "Laura",
    primerApellido: "Méndez",
    estado: "publicado",
    familia: "Desarrollo",
    roles: ["Desarrolladora backend Java"],
    seniority: "Senior",
    anios: 8,
    tecnologias: ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
    sectores: ["Banca", "Seguros"],
    modalidad: "hibrido",
    ciudad: "Medellín",
    disponibleEnDias: 0,
  },
  {
    codigo: "PS-0187",
    nombre: "Julián",
    primerApellido: "Ospina",
    estado: "publicado",
    familia: "Desarrollo",
    roles: ["Desarrollador backend .NET"],
    seniority: "Senior",
    anios: 6,
    tecnologias: [".NET 8", "C#", "Azure Service Bus", "SQL Server"],
    sectores: ["Banca"],
    modalidad: "remoto",
    ciudad: "Bogotá",
    disponibleEnDias: 21,
  },
  {
    codigo: "PS-0201",
    nombre: "Camila",
    primerApellido: "Restrepo",
    estado: "publicado",
    familia: "Calidad",
    roles: ["Analista QA automatización"],
    seniority: "Semi senior",
    anios: 4,
    tecnologias: ["Cypress", "Playwright", "Postman"],
    sectores: ["Retail"],
    modalidad: "remoto",
    ciudad: "Cali",
    disponibleEnDias: 0,
  },
  {
    codigo: "PS-0215",
    nombre: "Andrés",
    primerApellido: "Salazar",
    estado: "publicado",
    familia: "Desarrollo",
    roles: ["Desarrollador frontend React", "Desarrollador full stack"],
    seniority: "Senior",
    anios: 7,
    tecnologias: ["React", "TypeScript", "Next.js", "Node.js"],
    sectores: ["Telecomunicaciones"],
    modalidad: "hibrido",
    ciudad: "Bogotá",
    disponibleEnDias: 45,
  },
  {
    codigo: "PS-0223",
    nombre: "Natalia",
    primerApellido: "Cárdenas",
    estado: "publicado",
    familia: "Datos",
    roles: ["Ingeniera de datos"],
    seniority: "Senior",
    anios: 9,
    tecnologias: ["Python", "Airflow", "Spark", "BigQuery"],
    sectores: ["Banca", "Energía"],
    modalidad: "remoto",
    ciudad: "Barranquilla",
    disponibleEnDias: 10,
  },
  {
    codigo: "PS-0230",
    nombre: "Felipe",
    primerApellido: "Arango",
    estado: "publicado",
    familia: "Infraestructura",
    roles: ["Ingeniero DevOps"],
    seniority: "Líder técnico",
    anios: 11,
    tecnologias: ["Kubernetes", "Terraform", "AWS", "GitHub Actions"],
    sectores: ["Seguros"],
    modalidad: "presencial",
    ciudad: "Medellín",
    disponibleEnDias: 30,
  },
  {
    codigo: "PS-0238",
    nombre: "Valeria",
    primerApellido: "Gómez",
    estado: "publicado",
    familia: "Calidad",
    roles: ["Analista QA funcional"],
    seniority: "Junior",
    anios: 2,
    tecnologias: ["Jira", "TestRail", "SQL"],
    sectores: ["Salud"],
    modalidad: "hibrido",
    ciudad: "Bogotá",
    disponibleEnDias: 0,
  },
  {
    codigo: "PS-0151",
    nombre: "Mateo",
    primerApellido: "Vargas",
    estado: "pausado",
    familia: "Desarrollo",
    roles: ["Desarrollador backend Java"],
    seniority: "Semi senior",
    anios: 5,
    tecnologias: ["Java", "Quarkus", "MongoDB"],
    sectores: ["Banca"],
    modalidad: "remoto",
    ciudad: "Pereira",
    disponibleEnDias: 0,
  },
  {
    codigo: "PS-0137",
    nombre: "Sara",
    primerApellido: "Londoño",
    estado: "publicado",
    colocadoEn: "Seguros Altamira",
    familia: "Calidad",
    roles: ["Analista QA automatización"],
    seniority: "Senior",
    anios: 6,
    tecnologias: ["Selenium", "Java", "Cucumber"],
    sectores: ["Seguros"],
    modalidad: "hibrido",
    ciudad: "Medellín",
    disponibleEnDias: 90,
  },
  {
    codigo: "PS-0160",
    nombre: "Tomás",
    primerApellido: "Rincón",
    estado: "borrador",
    familia: "Datos",
    roles: ["Analista de datos"],
    seniority: "Junior",
    anios: 1,
    tecnologias: ["Power BI", "SQL"],
    sectores: ["Retail"],
    modalidad: "remoto",
    ciudad: "Bucaramanga",
    disponibleEnDias: 0,
  },
  {
    codigo: "PS-0099",
    nombre: "Daniela",
    primerApellido: "Quintero",
    estado: "archivado",
    familia: "Desarrollo",
    roles: ["Desarrolladora móvil"],
    seniority: "Semi senior",
    anios: 4,
    tecnologias: ["Kotlin", "Swift"],
    sectores: ["Telecomunicaciones"],
    modalidad: "remoto",
    ciudad: "Manizales",
    disponibleEnDias: 0,
  },
];

// Publicados heredados incompletos (HU-178, HU-191; D62): se publicaron antes de que la guarda exigiera
// las validaciones de entrada y les falta alguna. Siembra aparte y opcional (`sembrarHeredadosIncompletos`)
// para no mover los conteos que fijan los tests y e2e del banco ficticio. Roles propios, que no comparten
// con el banco base. Códigos por debajo del mayor del banco base: el editor numera desde el mayor + 1,
// así que sembrarlos tarde nunca choca con un perfil creado por el panel.
export const HEREDADOS_INCOMPLETOS: PerfilFicticio[] = [
  {
    codigo: "PS-0105",
    nombre: "Ricardo",
    primerApellido: "Mejía",
    estado: "publicado",
    heredadoSin: ["saro"],
    familia: "Desarrollo",
    roles: ["Desarrollador backend Kotlin"],
    seniority: "Senior",
    anios: 9,
    tecnologias: ["Java", "Spring Boot", "Oracle"],
    sectores: ["Banca"],
    modalidad: "remoto",
    ciudad: "Bogotá",
    disponibleEnDias: 14,
  },
  {
    codigo: "PS-0112",
    nombre: "Paula",
    primerApellido: "Cárdenas",
    estado: "publicado",
    heredadoSin: ["saro", "disc"],
    familia: "Datos",
    roles: ["Arquitecta de datos"],
    seniority: "Semi senior",
    anios: 5,
    tecnologias: ["Python", "Airflow", "BigQuery"],
    sectores: ["Retail"],
    modalidad: "hibrido",
    ciudad: "Medellín",
    disponibleEnDias: 7,
  },
  {
    codigo: "PS-0118",
    nombre: "Esteban",
    primerApellido: "Salazar",
    estado: "publicado",
    heredadoSin: ["disc"],
    familia: "Infraestructura",
    roles: ["Ingeniero de plataforma"],
    seniority: "Senior",
    anios: 8,
    tecnologias: ["Azure", "Terraform", "Kubernetes"],
    sectores: ["Seguros"],
    modalidad: "remoto",
    ciudad: "Cali",
    disponibleEnDias: 0,
  },
  {
    codigo: "PS-0124",
    nombre: "Juliana",
    primerApellido: "Ospina",
    estado: "publicado",
    heredadoSin: ["modalidad"],
    familia: "Calidad",
    roles: ["Analista QA de rendimiento"],
    seniority: "Semi senior",
    anios: 4,
    tecnologias: ["Cypress", "JavaScript", "Postman"],
    sectores: ["Telecomunicaciones"],
    modalidad: "hibrido",
    ciudad: "Bogotá",
    disponibleEnDias: 30,
  },
];

export interface ContextoFicticios {
  bd: pg.Pool;
  auditoria: ClavesAuditoria;
  appEnv: "local" | "ci" | "staging" | "produccion";
  registrar: (evento: Record<string, unknown>) => void;
}

type Tx = pg.PoolClient;

// Busca o crea un valor de catálogo y devuelve su id.
async function valor(
  tx: Tx,
  tabla: string,
  nombre: string,
  extra: Record<string, unknown> = {},
): Promise<string> {
  const r = await tx.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]);
  if (r.rows[0]) return r.rows[0].id;
  const cols = ["nombre", ...Object.keys(extra)];
  const vals = [nombre, ...Object.values(extra)];
  const i = await tx.query(
    `INSERT INTO inventario.${tabla} (${cols.join(", ")}) VALUES (${cols.map((_, n) => `$${n + 1}`).join(", ")}) RETURNING id`,
    vals,
  );
  return i.rows[0].id;
}

// Los tres motivos de pausa de RF-8.14.2, con la ayuda que se ve al elegirlos (HU-133). En producción
// se crean desde Catálogos (RF-8.16); aquí, para local, CI y staging.
export const MOTIVOS_PAUSA_FICTICIOS = [
  { nombre: "En proceso de selección con otro cliente", descripcion: "Entrevistas en curso sin decisión." },
  {
    nombre: "En licencia o ausencia temporal",
    descripcion: "Incapacidad, licencia o vacaciones largas sin fecha de regreso.",
  },
  { nombre: "Decisión de Talento Humano", descripcion: "Se revisa el perfil o su evidencia." },
];

// Alcance SARO ficticio (HU-177; catálogo cerrado de la 0027): los perfiles sembrados fuera de borrador
// lo llevan con su fecha y la de la evaluación DISC, porque entrar en publicado los exige (D61, 0028).
// Texto ilustrativo, marcado para revisión de copy (D73) antes de cargar el catálogo real.
export const ALCANCE_SARO_FICTICIO = {
  nombre: "Antecedentes judiciales, disciplinarios y fiscales",
  texto: "Verificamos sus antecedentes judiciales, disciplinarios y fiscales.",
};
export const FECHAS_VALIDACION_FICTICIAS = { saro: "2026-03-15", disc: "2026-04-10" };

// El día civil de Bogotá (el «hoy» del portal), no el de UTC: entre las 19:00 y la medianoche de
// Colombia UTC ya va un día adelante y «disponible hoy» se sembraba como «mañana».
export function fechaEnDias(dias: number): string {
  return diaCivilDeColombia(new Date(Date.now() + dias * 86_400_000));
}

export async function sembrarFicticios(
  ctx: ContextoFicticios,
  perfiles: PerfilFicticio[] = PERFILES_FICTICIOS,
): Promise<{ creados: number }> {
  if (ctx.appEnv === "produccion") {
    throw new Error("sembrar_ficticios: bloqueado en producción (solo local, CI y staging)");
  }
  let creados = 0;
  for (const m of MOTIVOS_PAUSA_FICTICIOS)
    await ctx.bd.query(
      `INSERT INTO inventario.catalogo_motivos_pausa (nombre, descripcion)
       SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_motivos_pausa WHERE nombre = $1)`,
      [m.nombre, m.descripcion],
    );
  await ctx.bd.query(
    `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente)
     SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_alcances_saro WHERE nombre = $1)`,
    [ALCANCE_SARO_FICTICIO.nombre, ALCANCE_SARO_FICTICIO.texto],
  );
  for (const p of perfiles) {
    const creado = await conAuditoria(ctx.bd, ctx.auditoria, async (tx) => {
      const existe = await tx.query(`SELECT 1 FROM inventario.perfiles WHERE codigo = $1`, [
        p.codigo,
      ]);
      if (existe.rows[0]) return { resultado: false, cambios: [] };

      const familia = await valor(tx, "catalogo_familias", p.familia);
      const seniority = await valor(tx, "catalogo_seniorities", p.seniority, {
        orden: SENIORITIES.indexOf(p.seniority) + 1,
      });
      const modalidad = await valor(tx, "catalogo_modalidades", p.modalidad, {
        texto_cliente: MODALIDADES[p.modalidad],
      });
      const pais = await valor(tx, "catalogo_paises", "Colombia");
      const ciudad = await valor(tx, "catalogo_ciudades", p.ciudad, { pais_id: pais });
      const perfil = await tx.query(
        `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido, familia_id, seniority_id, anios_experiencia,
           modalidad_id, pais_id, ciudad_id, disponibilidad_fecha, disponibilidad_actualizada_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now()) RETURNING id`,
        [
          p.codigo,
          p.nombre,
          p.primerApellido,
          familia,
          seniority,
          p.anios,
          modalidad,
          pais,
          ciudad,
          fechaEnDias(p.disponibleEnDias),
        ],
      );
      const id = perfil.rows[0].id as string;
      for (const [tabla, catalogo, nombres, extra] of [
        ["perfil_roles", "catalogo_roles", p.roles, { familia_id: familia }],
        ["perfil_tecnologias", "catalogo_tecnologias", p.tecnologias, {}],
        ["perfil_sectores", "catalogo_sectores", p.sectores, {}],
      ] as const) {
        for (const [n, nombre] of nombres.entries()) {
          const v = await valor(tx, catalogo, nombre, extra);
          await tx.query(
            `INSERT INTO inventario.${tabla} (perfil_id, valor_id, orden) VALUES ($1, $2, $3)`,
            [id, v, n + 1],
          );
        }
      }
      if (p.estado !== "borrador") {
        // Publicar exige modalidad de prueba activa de la familia (D10, migración 0017).
        const prueba = MODALIDADES_FICTICIAS.find((m) => m.familia === p.familia)!;
        await tx.query(
          `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente, enunciado_reto, entregables, criterios)
           SELECT $1, $2, $3, $4, $5, $6 WHERE NOT EXISTS (
             SELECT 1 FROM inventario.catalogo_modalidades_prueba WHERE familia_id = $1 AND nombre = $2)`,
          [familia, prueba.nombre, prueba.texto, prueba.enunciadoReto, prueba.entregables, prueba.criterios.join("\n")],
        );
        await tx.query(
          `UPDATE inventario.perfiles SET modalidad_prueba_id = (
             SELECT id FROM inventario.catalogo_modalidades_prueba WHERE familia_id = $2 AND nombre = $3)
            WHERE id = $1`,
          [id, familia, prueba.nombre],
        );
        await tx.query(
          `INSERT INTO inventario.consentimientos (perfil_id, alcance) VALUES ($1, 'dato ficticio de prueba: nombre, trayectoria y clientes')`,
          [id],
        );
        await tx.query(
          `UPDATE inventario.perfiles
              SET saro_alcance_id = (SELECT id FROM inventario.catalogo_alcances_saro WHERE nombre = $2),
                  saro_fecha = $3, disc_fecha = $4
            WHERE id = $1`,
          [id, ALCANCE_SARO_FICTICIO.nombre, FECHAS_VALIDACION_FICTICIAS.saro, FECHAS_VALIDACION_FICTICIAS.disc],
        );
        // Un pausado lleva su motivo del catálogo (HU-133; migración 0019); pausado y archivado no
        // tienen disponibilidad (matriz D5, D32).
        await tx.query(
          `UPDATE inventario.perfiles SET estado = $2,
                  motivo_pausa_id = CASE WHEN $2 = 'pausado'
                    THEN (SELECT id FROM inventario.catalogo_motivos_pausa WHERE nombre = $3) END,
                  disponibilidad_fecha = CASE WHEN $2 IN ('pausado', 'archivado') THEN NULL
                    ELSE disponibilidad_fecha END
            WHERE id = $1`,
          [id, p.estado, MOTIVOS_PAUSA_FICTICIOS[1]!.nombre],
        );
        // Heredado (HU-178): se le quita lo que hoy exige la guarda, ya publicado.
        if (p.heredadoSin?.length)
          await tx.query(
            `UPDATE inventario.perfiles
                SET saro_alcance_id = CASE WHEN $2 THEN NULL ELSE saro_alcance_id END,
                    saro_fecha = CASE WHEN $2 THEN NULL ELSE saro_fecha END,
                    disc_fecha = CASE WHEN $3 THEN NULL ELSE disc_fecha END,
                    modalidad_prueba_id = CASE WHEN $4 THEN NULL ELSE modalidad_prueba_id END
              WHERE id = $1`,
            [
              id,
              p.heredadoSin.includes("saro"),
              p.heredadoSin.includes("disc"),
              p.heredadoSin.includes("modalidad"),
            ],
          );
        if (p.colocadoEn)
          await tx.query(
            `INSERT INTO inventario.colocaciones (perfil_id, cuenta, inicio, liberacion, fuente)
             SELECT id, $2, disponibilidad_fecha - 180, disponibilidad_fecha, 'siembra'
               FROM inventario.perfiles WHERE id = $1`,
            [id, p.colocadoEn],
          );
      }
      await tx.query(
        `INSERT INTO identidad.claves_titular (titular, clave_envuelta) VALUES ($1, $2) ON CONFLICT (titular) DO NOTHING`,
        [p.codigo, envolverClave(ctx.auditoria.kek, randomBytes(32))],
      );
      return {
        resultado: true,
        cambios: [
          {
            actor: "sistema:sembrar_ficticios",
            entidad: "perfiles",
            entidadId: id,
            campo: "estado",
            titular: p.codigo,
            antes: null,
            despues: p.estado,
            origen: "migracion" as const,
          },
        ],
      };
    });
    if (creado) creados++;
  }
  // Trayectoria (RF-8.4: publicar exige al menos una experiencia; la ficha del portal la muestra, D47).
  // Aparte del alta para completar también lo sembrado antes: una por perfil, solo si no tiene ninguna,
  // sin cliente nombrado (el consentimiento ficticio no los incluye).
  for (const p of perfiles.filter((x) => x.estado !== "borrador"))
    await ctx.bd.query(
      `INSERT INTO inventario.perfil_experiencias (perfil_id, orden, cargo, desde, descripcion)
       SELECT id, 1, $2, $3, $4 FROM inventario.perfiles p
        WHERE codigo = $1
          AND NOT EXISTS (SELECT 1 FROM inventario.perfil_experiencias e WHERE e.perfil_id = p.id)`,
      [
        p.codigo,
        p.roles[0],
        new Date().getUTCFullYear() - p.anios,
        `Experiencia ficticia de prueba: ${p.tecnologias.slice(0, 2).join(" y ")} en ${p.sectores[0] ?? "proyectos de software"}.`,
      ],
    );
  ctx.registrar({ evento: "ficticios_sembrados", creados, total: perfiles.length });
  return { creados };
}

// Los cuatro heredados incompletos (PS-0105 sin SARO, PS-0112 sin SARO ni DISC, PS-0118 sin DISC,
// PS-0124 sin modalidad de prueba), con los catálogos del banco base. Mismas garantías: nunca en
// producción, idempotente y auditado.
export const sembrarHeredadosIncompletos = (ctx: ContextoFicticios) =>
  sembrarFicticios(ctx, HEREDADOS_INCOMPLETOS);
