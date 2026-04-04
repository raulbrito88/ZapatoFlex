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
    const marcaIds        = ids(req, "marcaIds");
    const colorIds        = ids(req, "colorIds");

    const prodAnd: object[] = [];
    if (categoriaIds.length)    prodAnd.push({ categoriaId:    { in: categoriaIds } });
    if (generoIds.length)       prodAnd.push({ generoId:       { in: generoIds } });
    if (subcategoriaIds.length) prodAnd.push({ subcategoriaId: { in: subcategoriaIds } });
    if (marcaIds.length)        prodAnd.push({ marcaId:        { in: marcaIds } });
    if (colorIds.length)        prodAnd.push({ colorId:        { in: colorIds } });

    const tallas = await prisma.talla.findMany({
      where: prodAnd.length
        ? {
            variantes: {
              some: {
                stock: { gt: 0 },
                producto: prodAnd.length ? { AND: prodAnd } : undefined,
              },
            },
          }
        : undefined,
      orderBy: { valor: "asc" },
      select: { id: true, valor: true },
    });
    return NextResponse.json(tallas.map((t) => ({ id: t.id, nombre: t.valor })));
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
