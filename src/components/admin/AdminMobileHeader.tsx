/**
 * Cabeçalho mobile do admin com menu para ações secundárias (ver site, sair).
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LogOut, Menu, Wheat, X } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/produtos": "Produtos",
  "/admin/pedidos": "Pedidos",
  "/admin/vendas": "Vendas",
  "/admin/configuracoes": "Configurações",
};

interface AdminMobileHeaderProps {
  onLogout: () => void;
}

export default function AdminMobileHeader({ onLogout }: AdminMobileHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = pageTitles[pathname] ?? "Admin";

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
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Wheat className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{pageTitle}</p>
            <p className="text-[10px] text-muted">Tutti Pane Admin</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="animate-overlay-in absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          />

          <nav
            className="animate-drawer-in absolute inset-y-0 right-0 flex w-[min(100%,18rem)] flex-col bg-card shadow-2xl"
            aria-label="Menu do admin"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="font-display text-lg font-bold text-foreground">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <ExternalLink className="h-5 w-5 text-primary" />
                Ver site
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
