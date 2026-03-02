import Link from "next/link";
import { iniciarSesion } from "@/app/actions/auth";
import { FormLogin } from "./form-login";

export default function LoginPage() {
  return (
    <div className="container" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Iniciar sesión</h1>
      <FormLogin action={iniciarSesion} />
      <p className="text-muted mt-2">
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>.
      </p>
    </div>
  );
}
