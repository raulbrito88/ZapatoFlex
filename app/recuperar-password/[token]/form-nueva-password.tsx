"use client";

import { useActionState } from "react";
import { restablecerPassword } from "@/app/actions/recuperar-password";

export function FormNuevaPassword({ token }: { token: string }) {
  const [state, formAction] = useActionState(restablecerPassword, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <div className="form-group">
        <label htmlFor="password">Nueva contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmar">Confirmar contraseña</label>
        <input
          id="confirmar"
          name="confirmar"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state?.error && <p className="form-error">{state.error}</p>}
      <button type="submit" className="btn btn-primary">
        Restablecer contraseña
      </button>
    </form>
  );
}
