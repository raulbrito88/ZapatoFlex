import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

