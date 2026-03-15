import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormPerfil } from "./form-perfil";

export default async function PerfilPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");

  const datos = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: {
      nombre: true,
      email: true,
      documento: true,
      telefono: true,
      departamento: true,
      municipio: true,
      direccionEnvio: true,
      complemento: true,
    },
  });

  if (!datos) redirect("/login");

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h1>Mi perfil</h1>
      <p className="text-muted mb-2">
        <strong>{datos.nombre}</strong> · {datos.email}
      </p>
      <div className="card" style={{ padding: "1.5rem" }}>
        <FormPerfil usuario={datos} />
      </div>
    </div>
  );
}
