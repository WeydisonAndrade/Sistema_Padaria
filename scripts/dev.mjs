/**
 * Inicia o servidor de desenvolvimento com cache limpo.
 * Evita erros 500 por arquivos corrompidos em .next (webpack/turbopack).
 */
import { existsSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");

if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("Cache .next removido antes de iniciar o dev server.");
}

const child = spawn("npx", ["next", "dev", "--turbo"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, TURBOPACK: "1" },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
