/**
 * Servicio de email: envía notificaciones al cliente.
 * Usa Nodemailer con configuración SMTP por variables de entorno.
 */
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function obtenerConfigSitio(): Promise<{ nombre: string; color: string; logoUrl: string | null }> {
  try {
    const config = await prisma.configuracionSitio.findUnique({ where: { id: "default" } });
    return {
      nombre: config?.nombreSitio ?? "ZapatoFlex",
      color: config?.colorPrimario ?? "#6366f1",
      logoUrl: config?.logoUrl ?? null,
    };
  } catch {
    return { nombre: "ZapatoFlex", color: "#6366f1", logoUrl: null };
  }
}

function emailHeader(nombre: string, color: string, logoUrl: string | null, subtitulo: string): string {
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${nombre}" style="max-height:64px;max-width:220px;object-fit:contain;display:block;margin:0 auto 8px">`
    : `<p style="margin:0 0 4px;font-size:20px;font-weight:bold">${nombre}</p>`;
  return `<div style="background:${color};color:#fff;padding:20px;text-align:center;border-radius:8px 8px 0 0">
      ${logoHtml}
      <p style="margin:0;font-size:14px;opacity:0.9">${subtitulo}</p>
    </div>`;
}

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
  direccionEnvio?: string;
  lineas: LineaPedidoEmail[];
};

export async function enviarNotificacionAdminPedido(
  nombreCliente: string,
  emailCliente: string,
  pedido: PedidoEmail
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const { nombre, logoUrl } = await obtenerConfigSitio();

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
      ${emailHeader(nombre, "#22c55e", logoUrl, `Nueva venta recibida — Pedido #${pedido.id.slice(-8)}`)}
      <div style="padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
        <p><strong>Cliente:</strong> ${nombreCliente} (${emailCliente})</p>
        <p><strong>Método de pago:</strong> ${pedido.metodoPago}</p>
        ${pedido.direccionEnvio ? `<p><strong>Dirección de envío:</strong> ${pedido.direccionEnvio}</p>` : ""}
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
        <p style="font-size:18px;font-weight:bold;text-align:right;color:#22c55e">
          Total: $${pedido.total.toLocaleString("es-CO")}
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${nombre}" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Nueva venta #${pedido.id.slice(-8)} — $${pedido.total.toLocaleString("es-CO")}`,
      html,
    });
    console.log("[Email] Notificación admin enviada a", adminEmail);
  } catch (error) {
    console.error("[Email] Error al enviar notificación admin:", error);
  }
}

export async function enviarConfirmacionPedido(
  destinatario: string,
  nombreCliente: string,
  pedido: PedidoEmail
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] SMTP no configurado, omitiendo envío de correo para pedido", pedido.id);
    return;
  }

  const { nombre, color, logoUrl } = await obtenerConfigSitio();

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
      ${emailHeader(nombre, color, logoUrl, "Confirmación de pedido")}
      <div style="padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
        <p>Hola <strong>${nombreCliente}</strong>,</p>
        <p>Tu pedido <strong>#${pedido.id.slice(-8)}</strong> ha sido registrado exitosamente.</p>
        ${pedido.direccionEnvio ? `<p><strong>Dirección de envío:</strong> ${pedido.direccionEnvio}</p>` : ""}
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
      from: `"${nombre}" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `Confirmación de pedido #${pedido.id.slice(-8)} - ${nombre}`,
      html,
    });
    console.log("[Email] Confirmación enviada a", destinatario);
  } catch (error) {
    console.error("[Email] Error al enviar confirmación:", error);
  }
}

export async function enviarEmailRecuperarPassword(
  destinatario: string,
  nombreCliente: string,
  resetUrl: string
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] SMTP no configurado, omitiendo recuperación de contraseña");
    return;
  }

  const { nombre, color, logoUrl } = await obtenerConfigSitio();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
      ${emailHeader(nombre, color, logoUrl, "Recuperación de contraseña")}
      <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
        <p>Hola <strong>${nombreCliente}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para continuar:</p>
        <div style="text-align:center;margin:28px 0">
          <a href="${resetUrl}"
             style="background:${color};color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
            Restablecer contraseña
          </a>
        </div>
        <p style="color:#666;font-size:14px">Este enlace expira en <strong>1 hora</strong>.</p>
        <p style="color:#666;font-size:14px">Si no solicitaste este cambio, ignora este correo — tu contraseña no será modificada.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="color:#999;font-size:12px;text-align:center">
          ${nombre} — No respondas a este correo.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${nombre}" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `Restablece tu contraseña — ${nombre}`,
      html,
    });
    console.log("[Email] Recuperación de contraseña enviada a", destinatario);
  } catch (error) {
    console.error("[Email] Error al enviar recuperación de contraseña:", error);
  }
}
