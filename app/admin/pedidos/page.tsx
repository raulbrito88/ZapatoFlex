import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EstadoSelector } from "./estado-selector";

export default async function AdminPedidosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return (
      <div className="container">
        <p className="text-muted">Acceso denegado.</p>
      </div>
    );
  }

  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usuario: true,
      pago: true,
      lineas: {
        include: {
          producto: {
            include: { imagenes: { orderBy: { orden: "asc" }, take: 1 } },
          },
        },
      },
    },
  });

  return (
    <div className="container">
      <h1>Panel administrativo — Pedidos</h1>
      <p className="text-muted mb-2">
        <Link href="/admin/productos">Gestionar productos</Link>
      </p>
      {pedidos.length === 0 ? (
        <p className="text-muted">No hay pedidos aún.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pedidos.map((p) => (
            <li key={p.id} className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <strong>Pedido #{p.id.slice(-8)}</strong>
                    <span className="text-muted"> — {p.usuario.nombre} ({p.usuario.email})</span>
                    <br />
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                      ${Number(p.total).toLocaleString("es-CO")} · {new Date(p.createdAt).toLocaleString("es-CO")}
                    </span>
                  </div>
                  <EstadoSelector
                    pedidoId={p.id}
                    estadoPedido={p.estado}
                    estadoPago={p.pago?.estado}
                  />
                </div>

                <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {p.lineas.map((l) => {
                    const img = (l.producto as any).imagenes?.[0]?.url;
                    return (
                      <li key={l.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <img
                          src={img || "https://placehold.co/40x40/1a1a20/6366f1?text=Z"}
                          alt={l.producto.nombre}
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "0.9rem" }}>
                          {l.producto.nombre}{l.talla ? ` · Talla ${l.talla}` : ""} × {l.cantidad}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
