import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const categoriaIds = (req.nextUrl.searchParams.get("categoriaIds") || "")
      .split(",")
      .filter(Boolean);

    const subcategorias = await prisma.subcategoria.findMany({
      where: categoriaIds.length ? { categoriaId: { in: categoriaIds } } : undefined,
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    });
    return NextResponse.json(subcategorias);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
