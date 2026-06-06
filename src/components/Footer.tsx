import Link from "next/link";
import { BAKERY_NAME, BAKERY_TAGLINE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-accent text-white">
      <div className="absolute inset-0 bg-grain opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-primary">
                <span className="font-display text-base font-bold text-gold-light">T</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">{BAKERY_NAME}</span>
                <p className="text-[10px] italic tracking-widest text-gold/80 uppercase">
                  {BAKERY_TAGLINE}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              Tradição e sabor em cada fornada. Venha nos visitar e saboreie o melhor pão artesanal da região.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold tracking-widest text-gold uppercase">
              Navegação
            </h3>
            <div className="flex flex-col gap-2.5 text-sm text-white/70">
              <Link href="/" className="transition-colors hover:text-gold-light">
                Início
              </Link>
              <Link href="/produtos" className="transition-colors hover:text-gold-light">
                Produtos
              </Link>
              <Link href="/contato" className="transition-colors hover:text-gold-light">
                Contato
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold tracking-widest text-gold uppercase">
              Horário
            </h3>
            <p className="text-sm leading-relaxed text-white/70">
              Segunda a Sábado
              <br />
              6h às 20h
              <br />
              <br />
              Domingo
              <br />
              6h às 14h
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {BAKERY_NAME}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
