import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/Header";

export const metadata: Metadata = {
  title: "ZapatoFlex - Calzado en línea",
  description: "Plataforma de venta de calzado deportivo, casual y formal - ZapatoFlex S.A.S.",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        <main style={{ padding: "2rem 0", minHeight: "calc(100vh - 120px)" }}>
          {children}
        </main>
        <footer className="footer">
          Prototipo ZapatoFlex S.A.S. — Arquitectura de Software
        </footer>
      </body>
    </html>
  );
}
