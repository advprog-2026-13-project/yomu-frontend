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
        "src/modules/auth/**/*.{ts,tsx}",
        "src/modules/achievements/**/*.{ts,tsx}",
        "src/modules/readings/**/*.{ts,tsx}",
        "src/app/auth/**/*.{ts,tsx}",
        "src/components/auth/**/*.{ts,tsx}",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
