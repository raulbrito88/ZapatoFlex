"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obtenerUsuarioActual } from "@/lib/auth";

export async function toggleFavorito(productoId: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Debes iniciar sesión para guardar favoritos" };

  const existente = await prisma.favorito.findUnique({
    where: { usuarioId_productoId: { usuarioId: usuario.id, productoId } },
  });

  if (existente) {
    await prisma.favorito.delete({ where: { id: existente.id } });
    revalidatePath("/favoritos");
    return { favorito: false };
  } else {
    await prisma.favorito.create({ data: { usuarioId: usuario.id, productoId } });
    revalidatePath("/favoritos");
    return { favorito: true };
  }
}
