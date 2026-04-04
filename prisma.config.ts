/**
 * Configuración de Prisma CLI para Prisma 7.
 * Lee .env.local para que `prisma generate` y `prisma db push` usen las credenciales locales.
 */
import { readFileSync } from "fs";
import { defineConfig } from "prisma/config";

// Prisma CLI no carga .env.local automáticamente (Next.js sí lo hace en runtime).
// Este bloque lo carga manualmente para los comandos de consola.
try {
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local no existe o no es legible */ }

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.TURSO_DATABASE_URL!,
  },
});
