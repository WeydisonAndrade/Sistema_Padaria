"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BAKERY_NAME, BAKERY_TAGLINE } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
          <Link
            href="/admin/login"
            className="ml-3 rounded-full border border-primary/20 bg-primary px-5 py-2 text-sm font-medium text-white transition-all hover:bg-primary-dark hover:shadow-md"
          >
            Admin
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-white"
            >
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
