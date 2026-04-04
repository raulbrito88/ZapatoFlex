"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BarraBusqueda() {
  const router = useRouter();
  const params = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get("busqueda") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params.toString());
    if (busqueda.trim()) p.set("busqueda", busqueda.trim());
    else p.delete("busqueda");
    router.push(`/tienda?${p.toString()}`);
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <div className="search-input-wrapper" style={{ marginBottom: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
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
    </div>
  );
}
