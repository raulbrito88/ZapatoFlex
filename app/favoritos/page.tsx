import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AgregarAlCarritoBtn } from "@/app/tienda/agregar-carrito";
import { CarruselProducto } from "@/app/tienda/carrusel-producto";
import { FavoritoBtn } from "@/app/tienda/favorito-btn";

export default async function FavoritosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");

  const favoritos = await prisma.favorito.findMany({
    where: { usuarioId: usuario.id },
    include: {
      producto: {
        include: {
          imagenes: { orderBy: { orden: "asc" } },
          marca: true,
          color: true,
          categoria: true,
          subcategoria: true,
          genero: true,
          variantes: { include: { talla: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container">
      <h1 className="mb-2">Mis favoritos</h1>
      {favoritos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p className="text-muted">No tienes productos favoritos todavía.</p>
          <Link href="/tienda" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Explorar tienda
          </Link>
        </div>
      ) : (
        <div className="grid-productos">
          {favoritos.map(({ producto: p }) => {
            const tallasDisponibles = p.variantes
              .filter((v) => v.stock > 0)
              .map((v) => v.talla.valor);
            return (
              <div key={p.id} className="card card-producto">
                <CarruselProducto imagenes={p.imagenes || []} nombre={p.nombre} />
                <FavoritoBtn productoId={p.id} inicial={true} />
                <div className="card-body">
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span className="badge">
                      {p.categoria?.nombre ?? "Sin categoría"}
                      {p.subcategoria ? ` · ${p.subcategoria.nombre}` : ""}
                    </span>
                  </div>
                  <h3 className="card-title">{p.nombre}</h3>
                  <p className="card-meta">
                    {p.marca.nombre} · {p.color.nombre}
                    {p.genero ? ` · ${p.genero.nombre}` : ""}
                  </p>
                  {tallasDisponibles.length > 0 && (
                    <p className="card-meta">Tallas: {tallasDisponibles.join(", ")}</p>
                  )}
                  <p className="card-price">${Number(p.precio).toLocaleString("es-CO")}</p>
                  <AgregarAlCarritoBtn productoId={p.id} tallas={tallasDisponibles} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
