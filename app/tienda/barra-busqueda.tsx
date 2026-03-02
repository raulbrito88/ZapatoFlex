"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CATEGORIAS = [
  { value: "", label: "Todos" },
  { value: "DEPORTIVO", label: "Deportivos" },
  { value: "CASUAL", label: "Casuales" },
  { value: "FORMAL", label: "Formales" },
];

const TALLAS = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export function BarraBusqueda() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") || "");
  const categoriaActual = searchParams.get("categoria") || "";
  const tallaActual = searchParams.get("talla") || "";
  const [marca, setMarca] = useState(searchParams.get("marca") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [precioMin, setPrecioMin] = useState(searchParams.get("precioMin") || "");
  const [precioMax, setPrecioMax] = useState(searchParams.get("precioMax") || "");

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      busqueda,
      categoria: categoriaActual,
      talla: tallaActual,
      marca,
      color,
      precioMin,
      precioMax,
      ...overrides,
    };
    for (const [k, v] of Object.entries(values)) {
      if (v) params.set(k, v);
    }
    return `/tienda?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({}));
  }

  function handleCategoria(cat: string) {
    router.push(buildUrl({ categoria: cat }));
  }

  function handleTalla(t: string) {
    router.push(buildUrl({ talla: tallaActual === t ? "" : t }));
  }

  function handleFiltroTexto() {
    router.push(buildUrl({}));
  }

  const hayFiltrosActivos = busqueda || categoriaActual || tallaActual || marca || color || precioMin || precioMax;

  function limpiarFiltros() {
    setBusqueda("");
    setMarca("");
    setColor("");
    setPrecioMin("");
    setPrecioMax("");
    router.push("/tienda");
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, marca o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </form>

      {/* Categorías */}
      <div className="search-filters">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.value}
            type="button"
            className={`filter-chip${categoriaActual === cat.value ? " active" : ""}`}
            onClick={() => handleCategoria(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tallas */}
      <div className="search-filters" style={{ marginTop: "0.5rem" }}>
        <span className="filter-label">Talla:</span>
        {TALLAS.map((t) => (
          <button
            key={t}
            type="button"
            className={`filter-chip filter-chip-sm${tallaActual === t ? " active" : ""}`}
            onClick={() => handleTalla(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Marca, Color, Precio */}
      <div className="search-filters" style={{ marginTop: "0.5rem" }}>
        <div className="search-text-filter">
          <span>Marca:</span>
          <input
            type="text"
            placeholder="Ej: Nike"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            onBlur={handleFiltroTexto}
            onKeyDown={(e) => { if (e.key === "Enter") handleFiltroTexto(); }}
          />
        </div>
        <div className="search-text-filter">
          <span>Color:</span>
          <input
            type="text"
            placeholder="Ej: Negro"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            onBlur={handleFiltroTexto}
            onKeyDown={(e) => { if (e.key === "Enter") handleFiltroTexto(); }}
          />
        </div>
        <div className="search-price-filters">
          <span>Precio:</span>
          <input
            type="number"
            placeholder="Min"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            onBlur={handleFiltroTexto}
            onKeyDown={(e) => { if (e.key === "Enter") handleFiltroTexto(); }}
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            onBlur={handleFiltroTexto}
            onKeyDown={(e) => { if (e.key === "Enter") handleFiltroTexto(); }}
            min="0"
          />
        </div>
        {hayFiltrosActivos && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={limpiarFiltros}
            style={{ whiteSpace: "nowrap" }}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
