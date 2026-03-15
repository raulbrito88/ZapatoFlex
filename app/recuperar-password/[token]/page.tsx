import crypto from "crypto";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { FormNuevaPassword } from "./form-nueva-password";

interface Props {
  params: { token: string };
}

export default async function NuevaPasswordPage({ params }: Props) {
  const { token } = params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const usuario = await prisma.usuario.findFirst({
    where: { resetToken: hashedToken },
    select: { resetTokenExpiry: true },
  });

  const isValid =
    usuario &&
    usuario.resetTokenExpiry &&
    usuario.resetTokenExpiry > new Date();

  if (!isValid) {
    return (
      <div className="container" style={{ maxWidth: 400, margin: "0 auto" }}>
        <h1>Enlace inválido</h1>
        <p className="form-error">
          Este enlace es inválido o ha expirado (los enlaces son válidos por 1 hora).
        </p>
        <Link href="/recuperar-password">Solicitar un nuevo enlace</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Nueva contraseña</h1>
      <p className="text-muted">Elige una contraseña de al menos 6 caracteres.</p>
      <FormNuevaPassword token={token} />
    </div>
  );
}
