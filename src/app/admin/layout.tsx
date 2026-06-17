/**
 * Layout compartilhado do painel administrativo.
 * Sidebar no desktop; barra inferior de navegação e header com menu no mobile.
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Wheat,
  ExternalLink,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";

// --- Itens de navegação do menu lateral (desktop) ---
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Cadastro de Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos Online", icon: ClipboardList },
  { href: "/admin/vendas", label: "Registrar Venda", icon: ShoppingCart },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  // --- Logout: invalida sessão e redireciona para login ---
  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  // --- Página de login: renderiza apenas o conteúdo, sem sidebar ---
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* --- Sidebar desktop: logo, menu e ações --- */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
              <Wheat className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">Admin</p>
              <p className="text-xs text-muted">Tutti Pane</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-secondary hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* --- Área principal: chrome mobile + conteúdo --- */}
      <div className="flex flex-1 flex-col">
        <AdminMobileHeader onLogout={handleLogout} />

        <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">{children}</main>

        <AdminMobileNav />
      </div>
    </div>
  );
}
