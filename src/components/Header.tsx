"use client";

/**
 * Cabeçalho sticky do site com navegação desktop, menu mobile e carrinho.
 * Visual acolhedor de café da manhã, sem atalhos para o painel admin.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { BAKERY_NAME, BAKERY_TAGLINE } from "@/lib/constants";
import CartButton from "@/components/CartButton";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/pedidos", label: "Meus Pedidos" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
      <header className="sticky top-0 z-50 border-b border-border/70 bg-cream/90 shadow-sm shadow-coffee/5 backdrop-blur-md">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="font-display text-lg font-bold text-gold-light">T</span>
              <Coffee className="absolute -right-1 -top-1 h-3.5 w-3.5 text-butter" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-foreground">
                {BAKERY_NAME}
              </p>
              <p className="text-[11px] italic tracking-widest text-coffee-light uppercase">
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
                    : "text-muted hover:text-coffee"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold to-crust" />
                )}
              </Link>
            ))}
            <CartButton />
          </nav>

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

      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="animate-overlay-in absolute inset-0 bg-coffee/40 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          />

          <nav
            className="animate-drawer-in absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-cream shadow-2xl"
            aria-label="Menu principal"
          >
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-butter/20 to-transparent px-5 py-4">
              <div>
                <p className="font-display text-lg font-bold text-foreground">
                  {BAKERY_NAME}
                </p>
                <p className="text-[10px] italic tracking-widest text-coffee uppercase">
                  Café da manhã
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
                      : "border border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho
                </Link>
              </div>
            </div>

            <div className="border-t border-border bg-butter/10 px-5 py-4">
              <p className="flex items-center justify-center gap-2 text-center text-xs text-coffee">
                <Coffee className="h-3.5 w-3.5" />
                Pão quentinho todos os dias
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
