/**
 * Script: pull-from-prod.ts
 * Copia todos los datos de la BD de producción (Turso) a la BD local (file:./dev.db).
 *
 * Uso:
 *   tsx --env-file=.env.local prisma/pull-from-prod.ts
 *
 * Variables de entorno requeridas en .env.local (temporalmente):
 *   TURSO_DATABASE_URL_PROD=libsql://...
 *   TURSO_AUTH_TOKEN_PROD=...
 *   TURSO_DATABASE_URL=file:./dev.db   (destino local)
 */

import { createClient } from "@libsql/client";

const PROD_URL = process.env.TURSO_DATABASE_URL_PROD;
const PROD_TOKEN = process.env.TURSO_AUTH_TOKEN_PROD;
const LOCAL_URL = process.env.TURSO_DATABASE_URL ?? "file:./dev.db";

if (!PROD_URL || !PROD_TOKEN) {
  console.error(
    "Faltan variables: TURSO_DATABASE_URL_PROD y TURSO_AUTH_TOKEN_PROD en .env.local"
  );
  process.exit(1);
}

const prod = createClient({ url: PROD_URL, authToken: PROD_TOKEN });
const local = createClient({ url: LOCAL_URL });

// Orden respetando foreign keys
const TABLAS = [
  "Categoria",
  "Subcategoria",
  "Marca",
  "Color",
  "Talla",
  "Genero",
  "Usuario",
  "Producto",
  "ProductoTalla",
  "ImagenProducto",
  "Carrito",
  "LineaCarrito",
  "Pedido",
  "LineaPedido",
  "Pago",
  "Favorito",
  "ConfiguracionSitio",
];

async function copiarTabla(tabla: string) {
  const { rows, columns } = await prod.execute(`SELECT * FROM "${tabla}"`);

  if (rows.length === 0) {
    console.log(`  ${tabla}: vacía, se omite.`);
    return;
  }

  // Limpia la tabla local antes de insertar
  await local.execute(`DELETE FROM "${tabla}"`);

  let insertados = 0;
  for (const row of rows) {
    const cols = columns.map((c) => `"${c}"`).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const valores = columns.map((c) => (row as Record<string, unknown>)[c] ?? null);

    await local.execute({
      sql: `INSERT OR REPLACE INTO "${tabla}" (${cols}) VALUES (${placeholders})`,
      args: valores,
    });
    insertados++;
  }

  console.log(`  ${tabla}: ${insertados} filas copiadas.`);
}

async function main() {
  console.log("=== Iniciando sincronización producción → local ===\n");
  console.log(`Origen : ${PROD_URL}`);
  console.log(`Destino: ${LOCAL_URL}\n`);

  // Deshabilita FK constraints durante la carga
  await local.execute("PRAGMA foreign_keys = OFF");

  for (const tabla of TABLAS) {
    try {
      await copiarTabla(tabla);
    } catch (err) {
      console.warn(`  ${tabla}: error →`, (err as Error).message);
    }
  }

  await local.execute("PRAGMA foreign_keys = ON");

  console.log("\n=== Sincronización completada ===");
  prod.close();
  local.close();
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
