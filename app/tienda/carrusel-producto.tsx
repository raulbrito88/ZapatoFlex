"use client";

import { useState } from "react";

const PLACEHOLDER = "https://placehold.co/300x300/1a1a20/6366f1?text=Zapato";

export function CarruselProducto({
  imagenes,
  nombre,
}: {
  imagenes: { url: string }[];
  nombre: string;
}) {
  const [index, setIndex] = useState(0);
  const urls = imagenes.length > 0 ? imagenes.map((i) => i.url) : [PLACEHOLDER];
  const total = urls.length;

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + total) % total);
  }

  function next(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % total);
  }

  return (
    <div className="carrusel">
      <img src={urls[index]} alt={nombre} className="card-img" />
      {total > 1 && (
        <>
          <button className="carrusel-btn carrusel-btn-left" onClick={prev} aria-label="Anterior">
            ‹
          </button>
          <button className="carrusel-btn carrusel-btn-right" onClick={next} aria-label="Siguiente">
            ›
          </button>
          <div className="carrusel-dots">
            {urls.map((_, i) => (
              <span
                key={i}
                className={`carrusel-dot${i === index ? " active" : ""}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(i); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
