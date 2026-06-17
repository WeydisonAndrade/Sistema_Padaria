/**
 * Inicia o servidor de desenvolvimento de forma estável:
 * 1. Encerra instâncias antigas na porta 3000
 * 2. Remove cache .next corrompido
 * 3. Sobe o Next.js em modo webpack (mais estável que Turbopack no Windows)
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as sleep } from "node:timers/promises";
import { killPort } from "./kill-port.mjs";
import { removeNextCache } from "./clean-next.mjs";

const PORT = Number(process.env.PORT) || 3000;

console.log(`Preparando ambiente de desenvolvimento na porta ${PORT}...`);

killPort(PORT);
await sleep(800);

removeNextCache();

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, "dev", "-p", String(PORT)], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(PORT) },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
