"use client";

import { useState, useTransition } from "react";
import { toggleFavorito } from "@/app/actions/favoritos";

export function FavoritoBtn({
  productoId,
  inicial,
}: {
  productoId: string;
  inicial: boolean;
}) {
  const [esFavorito, setEsFavorito] = useState(inicial);
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nuevo = !esFavorito;
    setEsFavorito(nuevo); // optimistic
    startTransition(async () => {
      const res = await toggleFavorito(productoId);
      if (res?.error) setEsFavorito(!nuevo); // revert on error
    });
  }

  return (
    <button
      type="button"
      className={`favorito-btn${esFavorito ? " activo" : ""}`}
      onClick={handleClick}
      disabled={pending}
      aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
      title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <svg
        viewBox="0 0 24 24"
        fill={esFavorito ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
