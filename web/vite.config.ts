import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { gameSyncPlugin } from "./src/server/gameSyncPlugin";
import { pagesPreviewPlugin } from "./src/server/pagesPreviewPlugin";

const contractsDir = fileURLToPath(new URL("../contracts", import.meta.url));
const projectRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  plugins: [react(), gameSyncPlugin(), pagesPreviewPlugin(fileURLToPath(new URL("./dist", import.meta.url)))],
  // Absolute asset paths: pages live at real paths (/guide/<slug>), so "./" would break there.
  base: "/",
  resolve: {
    alias: { "@contracts": contractsDir },
  },
  server: {
    port: 5173,
    strictPort: true,
    // contracts/ lives outside web/: allow the dev server to read it.
    fs: { allow: [projectRoot] },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"],
    benchmark: {
      include: ["src/**/*.bench.ts"],
    },
  },
});
