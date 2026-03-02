"use client";

import { useFormState } from "react-dom";
import { iniciarSesion } from "@/app/actions/auth";

function form(state: { error?: string } | null, formData: FormData) {
  return iniciarSesion(state, formData);
}

export function FormLogin({ action }: { action: typeof iniciarSesion }) {
  const [state, formAction] = useFormState(form, null);

  return (
    <form action={formAction}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {state?.error && <p className="form-error">{state.error}</p>}
      <button type="submit" className="btn btn-primary">
        Entrar
      </button>
    </form>
  );
}
