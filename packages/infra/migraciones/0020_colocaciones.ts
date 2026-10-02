// EP-006 · sub-slice 9, expand (HU-137, HU-150; RF-8.13, RF-8.13.2; D8, D12, D15, D16; diseño §1, §11):
//  - `colocaciones`: la asignación de un perfil publicado a una cuenta, con su fecha de liberación siempre
//    (RF-8.13.2) y de dónde salió el dato: el panel (la fuente, D8, con quién lo registró), la carga de
//    Operaciones (HU-150), la migración de los antiguos `colocado` o la siembra ficticia. Una sola
//    vigente por perfil.
//  - `cargas_operaciones`: cada carga del archivo de Operaciones; `cargado_en` es la fecha de corte (D16),
//    con lo que se aplicó, lo que no y las columnas ignoradas.
//  - `diferencias_operaciones`: la fila de Operaciones que no coincide con un colocado del panel; gana el
//    panel (D15) y la fila queda para aceptarla o descartarla.
// El estado `colocado` se retira en la 0021 (contract), después de que el worker mueva los datos.
// Sin DELETE para nadie (CON-11), `ps_portal` sin acceso (V3-2) y sin DML de nivel superior (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

CREATE TABLE inventario.cargas_operaciones (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cargado_por         uuid NOT NULL,
  cargado_en          timestamptz NOT NULL DEFAULT now(),
  archivo             text NOT NULL CHECK (length(btrim(archivo)) BETWEEN 1 AND 200),
  formato             text NOT NULL CHECK (formato IN ('json', 'csv')),
  filas_aplicadas     integer NOT NULL CHECK (filas_aplicadas >= 0),
  filas_con_error     integer NOT NULL CHECK (filas_con_error >= 0),
  columnas_ignoradas  text[] NOT NULL DEFAULT '{}',
  -- [{numero, codigo, motivo}]: lo que no se aplicó, para mostrarlo con su número de fila.
  errores             jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(errores) = 'array')
);

CREATE TABLE inventario.colocaciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id       uuid NOT NULL REFERENCES inventario.perfiles (id),
  cuenta          text NOT NULL CHECK (length(btrim(cuenta)) BETWEEN 1 AND 200),
  inicio          date,
  liberacion      date NOT NULL,
  fuente          text NOT NULL CHECK (fuente IN ('panel', 'operaciones', 'migracion', 'siembra')),
  carga_id        uuid REFERENCES inventario.cargas_operaciones (id),
  registrado_por  uuid,
  registrado_en   timestamptz NOT NULL DEFAULT now(),
  vigente         boolean NOT NULL DEFAULT true,
  cerrada_en      timestamptz,
  -- La migración de los antiguos colocados no sabe cuándo empezaron; el resto siempre lo dice.
  CHECK (inicio IS NOT NULL OR fuente = 'migracion'),
  CHECK (inicio IS NULL OR liberacion > inicio),
  CHECK ((fuente = 'operaciones') = (carga_id IS NOT NULL)),
  CHECK (fuente <> 'panel' OR registrado_por IS NOT NULL),
  CHECK (vigente = (cerrada_en IS NULL))
);
CREATE UNIQUE INDEX colocaciones_una_vigente ON inventario.colocaciones (perfil_id) WHERE vigente;
CREATE INDEX colocaciones_liberacion ON inventario.colocaciones (liberacion) WHERE vigente;

CREATE TABLE inventario.diferencias_operaciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id        uuid NOT NULL REFERENCES inventario.cargas_operaciones (id),
  colocacion_id   uuid NOT NULL REFERENCES inventario.colocaciones (id),
  numero_fila     integer NOT NULL CHECK (numero_fila >= 1),
  cuenta          text NOT NULL CHECK (length(btrim(cuenta)) BETWEEN 1 AND 200),
  inicio          date NOT NULL,
  liberacion      date NOT NULL CHECK (liberacion > inicio),
  decision        text CHECK (decision IN ('aceptada', 'descartada')),
  decidida_por    uuid,
  decidida_en     timestamptz,
  CHECK ((decision IS NULL) = (decidida_en IS NULL)),
  CHECK ((decision IS NULL) = (decidida_por IS NULL))
);
CREATE UNIQUE INDEX diferencias_una_pendiente ON inventario.diferencias_operaciones (colocacion_id)
  WHERE decision IS NULL;

GRANT SELECT, INSERT, UPDATE ON inventario.cargas_operaciones, inventario.colocaciones,
  inventario.diferencias_operaciones TO ps_panel, ps_worker;
REVOKE ALL ON inventario.cargas_operaciones, inventario.colocaciones, inventario.diferencias_operaciones
  FROM ps_portal;

RESET ROLE;
`,
    )
    .execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
DROP TABLE inventario.diferencias_operaciones, inventario.colocaciones, inventario.cargas_operaciones;
RESET ROLE;
`,
    )
    .execute(db);
}
