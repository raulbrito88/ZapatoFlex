"use client";

import { useState } from "react";
import { actualizarCantidad, eliminarDelCarrito } from "@/app/actions/carrito";

export function CarritoActions({
  lineaId,
  cantidad,
}: {
  lineaId: string;
  cantidad: number;
}) {
  const [cant, setCant] = useState(cantidad);
  const [loading, setLoading] = useState(false);

  async function update(q: number) {
    if (q < 1) return;
    setLoading(true);
    await actualizarCantidad(lineaId, q);
    setCant(q);
    setLoading(false);
  }

  async function remove() {
    setLoading(true);
    await eliminarDelCarrito(lineaId);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => update(cant - 1)}
        disabled={loading || cant <= 1}
      >
        −
      </button>
      <span style={{ minWidth: 24, textAlign: "center" }}>{cant}</span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => update(cant + 1)}
        disabled={loading}
      >
        +
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={remove}
        disabled={loading}
        style={{ color: "var(--error)" }}
      >
        Quitar
      </button>
    </div>
  );
}
