import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { gameSyncPlugin } from "./src/server/gameSyncPlugin";

const contractsDir = fileURLToPath(new URL("../contracts", import.meta.url));
const projectRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  plugins: [react(), gameSyncPlugin()],
  // Relative asset paths so the static build works from any local file server.
  base: "./",
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
