import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { obtenerConfiguracionSitio } from "@/lib/configuracion-sitio";
import { CerrarSesionBtn } from "./CerrarSesionBtn";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const [usuario, config] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerConfiguracionSitio(),
  ]);

  let cantidadCarrito = 0;
  if (usuario) {
    const carrito = await prisma.carrito.findUnique({
      where: { usuarioId: usuario.id },
      include: { items: { select: { cantidad: true } } },
    });
    if (carrito) {
      cantidadCarrito = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
    }
  }

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="logo">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="logo-img" />
          ) : (
            <>
              <svg
                className="logo-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 18c0-1 1-3 3-4 2-1 5-1.5 7-1.5s5 .5 7 1.5c2 1 3 3 3 4v1H2v-1z" />
                <path d="M4 14c1-3 3-6 5.5-7.5C12 5 15 5 17 6c1.5.8 2.5 2 3 3.5" />
                <path d="M7 14.5c1-1.5 3-2.5 5-2.5" />
              </svg>
              <span className="logo-text">Zapato<strong>Flex</strong></span>
            </>
          )}
        </Link>
        <nav className="nav">
          <ThemeToggle />
          <Link href="/tienda">Tienda</Link>
          <Link href="/carrito" className="nav-carrito">
            Carrito
            {cantidadCarrito > 0 && (
              <span className="carrito-badge">{cantidadCarrito}</span>
            )}
          </Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link href="/pedidos">Mis pedidos</Link>
          {usuario ? (
            <>
              <Link href="/perfil" className="user-name">{usuario.nombre}</Link>
              {usuario.rol === "ADMIN" && (
                <>
                  <Link href="/admin/productos">Admin</Link>
                  <Link href="/admin/reportes">Reportes</Link>
                  <Link href="/admin/configuracion">Configurar sitio</Link>
                </>
              )}
              <CerrarSesionBtn />
            </>
          ) : (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/registro">Registrarse</Link>
            </>
          )}
        </nav>
        <MobileNav
          usuario={usuario ? { nombre: usuario.nombre, rol: usuario.rol } : null}
          cantidadCarrito={cantidadCarrito}
        />
      </div>
    </header>
  );
}
