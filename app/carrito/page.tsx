import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CarritoActions } from "./carrito-actions";
import { CheckoutBtn } from "./checkout-btn";

export default async function CarritoPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    return (
      <div className="container">
        <p className="text-muted">Debes <Link href="/login">iniciar sesión</Link> para ver tu carrito.</p>
      </div>
    );
  }

  const carrito = await prisma.carrito.findUnique({
    where: { usuarioId: usuario.id },
    include: {
      items: {
        include: {
          producto: {
            include: {
              marca: true,
              color: true,
              imagenes: { orderBy: { orden: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="container">
        <h1>Carrito</h1>
        <p className="text-muted">Tu carrito está vacío. <Link href="/tienda">Ir a la tienda</Link>.</p>
      </div>
    );
  }

  const total = carrito.items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  return (
    <div className="container">
      <h1>Carrito</h1>
      <ul className="carrito-list">
        {carrito.items.map((item) => (
          <li key={item.id} className="carrito-item">
            <img
              src={item.producto.imagenes?.[0]?.url || "https://placehold.co/64x64/1a1a20/6366f1?text=Z"}
              alt={item.producto.nombre}
            />
            <div style={{ flex: 1 }}>
              <strong>{item.producto.nombre}</strong>
              <p className="text-muted">{(item.producto as any).marca?.nombre || ""}{item.talla ? ` · Talla ${item.talla}` : ""} · ${Number(item.producto.precio).toLocaleString("es-CO")} c/u</p>
            </div>
            <CarritoActions lineaId={item.id} cantidad={item.cantidad} />
            <span>${(item.producto.precio * item.cantidad).toLocaleString("es-CO")}</span>
          </li>
        ))}
      </ul>
      <div className="carrito-total">
        Total: ${total.toLocaleString("es-CO")}
      </div>
      <CheckoutBtn />
    </div>
  );
}
