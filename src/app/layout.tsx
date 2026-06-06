import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Tutti Pane | Pães Artesanais e Doces Caseiros",
  description:
    "Tutti Pane — tradição e sabor em cada fornada. Pães artesanais, bolos e doces feitos com carinho. Peça pelo WhatsApp!",
};

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
