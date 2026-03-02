"use client";

import { useState } from "react";
import {
  crearMarca, eliminarMarca,
  crearColor, eliminarColor,
  crearTalla, eliminarTalla,
} from "@/app/actions/catalogos";

type Item = { id: string; label: string };

const actions = {
  marca: { crear: crearMarca, eliminar: eliminarMarca },
  color: { crear: crearColor, eliminar: eliminarColor },
  talla: { crear: crearTalla, eliminar: eliminarTalla },
};

export function CatalogoSection({
  titulo,
  items,
  tipo,
  placeholder,
  inputName,
}: {
  titulo: string;
  items: Item[];
  tipo: "marca" | "color" | "talla";
  placeholder: string;
  inputName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const fd = new FormData(form);
    const res = await actions[tipo].crear(null, fd);
    setLoading(false);
    if (res?.error) setError(res.error);
    else form.reset();
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await actions[tipo].eliminar(id);
    if (res?.error) setError(res.error);
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h2 style={{ marginTop: 0 }}>{titulo}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {items.map((item) => (
          <span key={item.id} className="badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            {item.label}
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, fontSize: "0.8em" }}
              title="Eliminar"
            >
              ✕
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-muted">Sin registros</span>}
      </div>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input name={inputName} placeholder={placeholder} required style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? "..." : "Agregar"}
        </button>
      </form>
      {error && <p className="form-error" style={{ marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
