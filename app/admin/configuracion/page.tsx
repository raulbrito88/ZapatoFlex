import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { obtenerConfiguracionSitio } from "@/lib/configuracion-sitio";
import { FormConfiguracion } from "./form-configuracion";

export default async function AdminConfiguracionPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return (
      <div className="container">
        <p className="text-muted">Acceso denegado. Solo administradores.</p>
      </div>
    );
  }

  const config = await obtenerConfiguracionSitio();

  return (
    <div className="container">
      <h1>Configuración del sitio</h1>
      <p className="text-muted mb-2">
        <Link href="/admin/productos">Ir a productos</Link> ·{" "}
        <Link href="/admin/catalogos">Gestionar catálogos</Link>
      </p>

      <div className="card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
        <FormConfiguracion config={config} />
      </div>
    </div>
  );
}

