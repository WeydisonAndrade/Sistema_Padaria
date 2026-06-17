/**
 * Vitest — testes unitários e de integração (pirâmide: base e meio).
 */
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          environment: "node",
          setupFiles: ["./tests/setup/unit.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          setupFiles: ["./tests/setup/integration.ts"],
          fileParallelism: false,
          maxWorkers: 1,
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          include: ["src/**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["./tests/setup/components.ts"],
        },
      },
    ],
  },
});
