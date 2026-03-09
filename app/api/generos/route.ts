import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const generos = await prisma.genero.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    });
    return NextResponse.json(generos);
  } catch (error) {
    console.error("Error al obtener géneros", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

