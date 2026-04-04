"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enviarNotificacionEstado } from "@/lib/services/email-service";

export async function actualizarEstadoPedido(pedidoId: string, nuevoEstado: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };

  // Leer estado actual antes de modificar
  const pedido = await (prisma.pedido as any).findUnique({
    where: { id: pedidoId },
    select: {
      estado: true,
      usuario: { select: { email: true, nombre: true } },
      lineas: {
        select: {
          cantidad: true,
          talla: true,
          productoId: true,
          producto: { select: { requiereTalla: true } },
        },
      },
    },
  });

  if (!pedido) return { error: "Pedido no encontrado" };

  // Restaurar stock solo cuando se cancela un pedido que no estaba ya cancelado
  if (nuevoEstado === "CANCELADO" && pedido.estado !== "CANCELADO") {
    for (const linea of pedido.lineas) {
      if (linea.producto.requiereTalla === false) {
        await (prisma.producto as any).update({
          where: { id: linea.productoId },
          data: { stockTotal: { increment: linea.cantidad } },
        });
      } else if (linea.talla) {
        const variante = await prisma.productoTalla.findFirst({
          where: { productoId: linea.productoId, talla: { valor: linea.talla } },
        });
        if (variante) {
          await prisma.productoTalla.update({
            where: { id: variante.id },
            data: { stock: { increment: linea.cantidad } },
          });
        }
      }
    }
  }

  await (prisma.pedido as any).update({
    where: { id: pedidoId },
    data: { estado: nuevoEstado },
  });

  // Notificar al comprador
  if (pedido.usuario?.email) {
    void enviarNotificacionEstado(
      pedido.usuario.email,
      pedido.usuario.nombre,
      pedidoId,
      "pedido",
      nuevoEstado
    );
  }

  revalidatePath("/admin/pedidos");
  return { success: true };
}

export async function actualizarEstadoPago(pedidoId: string, estado: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };

  const pedido = await (prisma.pedido as any).findUnique({
    where: { id: pedidoId },
    select: { usuario: { select: { email: true, nombre: true } } },
  });

  await (prisma.pago as any).update({
    where: { pedidoId },
    data: { estado },
  });

  // Notificar al comprador
  if (pedido?.usuario?.email) {
    void enviarNotificacionEstado(
      pedido.usuario.email,
      pedido.usuario.nombre,
      pedidoId,
      "pago",
      estado
    );
  }

  revalidatePath("/admin/pedidos");
  return { success: true };
}
