import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { existsSync } from "fs";

config({ path: ".env" });
if (existsSync(".env.local")) config({ path: ".env.local", override: true });

const client = createClient({
  url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addColumnIfMissing(table, column, type) {
  const info = await client.execute(`PRAGMA table_info("${table}")`);
  const cols = info.rows.map((r) => r[1]);
  if (!cols.includes(column)) {
    await client.execute(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`);
    console.log(`OK: ${table}.${column} agregado`);
  } else {
    console.log(`Ya existe: ${table}.${column}`);
  }
}

async function run() {
  await addColumnIfMissing("Usuario", "resetToken", "TEXT");
  await addColumnIfMissing("Usuario", "resetTokenExpiry", "DATETIME");
  await addColumnIfMissing("Usuario", "documento", "TEXT");
  await addColumnIfMissing("Usuario", "departamento", "TEXT");
  await addColumnIfMissing("Usuario", "municipio", "TEXT");
  await addColumnIfMissing("Usuario", "direccionEnvio", "TEXT");
  await addColumnIfMissing("Usuario", "complemento", "TEXT");
  await addColumnIfMissing("Producto", "requiereTalla", "INTEGER NOT NULL DEFAULT 1");
  await addColumnIfMissing("Producto", "stockTotal", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing("Producto", "marcaId", "TEXT");
  await addColumnIfMissing("Producto", "colorId", "TEXT");
  await addColumnIfMissing("ConfiguracionSitio", "whatsappNumero", "TEXT");
  await addColumnIfMissing("ConfiguracionSitio", "nombreSitio", 'TEXT NOT NULL DEFAULT "ZapatoFlex"');
}

run()
  .then(() => { console.log("Migraciones completadas."); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
