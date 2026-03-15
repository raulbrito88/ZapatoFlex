"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schemaConfig = z.object({
  heroTitulo: z.string().min(1),
  heroDescripcion: z.string().min(1),
  colorPrimario: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: "Color inválido, usa formato hexadecimal. Ej: #ff0000",
  }),
  logoUrl: z.string().optional().or(z.literal("")),
});

export async function actualizarConfiguracion(prev: unknown, formData: FormData) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") return { error: "No autorizado" };

  const whatsappNumero = (formData.get("whatsappNumero") as string) || null;

  const parsed = schemaConfig.safeParse({
    heroTitulo: formData.get("heroTitulo"),
    heroDescripcion: formData.get("heroDescripcion"),
    colorPrimario: formData.get("colorPrimario"),
    logoUrl: formData.get("logoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos en la configuración." };
  }

  const data = parsed.data;

  await (prisma.configuracionSitio as any).upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroTitulo: data.heroTitulo,
      heroDescripcion: data.heroDescripcion,
      colorPrimario: data.colorPrimario,
      logoUrl: data.logoUrl || null,
      whatsappNumero,
    },
    update: {
      heroTitulo: data.heroTitulo,
      heroDescripcion: data.heroDescripcion,
      colorPrimario: data.colorPrimario,
      logoUrl: data.logoUrl || null,
      whatsappNumero,
    },
  });

  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/admin/configuracion");
  return { success: true };
}

