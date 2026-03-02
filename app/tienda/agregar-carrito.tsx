"use client";

import { useState } from "react";
import { agregarAlCarrito } from "@/app/actions/carrito";

export function AgregarAlCarritoBtn({ productoId, tallas }: { productoId: string; tallas: string[] }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");

  async function handleClick() {
    if (tallas.length > 0 && !tallaSeleccionada) {
      setMsg("Selecciona una talla");
      return;
    }
    setLoading(true);
    setMsg(null);
    const res = await agregarAlCarrito(productoId, 1, tallaSeleccionada || undefined);
    setLoading(false);
    if (res.error) setMsg(res.error);
    else setMsg("Añadido al carrito");
  }

  return (
    <div className="mt-1">
      {tallas.length > 0 && (
        <div className="talla-selector">
          <span className="talla-label">Talla:</span>
          <div className="talla-chips">
            {tallas.map((t) => (
              <button
                key={t}
                type="button"
                className={`talla-chip${tallaSeleccionada === t ? " active" : ""}`}
                onClick={() => setTallaSeleccionada(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={handleClick}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "..." : "Agregar al carrito"}
      </button>
      {msg && <span className="form-error" style={{ display: "block", marginTop: 4 }}>{msg}</span>}
    </div>
  );
}
