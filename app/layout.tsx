import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/Header";
import { WhatsappBtn } from "./components/WhatsappBtn";
import { obtenerConfiguracionSitio } from "@/lib/configuracion-sitio";

export const metadata: Metadata = {
  title: "Boutique Claudia - Tienda en línea",
  description: "Plataforma de venta de calzado, ropa y artículos para el hogar - ZapatoFlex S.A.S.",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch(e){}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await obtenerConfiguracionSitio();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        style={
          {
            "--accent": config.colorPrimario,
            "--accent-hover": config.colorPrimario,
          } as React.CSSProperties
        }
      >
        <Header />
        <main style={{ padding: "2rem 0", minHeight: "calc(100vh - 120px)" }}>
          {children}
        </main>
        {(config as any).whatsappNumero && <WhatsappBtn numero={(config as any).whatsappNumero} />}
      </body>
    </html>
  );
}
