"use client";

import { useActionState } from "react";
import { solicitarReset } from "@/app/actions/recuperar-password";

export function FormSolicitarReset() {
  const [state, formAction] = useActionState(solicitarReset, null);

  if (state?.success) {
    return <p className="form-success">{state.success}</p>;
  }

  return (
    <form action={formAction}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state?.error && <p className="form-error">{state.error}</p>}
      <button type="submit" className="btn btn-primary">
        Enviar enlace
      </button>
    </form>
  );
}
