/**
 * Remove a pasta .next para corrigir cache corrompido do Next.js.
 * Usado por: npm run clean, prebuild e dev.mjs
 */
import { existsSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const RM_OPTIONS = {
  recursive: true,
  force: true,
  maxRetries: 8,
  retryDelay: 250,
};

export function removeNextCache(cwd = process.cwd()) {
  const nextDir = join(cwd, ".next");

  if (!existsSync(nextDir)) {
    console.log("Nenhum cache .next encontrado.");
    return;
  }

  try {
    rmSync(nextDir, RM_OPTIONS);
    console.log("Cache .next removido com sucesso.");
    return;
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    console.warn(`Nao foi possivel remover .next de imediato (${code}). Tentando renomear...`);
  }

  const backupDir = join(cwd, `.next.old-${Date.now()}`);
  try {
    renameSync(nextDir, backupDir);
    rmSync(backupDir, RM_OPTIONS);
    console.log("Cache .next removido (via backup temporario).");
  } catch {
    console.warn(
      "Cache .next ainda em uso. O servidor criara um cache novo; se persistir erro 500, feche o terminal e rode npm run dev novamente."
    );
  }
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("clean-next.mjs")) {
  removeNextCache();
}
