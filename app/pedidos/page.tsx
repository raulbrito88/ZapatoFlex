import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { pedidoRepository } from "@/lib/repositories/pedido-repository";

export default async function PedidosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    return (
      <div className="container">
        <p className="text-muted">Debes <Link href="/login">iniciar sesión</Link> para ver tus pedidos.</p>
      </div>
    );
  }

  const pedidos = await pedidoRepository.findByUsuarioId(usuario.id);

  return (
    <div className="container">
      <h1>Mis pedidos</h1>
      {pedidos.length === 0 ? (
        <p className="text-muted">Aún no tienes pedidos. <Link href="/tienda">Ir a la tienda</Link>.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {(pedidos as Array<{ id: string; total: number; estado: string; createdAt: Date }>).map((p) => (
            <li key={p.id} className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ padding: "1rem" }}>
                <Link href={`/pedidos/${p.id}`}>
                  <strong>Pedido #{p.id.slice(-6)}</strong>
                </Link>
                <p className="text-muted">
                  ${Number(p.total).toLocaleString("es-CO")} · {p.estado} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString("es-CO")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
