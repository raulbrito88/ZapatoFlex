"use client";

import { useState, useRef } from "react";
import { crearProducto } from "@/app/actions/admin";

type CatalogoItem = { id: string; label: string };
type SubcategoriaItem = { id: string; label: string; categoriaId: string };

export function FormProducto({
  categorias,
  subcategorias,
  generos,
  marcas,
  colores,
  tallas,
}: {
  categorias: CatalogoItem[];
  subcategorias: SubcategoriaItem[];
  generos: CatalogoItem[];
  marcas: CatalogoItem[];
  colores: CatalogoItem[];
  tallas: CatalogoItem[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [stockPorTalla, setStockPorTalla] = useState<Record<string, number>>({});
  const [requiereTalla, setRequiereTalla] = useState(true);
  const [stockTotal, setStockTotal] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setShowMenu(false);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImagenes((prev) => [...prev, data.url]);
      else setError(data.error || "Error al subir imagen");
    } catch {
      setError("Error al subir imagen");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addUrl() {
    if (urlValue.trim()) {
      setImagenes((prev) => [...prev, urlValue.trim()]);
      setUrlValue("");
      setShowUrlInput(false);
    }
  }

  function removeImage(index: number) {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStockChange(tallaId: string, value: string) {
    setStockPorTalla((prev) => ({ ...prev, [tallaId]: Number(value) || 0 }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("imagenes", JSON.stringify(imagenes));
    formData.set("requiereTalla", String(requiereTalla));
    formData.set("stockTotal", String(requiereTalla ? 0 : stockTotal));
    const variantes = requiereTalla
      ? tallas.map((t) => ({ tallaId: t.id, stock: stockPorTalla[t.id] || 0 }))
      : [];
    formData.set("variantes", JSON.stringify(variantes));
    const res = await crearProducto(null, formData);
    setLoading(false);
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setImagenes([]);
      setStockPorTalla({});
      setStockTotal(0);
      setCategoriaId("");
      setSubcategoriaId("");
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Nombre</label>
        <input name="nombre" required />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea name="descripcion" rows={2} />
      </div>
      <div className="form-group">
        <label>Precio</label>
        <input name="precio" type="number" step="0.01" min="0" required />
      </div>
      <div className="form-group">
        <label>Categoría</label>
        <select
          name="categoriaId"
          required
          value={categoriaId}
          onChange={(e) => { setCategoriaId(e.target.value); setSubcategoriaId(""); }}
        >
          <option value="">Seleccionar categoría...</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Subcategoría</label>
        <select
          name="subcategoriaId"
          value={subcategoriaId}
          onChange={(e) => setSubcategoriaId(e.target.value)}
          disabled={!categoriaId}
        >
          <option value="">Sin subcategoría</option>
          {subcategorias
            .filter((s) => s.categoriaId === categoriaId)
            .map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
        </select>
      </div>
      <div className="form-group">
        <label>Marca</label>
        <select name="marcaId">
          <option value="">Sin especificar</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Color</label>
        <select name="colorId">
          <option value="">Sin especificar</option>
          {colores.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Género</label>
        <select name="generoId">
          <option value="">Sin especificar</option>
          {generos.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Requiere talla */}
      <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="checkbox"
          id="requiereTalla"
          checked={requiereTalla}
          onChange={(e) => setRequiereTalla(e.target.checked)}
          style={{ width: "auto" }}
        />
        <label htmlFor="requiereTalla" style={{ marginBottom: 0, cursor: "pointer" }}>
          Requiere selección de talla
        </label>
      </div>

      {/* Stock por talla o stock total */}
      {requiereTalla ? (
        <div className="form-group">
          <label>Stock por talla</label>
          {tallas.length === 0 ? (
            <p className="text-muted">No hay tallas registradas. Crea tallas en Catálogos.</p>
          ) : (
            <div className="stock-talla-grid">
              {tallas.map((t) => (
                <div key={t.id} className="stock-talla-item">
                  <span className="stock-talla-label">{t.label}</span>
                  <input
                    type="number"
                    min="0"
                    value={stockPorTalla[t.id] || 0}
                    onChange={(e) => handleStockChange(t.id, e.target.value)}
                    className="stock-talla-input"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="form-group">
          <label>Stock disponible</label>
          <input
            type="number"
            min="0"
            value={stockTotal}
            onChange={(e) => setStockTotal(Number(e.target.value) || 0)}
          />
        </div>
      )}

      {/* Imágenes dinámicas */}
      <div className="form-group">
        <label>Imágenes</label>
        {imagenes.length > 0 && (
          <div className="imagenes-lista">
            {imagenes.map((url, i) => (
              <div key={i} className="imagen-item">
                <img src={url} alt={`Imagen ${i + 1}`} className="imagen-preview" />
                <span className="imagen-url">{url.length > 40 ? url.slice(0, 40) + "..." : url}</span>
                <button type="button" className="btn-remove-img" onClick={() => removeImage(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="imagen-add-wrapper">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { setShowMenu(!showMenu); setShowUrlInput(false); }}
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "+ Agregar imagen"}
          </button>
          {showMenu && (
            <div className="imagen-menu">
              <button
                type="button"
                className="imagen-menu-option"
                onClick={() => { fileRef.current?.click(); setShowMenu(false); }}
              >
                Desde archivo
              </button>
              <button
                type="button"
                className="imagen-menu-option"
                onClick={() => { setShowUrlInput(true); setShowMenu(false); }}
              >
                Por URL
              </button>
            </div>
          )}
        </div>

        {showUrlInput && (
          <div className="imagen-url-input">
            <input
              type="url"
              placeholder="https://..."
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={addUrl}>
              Agregar
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowUrlInput(false)}>
              Cancelar
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Guardando..." : "Agregar producto"}
      </button>
    </form>
  );
}
