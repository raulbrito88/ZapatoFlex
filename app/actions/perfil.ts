"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function actualizarPerfil(formData: FormData) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "No autenticado" };

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      documento:      (formData.get("documento") as string)      || null,
      departamento:   (formData.get("departamento") as string)   || null,
      municipio:      (formData.get("municipio") as string)      || null,
      direccionEnvio: (formData.get("direccionEnvio") as string) || null,
      complemento:    (formData.get("complemento") as string)    || null,
    },
  });

  revalidatePath("/perfil");
  return { success: true };
}
