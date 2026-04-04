"use client";

import { useEffect, useRef, useState } from "react";

export type Opcion = { id: string; nombre: string };

interface Props {
  label: string;
  opciones: Opcion[];
  valorIds: string[];
  onChange: (nuevosIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  label,
  opciones,
  valorIds,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpcion(opcion: Opcion) {
    if (disabled) return;
    const existe = valorIds.includes(opcion.id);
    onChange(existe ? valorIds.filter((id) => id !== opcion.id) : [...valorIds, opcion.id]);
  }

  function quitarTag(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(valorIds.filter((v) => v !== id));
  }

  const seleccionados = opciones.filter((o) => valorIds.includes(o.id));

  return (
    <div className={`ms-wrapper${disabled ? " ms-disabled" : ""}${abierto ? " ms-wrapper-open" : ""}`} ref={ref}>
      <span className="ms-label">{label}</span>
      <div
        className={`ms-control${abierto ? " ms-open" : ""}`}
        onClick={() => !disabled && setAbierto((v) => !v)}
      >
        {seleccionados.length === 0 ? (
          <span className="ms-placeholder">{placeholder}</span>
        ) : (
          <div className="ms-tags">
            {seleccionados.map((s) => (
              <span key={s.id} className="ms-tag">
                {s.nombre}
                <button
                  type="button"
                  className="ms-tag-remove"
                  onClick={(e) => quitarTag(s.id, e)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <span className="ms-arrow">{abierto ? "▲" : "▼"}</span>
      </div>

      {abierto && !disabled && opciones.length > 0 && (
        <div className="ms-dropdown">
          {opciones.map((opcion) => {
            const checked = valorIds.includes(opcion.id);
            return (
              <div
                key={opcion.id}
                className={`ms-option${checked ? " ms-option-checked" : ""}`}
                onClick={() => toggleOpcion(opcion)}
              >
                <input type="checkbox" checked={checked} readOnly />
                <span>{opcion.nombre}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
