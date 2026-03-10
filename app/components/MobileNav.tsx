"use client";

import { useState } from "react";
import Link from "next/link";
import { cerrarSesion } from "@/app/actions/auth";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  usuario: { nombre: string; rol: string } | null;
  cantidadCarrito: number;
};

export function MobileNav({ usuario, cantidadCarrito }: Props) {
  const [abierto, setAbierto] = useState(false);

  function cerrar() {
    setAbierto(false);
  }

  return (
    <div className="mobile-nav-wrapper">
      <button
        type="button"
        className="hamburger-btn"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
      >
        {abierto ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
        {cantidadCarrito > 0 && !abierto && (
          <span className="carrito-badge" style={{ position: "absolute", top: 2, right: 2, fontSize: "0.6rem", minWidth: 14, height: 14 }}>
            {cantidadCarrito}
          </span>
        )}
      </button>

      {abierto && (
        <>
          <div className="mobile-overlay" onClick={cerrar} />
          <nav className="mobile-menu">
            <ThemeToggle />
            <Link href="/tienda" onClick={cerrar}>Tienda</Link>
            <Link href="/carrito" onClick={cerrar} className="nav-carrito">
              Carrito
              {cantidadCarrito > 0 && (
                <span className="carrito-badge">{cantidadCarrito}</span>
              )}
            </Link>
            <Link href="/favoritos" onClick={cerrar}>Favoritos</Link>
            <Link href="/pedidos" onClick={cerrar}>Mis pedidos</Link>
            {usuario ? (
              <>
                <span className="user-name">{usuario.nombre}</span>
                {usuario.rol === "ADMIN" && (
                  <>
                    <Link href="/admin/productos" onClick={cerrar}>Admin</Link>
                    <Link href="/admin/configuracion" onClick={cerrar}>Configurar sitio</Link>
                  </>
                )}
                <form action={cerrarSesion}>
                  <button type="submit" className="btn btn-ghost btn-sm">Cerrar sesión</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={cerrar}>Entrar</Link>
                <Link href="/registro" onClick={cerrar}>Registrarse</Link>
              </>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
