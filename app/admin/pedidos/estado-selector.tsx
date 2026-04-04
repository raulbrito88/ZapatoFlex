"use client";

import { useEffect, useState, useTransition } from "react";
import { actualizarEstadoPedido, actualizarEstadoPago } from "@/app/actions/admin-pedidos";

const ESTADOS_PEDIDO = [
  { value: "PENDIENTE",   label: "Pendiente" },
  { value: "CONFIRMADO",  label: "Confirmado" },
  { value: "ENVIADO",     label: "Enviado" },
  { value: "ENTREGADO",   label: "Entregado" },
  { value: "CANCELADO",   label: "Cancelado" },
];

const ESTADOS_PAGO = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "SIMULADO",  label: "Por cobrar" },
  { value: "APROBADO",  label: "Pagado" },
];

const BADGE: Record<string, string> = {
  PENDIENTE:  "badge-pending",
  CONFIRMADO: "badge-confirmed",
  ENVIADO:    "badge-shipped",
  ENTREGADO:  "badge-delivered",
  CANCELADO:  "badge-cancelled",
  SIMULADO:   "badge-pending",
  APROBADO:   "badge-delivered",
};

interface Props {
  pedidoId: string;
  estadoPedido: string;
  estadoPago: string | undefined;
}

export function EstadoSelector({ pedidoId, estadoPedido, estadoPago }: Props) {
  const [pendingPedido, startPedido] = useTransition();
  const [pendingPago, startPago] = useTransition();

  const [selPedido, setSelPedido] = useState(estadoPedido);
  const [selPago, setSelPago] = useState(estadoPago ?? "");

  // Sincronizar cuando el servidor re-renderiza con valores actualizados
  useEffect(() => { setSelPedido(estadoPedido); }, [estadoPedido]);
  useEffect(() => { setSelPago(estadoPago ?? ""); }, [estadoPago]);

  const pedidoCambiado = selPedido !== estadoPedido;
  const pagoCambiado = selPago !== (estadoPago ?? "");

  return (
    <div className="estado-selector-row">
      <label className="estado-selector-label">
        <span>Pedido</span>
        <select
          className={`estado-select badge ${BADGE[selPedido] ?? ""}`}
          value={selPedido}
          disabled={pendingPedido}
          onChange={(e) => setSelPedido(e.target.value)}
        >
          {ESTADOS_PEDIDO.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {pedidoCambiado && (
        <div className="estado-confirm-btns">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={pendingPedido}
            onClick={() => startPedido(() => void actualizarEstadoPedido(pedidoId, selPedido))}
          >
            {pendingPedido ? "Guardando..." : "Confirmar"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={pendingPedido}
            onClick={() => setSelPedido(estadoPedido)}
          >
            Cancelar
          </button>
        </div>
      )}

      {estadoPago !== undefined && (
        <label className="estado-selector-label">
          <span>Pago</span>
          <select
            className={`estado-select badge ${BADGE[selPago] ?? ""}`}
            value={selPago}
            disabled={pendingPago}
            onChange={(e) => setSelPago(e.target.value)}
          >
            {ESTADOS_PAGO.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      )}

      {estadoPago !== undefined && pagoCambiado && (
        <div className="estado-confirm-btns">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={pendingPago}
            onClick={() => startPago(() => void actualizarEstadoPago(pedidoId, selPago))}
          >
            {pendingPago ? "Guardando..." : "Confirmar"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={pendingPago}
            onClick={() => setSelPago(estadoPago ?? "")}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
