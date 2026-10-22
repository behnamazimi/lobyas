import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Runs `render-splash.gen.ts`, which is not part of the normal test run.
export default defineConfig({
  test: { environment: "node", include: ["scripts/render-splash.gen.ts"] },
  resolve: { alias: { "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..") } },
});
