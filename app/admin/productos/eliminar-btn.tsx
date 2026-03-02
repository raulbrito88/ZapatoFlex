"use client";

import { useState } from "react";
import { eliminarProducto } from "@/app/actions/admin";

export function EliminarProductoBtn({ productoId, nombre }: { productoId: string; nombre: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    setLoading(true);
    await eliminarProducto(productoId);
    setLoading(false);
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={handleClick}
      disabled={loading}
      style={{ color: "var(--error)" }}
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
