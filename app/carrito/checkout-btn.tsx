"use client";

import { useState } from "react";
import Link from "next/link";
import { realizarCheckout } from "@/app/actions/checkout";

interface DatosPerfil {
  nombre: string | null;
  documento: string | null;
  telefono: string | null;
  departamento: string | null;
  municipio: string | null;
  direccionEnvio: string | null;
  complemento: string | null;
}

interface Props {
  perfilCompleto: boolean;
  camposFaltantes: string[];
  perfil: DatosPerfil | null;
}

export function CheckoutBtn({ perfilCompleto, camposFaltantes, perfil }: Props) {
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    const res = await realizarCheckout();
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  const direccion = [
    perfil?.direccionEnvio,
    perfil?.complemento,
    perfil?.municipio,
    perfil?.departamento,
  ].filter(Boolean).join(", ");

  return (
    <div className="checkout-perfil-box mt-2">
      <div className="checkout-perfil-header">
        <strong>Datos de envío</strong>
        <Link href="/perfil" className="btn btn-secondary btn-sm">
          Editar
        </Link>
      </div>

      {perfilCompleto ? (
        <ul className="checkout-perfil-datos">
          <li><span>Nombre</span><span>{perfil?.nombre}</span></li>
          <li><span>Documento</span><span>{perfil?.documento}</span></li>
          <li><span>Teléfono</span><span>{perfil?.telefono}</span></li>
          <li><span>Dirección</span><span>{direccion}</span></li>
        </ul>
      ) : (
        <div className="alert alert-warning" style={{ marginTop: "0.75rem" }}>
          Faltan los siguientes datos: <strong>{camposFaltantes.join(", ")}</strong>.
          Por favor <Link href="/perfil">completa tu perfil</Link> antes de continuar.
        </div>
      )}

      {perfilCompleto && (
        <label className="checkout-confirmar">
          <input
            type="checkbox"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
          />
          Mis datos son correctos, deseo continuar con la compra
        </label>
      )}

      <button
        type="button"
        className="btn btn-primary mt-2"
        onClick={handleCheckout}
        disabled={loading || !perfilCompleto || !confirmado}
      >
        {loading ? "Procesando..." : "Finalizar compra (contraentrega)"}
      </button>

      {error && <p className="form-error mt-1">{error}</p>}
    </div>
  );
}
