import { Suspense } from "react";
import { productoRepository } from "@/lib/repositories/producto-repository";
import { FiltrosProducto } from "@/lib/repositories/producto-repository";
import { AgregarAlCarritoBtn } from "./agregar-carrito";
import { CarruselProducto } from "./carrusel-producto";
import { BarraBusqueda } from "./barra-busqueda";

type SearchParams = {
  categoria?: string;
  marca?: string;
  color?: string;
  talla?: string;
  precioMin?: string;
  precioMax?: string;
  busqueda?: string;
};

const BADGE_CLASS: Record<string, string> = {
  DEPORTIVO: "badge badge-deportivo",
  CASUAL: "badge badge-casual",
  FORMAL: "badge badge-formal",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filtros: FiltrosProducto = {};
  if (searchParams.categoria) filtros.categoria = searchParams.categoria as "DEPORTIVO" | "CASUAL" | "FORMAL";
  if (searchParams.marca) filtros.marca = searchParams.marca;
  if (searchParams.color) filtros.color = searchParams.color;
  if (searchParams.talla) filtros.talla = searchParams.talla;
  if (searchParams.precioMin) filtros.precioMin = Number(searchParams.precioMin);
  if (searchParams.precioMax) filtros.precioMax = Number(searchParams.precioMax);
  if (searchParams.busqueda) filtros.busqueda = searchParams.busqueda;

  const productos = await productoRepository.findMany(filtros);

  return (
    <div className="container">
      <h1 className="mb-2">Catalogo</h1>
      <Suspense fallback={null}>
        <BarraBusqueda />
      </Suspense>
      {productos.length === 0 ? (
        <p className="text-muted">No se encontraron productos con esos filtros.</p>
      ) : (
        <div className="grid-productos">
          {productos.map((p) => {
            const tallasDisponibles = p.variantes
              .filter((v) => v.stock > 0)
              .map((v) => v.talla.valor);
            return (
              <div key={p.id} className="card">
                <CarruselProducto
                  imagenes={p.imagenes || []}
                  nombre={p.nombre}
                />
                <div className="card-body">
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span className={BADGE_CLASS[p.categoria] || "badge"}>{p.categoria}</span>
                  </div>
                  <h3 className="card-title">{p.nombre}</h3>
                  <p className="card-meta">{p.marca.nombre} · {p.color.nombre}</p>
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
