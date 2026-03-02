import Link from "next/link";
import { registrar } from "@/app/actions/auth";
import { FormRegistro } from "./form-registro";

export default function RegistroPage() {
  return (
    <div className="container" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Registrarse</h1>
      <FormRegistro action={registrar} />
      <p className="text-muted mt-2">
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>.
      </p>
    </div>
  );
}
