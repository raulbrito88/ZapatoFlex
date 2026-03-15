"use server";

import crypto from "crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { usuarioRepository } from "@/lib/repositories/usuario-repository";
import { enviarEmailRecuperarPassword } from "@/lib/services/email-service";
import { hashPassword } from "@/lib/auth";

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// ── Solicitar restablecimiento ────────────────────────────────────────────────

const schemaSolicitud = z.object({
  email: z.string().email("Email inválido."),
});

export async function solicitarReset(
  prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const parsed = schemaSolicitud.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Email inválido." };

  const { email } = parsed.data;
  const successMsg = "Si el email existe, recibirás un correo con instrucciones en los próximos minutos.";

  const usuario = await usuarioRepository.findByEmail(email);
  if (!usuario) return { success: successMsg };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await usuarioRepository.saveResetToken(usuario.id, hashedToken, expiry);

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/recuperar-password/${rawToken}`;

  await enviarEmailRecuperarPassword(usuario.email, usuario.nombre, resetUrl);

  return { success: successMsg };
}

// ── Restablecer contraseña ────────────────────────────────────────────────────

const schemaReset = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmar: z.string().min(1),
});

export async function restablecerPassword(
  prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = schemaReset.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmar: formData.get("confirmar"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const { token: rawToken, password, confirmar } = parsed.data;

  if (password !== confirmar) return { error: "Las contraseñas no coinciden." };

  const hashedToken = hashToken(rawToken);
  const usuario = await usuarioRepository.findByResetToken(hashedToken);

  if (!usuario || !usuario.resetTokenExpiry) {
    return { error: "El enlace es inválido o ya fue utilizado." };
  }

  if (usuario.resetTokenExpiry < new Date()) {
    return { error: "El enlace ha expirado. Solicita uno nuevo." };
  }

  const newHash = await hashPassword(password);
  await usuarioRepository.updatePassword(usuario.id, newHash);
  await usuarioRepository.clearResetToken(usuario.id);

  redirect("/login?reset=ok");
}
