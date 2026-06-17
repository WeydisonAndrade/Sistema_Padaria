/**
 * Encerra processos que estão escutando em uma porta TCP.
 * Evita servidor antigo/corrompido responder com erro 500 após atualizações.
 */
import { execSync } from "node:child_process";

export function killPort(port) {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });

      const pids = new Set();
      for (const line of output.split("\n")) {
        if (!line.includes("LISTENING")) continue;
        const pid = line.trim().split(/\s+/).at(-1);
        if (pid && pid !== "0") pids.add(pid);
      }

      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          console.log(`Processo ${pid} na porta ${port} encerrado.`);
        } catch {
          // processo já encerrado
        }
      }
      return;
    }

    execSync(`lsof -ti tcp:${port} | xargs kill -9 2>/dev/null || true`, {
      stdio: "ignore",
      shell: true,
    });
  } catch {
    // nenhum processo na porta
  }
}
