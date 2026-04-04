import { NextResponse } from "next/server";
import { productoRepository } from "@/lib/repositories/producto-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const categoria = searchParams.get("categoria");
  const genero = searchParams.get("genero");
  const marca = searchParams.get("marca");
  const color = searchParams.get("color");
  const talla = searchParams.get("talla");
  const precioMin = searchParams.get("precioMin");
  const precioMax = searchParams.get("precioMax");

  try {
    const productos = await productoRepository.findMany({
      categoriaIds: categoria ? [categoria] : undefined,
      generoIds: genero ? [genero] : undefined,
      marcaIds: marca ? [marca] : undefined,
      colorIds: color ? [color] : undefined,
      tallas: talla ? [talla] : undefined,
      precioMin: precioMin != null ? Number(precioMin) : undefined,
      precioMax: precioMax != null ? Number(precioMax) : undefined,
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al obtener productos", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

