/**
 * Patrón Repository: acceso a datos de Usuario.
 */
import { prisma } from "@/lib/db";
import type { Usuario } from "@prisma/client";

export interface IUsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  create(data: { email: string; nombre: string; passwordHash: string; rol?: "USUARIO" | "ADMIN" }): Promise<Usuario>;
}

export const usuarioRepository: IUsuarioRepository = {
  async findById(id) {
    return prisma.usuario.findUnique({ where: { id } });
  },
  async findByEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },
  async create(data) {
    return prisma.usuario.create({
      data: {
        email: data.email,
        nombre: data.nombre,
        passwordHash: data.passwordHash,
        rol: data.rol ?? "USUARIO",
      },
    });
  },
};
