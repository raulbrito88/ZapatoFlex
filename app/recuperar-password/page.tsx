import { FormSolicitarReset } from "./form-solicitar";

export default function RecuperarPasswordPage() {
  return (
    <div className="container" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Recuperar contraseña</h1>
      <p className="text-muted">
        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <FormSolicitarReset />
    </div>
  );
}
