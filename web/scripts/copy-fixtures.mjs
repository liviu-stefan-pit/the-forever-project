// Copies contracts/fixtures/* into web/public/data/ (git-ignored) so the app can run on sample data.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../../contracts/fixtures/", import.meta.url));
const dst = fileURLToPath(new URL("../public/data/", import.meta.url));

if (!existsSync(src)) {
  console.error(`fixtures not found: ${src}`);
  process.exit(1);
}
mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true });
console.log(`copied ${src} -> ${dst}`);
