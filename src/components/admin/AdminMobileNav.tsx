/**
 * Navegação inferior do admin no mobile.
 * Exibe ícones das seções principais para acesso rápido entre páginas.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const mobileNavItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/admin/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/admin/configuracoes", label: "Config", icon: Settings },
];

export default function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden"
      aria-label="Navegação do painel administrativo"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? "text-primary" : ""}`} />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="mt-0.5 h-0.5 w-5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
