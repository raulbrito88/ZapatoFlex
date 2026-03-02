"use client";

import { useState } from "react";
import { realizarCheckout } from "@/app/actions/checkout";

export function CheckoutBtn() {
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

  return (
    <div className="mt-2">
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Finalizar compra (contraentrega)"}
      </button>
      {error && <p className="form-error mt-1">{error}</p>}
    </div>
  );
}
