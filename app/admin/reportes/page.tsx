import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ReportesPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return <div className="container"><p className="text-muted">Acceso denegado.</p></div>;
  }

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);

  const [
    totalPedidos,
    pedidosMes,
    pedidosMesAnterior,
    totalUsuarios,
    topProductos,
    pedidosPorEstado,
    ultimosPedidos,
  ] = await Promise.all([
    prisma.pedido.aggregate({ _sum: { total: true }, _count: true }),
    prisma.pedido.aggregate({
      where: { createdAt: { gte: inicioMes } },
      _sum: { total: true }, _count: true,
    }),
    prisma.pedido.aggregate({
      where: { createdAt: { gte: inicioMesAnterior, lt: inicioMes } },
      _sum: { total: true }, _count: true,
    }),
    prisma.usuario.count({ where: { rol: "USUARIO" } }),
    prisma.lineaPedido.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 5,
    }),
    prisma.pedido.groupBy({
      by: ["estado"],
      _count: true,
    }),
    prisma.pedido.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { usuario: { select: { nombre: true, email: true } } },
    }),
  ]);

  const topProductosDetalle = await Promise.all(
    topProductos.map(async (t) => {
      const producto = await prisma.producto.findUnique({
        where: { id: t.productoId },
        select: { nombre: true },
      });
      return { nombre: producto?.nombre ?? "Desconocido", cantidad: t._sum.cantidad ?? 0 };
    })
  );

  const ingresosMes = pedidosMes._sum.total ?? 0;
  const ingresosMesAnterior = pedidosMesAnterior._sum.total ?? 0;
  const variacion = ingresosMesAnterior > 0
    ? Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100)
    : null;

  const estadoLabels: Record<string, string> = {
    PENDIENTE: "Pendiente", CONFIRMADO: "Confirmado",
    ENVIADO: "Enviado", ENTREGADO: "Entregado", CANCELADO: "Cancelado",
  };

  return (
    <div className="container">
      <h1>Reportes</h1>
      <p className="text-muted mb-2">
        <Link href="/admin/productos">Productos</Link> ·{" "}
        <Link href="/admin/pedidos">Pedidos</Link> ·{" "}
        <Link href="/admin/catalogos">Catálogos</Link>
      </p>

      {/* KPIs */}
      <div className="reportes-grid">
        <div className="card reporte-kpi">
          <span className="reporte-kpi-label">Ingresos este mes</span>
          <span className="reporte-kpi-valor">${ingresosMes.toLocaleString("es-CO")}</span>
          {variacion !== null && (
            <span className={`reporte-kpi-variacion ${variacion >= 0 ? "positivo" : "negativo"}`}>
              {variacion >= 0 ? "▲" : "▼"} {Math.abs(variacion)}% vs mes anterior
            </span>
          )}
        </div>
        <div className="card reporte-kpi">
          <span className="reporte-kpi-label">Pedidos este mes</span>
          <span className="reporte-kpi-valor">{pedidosMes._count}</span>
        </div>
        <div className="card reporte-kpi">
          <span className="reporte-kpi-label">Total ventas (histórico)</span>
          <span className="reporte-kpi-valor">${(totalPedidos._sum.total ?? 0).toLocaleString("es-CO")}</span>
          <span className="reporte-kpi-sub">{totalPedidos._count} pedidos</span>
        </div>
        <div className="card reporte-kpi">
          <span className="reporte-kpi-label">Clientes registrados</span>
          <span className="reporte-kpi-valor">{totalUsuarios}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Top productos */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>Top 5 productos vendidos</h3>
          {topProductosDetalle.length === 0 ? (
            <p className="text-muted">Sin datos aún.</p>
          ) : (
            <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
              {topProductosDetalle.map((p, i) => (
                <li key={i} style={{ padding: "0.4rem 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{p.nombre}</span>
                  <span className="text-muted" style={{ float: "right" }}>{p.cantidad} uds.</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Estado de pedidos */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>Pedidos por estado</h3>
          {pedidosPorEstado.map((e) => (
            <div key={e.estado} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid var(--border)" }}>
              <span>{estadoLabels[e.estado] ?? e.estado}</span>
              <strong>{e._count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="card" style={{ padding: "1.25rem", marginTop: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Últimos 10 pedidos</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>ID</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Cliente</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "0.5rem", textAlign: "right" }}>Total</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ultimosPedidos.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <Link href={`/admin/pedidos`} className="text-muted">#{p.id.slice(-6)}</Link>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{p.usuario.nombre}</td>
                  <td style={{ padding: "0.5rem" }}>{estadoLabels[p.estado] ?? p.estado}</td>
                  <td style={{ padding: "0.5rem", textAlign: "right" }}>${p.total.toLocaleString("es-CO")}</td>
                  <td style={{ padding: "0.5rem", color: "var(--muted)", fontSize: "0.8rem" }}>
                    {new Date(p.createdAt).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
