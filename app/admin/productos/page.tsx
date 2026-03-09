import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormProducto } from "./form-producto";
import { EliminarProductoBtn } from "./eliminar-btn";

export default async function AdminProductosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return (
      <div className="container">
        <p className="text-muted">Acceso denegado. Solo administradores.</p>
      </div>
    );
  }

  const [
    productos,
    categorias,
    subcategorias,
    generos,
    marcas,
    colores,
    tallas,
  ] = await Promise.all([
    prisma.producto.findMany({
      include: {
        categoria: true,
        subcategoria: true,
        genero: true,
        marca: true,
        color: true,
        variantes: { include: { talla: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.subcategoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.genero.findMany({ orderBy: { nombre: "asc" } }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
    prisma.color.findMany({ orderBy: { nombre: "asc" } }),
    prisma.talla.findMany({ orderBy: { valor: "asc" } }),
  ]);

  const stockTotal = (variantes: { stock: number }[]) =>
    variantes.reduce((s, v) => s + v.stock, 0);

  return (
    <div className="container">
      <h1>Panel administrativo — Productos</h1>
      <p className="text-muted mb-2">
        <Link href="/admin/pedidos">Ver pedidos</Link> · <Link href="/admin/catalogos">Gestionar catálogos</Link>
      </p>

      <div className="card mb-2" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Agregar producto</h2>
        <FormProducto
          categorias={categorias.map((c) => ({ id: c.id, label: c.nombre }))}
          subcategorias={subcategorias.map((s) => ({
            id: s.id,
            label: `${s.nombre} — ${categorias.find((c) => c.id === s.categoriaId)?.nombre ?? ""
              }`,
          }))}
          generos={generos.map((g) => ({ id: g.id, label: g.nombre }))}
          marcas={marcas.map((m) => ({ id: m.id, label: m.nombre }))}
          colores={colores.map((c) => ({ id: c.id, label: c.nombre }))}
          tallas={tallas.map((t) => ({ id: t.id, label: t.valor }))}
        />
      </div>

      <h2>Listado</h2>
      {productos.length === 0 ? (
        <p className="text-muted">No hay productos.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {productos.map((p) => (
            <li key={p.id} className="card" style={{ marginBottom: "0.75rem" }}>
              <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <strong>{p.nombre}</strong> — {p.marca.nombre} ·{" "}
                  {p.categoria?.nombre ?? "Sin categoría"}{" "}
                  {p.subcategoria ? `· ${p.subcategoria.nombre}` : ""}{" "}
                  {p.genero ? `· ${p.genero.nombre}` : ""} · $
                  {Number(p.precio).toLocaleString("es-CO")}
                  <br />
                  <span className="text-muted">
                    Color: {p.color.nombre} · Stock total: {stockTotal(p.variantes)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/admin/productos/${p.id}`} className="btn btn-ghost btn-sm">Editar</Link>
                  <EliminarProductoBtn productoId={p.id} nombre={p.nombre} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
