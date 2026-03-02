"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { usuarioRepository } from "@/lib/repositories/usuario-repository";
import { hashPassword, verifyPassword, crearSesion, destruirSesion } from "@/lib/auth";

const schemaRegistro = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const schemaLogin = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registrar(prev: unknown, formData: FormData) {
  const parsed = schemaRegistro.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Datos inválidos. Contraseña mínimo 6 caracteres." };
  const { nombre, email, password } = parsed.data;

  const existente = await usuarioRepository.findByEmail(email);
  if (existente) return { error: "Ya existe un usuario con ese email." };

  const passwordHash = await hashPassword(password);
  const usuario = await usuarioRepository.create({ nombre, email, passwordHash });
  await crearSesion(usuario.id);
  redirect("/");
}

export async function iniciarSesion(prev: unknown, formData: FormData) {
  const parsed = schemaLogin.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Email y contraseña requeridos." };
  const { email, password } = parsed.data;

  const usuario = await usuarioRepository.findByEmail(email);
  if (!usuario) return { error: "Credenciales incorrectas." };

  const ok = await verifyPassword(password, usuario.passwordHash);
  if (!ok) return { error: "Credenciales incorrectas." };

  await crearSesion(usuario.id);
  redirect("/");
}

export async function cerrarSesion() {
  await destruirSesion();
  redirect("/");
}
