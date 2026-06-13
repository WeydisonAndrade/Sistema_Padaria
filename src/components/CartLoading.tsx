/**
 * Indicador visual exibido enquanto o carrinho é carregado
 * ou sincronizado com o armazenamento local.
 */

export default function CartLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      {/* --- Spinner e mensagem de carregamento --- */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted">Carregando carrinho…</p>
    </div>
  );
}
