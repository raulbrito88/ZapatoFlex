import { readFileSync } from "fs";
import { join } from "path";
// Cargar .env.local manualmente (tsx no lo carga automáticamente)
try {
  const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split("\n")) {
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1 || line.startsWith("#")) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch {}

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

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
  const categoriasNombre = ["Calzado deportivo", "Calzado casual", "Calzado formal", "Ropa", "Hogar"];
  const marcas = ["ZapatoFlex", "Nike", "Adidas", "Puma"];
  const colores = ["Negro", "Blanco", "Café", "Rojo", "Azul", "Gris"];
  const tallasValor = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

  const categoriaMap: Record<string, string> = {};
  for (const nombre of categoriasNombre) {
    const c = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    categoriaMap[nombre] = c.id;
  }
  console.log("Categorías creadas:", categoriasNombre.join(", "));

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

  const generos = ["Hombre", "Mujer", "Niños", "Unisex"];
  const generoMap: Record<string, string> = {};
  for (const nombre of generos) {
    const g = await prisma.genero.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    generoMap[nombre] = g.id;
  }
  console.log("Géneros creados:", generos.join(", "));

  const subcategoriasDef = [
    { nombre: "Deportivo", categoria: "Calzado deportivo" },
    { nombre: "Casual", categoria: "Calzado casual" },
    { nombre: "Formal", categoria: "Calzado formal" },
  ];
  const subcategoriaMap: Record<string, string> = {};
  for (const sc of subcategoriasDef) {
    const key = `${sc.nombre}|${sc.categoria}`;
    const s = await prisma.subcategoria.upsert({
      where: {
        nombre_categoriaId: {
          nombre: sc.nombre,
          categoriaId: categoriaMap[sc.categoria],
        },
      },
      update: {},
      create: {
        nombre: sc.nombre,
        categoriaId: categoriaMap[sc.categoria],
      },
    });
    subcategoriaMap[key] = s.id;
  }
  console.log(
    "Subcategorías creadas:",
    subcategoriasDef.map((s) => `${s.nombre} (${s.categoria})`).join(", "),
  );

  // --- Productos ---
  const productos = [
    {
      nombre: "Runner Pro",
      categoria: "Calzado deportivo",
      subcategoria: "Deportivo",
      genero: "Hombre",
      marca: "ZapatoFlex",
      color: "Negro",
      precio: 189000,
      tallas: ["36", "37", "38", "39", "40", "41", "42", "43"],
      imagenes: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    },
    {
      nombre: "Urban Classic",
      categoria: "Calzado casual",
      subcategoria: "Casual",
      genero: "Unisex",
      marca: "ZapatoFlex",
      color: "Blanco",
      precio: 129000,
      tallas: ["37", "38", "39", "40", "41", "42"],
      imagenes: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"],
    },
    {
      nombre: "Executive",
      categoria: "Calzado formal",
      subcategoria: "Formal",
      genero: "Hombre",
      marca: "ZapatoFlex",
      color: "Café",
      precio: 249000,
      tallas: ["38", "39", "40", "41", "42", "43", "44"],
      imagenes: ["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400"],
    },
  ];

  for (const { imagenes, tallas, marca, color, categoria, subcategoria, genero, ...p } of productos) {
    const prod = await prisma.producto.create({
      data: {
        ...p,
        categoriaId: categoriaMap[categoria],
        subcategoriaId: subcategoria ? subcategoriaMap[`${subcategoria}|${categoria}`] : undefined,
        generoId: genero ? generoMap[genero] : undefined,
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
