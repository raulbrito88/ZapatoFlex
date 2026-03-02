/**
 * Módulo de Autenticación - Sesión simple con cookies.
 * Para producción se recomienda NextAuth o similar.
 */
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { usuarioRepository } from "@/lib/repositories/usuario-repository";

const COOKIE_NAME = "zapatoflex_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function crearSesion(usuarioId: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, usuarioId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destruirSesion() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function obtenerUsuarioActual() {
  const c = await cookies();
  const id = c.get(COOKIE_NAME)?.value;
  if (!id) return null;
  return usuarioRepository.findById(id);
}
