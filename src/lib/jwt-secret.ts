/**
 * Chave secreta usada para assinar e verificar tokens JWT de sessão do admin.
 * Lê JWT_SECRET do ambiente ou usa um valor padrão apenas para desenvolvimento.
 */

// --- Chave codificada para uso com jose/Web Crypto ---
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "padaria-secreto-alterar-em-producao"
);
