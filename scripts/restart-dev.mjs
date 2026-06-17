/**
 * Reinicia o servidor de desenvolvimento do zero.
 * Use quando aparecer erro 500 após alterações no código.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const devScript = join(dirname(fileURLToPath(import.meta.url)), "dev.mjs");

const child = spawn(process.execPath, [devScript], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
