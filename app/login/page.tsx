import Link from "next/link";
import { iniciarSesion } from "@/app/actions/auth";
import { FormLogin } from "./form-login";

export default async function LoginPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  return (
    <div className="container" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Iniciar sesión</h1>
      {searchParams.reset === "ok" && (
        <p className="form-success">
          Contraseña restablecida correctamente. Ya puedes iniciar sesión.
        </p>
      )}
      <FormLogin action={iniciarSesion} />
      <p className="text-muted mt-2">
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>.
      </p>
      <p className="text-muted mt-1">
        <Link href="/recuperar-password">¿Olvidaste tu contraseña?</Link>
      </p>
    </div>
  );
}
