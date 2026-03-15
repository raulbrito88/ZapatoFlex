/**
 * Patrón Repository: acceso a datos de Usuario.
 */
import { prisma } from "@/lib/db";
import type { Usuario } from "@prisma/client";

export interface IUsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  create(data: { email: string; nombre: string; passwordHash: string; rol?: "USUARIO" | "ADMIN" }): Promise<Usuario>;
  findByResetToken(hashedToken: string): Promise<Usuario | null>;
  saveResetToken(id: string, hashedToken: string, expiry: Date): Promise<void>;
  clearResetToken(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
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
  async findByResetToken(hashedToken) {
    return prisma.usuario.findFirst({ where: { resetToken: hashedToken } });
  },
  async saveResetToken(id, hashedToken, expiry) {
    await prisma.usuario.update({
      where: { id },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });
  },
  async clearResetToken(id) {
    await prisma.usuario.update({
      where: { id },
      data: { resetToken: null, resetTokenExpiry: null },
    });
  },
  async updatePassword(id, passwordHash) {
    await prisma.usuario.update({ where: { id }, data: { passwordHash } });
  },
};
