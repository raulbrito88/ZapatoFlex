import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function ids(req: NextRequest, key: string): string[] {
  return (req.nextUrl.searchParams.get(key) || "").split(",").filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    const categoriaIds    = ids(req, "categoriaIds");
    const generoIds       = ids(req, "generoIds");
    const subcategoriaIds = ids(req, "subcategoriaIds");

    const and: object[] = [];
    if (categoriaIds.length)    and.push({ categoriaId:    { in: categoriaIds } });
    if (generoIds.length)       and.push({ generoId:       { in: generoIds } });
    if (subcategoriaIds.length) and.push({ subcategoriaId: { in: subcategoriaIds } });

    const marcas = await prisma.marca.findMany({
      where: and.length ? { productos: { some: { AND: and } } } : undefined,
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    });
    return NextResponse.json(marcas);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
