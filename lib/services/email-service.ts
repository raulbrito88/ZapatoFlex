/**
 * Servicio de email: envía notificaciones al cliente.
 * Usa Nodemailer con configuración SMTP por variables de entorno.
 */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type LineaPedidoEmail = {
  nombre: string;
  talla: string | null;
  cantidad: number;
  precioUnitario: number;
};

type PedidoEmail = {
  id: string;
  total: number;
  metodoPago: string;
  lineas: LineaPedidoEmail[];
};

export async function enviarConfirmacionPedido(
  destinatario: string,
  nombreCliente: string,
  pedido: PedidoEmail
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] SMTP no configurado, omitiendo envío de correo para pedido", pedido.id);
    return;
  }

  const lineasHtml = pedido.lineas
    .map(
      (l) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${l.nombre}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${l.talla || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${l.cantidad}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(l.precioUnitario * l.cantidad).toLocaleString("es-CO")}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
      <div style="background:#6366f1;color:#fff;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:24px">ZapatoFlex</h1>
        <p style="margin:4px 0 0">Confirmación de pedido</p>
      </div>
      <div style="padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
        <p>Hola <strong>${nombreCliente}</strong>,</p>
        <p>Tu pedido <strong>#${pedido.id.slice(-8)}</strong> ha sido registrado exitosamente.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Producto</th>
              <th style="padding:8px;text-align:center">Talla</th>
              <th style="padding:8px;text-align:center">Cant.</th>
              <th style="padding:8px;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${lineasHtml}</tbody>
        </table>
        <p style="font-size:18px;font-weight:bold;text-align:right">
          Total: $${pedido.total.toLocaleString("es-CO")}
        </p>
        <p style="color:#666">Método de pago: ${pedido.metodoPago}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="color:#999;font-size:12px;text-align:center">
          Gracias por tu compra en ZapatoFlex. Si tienes alguna pregunta, contáctanos.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"ZapatoFlex" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `Confirmación de pedido #${pedido.id.slice(-8)} - ZapatoFlex`,
      html,
    });
    console.log("[Email] Confirmación enviada a", destinatario);
  } catch (error) {
    console.error("[Email] Error al enviar confirmación:", error);
  }
}
