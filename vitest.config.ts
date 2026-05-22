import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "src/modules/auth/**/*.ts",
        "src/modules/auth/**/*.tsx",
        "src/app/auth/**/*.tsx",
        "src/components/auth/**/*.tsx",
        "src/app/components/auth/**/*.tsx",
      ],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.d.ts",
        "src/**/index.ts",
        "src/**/types.ts",
        "src/**/constants.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
