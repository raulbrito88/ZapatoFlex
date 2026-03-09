import { prisma } from "@/lib/db";

const CONFIG_ID = "default";

export async function obtenerConfiguracionSitio() {
  const config = await prisma.configuracionSitio.upsert({
    where: { id: CONFIG_ID },
    update: {},
    create: {
      id: CONFIG_ID,
      heroTitulo: "Tu estilo, tu comodidad",
      heroDescripcion:
        "Descubre calzado, ropa y artículos para el hogar con envíos a todo Colombia.",
      colorPrimario: "#6366f1",
    },
  });

  return config;
}

