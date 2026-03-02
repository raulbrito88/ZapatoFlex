/**
 * Patrón Strategy: métodos de pago intercambiables.
 * Actual: Contraentrega (simulado). Futuro: Tarjeta, PSE, etc.
 */
export interface ContextoPago {
  pedidoId: string;
  total: number;
  usuarioId: string;
  metodo: string;
}

export interface ResultadoPago {
  ok: boolean;
  pagoId?: string;
  mensaje: string;
}

export interface IMetodoPagoStrategy {
  procesar(ctx: ContextoPago): Promise<ResultadoPago>;
}

/** Simulación de pago contraentrega (requisito del caso de estudio). */
export class ContraentregaStrategy implements IMetodoPagoStrategy {
  async procesar(ctx: ContextoPago): Promise<ResultadoPago> {
    // Simulación: siempre aprobado. En producción aquí iría lógica real.
    return {
      ok: true,
      pagoId: `sim-${ctx.pedidoId}-${Date.now()}`,
      mensaje: "Pago contraentrega registrado. Se cobrará al recibir el pedido.",
    };
  }
}
