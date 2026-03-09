import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { obtenerConfiguracionSitio } from "@/lib/configuracion-sitio";

export default async function HomePage() {
  const [usuario, config] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerConfiguracionSitio(),
  ]);

  return (
    <>
      <div className="hero">
        <div className="container">
          <h1>{config.heroTitulo}</h1>
          <p>{config.heroDescripcion}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/tienda" className="btn btn-primary btn-lg">
              Explorar catalogo
            </Link>
            {!usuario && (
              <Link href="/registro" className="btn btn-ghost btn-lg" style={{ border: "1px solid var(--border)" }}>
                Crear cuenta
              </Link>
            )}
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <svg className="hero-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Envio a todo el pais</span>
            </div>
            <div className="hero-feature">
              <svg className="hero-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Compra segura</span>
            </div>
            <div className="hero-feature">
              <svg className="hero-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              <span>Las mejores marcas</span>
            </div>
          </div>
        </div>
      </div>
      <div className="container text-center">
        {usuario && (
          <p className="text-muted">
            Hola, <strong>{usuario.nombre}</strong>.{" "}
            <Link href="/tienda">Explorar tienda</Link> o{" "}
            <Link href="/carrito">ver carrito</Link>.
          </p>
        )}
      </div>
    </>
  );
}
