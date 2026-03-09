import { prisma } from "@/lib/db";
import type {
  Producto,
  Marca,
  Color,
  Categoria,
  Genero,
  Subcategoria,
  Prisma,
} from "@prisma/client";

export type ProductoCompleto = Producto & {
  categoria: (Pick<Categoria, "id" | "nombre">) | null;
  subcategoria: (Pick<Subcategoria, "id" | "nombre">) | null;
  genero: (Pick<Genero, "id" | "nombre">) | null;
  marca: Marca;
  color: Color;
  variantes: {
    id: string;
    tallaId: string;
    stock: number;
    talla: { id: string; valor: string };
  }[];
  imagenes: { id: string; url: string; orden: number }[];
};

export type FiltrosProducto = {
  categoriaId?: string;
  generoId?: string;
  talla?: string;
  precioMin?: number;
  precioMax?: number;
  marca?: string;
  color?: string;
  busqueda?: string;
};

export interface IProductoRepository {
  findById(id: string): Promise<Producto | null>;
  findMany(filtros?: FiltrosProducto): Promise<ProductoCompleto[]>;
  create(data: Prisma.ProductoCreateInput): Promise<Producto>;
  update(id: string, data: Prisma.ProductoUpdateInput): Promise<Producto>;
  delete(id: string): Promise<void>;
}

export const productoRepository: IProductoRepository = {
  async findById(id) {
    return prisma.producto.findUnique({ where: { id } });
  },

  async findMany(filtros = {}) {
    const where: Prisma.ProductoWhereInput = {};

    if (filtros.categoriaId) {
      where.categoriaId = filtros.categoriaId;
    }
    if (filtros.generoId) {
      where.generoId = filtros.generoId;
    }
    if (filtros.marca) {
      where.marca = { nombre: { contains: filtros.marca } };
    }
    if (filtros.color) {
      where.color = { nombre: { contains: filtros.color } };
    }
    if (filtros.talla) {
      where.variantes = {
        some: { talla: { valor: filtros.talla }, stock: { gt: 0 } },
      };
    }
    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda } },
        { descripcion: { contains: filtros.busqueda } },
        { marca: { nombre: { contains: filtros.busqueda } } },
      ];
    }
    if (filtros.precioMin != null || filtros.precioMax != null) {
      where.precio = {};
      if (filtros.precioMin != null) where.precio.gte = filtros.precioMin;
      if (filtros.precioMax != null) where.precio.lte = filtros.precioMax;
    }

    return prisma.producto.findMany({
      where,
      include: {
        categoria: { select: { id: true, nombre: true } },
        subcategoria: { select: { id: true, nombre: true } },
        genero: { select: { id: true, nombre: true } },
        marca: true,
        color: true,
        variantes: { include: { talla: true } },
        imagenes: { orderBy: { orden: "asc" } },
      },
    }) as Promise<ProductoCompleto[]>;
  },

  async create(data) {
    return prisma.producto.create({ data });
  },

  async update(id, data) {
    return prisma.producto.update({ where: { id }, data });
  },

  async delete(id) {
    await prisma.producto.delete({ where: { id } });
  },
};

