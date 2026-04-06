"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function BarraBusqueda() {
  const router = useRouter();
  const params = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get("busqueda") || "");
  const [precioMin, setPrecioMin] = useState(params.get("precioMin") || "");
  const [precioMax, setPrecioMax] = useState(params.get("precioMax") || "");

  const hayFiltros = busqueda.trim() || precioMin.trim() || precioMax.trim();

  function buildUrl(b: string, min: string, max: string) {
    const p = new URLSearchParams(params.toString());
    if (b.trim()) p.set("busqueda", b.trim()); else p.delete("busqueda");
    if (min.trim()) p.set("precioMin", min.trim()); else p.delete("precioMin");
    if (max.trim()) p.set("precioMax", max.trim()); else p.delete("precioMax");
    return `/tienda?${p.toString()}`;
  }

  // Debounce: aplica la búsqueda 400ms después de que el usuario deja de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(buildUrl(busqueda, precioMin, precioMax));
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  function limpiar() {
    setBusqueda("");
    setPrecioMin("");
    setPrecioMax("");
    router.push(buildUrl("", "", ""));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl(busqueda, precioMin, precioMax));
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <div className="search-bar-row">
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre del artículo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="precio-inputs">
            <input
              type="number"
              placeholder="Precio mín."
              value={precioMin}
              min={0}
              onChange={(e) => setPrecioMin(e.target.value)}
              onBlur={() => router.push(buildUrl(busqueda, precioMin, precioMax))}
              className="input-precio"
            />
            <span className="precio-separador">—</span>
            <input
              type="number"
              placeholder="Precio máx."
              value={precioMax}
              min={0}
              onChange={(e) => setPrecioMax(e.target.value)}
              onBlur={() => router.push(buildUrl(busqueda, precioMin, precioMax))}
              className="input-precio"
            />
          </div>
          <button type="submit" className="busqueda-btn" title="Buscar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="busqueda-limpiar"
              title="Limpiar búsqueda y precios"
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
