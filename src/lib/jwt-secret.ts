export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "padaria-secreto-alterar-em-producao"
);
