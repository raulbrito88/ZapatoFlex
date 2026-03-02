import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    include: { usuario: true, lineas: { include: { producto: true } } },
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
                <strong>Pedido #{p.id.slice(-8)}</strong> — {p.usuario.nombre} ({p.usuario.email})
                <br />
                <span className="text-muted">
                  ${Number(p.total).toLocaleString("es-CO")} · {p.estado} · {new Date(p.createdAt).toLocaleString("es-CO")}
                </span>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                  {p.lineas.map((l) => (
                    <li key={l.id}>{l.producto.nombre} × {l.cantidad}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
