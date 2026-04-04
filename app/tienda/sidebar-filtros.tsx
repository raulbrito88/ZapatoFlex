"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MultiSelect, type Opcion } from "./multi-select";

function splitParam(params: URLSearchParams, key: string): string[] {
  return (params.get(key) || "").split(",").filter(Boolean);
}

function qs(ctx: Record<string, string[]>): string {
  return Object.entries(ctx)
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => `${k}=${v.join(",")}`)
    .join("&");
}

export function SidebarFiltros() {
  const router = useRouter();
  const params = useSearchParams();

  const catIds = splitParam(params, "categoria");
  const genIds = splitParam(params, "genero");
  const subIds = splitParam(params, "subcategoria");
  const marIds = splitParam(params, "marca");
  const colIds = splitParam(params, "color");
  const talIds = splitParam(params, "talla");

  const [categorias,    setCategorias]    = useState<Opcion[]>([]);
  const [generos,       setGeneros]       = useState<Opcion[]>([]);
  const [subcategorias, setSubcategorias] = useState<Opcion[]>([]);
  const [marcas,        setMarcas]        = useState<Opcion[]>([]);
  const [colores,       setColores]       = useState<Opcion[]>([]);
  const [tallas,        setTallas]        = useState<Opcion[]>([]);
  const [panelAbierto,  setPanelAbierto]  = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categorias").then((r) => r.ok ? r.json() : []),
      fetch(`/api/generos?${qs({ categoriaIds: catIds })}`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/subcategorias?${qs({ categoriaIds: catIds })}`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/marcas?${qs({ categoriaIds: catIds, generoIds: genIds, subcategoriaIds: subIds })}`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/colores?${qs({ categoriaIds: catIds, generoIds: genIds, subcategoriaIds: subIds, marcaIds: marIds })}`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/tallas?${qs({ categoriaIds: catIds, generoIds: genIds, subcategoriaIds: subIds, marcaIds: marIds, colorIds: colIds })}`).then((r) => r.ok ? r.json() : []),
    ]).then(([cats, gens, subs, mars, cols, tals]) => {
      setCategorias(cats);
      setGeneros(gens);
      setSubcategorias(subs);
      setMarcas(mars);
      setColores(cols);
      setTallas(tals);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const totalActivos = [catIds, genIds, subIds, marIds, colIds, talIds]
    .filter((a) => a.length > 0).length;

  function push(key: string, ids: string[]) {
    const p = new URLSearchParams(params.toString());
    if (ids.length) p.set(key, ids.join(","));
    else p.delete(key);
    router.push(`/tienda?${p.toString()}`);
  }

  function limpiarFiltros() {
    const p = new URLSearchParams();
    const busqueda = params.get("busqueda");
    if (busqueda) p.set("busqueda", busqueda);
    router.push(`/tienda?${p.toString()}`);
  }

  return (
    <aside className="tienda-sidebar">
      {/* Botón visible solo en mobile */}
      <button
        type="button"
        className={`sidebar-mobile-toggle${totalActivos > 0 ? " tiene-filtros" : ""}`}
        onClick={() => setPanelAbierto((v) => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        Filtros{totalActivos > 0 ? ` (${totalActivos})` : ""}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="14" height="14"
          style={{ marginLeft: "auto", transform: panelAbierto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Panel: siempre visible en desktop, controlado por toggle en mobile */}
      <div className={`sidebar-filtros-panel${panelAbierto ? " abierto" : ""}`}>
        <div className="sidebar-filtros-header">
          <span className="sidebar-filtros-titulo">Filtros</span>
          {totalActivos > 0 && (
            <button type="button" className="sidebar-filtros-limpiar" onClick={limpiarFiltros}>
              Limpiar todo
            </button>
          )}
        </div>

        <div className="sidebar-filtros-body">
          <MultiSelect
            label="Categoría"
            opciones={categorias}
            valorIds={catIds}
            onChange={(ids) => push("categoria", ids)}
            placeholder="Todas las categorías"
          />
          <MultiSelect
            label="Género"
            opciones={generos}
            valorIds={genIds}
            onChange={(ids) => push("genero", ids)}
            placeholder={generos.length === 0 ? "No disponible" : "Todos los géneros"}
            disabled={generos.length === 0}
          />
          <MultiSelect
            label="Subcategoría"
            opciones={subcategorias}
            valorIds={subIds}
            onChange={(ids) => push("subcategoria", ids)}
            placeholder={subcategorias.length === 0 ? "No disponible" : "Todas las subcategorías"}
            disabled={subcategorias.length === 0}
          />
          <MultiSelect
            label="Marca"
            opciones={marcas}
            valorIds={marIds}
            onChange={(ids) => push("marca", ids)}
            placeholder={marcas.length === 0 ? "No disponible" : "Todas las marcas"}
            disabled={marcas.length === 0}
          />
          <MultiSelect
            label="Color"
            opciones={colores}
            valorIds={colIds}
            onChange={(ids) => push("color", ids)}
            placeholder={colores.length === 0 ? "No disponible" : "Todos los colores"}
            disabled={colores.length === 0}
          />
          <MultiSelect
            label="Talla"
            opciones={tallas}
            valorIds={talIds}
            onChange={(ids) => push("talla", ids)}
            placeholder={tallas.length === 0 ? "No disponible" : "Todas las tallas"}
            disabled={tallas.length === 0}
          />
        </div>
      </div>
    </aside>
  );
}
