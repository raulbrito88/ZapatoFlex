"use server";

import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { ejecutarCheckout } from "@/lib/services/checkout-service";

export async function realizarCheckout() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");

  const resultado = await ejecutarCheckout(usuario.id);
  if (!resultado.success) {
    return { error: resultado.error };
  }
  redirect(`/pedidos/${resultado.pedidoId}`);
}
