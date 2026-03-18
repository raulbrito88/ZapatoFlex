import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    return (
      <div className="container">
        <p className="text-muted">Debes <Link href="/login">iniciar sesión</Link>.</p>
      </div>
    );
  }

  const pedido = await prisma.pedido.findFirst({
    where: { id, usuarioId: usuario.id },
    include: {
      lineas: {
        include: {
          producto: {
            include: { imagenes: { orderBy: { orden: "asc" }, take: 1 } },
          },
        },
      },
      pago: true,
    },
  });

  if (!pedido) {
    return (
      <div className="container">
        <p>Pedido no encontrado.</p>
        <Link href="/pedidos" className="btn btn-ghost">Volver a mis pedidos</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Pedido #{pedido.id.slice(-8)}</h1>
      <p className="text-muted">
        Estado: <strong>{pedido.estado}</strong> · Pago: {pedido.pago?.estado ?? "N/A"} (contraentrega)
      </p>
      <p className="text-muted">Fecha: {new Date(pedido.createdAt).toLocaleString("es-CO")}</p>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
        {pedido.lineas.map((l) => {
          const img = (l.producto as any).imagenes?.[0]?.url;
          return (
            <li key={l.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }}>
              <img
                src={img || "https://placehold.co/56x56/1a1a20/6366f1?text=Z"}
                alt={l.producto.nombre}
                style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <strong>{l.producto.nombre}</strong>
                {l.talla && <span className="text-muted"> · Talla {l.talla}</span>}
                <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                  {l.cantidad} × ${Number(l.precioUnitario).toLocaleString("es-CO")} = ${Number(l.precioUnitario * l.cantidad).toLocaleString("es-CO")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="carrito-total">Total: ${Number(pedido.total).toLocaleString("es-CO")}</p>
      <Link href="/tienda" className="btn btn-primary">Seguir comprando</Link>
    </div>
  );
}
