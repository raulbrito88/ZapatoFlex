"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function agregarAlCarrito(productoId: string, cantidad: number = 1, talla?: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Debes iniciar sesión" };

  // Verificar stock
  if (talla) {
    const variante = await prisma.productoTalla.findFirst({
      where: { productoId, talla: { valor: talla }, stock: { gt: 0 } },
    });
    if (!variante) return { error: `Sin stock para talla ${talla}` };
  } else {
    const prod = await (prisma.producto as any).findUnique({
      where: { id: productoId },
      select: { requiereTalla: true, stockTotal: true },
    });
    if (prod && prod.requiereTalla === false && prod.stockTotal <= 0) {
      return { error: "Sin stock disponible" };
    }
  }

  let carrito = await prisma.carrito.findUnique({ where: { usuarioId: usuario.id } });
  if (!carrito) {
    carrito = await prisma.carrito.create({ data: { usuarioId: usuario.id } });
  }

  const existente = await prisma.lineaCarrito.findFirst({
    where: { carritoId: carrito.id, productoId, talla: talla || null },
  });
  if (existente) {
    await prisma.lineaCarrito.update({
      where: { id: existente.id },
      data: { cantidad: existente.cantidad + cantidad },
    });
  } else {
    await prisma.lineaCarrito.create({
      data: { carritoId: carrito.id, productoId, cantidad, talla: talla || null },
    });
  }
  revalidatePath("/");
  revalidatePath("/carrito");
  revalidatePath("/tienda");
  return { success: true };
}

export async function actualizarCantidad(lineaId: string, cantidad: number) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Debes iniciar sesión" };
  if (cantidad < 1) return eliminarDelCarrito(lineaId);

  const linea = await prisma.lineaCarrito.findFirst({
    where: { id: lineaId },
    include: { carrito: true },
  });
  if (!linea || linea.carrito.usuarioId !== usuario.id) return { error: "No autorizado" };

  await prisma.lineaCarrito.update({
    where: { id: lineaId },
    data: { cantidad },
  });
  revalidatePath("/carrito");
  revalidatePath("/");
  return { success: true };
}

export async function eliminarDelCarrito(lineaId: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Debes iniciar sesión" };

  const linea = await prisma.lineaCarrito.findFirst({
    where: { id: lineaId },
    include: { carrito: true },
  });
  if (!linea || linea.carrito.usuarioId !== usuario.id) return { error: "No autorizado" };

  await prisma.lineaCarrito.delete({ where: { id: lineaId } });
  revalidatePath("/carrito");
  revalidatePath("/");
  return { success: true };
}
