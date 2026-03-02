/**
 * Singleton: cliente de base de datos (Prisma).
 * En serverless (Vercel) cada instancia puede tener su propio cliente;
 * Prisma recomienda instancia única por proceso.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
