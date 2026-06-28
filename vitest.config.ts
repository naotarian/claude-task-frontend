import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      // Focus coverage on the framework-agnostic logic layer.
      include: ["src/lib/**/*.ts"],
      // Thin React-Query/adapter wrappers are exercised via integration, not unit tests.
      exclude: [
        "src/lib/providers.tsx",
        "src/lib/hooks.ts",
        "src/lib/auth.ts",
        "src/lib/api/endpoints.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 80,
      },
    },
  },
});
