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
        "src/modules/api.ts",
        "src/modules/admin/**/*.{ts,tsx}",
        "src/modules/social/**/*.{ts,tsx}",
        "src/app/auth/**/*.{ts,tsx}",
        "src/app/(admin)/**/*.{ts,tsx}",
        "src/app/(protected)/**/*.{ts,tsx}",
        "src/components/auth/**/*.{ts,tsx}",
        "src/app/components/auth/**/*.{ts,tsx}",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
