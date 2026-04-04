import { Suspense } from "react";
import { productoRepository, FiltrosProducto } from "@/lib/repositories/producto-repository";
import { AgregarAlCarritoBtn } from "./agregar-carrito";
import { CarruselProducto } from "./carrusel-producto";
import { BarraBusqueda } from "./barra-busqueda";
import { SidebarFiltros } from "./sidebar-filtros";
import { FavoritoBtn } from "./favorito-btn";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

type SearchParams = {
  categoria?: string;
  genero?: string;
  subcategoria?: string;
  marca?: string;
  color?: string;
  talla?: string;
  precioMin?: string;
  precioMax?: string;
  busqueda?: string;
};

function splitIds(value?: string): string[] {
  return (value || "").split(",").filter(Boolean);
}

export default async function TiendaPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;
  const filtros: FiltrosProducto = {};
  const catIds = splitIds(searchParams.categoria);
  const genIds = splitIds(searchParams.genero);
  const subIds = splitIds(searchParams.subcategoria);
  const marIds = splitIds(searchParams.marca);
  const colIds = splitIds(searchParams.color);
  const talIds = splitIds(searchParams.talla);

  if (catIds.length) filtros.categoriaIds = catIds;
  if (genIds.length) filtros.generoIds = genIds;
  if (subIds.length) filtros.subcategoriaIds = subIds;
  if (marIds.length) filtros.marcaIds = marIds;
  if (colIds.length) filtros.colorIds = colIds;
  if (talIds.length) filtros.tallas = talIds;
  if (searchParams.precioMin) filtros.precioMin = Number(searchParams.precioMin);
  if (searchParams.precioMax) filtros.precioMax = Number(searchParams.precioMax);
  if (searchParams.busqueda) filtros.busqueda = searchParams.busqueda;

  const [productos, usuario] = await Promise.all([
    productoRepository.findMany(filtros),
    obtenerUsuarioActual(),
  ]);

  let favoritoIds = new Set<string>();
  if (usuario) {
    const favs = await prisma.favorito.findMany({
      where: { usuarioId: usuario.id },
      select: { productoId: true },
    });
    favoritoIds = new Set(favs.map((f) => f.productoId));
  }

  return (
    <div className="container">
      <h1 className="mb-2">Catálogo</h1>
      <Suspense fallback={null}>
        <BarraBusqueda />
      </Suspense>
      <div className="tienda-layout">
        <Suspense fallback={null}>
          <SidebarFiltros />
        </Suspense>
        <div className="tienda-grid-area">
          {productos.length === 0 ? (
            <p className="text-muted">No se encontraron productos con esos filtros.</p>
          ) : (
            <div className="grid-productos">
              {productos.map((p) => {
                const pAny = p as any;
                const tallasDisponibles = p.variantes
                  .filter((v) => v.stock > 0)
                  .map((v) => v.talla.valor);
                const sinTallas = pAny.requiereTalla === false;
                return (
                  <div key={p.id} className="card card-producto">
                    <CarruselProducto
                      imagenes={p.imagenes || []}
                      nombre={p.nombre}
                    />
                    <FavoritoBtn productoId={p.id} inicial={favoritoIds.has(p.id)} />
                    <div className="card-body">
                      <div style={{ marginBottom: "0.5rem" }}>
                        <span className="badge">
                          {p.categoria?.nombre ?? "Sin categoría"}
                          {p.subcategoria ? ` · ${p.subcategoria.nombre}` : ""}
                        </span>
                      </div>
                      <h3 className="card-title">{p.nombre}</h3>
                      <p className="card-meta">
                        {[p.marca?.nombre, p.color?.nombre, p.genero?.nombre].filter(Boolean).join(" · ")}
                      </p>
                      {!sinTallas && tallasDisponibles.length > 0 && (
                        <p className="card-meta">Tallas: {tallasDisponibles.join(", ")}</p>
                      )}
                      {sinTallas && (
                        <p className="card-meta">
                          {pAny.stockTotal > 0 ? `En stock: ${pAny.stockTotal}` : "Sin stock"}
                        </p>
                      )}
                      <p className="card-price">${Number(p.precio).toLocaleString("es-CO")}</p>
                      <AgregarAlCarritoBtn productoId={p.id} tallas={sinTallas ? [] : tallasDisponibles} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
