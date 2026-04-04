"use client";

import { useActionState } from "react";
import { registrar } from "@/app/actions/auth";

function form(state: { error?: string } | null, formData: FormData) {
  return registrar(state, formData);
}

export function FormRegistro({ action }: { action: typeof registrar }) {
  const [state, formAction] = useActionState(form, null);

  return (
    <form action={formAction}>
      <div className="form-group">
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" required autoComplete="name" />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="form-group">
        <label htmlFor="password">Contraseña (mín. 6 caracteres)</label>
        <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      {state?.error && <p className="form-error">{state.error}</p>}
      <button type="submit" className="btn btn-primary">
        Crear cuenta
      </button>
    </form>
  );
}
