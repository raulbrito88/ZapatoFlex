/**
 * Servicio de checkout: orquesta carrito, inventario y pago.
 * Usa Factory implícita (creación de pedido/pago) y Strategy (método de pago).
 */
import { prisma } from "@/lib/db";
import { ContraentregaStrategy } from "./pago-strategy";
import { enviarConfirmacionPedido, enviarNotificacionAdminPedido } from "./email-service";
import type { IMetodoPagoStrategy } from "./pago-strategy";

export interface CheckoutResult {
  success: boolean;
  pedidoId?: string;
  error?: string;
}

export async function ejecutarCheckout(usuarioId: string): Promise<CheckoutResult> {
  const carrito = await prisma.carrito.findUnique({
    where: { usuarioId },
    include: {
      items: {
        include: {
          producto: {
            include: { variantes: { include: { talla: true } } },
          },
        },
      },
    },
  });

  if (!carrito || carrito.items.length === 0) {
    return { success: false, error: "Carrito vacío" };
  }

  // Verificar stock por talla
  for (const item of carrito.items) {
    if (!item.talla) {
      return { success: false, error: `Selecciona una talla para "${item.producto.nombre}"` };
    }
    const variante = item.producto.variantes.find(
      (v) => v.talla.valor === item.talla
    );
    if (!variante || variante.stock < item.cantidad) {
      const disponible = variante?.stock ?? 0;
      return {
        success: false,
        error: `Stock insuficiente para "${item.producto.nombre}" talla ${item.talla}. Disponible: ${disponible}`,
      };
    }
  }

  const total = carrito.items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0
  );

  const pedido = await prisma.pedido.create({
    data: {
      usuarioId,
      total,
      metodoPago: "CONTRAENTREGA",
      estado: "PENDIENTE",
      lineas: {
        create: carrito.items.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad,
          precioUnitario: i.producto.precio,
          talla: i.talla,
        })),
      },
    },
  });

  const estrategiaPago: IMetodoPagoStrategy = new ContraentregaStrategy();
  const resultadoPago = await estrategiaPago.procesar({
    pedidoId: pedido.id,
    total: pedido.total,
    usuarioId,
    metodo: "CONTRAENTREGA",
  });

  if (!resultadoPago.ok) {
    await prisma.pedido.update({ where: { id: pedido.id }, data: { estado: "CANCELADO" } });
    return { success: false, error: resultadoPago.mensaje };
  }

  await prisma.pago.create({
    data: {
      pedidoId: pedido.id,
      metodo: "CONTRAENTREGA",
      estado: "SIMULADO",
    },
  });

  // Descontar stock por talla
  for (const item of carrito.items) {
    const variante = item.producto.variantes.find(
      (v) => v.talla.valor === item.talla
    );
    if (variante) {
      await prisma.productoTalla.update({
        where: { id: variante.id },
        data: { stock: { decrement: item.cantidad } },
      });
    }
  }

  // Vaciar carrito
  await prisma.lineaCarrito.deleteMany({ where: { carritoId: carrito.id } });

  // Enviar emails — await con Promise.allSettled para garantizar envío en Vercel
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { email: true, nombre: true, direccionEnvio: true, complemento: true, municipio: true, departamento: true },
  });
  if (usuario) {
    const direccion = [
      usuario.direccionEnvio,
      usuario.complemento,
      usuario.municipio,
      usuario.departamento,
    ].filter(Boolean).join(", ") || undefined;

    const datosPedido = {
      id: pedido.id,
      total: pedido.total,
      metodoPago: "CONTRAENTREGA",
      direccionEnvio: direccion,
      lineas: carrito.items.map((i) => ({
        nombre: i.producto.nombre,
        talla: i.talla,
        cantidad: i.cantidad,
        precioUnitario: i.producto.precio,
      })),
    };
    await Promise.allSettled([
      enviarConfirmacionPedido(usuario.email, usuario.nombre, datosPedido),
      enviarNotificacionAdminPedido(usuario.nombre, usuario.email, datosPedido),
    ]);
  }

  return { success: true, pedidoId: pedido.id };
}
