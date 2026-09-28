// BD de prueba real (PostgreSQL + PgBouncer en modo transacción, sin superusuario para la aplicación).
// Crea una base nueva por fichero de test, aplica roles.sql con el usuario de instalación y las
// migraciones con `ps_migrador`, y devuelve conexiones como cada rol real por el pool.
// Variables (scripts/bd-local.sh entorno, o el servicio de CI): BD_INSTALACION_URL, y las URL de
// PgBouncer se derivan cambiando usuario, contraseña, puerto y base.
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import pg from "pg";
import { migrarHastaElFinal } from "../src/postgres/migrar";

export const HAY_BD = Boolean(process.env.BD_INSTALACION_URL);

const CLAVE_DEV = process.env.BD_CLAVE_DEV ?? "dev";
const PUERTO_POOL = process.env.BD_PUERTO_POOL ?? "64329";

export type RolBd = "ps_portal" | "ps_panel" | "ps_worker" | "ps_exportador" | "ps_migrador";

export interface BdPrueba {
  nombre: string;
  instalacion: pg.Pool;
  como(rol: RolBd, opciones?: { directa?: boolean }): pg.Pool;
  urlDe(rol: RolBd, opciones?: { directa?: boolean }): string;
  cerrar(): Promise<void>;
}

export async function crearBdPrueba(): Promise<BdPrueba> {
  const base = new URL(process.env.BD_INSTALACION_URL!);
  const nombre = `ps_t_${randomBytes(4).toString("hex")}`;
  // roles.sql toca roles globales del clúster: se serializa entre ficheros de test con un candado
  // consultivo en la base de instalación.
  const admin = new pg.Client({ connectionString: base.toString() });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${nombre}`);
  await admin.query(`SELECT pg_advisory_lock(hashtext('bd_prueba_roles'))`);

  const urlInstalacion = new URL(base.toString());
  urlInstalacion.pathname = `/${nombre}`;
  const instalacion = new pg.Pool({ connectionString: urlInstalacion.toString(), max: 2 });
  const roles = readFileSync(new URL("../bootstrap/roles.sql", import.meta.url), "utf8");
  try {
    await instalacion.query(roles);
  } finally {
    await admin.query(`SELECT pg_advisory_unlock(hashtext('bd_prueba_roles'))`);
    await admin.end();
  }

  const urlDe = (rol: RolBd, opciones: { directa?: boolean } = {}) => {
    const u = new URL(urlInstalacion.toString());
    u.username = rol;
    u.password = CLAVE_DEV;
    if (!opciones.directa) u.port = PUERTO_POOL;
    return u.toString();
  };

  await migrarHastaElFinal(urlDe("ps_migrador", { directa: true }));

  const pools: pg.Pool[] = [];
  return {
    nombre,
    instalacion,
    urlDe,
    como(rol, opciones) {
      const p = new pg.Pool({ connectionString: urlDe(rol, opciones), max: 3 });
      pools.push(p);
      return p;
    },
    async cerrar() {
      await Promise.all(pools.map((p) => p.end()));
      await instalacion.end();
      const c = new pg.Client({ connectionString: base.toString() });
      await c.connect();
      await c.query(`DROP DATABASE IF EXISTS ${nombre} WITH (FORCE)`);
      await c.end();
    },
  };
}

// Espera un error de PostgreSQL: devuelve su código SQLSTATE.
export async function codigoDeError(promesa: Promise<unknown>): Promise<string> {
  try {
    await promesa;
  } catch (e) {
    return (e as { code?: string }).code ?? "sin_codigo";
  }
  throw new Error("se esperaba un error de la base de datos y la operación tuvo éxito");
}

export const PERMISO_DENEGADO = "42501";
export const EXCEPCION = "P0001";
