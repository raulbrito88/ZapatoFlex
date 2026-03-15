"use server";

import { revalidatePath } from "next/cache";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function actualizarPerfil(formData: FormData) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "No autenticado" };

  const documento      = (formData.get("documento") as string)      || "";
  const telefono       = (formData.get("telefono") as string)       || "";
  const departamento   = (formData.get("departamento") as string)   || "";
  const municipio      = (formData.get("municipio") as string)      || "";
  const direccionEnvio = (formData.get("direccionEnvio") as string) || "";

  if (!documento)      return { error: "El número de documento es obligatorio." };
  if (!telefono)       return { error: "El número de contacto es obligatorio." };
  if (!departamento)   return { error: "El departamento es obligatorio." };
  if (!municipio)      return { error: "El municipio es obligatorio." };
  if (!direccionEnvio) return { error: "La dirección de envío es obligatoria." };

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      documento,
      telefono,
      departamento,
      municipio,
      direccionEnvio,
      complemento: (formData.get("complemento") as string) || null,
    },
  });

  revalidatePath("/perfil");
  return { success: true };
}
