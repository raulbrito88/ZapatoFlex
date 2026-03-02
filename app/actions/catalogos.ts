"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

// --- Marcas ---

export async function crearMarca(prev: unknown, formData: FormData) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };
  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return { error: "Nombre requerido" };
  try {
    await prisma.marca.create({ data: { nombre } });
  } catch {
    return { error: "Ya existe una marca con ese nombre" };
  }
  revalidatePath("/admin/catalogos");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function eliminarMarca(id: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };
  try {
    await prisma.marca.delete({ where: { id } });
  } catch {
    return { error: "No se puede eliminar, hay productos usando esta marca" };
  }
  revalidatePath("/admin/catalogos");
  return { success: true };
}

// --- Colores ---

export async function crearColor(prev: unknown, formData: FormData) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };
  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return { error: "Nombre requerido" };
  try {
    await prisma.color.create({ data: { nombre } });
  } catch {
    return { error: "Ya existe un color con ese nombre" };
  }
  revalidatePath("/admin/catalogos");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function eliminarColor(id: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };
  try {
    await prisma.color.delete({ where: { id } });
  } catch {
    return { error: "No se puede eliminar, hay productos usando este color" };
  }
  revalidatePath("/admin/catalogos");
  return { success: true };
}

// --- Tallas ---

export async function crearTalla(prev: unknown, formData: FormData) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };
  const valor = (formData.get("valor") as string)?.trim();
  if (!valor) return { error: "Valor requerido" };
  try {
    await prisma.talla.create({ data: { valor } });
  } catch {
    return { error: "Ya existe esa talla" };
  }
  revalidatePath("/admin/catalogos");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function eliminarTalla(id: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };
  try {
    await prisma.talla.delete({ where: { id } });
  } catch {
    return { error: "No se puede eliminar, hay productos usando esta talla" };
  }
  revalidatePath("/admin/catalogos");
  return { success: true };
}
