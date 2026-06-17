"use client";

/**
 * Cabeçalho sticky do site com navegação desktop, menu mobile e carrinho.
 * Sem atalhos para o painel admin — o acesso é feito pela rota /admin/login.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { BAKERY_NAME, BAKERY_TAGLINE } from "@/lib/constants";
import CartButton from "@/components/CartButton";

// --- Links principais de navegação ---

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/pedidos", label: "Meus Pedidos" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Fecha o menu mobile ao navegar ---
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // --- Bloqueia scroll e escuta tecla Escape com menu aberto ---
  useEffect(() => {
    if (!menuOpen) return;

    document.body.style.overflow = "hidden";

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <>
      {/* --- Barra superior: logo, nav desktop e carrinho --- */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-primary shadow-sm transition-transform group-hover:scale-105">
              <span className="font-display text-lg font-bold text-gold-light">T</span>
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-foreground">
                {BAKERY_NAME}
              </p>
              <p className="text-[11px] italic tracking-widest text-gold uppercase">
                {BAKERY_TAGLINE}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gold" />
                )}
              </Link>
            ))}
            <CartButton />
          </nav>

          {/* --- Controles mobile: carrinho e botão do menu --- */}
          <div className="flex items-center gap-1 md:hidden">
            <CartButton />
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- Drawer de navegação mobile --- */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="animate-overlay-in absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          />

          <nav
            className="animate-drawer-in absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-card shadow-2xl"
            aria-label="Menu principal"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="font-display text-lg font-bold text-foreground">
                  {BAKERY_NAME}
                </p>
                <p className="text-[10px] italic tracking-widest text-gold uppercase">
                  Menu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/carrinho"
                  onClick={() => setMenuOpen(false)}
                  className={`mt-2 flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                    pathname === "/carrinho"
                      ? "bg-primary text-white"
                      : "border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho
                </Link>
              </div>
            </div>

            <div className="border-t border-border px-5 py-4">
              <p className="text-center text-xs text-muted">
                Peça fresquinho todos os dias
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
