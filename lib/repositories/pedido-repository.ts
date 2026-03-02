/**
 * Patrón Repository: acceso a datos de Pedido.
 */
import { prisma } from "@/lib/db";
import type { Pedido } from "@prisma/client";

export interface IPedidoRepository {
  create(data: {
    usuarioId: string;
    total: number;
    metodoPago: string;
    lineas: { productoId: string; cantidad: number; precioUnitario: number }[];
  }): Promise<Pedido>;
  findById(id: string): Promise<Pedido | null>;
  findByUsuarioId(usuarioId: string): Promise<Pedido[]>;
  findAll(): Promise<Pedido[]>;
}

export const pedidoRepository: IPedidoRepository = {
  async create(data) {
    return prisma.pedido.create({
      data: {
        usuarioId: data.usuarioId,
        total: data.total,
        metodoPago: data.metodoPago,
        lineas: {
          create: data.lineas.map((l) => ({
            productoId: l.productoId,
            cantidad: l.cantidad,
            precioUnitario: l.precioUnitario,
          })),
        },
      },
    });
  },
  async findById(id) {
    return prisma.pedido.findUnique({
      where: { id },
      include: { lineas: { include: { producto: true } }, pago: true },
    }) as Promise<Pedido | null>;
  },
  async findByUsuarioId(usuarioId: string) {
    return prisma.pedido.findMany({
      where: { usuarioId },
      orderBy: { createdAt: "desc" },
      include: { lineas: { include: { producto: true } } },
    }) as unknown as Pedido[];
  },
  async findAll() {
    return prisma.pedido.findMany({
      orderBy: { createdAt: "desc" },
      include: { usuario: true, lineas: { include: { producto: true } } },
    }) as unknown as Pedido[];
  },
};
