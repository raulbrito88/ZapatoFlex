import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CatalogoSection } from "./catalogo-section";

export default async function AdminCatalogosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return (
      <div className="container">
        <p className="text-muted">Acceso denegado. Solo administradores.</p>
      </div>
    );
  }

  const [marcas, colores, tallas] = await Promise.all([
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
    prisma.color.findMany({ orderBy: { nombre: "asc" } }),
    prisma.talla.findMany({ orderBy: { valor: "asc" } }),
  ]);

  return (
    <div className="container">
      <h1>Panel administrativo — Catálogos</h1>
      <p className="text-muted mb-2">
        <Link href="/admin/productos">Ir a productos</Link> · <Link href="/admin/pedidos">Ver pedidos</Link>
      </p>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        <CatalogoSection
          titulo="Marcas"
          items={marcas.map((m) => ({ id: m.id, label: m.nombre }))}
          tipo="marca"
          placeholder="Ej: Nike"
          inputName="nombre"
        />
        <CatalogoSection
          titulo="Colores"
          items={colores.map((c) => ({ id: c.id, label: c.nombre }))}
          tipo="color"
          placeholder="Ej: Rojo"
          inputName="nombre"
        />
        <CatalogoSection
          titulo="Tallas"
          items={tallas.map((t) => ({ id: t.id, label: t.valor }))}
          tipo="talla"
          placeholder="Ej: 45"
          inputName="valor"
        />
      </div>
    </div>
  );
}
