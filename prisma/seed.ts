import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin ---
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@zapatoflex.com" },
    update: {},
    create: {
      email: "admin@zapatoflex.com",
      nombre: "Administrador",
      passwordHash: hash,
      rol: "ADMIN",
    },
  });
  console.log("Admin creado:", admin.email);

  // --- Catálogos ---
  const marcas = ["ZapatoFlex", "Nike", "Adidas", "Puma"];
  const colores = ["Negro", "Blanco", "Café", "Rojo", "Azul", "Gris"];
  const tallasValor = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

  const marcaMap: Record<string, string> = {};
  for (const nombre of marcas) {
    const m = await prisma.marca.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    marcaMap[nombre] = m.id;
  }
  console.log("Marcas creadas:", marcas.join(", "));

  const colorMap: Record<string, string> = {};
  for (const nombre of colores) {
    const c = await prisma.color.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    colorMap[nombre] = c.id;
  }
  console.log("Colores creados:", colores.join(", "));

  const tallaMap: Record<string, string> = {};
  for (const valor of tallasValor) {
    const t = await prisma.talla.upsert({
      where: { valor },
      update: {},
      create: { valor },
    });
    tallaMap[valor] = t.id;
  }
  console.log("Tallas creadas:", tallasValor.join(", "));

  // --- Productos ---
  const productos = [
    {
      nombre: "Runner Pro",
      categoria: "DEPORTIVO" as const,
      marca: "ZapatoFlex",
      color: "Negro",
      precio: 189000,
      tallas: ["36", "37", "38", "39", "40", "41", "42", "43"],
      imagenes: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    },
    {
      nombre: "Urban Classic",
      categoria: "CASUAL" as const,
      marca: "ZapatoFlex",
      color: "Blanco",
      precio: 129000,
      tallas: ["37", "38", "39", "40", "41", "42"],
      imagenes: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"],
    },
    {
      nombre: "Executive",
      categoria: "FORMAL" as const,
      marca: "ZapatoFlex",
      color: "Café",
      precio: 249000,
      tallas: ["38", "39", "40", "41", "42", "43", "44"],
      imagenes: ["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400"],
    },
  ];

  for (const { imagenes, tallas, marca, color, ...p } of productos) {
    const prod = await prisma.producto.create({
      data: {
        ...p,
        marcaId: marcaMap[marca],
        colorId: colorMap[color],
        variantes: {
          create: tallas.map((t) => ({
            tallaId: tallaMap[t],
            stock: 50,
          })),
        },
        imagenes: { create: imagenes.map((url, i) => ({ url, orden: i })) },
      },
    });
    console.log("Producto:", prod.nombre);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
