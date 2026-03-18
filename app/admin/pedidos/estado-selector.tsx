"use client";

import { useTransition } from "react";
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

  return (
    <div className="estado-selector-row">
      <label className="estado-selector-label">
        <span>Pedido</span>
        <select
          className={`estado-select badge ${BADGE[estadoPedido] ?? ""}`}
          defaultValue={estadoPedido}
          disabled={pendingPedido}
          onChange={(e) => {
            const v = e.target.value;
            startPedido(() => actualizarEstadoPedido(pedidoId, v));
          }}
        >
          {ESTADOS_PEDIDO.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {estadoPago !== undefined && (
        <label className="estado-selector-label">
          <span>Pago</span>
          <select
            className={`estado-select badge ${BADGE[estadoPago] ?? ""}`}
            defaultValue={estadoPago}
            disabled={pendingPago}
            onChange={(e) => {
              const v = e.target.value;
              startPago(() => actualizarEstadoPago(pedidoId, v));
            }}
          >
            {ESTADOS_PAGO.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      )}

      {(pendingPedido || pendingPago) && (
        <span className="text-muted" style={{ fontSize: "0.8rem" }}>Guardando...</span>
      )}
    </div>
  );
}
