"use client";

import { useState } from "react";
import {
  crearSubcategoria,
  eliminarSubcategoria,
} from "@/app/actions/catalogos";

type SubcategoriaItem = {
  id: string;
  nombre: string;
  categoriaNombre: string;
};

type CategoriaOption = { id: string; nombre: string };

export function SubcategoriaSection({
  subcategorias,
  categorias,
}: {
  subcategorias: SubcategoriaItem[];
  categorias: CategoriaOption[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const fd = new FormData(form);
    const res = await crearSubcategoria(null, fd);
    setLoading(false);
    if (res?.error) setError(res.error);
    else form.reset();
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await eliminarSubcategoria(id);
    if (res?.error) setError(res.error);
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h2 style={{ marginTop: 0 }}>Subcategorías</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {subcategorias.map((s) => (
          <span
            key={s.id}
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            {s.nombre} —{" "}
            <span style={{ fontWeight: 400 }}>{s.categoriaNombre}</span>
            <button
              type="button"
              onClick={() => handleDelete(s.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                padding: 0,
                fontSize: "0.8em",
              }}
              title="Eliminar"
            >
              ✕
            </button>
          </span>
        ))}
        {subcategorias.length === 0 && (
          <span className="text-muted">Sin subcategorías</span>
        )}
      </div>

      <form
        onSubmit={handleAdd}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select name="categoriaId" required style={{ flex: 1 }}>
            <option value="">Seleccionar categoría...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input
            name="nombre"
            placeholder="Ej: Deportivo, Casual..."
            required
            style={{ flex: 1 }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={loading}
        >
          {loading ? "..." : "Agregar subcategoría"}
        </button>
      </form>

      {error && (
        <p className="form-error" style={{ marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}

