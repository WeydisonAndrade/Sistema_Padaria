/**
 * Layout raiz da aplicação Next.js.
 * Define fontes globais, metadados SEO e a estrutura HTML base para todas as rotas.
 */

import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

// --- Configuração de fontes Google ---
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// --- Metadados da página (SEO) ---
export const metadata: Metadata = {
  title: "Tutti Pane | Café da Manhã com Pão, Queijo e Café",
  description:
    "Tutti Pane — pão quentinho, queijo derretido e café aromático. Peça seu café da manhã artesanal pelo WhatsApp ou site!",
};

// --- Componente de layout raiz ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
