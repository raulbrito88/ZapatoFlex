import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormEditarProducto } from "./form-editar";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return (
      <div className="container">
        <p className="text-muted">Acceso denegado.</p>
      </div>
    );
  }

  const [
    producto,
    categorias,
    subcategorias,
    generos,
    marcas,
    colores,
    tallas,
  ] = await Promise.all([
    prisma.producto.findUnique({
      where: { id },
      include: {
        imagenes: { orderBy: { orden: "asc" } },
        variantes: { select: { tallaId: true, stock: true } },
      },
    }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.subcategoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.genero.findMany({ orderBy: { nombre: "asc" } }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
    prisma.color.findMany({ orderBy: { nombre: "asc" } }),
    prisma.talla.findMany({ orderBy: { valor: "asc" } }),
  ]);

  if (!producto) notFound();

  return (
    <div className="container">
      <Link href="/admin/productos" className="btn btn-ghost btn-sm mb-2">← Volver a productos</Link>
      <h1>Editar: {producto.nombre}</h1>
      <FormEditarProducto
        producto={producto as any}
        categorias={categorias.map((c) => ({ id: c.id, label: c.nombre }))}
        subcategorias={subcategorias.map((s) => ({
          id: s.id,
          label: s.nombre,
          categoriaId: s.categoriaId,
        }))}
        generos={generos.map((g) => ({ id: g.id, label: g.nombre }))}
        marcas={marcas.map((m) => ({ id: m.id, label: m.nombre }))}
        colores={colores.map((c) => ({ id: c.id, label: c.nombre }))}
        tallas={tallas.map((t) => ({ id: t.id, label: t.valor }))}
      />
    </div>
  );
}
