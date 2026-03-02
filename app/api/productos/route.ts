import { NextResponse } from "next/server";
import { productoRepository } from "@/lib/repositories/producto-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const categoria = searchParams.get("categoria") as any | null;
  const marca = searchParams.get("marca") ?? undefined;
  const color = searchParams.get("color") ?? undefined;
  const talla = searchParams.get("talla") ?? undefined;
  const precioMin = searchParams.get("precioMin");
  const precioMax = searchParams.get("precioMax");

  try {
    const productos = await productoRepository.findMany({
      categoria: categoria || undefined,
      marca,
      color,
      talla,
      precioMin: precioMin != null ? Number(precioMin) : undefined,
      precioMax: precioMax != null ? Number(precioMax) : undefined,
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al obtener productos", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

