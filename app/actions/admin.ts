"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schemaProducto = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio: z.number().positive(),
  categoriaId: z.string().min(1),
  subcategoriaId: z.string().min(1).optional(),
  generoId: z.string().min(1).optional(),
  marcaId: z.string().min(1).optional(),
  colorId: z.string().min(1).optional(),
  requiereTalla: z.boolean().default(true),
  stockTotal: z.number().int().min(0).default(0),
  imagenes: z.array(z.string().url()).default([]),
  variantes: z.array(z.object({
    tallaId: z.string().min(1),
    stock: z.number().int().min(0),
  })).default([]),
});

export async function crearProducto(prev: unknown, formData: FormData) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };

  let imagenes: string[] = [];
  try {
    const raw = formData.get("imagenes");
    if (raw) imagenes = JSON.parse(raw as string);
  } catch {}

  let variantes: { tallaId: string; stock: number }[] = [];
  try {
    const raw = formData.get("variantes");
    if (raw) variantes = JSON.parse(raw as string);
  } catch {}

  const subcategoriaId = (formData.get("subcategoriaId") as string) || undefined;
  const generoId = (formData.get("generoId") as string) || undefined;
  const requiereTalla = formData.get("requiereTalla") !== "false";

  const parsed = schemaProducto.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || undefined,
    precio: Number(formData.get("precio")),
    categoriaId: formData.get("categoriaId"),
    subcategoriaId,
    generoId,
    marcaId: (formData.get("marcaId") as string) || undefined,
    colorId: (formData.get("colorId") as string) || undefined,
    requiereTalla,
    stockTotal: requiereTalla ? 0 : Number(formData.get("stockTotal")) || 0,
    imagenes,
    variantes,
  });
  if (!parsed.success) return { error: "Datos inválidos." };

  const { imagenes: imgs, variantes: vars, ...data } = parsed.data;
  const campos = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  await (prisma.producto as any).create({
    data: {
      ...campos,
      variantes: {
        create: vars.filter((v) => v.stock > 0).map((v) => ({
          tallaId: v.tallaId,
          stock: v.stock,
        })),
      },
      imagenes: {
        create: imgs.map((url, i) => ({ url, orden: i })),
      },
    },
  });
  revalidatePath("/tienda");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function actualizarProducto(
  id: string,
  prev: unknown,
  formData: FormData
) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };

  let imagenes: string[] = [];
  try {
    const raw = formData.get("imagenes");
    if (raw) imagenes = JSON.parse(raw as string);
  } catch {}

  let variantes: { tallaId: string; stock: number }[] = [];
  try {
    const raw = formData.get("variantes");
    if (raw) variantes = JSON.parse(raw as string);
  } catch {}

  const subcategoriaId = (formData.get("subcategoriaId") as string) || undefined;
  const generoId = (formData.get("generoId") as string) || undefined;
  const requiereTalla = formData.get("requiereTalla") !== "false";

  const parsed = schemaProducto.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || undefined,
    precio: Number(formData.get("precio")),
    categoriaId: formData.get("categoriaId"),
    subcategoriaId,
    generoId,
    marcaId: (formData.get("marcaId") as string) || undefined,
    colorId: (formData.get("colorId") as string) || undefined,
    requiereTalla,
    stockTotal: requiereTalla ? 0 : Number(formData.get("stockTotal")) || 0,
    imagenes,
    variantes,
  });
  if (!parsed.success) return { error: "Datos inválidos." };

  const { imagenes: imgs, variantes: vars, ...data } = parsed.data;
  const campos = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  await prisma.$transaction([
    prisma.imagenProducto.deleteMany({ where: { productoId: id } }),
    prisma.productoTalla.deleteMany({ where: { productoId: id } }),
    (prisma.producto as any).update({
      where: { id },
      data: {
        ...campos,
        marcaId: campos.marcaId ?? null,
        colorId: campos.colorId ?? null,
        variantes: {
          create: vars.filter((v) => v.stock > 0).map((v) => ({
            tallaId: v.tallaId,
            stock: v.stock,
          })),
        },
        imagenes: {
          create: imgs.map((url, i) => ({ url, orden: i })),
        },
      },
    }),
  ]);
  revalidatePath("/tienda");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function eliminarProducto(id: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };
  await prisma.producto.delete({ where: { id } });
  revalidatePath("/tienda");
  revalidatePath("/admin/productos");
  return { success: true };
}
