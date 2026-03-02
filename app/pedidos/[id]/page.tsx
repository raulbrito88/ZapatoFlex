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
    include: { lineas: { include: { producto: true } }, pago: true },
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
        {pedido.lineas.map((l) => (
          <li key={l.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
            {l.producto.nombre}{l.talla ? ` (Talla ${l.talla})` : ""} × {l.cantidad} — ${Number(l.precioUnitario * l.cantidad).toLocaleString("es-CO")}
          </li>
        ))}
      </ul>
      <p className="carrito-total">Total: ${Number(pedido.total).toLocaleString("es-CO")}</p>
      <Link href="/tienda" className="btn btn-primary">Seguir comprando</Link>
    </div>
  );
}
