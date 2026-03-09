"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type CategoriaOption = { id: string; nombre: string };
type GeneroOption = { id: string; nombre: string };

const TALLAS = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export function BarraBusqueda() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") || "");
  const categoriaActual = searchParams.get("categoria") || "";
  const generoActual = searchParams.get("genero") || "";
  const tallaActual = searchParams.get("talla") || "";
  const [marca, setMarca] = useState(searchParams.get("marca") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [precioMin, setPrecioMin] = useState(searchParams.get("precioMin") || "");
  const [precioMax, setPrecioMax] = useState(searchParams.get("precioMax") || "");
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [generos, setGeneros] = useState<GeneroOption[]>([]);

  useEffect(() => {
    async function cargarFiltros() {
      try {
        const [resCat, resGen] = await Promise.all([
          fetch("/api/categorias"),
          fetch("/api/generos"),
        ]);
        if (resCat.ok) {
          setCategorias(await resCat.json());
        }
        if (resGen.ok) {
          setGeneros(await resGen.json());
        }
      } catch {
        // silencio: si falla, simplemente no se muestran filtros dinámicos
      }
    }
    cargarFiltros();
  }, []);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      busqueda,
      categoria: categoriaActual,
      genero: generoActual,
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

  function handleGenero(id: string) {
    router.push(buildUrl({ genero: id }));
  }

  function handleTalla(t: string) {
    router.push(buildUrl({ talla: tallaActual === t ? "" : t }));
  }

  function handleFiltroTexto() {
    router.push(buildUrl({}));
  }

  const hayFiltrosActivos =
    busqueda ||
    categoriaActual ||
    generoActual ||
    tallaActual ||
    marca ||
    color ||
    precioMin ||
    precioMax;

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
        <button
          type="button"
          className={`filter-chip${categoriaActual === "" ? " active" : ""}`}
          onClick={() => handleCategoria("")}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`filter-chip${categoriaActual === cat.id ? " active" : ""}`}
            onClick={() => handleCategoria(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Género */}
      <div className="search-filters" style={{ marginTop: "0.5rem" }}>
        <span className="filter-label">Género:</span>
        <button
          type="button"
          className={`filter-chip filter-chip-sm${generoActual === "" ? " active" : ""}`}
          onClick={() => handleGenero("")}
        >
          Todos
        </button>
        {generos.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`filter-chip filter-chip-sm${generoActual === g.id ? " active" : ""}`}
            onClick={() => handleGenero(g.id)}
          >
            {g.nombre}
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
