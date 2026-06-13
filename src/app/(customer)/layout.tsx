/**
 * Layout da área pública do site (cliente).
 * Envolve as páginas com providers, cabeçalho, conteúdo principal e rodapé.
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerProviders from "@/components/CustomerProviders";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerProviders>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </CustomerProviders>
  );
}
