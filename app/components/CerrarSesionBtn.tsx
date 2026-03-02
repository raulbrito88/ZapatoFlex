"use client";

import { cerrarSesion } from "@/app/actions/auth";

export function CerrarSesionBtn() {
  return (
    <form action={cerrarSesion}>
      <button type="submit" className="btn btn-ghost btn-sm">
        Cerrar sesión
      </button>
    </form>
  );
}
