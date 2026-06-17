/**
 * Setup dos testes de integração — banco SQLite isolado para testes.
 */
import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll } from "vitest";

const TEST_DB_PATH = join(process.cwd(), "prisma", "test.db");
const TEST_DATABASE_URL = `file:${TEST_DB_PATH.replace(/\\/g, "/")}`;

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET ??= "test-jwt-secret";

function removeTestDbFiles() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const file = `${TEST_DB_PATH}${suffix}`;
    if (existsSync(file)) {
      try {
        unlinkSync(file);
      } catch {
        // arquivo em uso no Windows
      }
    }
  }
}

beforeAll(() => {
  removeTestDbFiles();

  // db push em banco vazio — sem --force-reset (apenas prisma/test.db de testes)
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
});

afterAll(() => {
  removeTestDbFiles();
});
